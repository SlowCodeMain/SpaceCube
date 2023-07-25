const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const imgPlayer = new Image();
imgPlayer.src = './img/player/playerShip1_blue.png';


class Player {
    constructor(imgPlayer) {
        this.xPosition = (canvas.width - 30) / 2;
        this.yPosition = canvas.height - 100;
        this.width = 50;
        this.height = 50;
        this.imgPlayer = imgPlayer;
        this.speed = 10;
        this.life = 100;
    }

    drawPlayer(context) {
        context.drawImage(this.imgPlayer, this.xPosition, this.yPosition, this.width, this.height);
    }

    moverArriba() {
        if (this.yPosition > 0) {
            this.yPosition = this.yPosition - this.speed;
        }
    }

    moverAbajo() {
        if (this.yPosition < canvas.height - this.height) {
            this.yPosition = this.yPosition + this.speed;
        }
    }

    moverIzquierda() {
        if (this.xPosition > 0) {
            this.xPosition = this.xPosition - this.speed;
        }
    }

    moverDerecha() {
        if (this.xPosition < canvas.width - this.width) {
            this.xPosition = this.xPosition + this.speed;
        }
    }

    takeDamage(damage) {
        this.life -= damage;
    }

    shoot() {
        const bulletWidth = 5;
        const bulletHeight = 10;
        const bulletX = this.xPosition + this.width / 2 - bulletWidth / 2;
        const bulletY = this.yPosition;
        const bulletSpeed = 15;
        const newBullet = new Bullet(bulletX, bulletY, bulletWidth, bulletHeight, 'yellow', bulletSpeed);
        bullets.push(newBullet);
    }
}

class Enemy {
    constructor(x, y, width, height, color, speed) {
        this.xPosition = x;
        this.yPosition = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
    }

    drawEnemy(context) {
        context.fillStyle = this.color;
        context.fillRect(this.xPosition, this.yPosition, this.width, this.height);
    }

    updatePosition() {
        this.yPosition += this.speed;
    }

    collidesWithPlayer(player) {
        return (
            this.xPosition < player.xPosition + player.width &&
            this.xPosition + this.width > player.xPosition &&
            this.yPosition < player.yPosition + player.height &&
            this.yPosition + this.height > player.yPosition
        );
    }

    collidesWithBullet(bullet) {
        return (
            this.xPosition < bullet.xPosition + bullet.width &&
            this.xPosition + this.width > bullet.xPosition &&
            this.yPosition < bullet.yPosition + bullet.height &&
            this.yPosition + this.height > bullet.yPosition
        );
    }
}

class Bullet {
    constructor(x, y, width, height, color, speed) {
        this.xPosition = x;
        this.yPosition = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
    }

    drawBullet(context) {
        context.fillStyle = this.color;
        context.fillRect(this.xPosition, this.yPosition, this.width, this.height);
    }

    updatePosition() {
        this.yPosition -= this.speed;
    }
}

const player = new Player(imgPlayer);
const targetFps = 60;
const frameDuration = 1000 / targetFps; // Duración de cada fotograma en milisegundos

const enemies = []; // Array para almacenar los enemigos
const bullets = []; // Array para almacenar las balas disparadas
let score = 0; // Variable para llevar el puntaje
let lives = 3; // Variable para llevar la cantidad de vidas del jugador
let gameState = 'menu'; // Variable para controlar el estado del juego
let enemySpeed = 2; // Velocidad inicial de los enemigos
let currentLevel = 1; // Nivel actual
let enemyColor = 'red'; // Color inicial de los enemigos

let lastTime = 0;

// Función para mostrar el menú
function showMenu() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('¡Bienvenido a SpaceCube!', canvas.width / 2 - 195, canvas.height / 2 - 30);
    ctx.font = '24px Arial';
    ctx.fillText('Presiona "Espacio" para comenzar:', canvas.width / 2 - 200, canvas.height / 2 + 10);
    ctx.fillText('Usa las flechas para moverte y dispara con espacio', canvas.width / 2 - 290, canvas.height / 2 + 50);
}

// Función para reiniciar el juego cuando el jugador pierda todas sus vidas
function restartGame() {
    player.xPosition = (canvas.width - 30) / 2;
    player.yPosition = canvas.height - 100;
    player.life = 100;
    score = 0;
    lives = 3;
    enemies.length = 0;
    bullets.length = 0;
    gameState = 'playing';
    currentLevel = 1;
    enemySpeed = 2;
    enemyColor = 'red';
}

