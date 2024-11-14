// Game state
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = gridSize;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameSpeed = 100;
let lastDirection = { dx: gridSize, dy: 0 };

// Apple image
const appleImage = new Image();
appleImage.src = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="#ff3b30" d="M18.8,9.8c-0.7-0.7-1.6-1.1-2.7-1.1c-1,0-2,0.4-2.7,1.1c-0.7-0.7-1.6-1.1-2.7-1.1c-1,0-2,0.4-2.7,1.1 c-1.5,1.5-1.5,3.9,0,5.4l5.4,5.4l5.4-5.4C20.3,13.7,20.3,11.3,18.8,9.8z"/>
        <path fill="#32cd32" d="M12.1,4.5c0,0-0.1-1.5,1.4-1.5c1.5,0,1.4,1.5,1.4,1.5"/>
    </svg>
`);

// Update high score display
document.getElementById('highScore').textContent = highScore;

// Handle touch/click controls
window.handleControl = function(direction) {
    const directions = {
        'ArrowUp': { dx: 0, dy: -gridSize },
        'ArrowDown': { dx: 0, dy: gridSize },
        'ArrowLeft': { dx: -gridSize, dy: 0 },
        'ArrowRight': { dx: gridSize, dy: 0 }
    };
    
    const newDirection = directions[direction];
    if (newDirection && isValidDirection(newDirection)) {
        dx = newDirection.dx;
        dy = newDirection.dy;
        lastDirection = { dx, dy };
    }
};

function isValidDirection(newDir) {
    return !(newDir.dx === -lastDirection.dx && newDir.dy === -lastDirection.dy);
}

export function startGame() {
    // Initialize snake
    snake = [
        { x: 5 * gridSize, y: 5 * gridSize }
    ];
    
    // Reset direction and speed
    dx = gridSize;
    dy = 0;
    lastDirection = { dx: gridSize, dy: 0 };
    gameSpeed = 100;
    
    // Reset score
    score = 0;
    document.getElementById('score').textContent = score;
    
    // Hide game over screen
    document.getElementById('gameOver').style.display = 'none';
    
    // Place initial food
    placeFood();
    
    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
}

function placeFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount) * gridSize,
            y: Math.floor(Math.random() * tileCount) * gridSize
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

function update() {
    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || 
        head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        
        // Increase speed every 50 points
        if (score % 50 === 0) {
            gameSpeed = Math.max(50, gameSpeed - 10);
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
        
        placeFood();
    } else {
        snake.pop();
    }
    
    // Draw everything
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Draw head
            ctx.fillStyle = '#32cd32';
            ctx.shadowColor = '#32cd32';
        } else {
            // Draw body with gradient
            const greenIntensity = Math.max(40, 70 - index * 2);
            ctx.fillStyle = `hsl(120, 61%, ${greenIntensity}%)`;
            ctx.shadowColor = `hsl(120, 61%, ${greenIntensity}%)`;
        }
        ctx.shadowBlur = index === 0 ? 15 : 10;
        ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
        
        if (index === 0) {
            // Draw eyes
            ctx.fillStyle = '#000';
            const eyeSize = 3;
            const eyeOffset = 4;
            if (dx > 0) {
                ctx.fillRect(segment.x + gridSize - eyeOffset - 2, segment.y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x + gridSize - eyeOffset - 2, segment.y + gridSize - eyeOffset - 3, eyeSize, eyeSize);
            } else if (dx < 0) {
                ctx.fillRect(segment.x + eyeOffset, segment.y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x + eyeOffset, segment.y + gridSize - eyeOffset - 3, eyeSize, eyeSize);
            } else if (dy > 0) {
                ctx.fillRect(segment.x + eyeOffset, segment.y + gridSize - eyeOffset - 2, eyeSize, eyeSize);
                ctx.fillRect(segment.x + gridSize - eyeOffset - 3, segment.y + gridSize - eyeOffset - 2, eyeSize, eyeSize);
            } else {
                ctx.fillRect(segment.x + eyeOffset, segment.y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x + gridSize - eyeOffset - 3, segment.y + eyeOffset, eyeSize, eyeSize);
            }
        }
    });
    
    // Draw food (apple)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff3b30';
    ctx.drawImage(appleImage, food.x, food.y, gridSize, gridSize);
}

function gameOver() {
    clearInterval(gameLoop);
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = score;
}

// Handle keyboard controls
document.addEventListener('keydown', (e) => {
    handleControl(e.key);
});