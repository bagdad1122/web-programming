let isGameRunning = false;
let keys = {};

// Обробники клавіатури (винесені назовні, щоб не дублюватись при перезапуску)
window.addEventListener('keydown', (e) => { 
    keys[e.code] = true; 
    // Блокуємо скрол тільки для стрілок і пробілу, коли гра активна
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
    
    // Скидаємо стан гри для нових запусків
    let player = { x: 50, y: 180, width: 60, height: 30, speed: 5, battery: 100, score: 0 };
    let obstacles = [];
    let chargers = [];
    isGameRunning = true;

    function spawnEntity(array, color, isCharger) {
        array.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 30),
            width: isCharger ? 20 : 30 + Math.random() * 40,
            height: isCharger ? 20 : 30 + Math.random() * 40,
            speed: 3 + Math.random() * 2,
            color: color
        });
    }

    function update() {
        if (!isGameRunning) return;

        // Рух гравця
        if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
        if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

        // Дренаж батареї
        player.battery -= 0.05;
        player.score += 1;

        if (player.battery <= 0) {
            gameOver(ctx, player.score);
            return;
        }

        // Обробка перешкод (йдемо з кінця масиву, щоб уникнути багів при видаленні)
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= obs.speed;
            
            if (player.x < obs.x + obs.width && player.x + player.width > obs.x &&
                player.y < obs.y + obs.height && player.y + player.height > obs.y) {
                player.battery -= 20;
                obstacles.splice(i, 1);
            } else if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
            }
        }

        // Обробка зарядних станцій
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

        // Спавн
        if (Math.random() < 0.02) spawnEntity(obstacles, '#dc3545', false);
        if (Math.random() < 0.01) spawnEntity(chargers, '#198754', true);
    }

    function draw() {
        if (!isGameRunning) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Гравець
        ctx.fillStyle = '#0d6efd';
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Об'єкти
        obstacles.forEach(obs => { ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.width, obs.height); });
        chargers.forEach(ch => { ctx.fillStyle = ch.color; ctx.fillRect(ch.x, ch.y, ch.width, ch.height); });

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

// Запуск гри
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'startGameBtn') {
        e.target.innerText = 'Гра йде...';
        initGame();
        // Примусовий фокус для захоплення клавіатури
        window.focus(); 
    }
});
