const canvas = document.getElementById('snake-field');
const ctx = canvas.getContext('2d');

const FIELD_SIZE_X = 600;
const FIELD_SIZE_Y = 600;
const CELL_SIZE = 20;
const SNAKE_SPEED = 50;
let snake = [];
let direction = 'RIGHT';
let gameIsRunning = false;
let snake_timer;
let score = 0;
let lives = 3;
let food = { x: 0, y: 0, type: 'normal' };

document.getElementById('snake-start').addEventListener('click', startGame);
document.getElementById('snake-renew').addEventListener('click', refreshGame);
document.addEventListener('keydown', changeDirection);

function init() {
    canvas.width = FIELD_SIZE_X;
    canvas.height = FIELD_SIZE_Y;
    updateScore();
    updateLives();
}

function startGame() {
    if (!gameIsRunning) {
        gameIsRunning = true;
        respawn();
        snake_timer = setInterval(move, SNAKE_SPEED);
        createFood();
        playBackgroundMusic();
    }
}

function respawn() {
    snake[0] = { x: 200, y: 200 }; // Перемещаем голову змейки на начальную позицию
    direction = 'RIGHT';
}

function move() {
    const head = { ...snake[0] };

    switch (direction) {
        case 'LEFT':
            head.x -= CELL_SIZE;
            break;
        case 'UP':
            head.y -= CELL_SIZE;
            break;
        case 'RIGHT':
            head.x += CELL_SIZE;
            break;
        case 'DOWN':
            head.y += CELL_SIZE;
            break;
    }

    if (head.x < 0 || head.x >= FIELD_SIZE_X || head.y < 0 || head.y >= FIELD_SIZE_Y || isSnakeUnit(head)) {
        lives--;
        updateLives();
        if (lives <= 0) {
            finishTheGame();
        } else {
            respawn(); // При потере жизни только перемещаем голову на начальную позицию
        }
        return;
    }

    snake.unshift(head);

    if (!haveFood(head)) {
        snake.pop();
    }

    draw();
}

function isSnakeUnit(unit) {
    return snake.some(segment => segment.x === unit.x && segment.y === unit.y);
}

let foodProbabilities = {
    normal: 0.6,
    poison: 0.2,
    special: 0.2
};

const foods = []; // Создаем массив для хранения еды

function createFood() {
    for (let i = foods.length; i < 2; i++) { // Проверяем, сколько еды уже на поле
        let foodCreated = false;
        while (!foodCreated) {
            const foodX = Math.floor(Math.random() * FIELD_SIZE_X / CELL_SIZE) * CELL_SIZE;
            const foodY = Math.floor(Math.random() * FIELD_SIZE_Y / CELL_SIZE) * CELL_SIZE;
            const foodType = Math.random();
            let cumulativeProbability = 0;

            for (const [type, probability] of Object.entries(foodProbabilities)) {
                cumulativeProbability += probability;
                if (foodType < cumulativeProbability) {
                    if (type === 'poison' && foods.some(food => food.type === 'poison')) {
                        // Если уже есть отравленная еда на поле, пропускаем создание новой
                        continue;
                    }
                    foods.push({ x: foodX, y: foodY, type: type }); // Добавляем новую единицу еды в массив
                    foodCreated = true;
                    break;
                }
            }

            if (!snake.some(segment => segment.x === foodX && segment.y === foodY)) {
                foodCreated = true;
            }
        }
    }
}


function drawFood() {
    foods.forEach(food => {
        if (food.type === 'special') {
            ctx.fillStyle = 'orange';
        } else if (food.type === 'poison') {
            ctx.fillStyle = 'red';
        } else {
            ctx.fillStyle = 'black';
        }
        ctx.fillRect(food.x, food.y, CELL_SIZE, CELL_SIZE);
    });
}

function haveFood(head) {
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        if (head.x === food.x && head.y === food.y) {
            if (food.type === 'special') {
                // Добавляем 3 единицы длины змейки
                for (let i = 0; i < 3; i++) {
                    snake.unshift({ ...snake[0] });
                }
                score += 3; // Увеличиваем счет на 3
            } else if (food.type === 'poison') {
                // Отнимаем 1 жизнь, 1 очко и 1 единицу длины змейки
                if (score === 0) {
                    finishTheGame();
                    return false; // Не продолжаем выполнение функции, чтобы не создавать новую еду
                }
                lives--;
                score--;
                snake.pop();
                updateLives();
                updateScore();
            } else {
                snake.unshift({ ...snake[0] }); // Добавляем 1 единицу длины змейки
                score++; // Увеличиваем счет на 1
            }
            updateScore(); // Обновляем отображение счета
            foods.splice(i, 1); // Удаляем съеденную еду из массива
            createFood(); // Создаем новую еду
            return true;
        }
    }
    return false;
}

function draw() {
    ctx.clearRect(0, 0, FIELD_SIZE_X, FIELD_SIZE_Y);
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, CELL_SIZE, CELL_SIZE);
    });
    drawFood();
}


function changeDirection(event) {
    const key = event.keyCode;
    if ((key === 37 && direction !== 'RIGHT') ||
        (key === 38 && direction !== 'DOWN') ||
        (key === 39 && direction !== 'LEFT') ||
        (key === 40 && direction !== 'UP')) {
        direction = {
            37: 'LEFT',
            38: 'UP',
            39: 'RIGHT',
            40: 'DOWN'
        }[key];
    }
}

function draw() {
    ctx.clearRect(0, 0, FIELD_SIZE_X, FIELD_SIZE_Y);
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, CELL_SIZE, CELL_SIZE);
    });
    drawFood();
}

function finishTheGame() {
    clearInterval(snake_timer);
    gameIsRunning = false;
    alert('Game Over! Your score: ' + score);
    pauseBackgroundMusic();
}

function refreshGame() {
    location.reload();
}

function updateScore() {
    document.getElementById('score').innerText = 'Score: ' + score;
}

function updateLives() {
    document.getElementById('lives').innerText = 'Lives: ' + lives;
}

const backgroundMusic = document.getElementById('background-music');

function playBackgroundMusic() {
    backgroundMusic.play();
}

function pauseBackgroundMusic() {
    backgroundMusic.pause();
}

window.onload = init;
