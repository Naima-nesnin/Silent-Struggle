let questions = [];

function addQuestion() {
    const username = document.getElementById("username").value;
    const questionText = document.getElementById("questionInput").value;

    if (username === "" || questionText === "") {
        alert("Please fill all fields!");
        return;
    }

    const question = {
        id: Date.now(),
        user: username,
        text: questionText,
        answers: []
    };

    questions.push(question);

    document.getElementById("username").value = "";
    document.getElementById("questionInput").value = "";

    displayQuestions();
}

function addAnswer(questionId) {
    const answerInput = document.getElementById("answerInput-" + questionId);
    const answerText = answerInput.value;

    if (answerText === "") {
        alert("Enter answer!");
        return;
    }

    const question = questions.find(q => q.id === questionId);
    question.answers.push(answerText);

    answerInput.value = "";

    displayQuestions();
}

function displayQuestions() {
    const container = document.getElementById("questionsContainer");
    container.innerHTML = "";

    questions.forEach(question => {
        const div = document.createElement("div");
        div.className = "question-card";

        let answersHTML = "";
        question.answers.forEach(answer => {
            answersHTML += `<p><strong>Answer:</strong> ${answer}</p>`;
        });

        div.innerHTML = `
            <h3>${question.user} asks:</h3>
            <p>${question.text}</p>

            ${answersHTML}

            <div class="answer-box">
                <textarea id="answerInput-${question.id}" placeholder="Write your answer..."></textarea>
                <button onclick="addAnswer(${question.id})">Submit Answer</button>
            </div>
        `;

        container.appendChild(div);
    });
}