// Giveaway dashboard (leaderboard)
// - Responsive (cards on mobile, table on desktop)
// - Accessible (labels, aria-live updates)

// === Supabase client setup ===
// NOTE: This is a public (anon) key. Ensure Row Level Security (RLS) is enabled in Supabase.
// Recommended: allow INSERT to entries, and allow SELECT only to a limited view (e.g., username + created_at),
// or protect SELECT with a server-side function if you want this dashboard private.
const SUPABASE_URL = "https://kimriiyyorsygphphmvz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpbXJpaXl5b3JzeWdwaHBobXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MjIwNjUsImV4cCI6MjA4MDM5ODA2NX0.J7uzp1Fqz2jTmn10-KoboQ7akfDeeGgksaILJrRpuHU";

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === DOM ===
const tbody = document.getElementById("tbody");
const cards = document.getElementById("cards");
const empty = document.getElementById("empty");
const live = document.getElementById("live");

const statTotal = document.getElementById("stat-total");
const statTop = document.getElementById("stat-top");
const statUpdated = document.getElementById("stat-updated");

const searchInput = document.getElementById("search");
const refreshBtn = document.getElementById("refresh");
const exportBtn = document.getElementById("export");
const toggleBtn = document.getElementById("toggle");
const tableSection = document.getElementById("table-section");

let allEntries = [];
let forceTable = false; // for Toggle view on mobile

function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setLive(msg) {
  live.textContent = msg;
}

async function fetchLeaderboard() {
  // Fetch only the fields we need for the dashboard
  // ✅ Added: email
  const { data, error } = await supabaseClient
    .from("entries")
    .select("id, username, fullname, email, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Dashboard fetch error:", error);
    setLive("Failed to load leaderboard.");
    return [];
  }
  return data || [];
}

function applyFilter(entries) {
  const q = (searchInput.value || "").trim().toLowerCase();
  if (!q) return entries;

  // ✅ Filter by username / fullname / email
  return entries.filter((e) => {
    const u = (e.username || "").toLowerCase();
    const f = (e.fullname || "").toLowerCase();
    const m = (e.email || "").toLowerCase();
    return u.includes(q) || f.includes(q) || m.includes(q);
  });
}

function renderStats(entries) {
  statTotal.textContent = String(entries.length);
  statTop.textContent = entries[0]?.username || "—";
  statUpdated.textContent = new Date().toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderTable(entries) {
  tbody.innerHTML = "";

  entries.forEach((e, idx) => {
    const pos = idx + 1;
    const isTop = idx === 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-3 text-xs md:text-sm font-bold ${isTop ? "text-amber-300" : "text-slate-100"}">#${pos}</td>
      <td class="px-4 py-3 text-xs md:text-sm text-slate-100">
        ${isTop ? '<span class="mr-2" aria-hidden="true">👑</span>' : ""}
        <span>${escapeHtml(e.username || "-")}</span>
      </td>
      <td class="px-4 py-3 text-xs md:text-sm text-slate-200">${escapeHtml(e.fullname || "-")}</td>
      <td class="px-4 py-3 text-xs md:text-sm text-slate-200">${escapeHtml(e.email || "-")}</td>
      <td class="px-4 py-3 text-xs md:text-sm text-slate-300">${escapeHtml(fmtTime(e.created_at))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCards(entries) {
  cards.innerHTML = "";

  entries.forEach((e, idx) => {
    const pos = idx + 1;
    const isTop = idx === 0;

    const el = document.createElement("div");
    el.className = "rounded-2xl border border-slate-700 bg-slate-900/60 p-4";
    el.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-extrabold ${isTop ? "text-amber-300" : "text-slate-100"}">#${pos} ${isTop ? "👑" : ""}</p>
        <p class="text-xs text-slate-400">${escapeHtml(fmtTime(e.created_at))}</p>
      </div>

      <p class="mt-2 text-base font-semibold">${escapeHtml(e.username || "-")}</p>
      <p class="text-sm text-slate-300">${escapeHtml(e.fullname || "-")}</p>

      <p class="mt-1 text-sm text-slate-300 break-all">
        <span class="sr-only">Email: </span>${escapeHtml(e.email || "-")}
      </p>
    `;
    cards.appendChild(el);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  const filtered = applyFilter(allEntries);

  const hasEntries = filtered.length > 0;
  empty.classList.toggle("hidden", hasEntries);

  // Always render table content (desktop). Mobile can toggle.
  renderTable(filtered);

  const isMobile = window.matchMedia("(max-width: 639px)").matches;
  const showCards = isMobile && !forceTable;

  cards.classList.toggle("hidden", !showCards);
  if (tableSection) tableSection.classList.toggle("hidden", showCards && isMobile);

  if (showCards) renderCards(filtered);

  setLive(`${filtered.length} entr${filtered.length === 1 ? "y" : "ies"} shown.`);
}

async function refresh() {
  refreshBtn.disabled = true;
  refreshBtn.textContent = "Refreshing…";
  try {
    allEntries = await fetchLeaderboard();
    renderStats(allEntries);
    render();
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "Refresh";
  }
}

function exportCSV() {
  const filtered = applyFilter(allEntries);
  const rows = [
    ["position", "username", "fullname", "email", "created_at"],
    ...filtered.map((e, idx) => [
      idx + 1,
      e.username || "",
      e.fullname || "",
      e.email || "",
      e.created_at || "",
    ]),
  ];

  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "leaderboard.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

// === Events ===
searchInput.addEventListener("input", () => render());
refreshBtn.addEventListener("click", () => refresh());
exportBtn.addEventListener("click", () => exportCSV());
toggleBtn.addEventListener("click", () => {
  forceTable = !forceTable;
  toggleBtn.textContent = forceTable ? "Show cards" : "Toggle view";
  render();
});

window.addEventListener("resize", () => render());

// Init
refresh();