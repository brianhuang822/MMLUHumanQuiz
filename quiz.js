let currentSubject;
let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let questionAnswered = false;
const subjects = ["abstract_algebra.csv", "anatomy.csv", "astronomy.csv", "business_ethics.csv", "clinical_knowledge.csv", "college_biology.csv", "college_chemistry.csv", "college_computer_science.csv", "college_mathematics.csv", "college_medicine.csv", "college_physics.csv", "computer_security.csv", "conceptual_physics.csv", "econometrics.csv", "electrical_engineering.csv", "elementary_mathematics.csv", "formal_logic.csv", "global_facts.csv", "high_school_biology.csv", "high_school_chemistry.csv", "high_school_computer_science.csv", "high_school_european_history.csv", "high_school_geography.csv", "high_school_government_and_politics.csv", "high_school_macroeconomics.csv", "high_school_mathematics.csv", "high_school_microeconomics.csv", "high_school_physics.csv", "high_school_psychology.csv", "high_school_statistics.csv", "high_school_us_history.csv", "high_school_world_history.csv", "human_aging.csv", "human_sexuality.csv", "international_law.csv", "jurisprudence.csv", "logical_fallacies.csv", "machine_learning.csv", "management.csv", "marketing.csv", "medical_genetics.csv", "miscellaneous.csv", "moral_disputes.csv", "moral_scenarios.csv", "nutrition.csv", "philosophy.csv", "prehistory.csv", "professional_accounting.csv", "professional_law.csv", "professional_medicine.csv", "professional_psychology.csv", "public_relations.csv", "security_studies.csv", "sociology.csv", "us_foreign_policy.csv", "virology.csv", "world_religions.csv"];

//https://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function loadSubjects() {
    const select = document.getElementById('subjectSelect');
    subjects.forEach(subject => {
        let option = document.createElement('option');
        option.value = subject;
        option.textContent = subject.split('.')[0].replace(/_/g, ' ');
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
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());

    if (result.length === 6 && (result[5] === "A" || result[5] === "B" || result[5] === "C" || result[5] === "D")) {
        const [question, optA, optB, optC, optD, answer] = result;
        return { question, options: [optA, optB, optC, optD], answer };
    } else {
        console.error('Invalid CSV format');
        console.error(line);
        return null;
    }
}

function loadQuestions(subject, option) {
    if (subject !== null) {
        const url = `./${subject}`;
        fetchCsv(url)
            .then(parseCsv)
            .then(loadedQuestions => {
                questions = shuffle(loadedQuestions);
                displayQuestion();
            });
    } else {
        const csvs = option === 1 ? subjects
            : option === 2 ?
            subjects.filter(subject => !subject.includes("elementary") && !subject.includes("high_school"))
            : subjects.filter(subject => !subject.includes("elementary") && !subject.includes("high_school") && !subject.includes("college"));

        let promises = csvs.map(csv => fetchCsv(csv).then(parseCsv));
        Promise.all(promises).then((values) => {
            questions = shuffle(values.flat());
        }).then(() => {
            displayQuestion();
        });
    }
}

function startQuiz(option) {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    questionAnswered = false;
    questions = [];

    if (option === 0) {
        currentSubject = document.getElementById('subjectSelect').value;
        loadQuestions(currentSubject);
    } else if (option === 1) {
        loadQuestions(null, 1);
    } else if (option === 2) {
        loadQuestions(null, 2);
    } else if (option === 3) {
        loadQuestions(null, 3);
    }

    document.getElementById('quizContainer').style.display = 'flex';
    document.getElementById('startContainer').style.display = 'none';
}

function updateProgress() {
    let total = questions.length;
    let current = currentQuestionIndex + 1;
    let pct = total > 0 ? (currentQuestionIndex / total) * 100 : 0;

    document.getElementById('progressText').textContent = `Question ${current} of ${total}`;
    document.getElementById('progressFraction').textContent = `${currentQuestionIndex} answered`;
    document.getElementById('progressBar').style.width = `${pct}%`;
}

