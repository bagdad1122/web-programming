let isGameRunning = false;
let keys = {};

// Завантаження зображень (спрайтів)
const playerImg = new Image();
playerImg.src = 'img/player.png';

const obstacleImg = new Image();
obstacleImg.src = 'img/obstacle.png';

const chargerImg = new Image();
chargerImg.src = 'img/charger.png';

window.addEventListener('keydown', (e) => { 
    keys[e.code] = true; 
    if (isGameRunning && (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'Space')) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => { 
    keys[e.code] = false; 
});

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Розміри гравця можна трохи збільшити під пропорції іконки машини
    let player = { x: 50, y: 180, width: 70, height: 35, speed: 5, battery: 100, score: 0 };
    let obstacles = [];
    let chargers = [];
    isGameRunning = true;

    function spawnEntity(array, isCharger) {
        array.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 40),
            width: isCharger ? 30 : 35 + Math.random() * 15,
            height: isCharger ? 30 : 35 + Math.random() * 15,
            speed: 3 + Math.random() * 2,
            isCharger: isCharger
        });
    }

    function update() {
        if (!isGameRunning) return;

        if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
        if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

        player.battery -= 0.05;
        player.score += 1;

        if (player.battery <= 0) {
            gameOver(ctx, player.score);
            return;
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= obs.speed;
            
            // Зіткнення (хітбокси трохи зменшені для більшої реалістичності іконок)
            if (player.x < obs.x + obs.width - 5 && player.x + player.width > obs.x + 5 &&
                player.y < obs.y + obs.height - 5 && player.y + player.height > obs.y + 5) {
                player.battery -= 20;
                obstacles.splice(i, 1);
            } else if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
            }
        }

        for (let i = chargers.length - 1; i >= 0; i--) {
            let ch = chargers[i];
            ch.x -= ch.speed;
            
            if (player.x < ch.x + ch.width && player.x + player.width > ch.x &&
                player.y < ch.y + ch.height && player.y + player.height > ch.y) {
                player.battery = Math.min(100, player.battery + 15);
                chargers.splice(i, 1);
            } else if (ch.x + ch.width < 0) {
                chargers.splice(i, 1);
            }
        }

        if (Math.random() < 0.02) spawnEntity(obstacles, false);
        if (Math.random() < 0.01) spawnEntity(chargers, true);
    }

    function draw() {
        if (!isGameRunning) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Малювання гравця (з перевіркою чи завантажилась картинка)
        if (playerImg.complete && playerImg.naturalHeight !== 0) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = '#0d6efd';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        // Малювання об'єктів
        obstacles.forEach(obs => { 
            if (obstacleImg.complete && obstacleImg.naturalHeight !== 0) {
                ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
            } else {
                ctx.fillStyle = '#dc3545'; 
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height); 
            }
        });

        chargers.forEach(ch => { 
            if (chargerImg.complete && chargerImg.naturalHeight !== 0) {
                ctx.drawImage(chargerImg, ch.x, ch.y, ch.width, ch.height);
            } else {
                ctx.fillStyle = '#198754'; 
                ctx.fillRect(ch.x, ch.y, ch.width, ch.height); 
            }
        });

        // Інтерфейс
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Рахунок: ${Math.floor(player.score)}`, 10, 20);
        ctx.fillText(`Батарея: ${Math.floor(player.battery)}%`, 10, 40);
    }

    function gameLoop() {
        if (!isGameRunning) return;
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

function gameOver(ctx, score) {
    isGameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 800, 400);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Батарея розряджена!', 250, 180);
    ctx.fillText(`Ваш рахунок: ${Math.floor(score)}`, 270, 230);
    
    const btn = document.getElementById('startGameBtn');
    if (btn) btn.innerText = 'Грати знову';
}

document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'startGameBtn') {
        e.target.innerText = 'Гра йде...';
        initGame();
        window.focus(); 
    }
});