// Función para actualizar la dificultad de los enemigos y cambiar color aleatorio al avanzar de nivel
function updateEnemyDifficulty() {
    if (score >= currentLevel * 100) {
        currentLevel++;
        enemySpeed += 2;
        enemyColor = getRandomColor();
    }
}

// Función para obtener un color aleatorio
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Función para actualizar el juego
function updateGame(timestamp) {
    const deltaTime = timestamp - lastTime;

    if (deltaTime >= frameDuration) {
        lastTime = timestamp - (deltaTime % frameDuration);

        // Borrar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mostrar el menú si el juego no ha comenzado
        if (gameState === 'menu') {
            showMenu();
            requestAnimationFrame(updateGame);
            return;
        }

        // Reiniciar el juego si el jugador perdió todas sus vidas
        if (gameState === 'gameOver') {
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.fillText('¡Has perdido! Presiona "Espacio" para reiniciar', canvas.width / 2 - 310, canvas.height / 2);
            requestAnimationFrame(updateGame);
            return;
        }

        // Lógica del juego aquí
        handleCollisions();
        updateEnemyDifficulty();

        // Renderizar el jugador
        player.drawPlayer(ctx);

        // Renderizar los enemigos
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            enemy.updatePosition();
            enemy.drawEnemy(ctx);

            // Eliminar enemigos que estén fuera del canvas
            if (enemy.yPosition > canvas.height) {
                enemies.splice(i, 1);
                i--;
            }

            // Verificar colisión con el jugador
            if (enemy.collidesWithPlayer(player)) {
                player.takeDamage(10); // Reducir 10 de vida al jugador cuando colisiona con un enemigo
                enemies.splice(i, 1); // Eliminar el enemigo que colisionó
                i--;
                lives--; // Restar una vida al jugador
            }
        }

        // Renderizar las balas disparadas
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            bullet.updatePosition();
            bullet.drawBullet(ctx);

            // Eliminar balas que estén fuera del canvas
            if (bullet.yPosition < 0) {
                bullets.splice(i, 1);
                i--;
            } else {
                // Verificar colisión con los enemigos
                for (let j = 0; j < enemies.length; j++) {
                    const enemy = enemies[j];
                    if (enemy.collidesWithBullet(bullet)) {
                        enemies.splice(j, 1); // Eliminar el enemigo que fue impactado por la bala
                        bullets.splice(i, 1); // Eliminar la bala
                        i--;
                        score += 10; // Incrementar el puntaje del jugador por eliminar un enemigo
                        break;
                    }
                }
            }
        }

        // Renderizar el puntaje del jugador
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Score: ' + score, canvas.width - 150, 30);

        // Renderizar las vidas del jugador
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Lives: ' + lives, 10, 30);

        // Renderizar el nivel actual
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Level: ' + currentLevel, canvas.width / 2 - 50, 30);

        // Verificar si el jugador perdió todas sus vidas
        if (lives <= 0) {
            gameState = 'gameOver';
        }
    }

    requestAnimationFrame(updateGame); // Llamar a la función de nuevo para el siguiente fotograma
}

// Función para crear enemigos en intervalos
function createEnemy() {
    const enemyWidth = 30;
    const enemyHeight = 30;
    const enemyX = Math.random() * (canvas.width - enemyWidth);
    const enemyY = -enemyHeight;
    const newEnemy = new Enemy(enemyX, enemyY, enemyWidth, enemyHeight, enemyColor, enemySpeed);
    enemies.push(newEnemy);
}

// Event listeners para el movimiento del jugador
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            player.moverArriba();
            break;
        case 'ArrowDown':
            player.moverAbajo();
            break;
        case 'ArrowLeft':
            player.moverIzquierda();
            break;
        case 'ArrowRight':
            player.moverDerecha();
            break;
        case ' ':
            if (gameState === 'menu') {
                // Comenzar el juego al presionar la tecla Espacio en el menú
                gameState = 'playing';
            } else if (gameState === 'gameOver') {
                // Reiniciar el juego al presionar la tecla Espacio luego de perder
                restartGame();
            } else if (gameState === 'playing') {
                // Disparar con la tecla Espacio mientras el juego está en curso
                player.shoot();
            }
            break;
    }
});

// Función para manejar las colisiones entre balas y enemigos
function handleCollisions() {
}

// Crear enemigos cada 1 segundo
setInterval(createEnemy, 1000);

// Iniciar el juego llamando a updateGame() por primera vez
requestAnimationFrame(updateGame);