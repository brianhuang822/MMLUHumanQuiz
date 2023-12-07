let currentSubject;
let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;

function loadSubjects() {
    // Example subjects - replace with actual file names
    const subjects = ["abstract_algebra.csv", "anatomy.csv", "astronomy.csv", "business_ethics.csv", "clinical_knowledge.csv", "college_biology.csv", "college_chemistry.csv", "college_computer_science.csv", "college_mathematics.csv", "college_medicine.csv", "college_physics.csv", "computer_security.csv", "conceptual_physics.csv", "econometrics.csv", "electrical_engineering.csv", "elementary_mathematics.csv", "formal_logic.csv", "global_facts.csv", "high_school_biology.csv", "high_school_chemistry.csv", "high_school_computer_science.csv", "high_school_european_history.csv", "high_school_geography.csv", "high_school_government_and_politics.csv", "high_school_macroeconomics.csv", "high_school_mathematics.csv", "high_school_microeconomics.csv", "high_school_physics.csv", "high_school_psychology.csv", "high_school_statistics.csv", "high_school_us_history.csv", "high_school_world_history.csv", "human_aging.csv", "human_sexuality.csv", "international_law.csv", "jurisprudence.csv", "logical_fallacies.csv", "machine_learning.csv", "management.csv", "marketing.csv", "medical_genetics.csv", "miscellaneous.csv", "moral_disputes.csv", "moral_scenarios.csv", "nutrition.csv", "philosophy.csv", "prehistory.csv", "professional_accounting.csv", "professional_law.csv", "professional_medicine.csv", "professional_psychology.csv", "public_relations.csv", "security_studies.csv", "sociology.csv", "us_foreign_policy.csv", "virology.csv", "world_religions.csv"];
    const select = document.getElementById('subjectSelect');
    subjects.forEach(subject => {
        let option = document.createElement('option');
        option.value = subject;
        option.textContent = subject.split('.')[0];
        select.appendChild(option);
    });
}

function fetchCsv(url) {
    return fetch(url).then(response => response.text());
}

function parseCsv(csv) {
    const lines = csv.split('\n');
    return lines.map(line => parseCsvLine(line)).filter(line => line !== null);
}

function parseCsvLine(line) {
    let result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || i+1 === line.length || line[i - 1] === ',' || line[i + 1] === ',')) {
            // Toggle the inQuotes flag if we're at the start of a new quoted field
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            // If we hit a comma and we're not within quotes, push the field to the result
            result.push(current.trim());
            current = '';
        }
        else {
            current += char;
        }
    }

    // Push the last field, as it's not followed by a comma
    result.push(current.trim());

    // Assuming the format: question, option A, option B, option C, option D, answer
    if (result.length === 6) {
        const [question, optA, optB, optC, optD, answer] = result;
        return { question, options: [optA, optB, optC, optD], answer };
    } else {
        // Handle error or return a default value
        console.error('Invalid CSV format');
        console.error(line);

        return null;
    }
}
function loadQuestions(subject) {
    const url = `./${subject}`; // Path to the CSV file
    fetchCsv(url)
        .then(parseCsv)
        .then(loadedQuestions => {
            questions = loadedQuestions;
            currentQuestionIndex = 0;
            correctAnswers = 0;
            displayQuestion();
        });
}

function startQuiz() {
    currentSubject = document.getElementById('subjectSelect').value;
    loadQuestions(currentSubject);
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('startContainer').style.display = 'none';
}

function displayQuestion() {
    let questionObj = questions[currentQuestionIndex];
    let questionElement = document.getElementById('question');
    let optionsElement = document.getElementById('options');

    // Clear previous options
    optionsElement.innerHTML = '';

    // Set the question text
    questionElement.innerText = questionObj.question;

    // Create and display options
    questionObj.options.forEach((option, index) => {
        let optionButton = document.createElement('button');
        optionButton.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
        optionButton.onclick = () => checkAnswer(String.fromCharCode(65 + index));
        optionsElement.appendChild(optionButton);
    });

    // Update statistics
    updateStats();
}

function updateStats() {
    let totalQuestions = questions.length;
    let answeredQuestions = currentQuestionIndex;
    let correctPercentage = (correctAnswers / answeredQuestions) * 100;
    let questionsRemaining = totalQuestions - answeredQuestions;

    let statsElement = document.getElementById('stats');
    statsElement.innerHTML = `
        Questions Answered: ${answeredQuestions} / ${totalQuestions}<br>
        Correct Answers: ${correctAnswers}<br>
        Correctness: ${correctPercentage.toFixed(2)}%<br>
        Questions Remaining: ${questionsRemaining}
    `;
}

function checkAnswer(selectedOption) {
    let correctOption = questions[currentQuestionIndex].answer;
    if (selectedOption === correctOption) {
        correctAnswers++;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}
function endQuiz() {
    // Hide the question and options
    document.getElementById('quizContainer').style.display = 'none';

    // Display final stats
    let finalStats = `
        <h2>Quiz Completed!</h2>
        <p>Total Questions: ${questions.length}</p>
        <p>Correct Answers: ${correctAnswers}</p>
        <p>Correctness: ${(correctAnswers / questions.length * 100).toFixed(2)}%</p>
    `;
    document.getElementById('stats').innerHTML = finalStats;
}

window.onload = function() {
    loadSubjects();
};