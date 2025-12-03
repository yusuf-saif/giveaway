async function loadQuestions() {
    const res = await fetch("data/questions.json");
    return await res.json();
}

loadQuestions().then(questions => {
    document.getElementById("quiz-box").innerHTML = `
        <div class="p-4 bg-white rounded-xl shadow">
            ${questions.map((q, i) => `
                <div class="mb-6">
                    <p class="font-semibold mb-2">${i+1}. ${q.question}</p>
                    ${q.options.map(opt => `
                        <label class="block">
                            <input type="radio" name="q${i}" value="${opt}" class="mr-2">
                            ${opt}
                        </label>
                    `).join("")}
                </div>
            `).join("")}
            <button onclick="submitQuiz()" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
                Submit
            </button>
        </div>
    `;
});

function submitQuiz() {
    const answers = document.querySelectorAll("input[type=radio]:checked");
    if (answers.length < 10) return alert("Answer all questions!");

    const score = [...answers].filter(a => a.value === "correct").length;
    showSuccess(score);

    saveWinner(score);
    sendEmail(score);
}

function sendEmail(score) {
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        score: score,
        user_email: "someone@example.com"
    }).then(() => {
        console.log("Email sent!");
    });
}
