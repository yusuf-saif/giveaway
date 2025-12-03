(async function() {
    const isIncognito = await detectIncognito();
    if (isIncognito) {
        document.body.innerHTML = `
            <div class="flex items-center justify-center h-screen">
                <p class="text-xl font-bold text-red-600">
                    Incognito Mode is not allowed for this quiz 🚫
                </p>
            </div>
        `;
    }
})();

function detectIncognito() {
    return new Promise(function (resolve) {
        const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
        if (!fs) resolve(false);
        fs(window.TEMPORARY, 100, () => resolve(false), () => resolve(true));
    });
}
