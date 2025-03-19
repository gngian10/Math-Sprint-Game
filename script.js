// SPLASH PAGE
const splashPageElem = $(".splash-page");
const startRoundBtn = $(".start-round");
const questionsElems = document.querySelectorAll(".question");

let questionAmount = 0;

function handleQuestion(questionElem) {
    questionsElems.forEach((questionElem) =>
        questionElem.classList.remove("selected")
    );

    questionElem.classList.add("selected");

    let questionValue = Number(questionElem.getAttribute("data-value"));

    if (questionValue) {
        questionAmount = questionValue;
    } else {
        questionAmount = 0;
    }
}

function handleStartRound() {
    if (questionAmount > 0) {
        showCounterPage();
    } else {
        alert("Please, select at least one option!");
    }
}

// events splash page
questionsElems.forEach((questionElem) => {
    questionElem.addEventListener("click", () => handleQuestion(questionElem));
});

startRoundBtn.addEventListener("click", handleStartRound);

// COUNTER PAGE
const counterPageElem = $(".counter-page");
const counterElem = $(".counter");

function showCounterPage() {
    let counter = 3;

    counterElem.textContent = counter;

    splashPageElem.classList.add("hidden");
    counterPageElem.classList.remove("hidden");

    let interval = setInterval(() => {
        if (counter <= 1) {
            counterElem.textContent = "GO!";

            clearInterval(interval);

            return;
        }

        counter--;

        counterElem.textContent = counter;
    }, 1000);

    setTimeout(showGamePage, 4000);
}

// GAME PAGE
const gamePageElem = $(".game-page");
const gamePageEquationsElem = $(".game-page__equations");
const wrongBtn = $(".game-page--wrong");
const rightBtn = $(".game-page--right");
const tmrElem = $(".tmr");
const equationsElem = document.querySelectorAll(".equation");
const gamePageBtns = document.querySelectorAll(".game-page__btn");

let equationsArr = [];
let equationsObj = {};
let tmrGamePage = 0;
let playerGuess = [];
let gamePageInterval;
let gamePageScroll = 0;

function showGamePage() {
    gamePageEquationsElem.innerHTML = "";

    createEquations();

    counterPageElem.classList.add("hidden");
    gamePageElem.classList.remove("hidden");

    runTmr();
}

function createEquations() {
    let rightEquations = getRandomElem("ceil", questionAmount);
    let wrongEquations = questionAmount - rightEquations;

    for (let i = 0; i < rightEquations; i++) {
        let firstElem = getRandomElem("ceil", 10);
        let secondElem = getRandomElem("ceil", 10);
        let answer = firstElem * secondElem;

        let equation = `${firstElem} x ${secondElem} = ${answer}`;

        equationsObj = {
            equation,
            evaluated: "true",
        };

        equationsArr.push(equationsObj);
    }

    for (let i = 0; i < wrongEquations; i++) {
        let firstElem = getRandomElem("ceil", 10);
        let secondElem = getRandomElem("ceil", 10);
        let answer = firstElem * secondElem;

        let wrongFormat = [
            `${firstElem + 1} x ${secondElem} = ${answer}`,
            `${firstElem} x ${secondElem + 1} = ${answer}`,
            `${firstElem} x ${secondElem} = ${answer + 1}`,
        ];

        let equation = wrongFormat[getRandomElem("floor", wrongFormat.length)];

        equationsObj = {
            equation,
            evaluated: "false",
        };

        equationsArr.push(equationsObj);
    }

    shuffle(equationsArr);

    displayEquationsInDOM();
}

function displayEquationsInDOM() {
    equationsArr.forEach((_, i) => {
        let equationElem = document.createElement("span");
        equationElem.classList.add("equation");

        equationElem.textContent = equationsArr[i].equation;

        gamePageEquationsElem.appendChild(equationElem);
    });
}