function displayQuestion() {
    questionAnswered = false;
    let questionObj = questions[currentQuestionIndex];
    let questionElement = document.getElementById('question');
    let optionsElement = document.getElementById('options');

    optionsElement.innerHTML = '';
    questionElement.innerText = questionObj.question;

    // Hide feedback and next button
    let answerDisplay = document.getElementById('answerDisplay');
    answerDisplay.style.display = 'none';
    answerDisplay.className = 'feedback-card';
    document.getElementById('nextBtn').style.display = 'none';

    questionObj.options.forEach((option, index) => {
        let letter = String.fromCharCode(65 + index);
        let optionButton = document.createElement('button');
        optionButton.innerHTML = `<span class="option-letter">${letter}</span><span>${option}</span>`;
        optionButton.onclick = () => checkAnswer(letter);
        optionsElement.appendChild(optionButton);
    });

    updateStats();
    updateProgress();
}

function updateStats() {
    let totalQuestions = questions.length;
    let answeredQuestions = currentQuestionIndex;
    let correctPercentage = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
    let questionsRemaining = totalQuestions - answeredQuestions;

    document.getElementById('stats').innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${answeredQuestions}</div>
                <div class="stat-label">Answered</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${correctAnswers}</div>
                <div class="stat-label">Correct</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${correctPercentage.toFixed(0)}%</div>
                <div class="stat-label">Accuracy</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${questionsRemaining}</div>
                <div class="stat-label">Remaining</div>
            </div>
        </div>
    `;
}

function checkAnswer(selectedOption) {
    if (questionAnswered) return;
    questionAnswered = true;

    let correctOption = questions[currentQuestionIndex].answer;
    let isCorrect = selectedOption === correctOption;

    if (isCorrect) correctAnswers++;

    // Colour the option buttons
    let buttons = document.querySelectorAll('#options button');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        let letter = String.fromCharCode(65 + idx);
        if (letter === correctOption) {
            btn.classList.add('correct');
        } else if (letter === selectedOption && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Store copy data for clipboard
    document.getElementById('copyData').innerHTML =
        `${questions[currentQuestionIndex].question} ` +
        questions[currentQuestionIndex].options
            .map((v, i) => String.fromCharCode(65 + i) + '. ' + v)
            .join(' ');

    // Show feedback card
    let answerDisplay = document.getElementById('answerDisplay');
    answerDisplay.className = `feedback-card ${isCorrect ? 'correct' : 'incorrect'}`;
    let correctText = questions[currentQuestionIndex].options[correctOption.charCodeAt(0) - 65];
    let selectedText = questions[currentQuestionIndex].options[selectedOption.charCodeAt(0) - 65];
    answerDisplay.innerHTML = `
        <div class="feedback-result ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</div>
        <div class="feedback-detail">
            <strong>Correct answer:</strong> ${correctText}
            ${!isCorrect ? `<br><strong>Your answer:</strong> ${selectedText}` : ''}
        </div>
    `;
    answerDisplay.style.display = 'block';

    // Show next button
    document.getElementById('nextBtn').style.display = 'flex';

    // Refresh stats
    updateStats();
}

function nextQuestion() {
    currentQuestionIndex++;
    questionAnswered = false;

    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    let quizContainer = document.getElementById('quizContainer');
    let pct = questions.length > 0 ? (correctAnswers / questions.length * 100).toFixed(1) : '0.0';
    quizContainer.innerHTML = `
        <div class="end-screen">
            <h2>Quiz Complete!</h2>
            <div class="final-score">${pct}%</div>
            <p class="final-sub">${correctAnswers} out of ${questions.length} correct</p>
            <button class="restart-btn" onclick="location.reload()">Try Again</button>
        </div>
    `;
    document.getElementById('stats').innerHTML = '';
}

function copyLastQuestion() {
    let copyData = document.getElementById('copyData');
    if (copyData.innerHTML) {
        navigator.clipboard.writeText(copyData.innerHTML);
    }
}

function showLastQuestion() {
    let lastQuestionDisplay = document.getElementById('lastQuestionDisplay');
    lastQuestionDisplay.style.display = 'block';
}

window.onload = function() {
    loadSubjects();
};
