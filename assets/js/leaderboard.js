function saveWinner(score) {
    const winners = JSON.parse(localStorage.getItem("winners")) || [];

    winners.push({ score, date: new Date().toISOString() });
    winners.sort((a, b) => b.score - a.score);
    localStorage.setItem("winners", JSON.stringify(winners.slice(0, 2)));

    renderLeaderboard();
}

function renderLeaderboard() {
    const winners = JSON.parse(localStorage.getItem("winners")) || [];

    document.getElementById("leaderboard").innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Top 2 Winners</h2>
        <div class="space-y-3">
            ${winners.map((w, i) => `
                <div class="p-3 bg-white shadow rounded-lg">
                    <span class="font-semibold">#${i+1}</span> — Score: ${w.score}
                </div>
            `).join("")}
        </div>
    `;

    if (winners.length > 0) launchFireworks();
}