function runTmr() {
    gamePageInterval = setInterval(() => {
        tmrGamePage += 0.1;

        tmrElem.textContent = `${tmrGamePage.toFixed(1)}s`;

        checkTm();
    }, 100);
}

function checkTm() {
    if (questionAmount === playerGuess.length) {
        gamePageEquationsElem.scrollTop = 0;

        clearInterval(gamePageInterval);

        calculateScore();

        return;
    }
}

// events game page
gamePageBtns.forEach((gamePageBtn) => {
    gamePageBtn.addEventListener("click", () => {
        let optionSelected = gamePageBtn.getAttribute("data-option");

        playerGuess.push(optionSelected);

        gamePageScroll += 80;
        gamePageEquationsElem.scrollTo({
            top: gamePageScroll,
            behavior: "smooth",
        });
    });
});

// SCORE PAGE
const scoreElem = $(".score");
const scoreBaseElem = $(".score-base");
const scorePenaltyElm = $(".score-penalty");
const scorePageElem = $(".score-page");
const playAgainBtn = $(".play-again");

let score = 0;
let scoreBase = 0;
let scorePenalty = 0;

function calculateScore() {
    equationsArr.forEach((equation, i) => {
        if (playerGuess[i] !== equation.evaluated) {
            scorePenalty += 0.5;
        }
    });

    scoreBase = tmrGamePage;
    score = scorePenalty + scoreBase;

    updateBestScore(Number(score.toFixed(1)));

    displayScore();
}

function displayScore() {
    scorePenaltyElm.textContent = `penalty: ${scorePenalty}s`;
    scoreBaseElem.textContent = `base time: ${scoreBase.toFixed(1)}s`;
    scoreElem.textContent = `${score.toFixed(1)}s`;

    gamePageElem.classList.add("hidden");
    scorePageElem.classList.remove("hidden");
}

// events score page
playAgainBtn.addEventListener("click", () => {
    score = 0;
    scoreBase = 0;
    scorePenalty = 0;

    equationsArr = [];
    equationsObj = {};
    tmrGamePage = 0;
    playerGuess = [];
    gamePageScroll = 0;

    scorePageElem.classList.add("hidden");
    splashPageElem.classList.remove("hidden");
});

// session storage
const bestScoreElems = document.querySelectorAll(".best-score");

let bestScoreArr = [];

function loadBestScore() {
    let bestScoreSaved = sessionStorage.getItem("bestScore");

    if (bestScoreSaved) {
        bestScoreArr = JSON.parse(bestScoreSaved);
    } else {
        bestScoreArr = [
            { question: 10, currScore: 0 },
            { question: 20, currScore: 0 },
            { question: 30, currScore: 0 },
            { question: 40, currScore: 0 },
        ];

        sessionStorage.setItem("bestScore", JSON.stringify(bestScoreArr));
    }

    displayBestScoreInDOM();
}

function displayBestScoreInDOM() {
    bestScoreElems.forEach((bestScoreElem, i) => {
        bestScoreElem.textContent = `${bestScoreArr[i].currScore}s`;
    });
}

function updateBestScore(newScore) {
    bestScoreArr.forEach((singleBestScore, i) => {
        let { question, currScore } = singleBestScore;

        if (questionAmount === question) {
            if (currScore === 0 || newScore < currScore) {
                currScore = newScore;

                bestScoreArr[i].currScore = currScore;

                sessionStorage.setItem(
                    "bestScore",
                    JSON.stringify(bestScoreArr)
                );

                displayBestScoreInDOM();
            }
        }
    });
}

// helpers
function $(elem) {
    return document.querySelector(elem);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let randomPos = getRandomElem("floor", i + 1);

        [arr[i], arr[randomPos]] = [arr[randomPos], arr[i]];
    }

    return arr;
}

function getRandomElem(ceil, elem) {
    if (ceil === "ceil") {
        return Math.ceil(Math.random() * elem);
    } else {
        return Math.floor(Math.random() * elem);
    }
}

loadBestScore();
