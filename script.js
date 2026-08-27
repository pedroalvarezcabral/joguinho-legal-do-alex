const player = document.getElementById('player');
const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over-screen');
const backgroundCity = document.getElementById('background-city');

let isJumping = false;
let isGameOver = false;
let score = 0;

let gameSpeed = 5;
let playerBottom = 12;
let gravity = 0.9;
let velocityY = 0;

let obstacles = [];
let birds = [];
let bgX = 0;

let obstacleTimer = null;
let birdTimer = null;
let animationFrame = null;

// ===============================
// SVG DO SKATISTA
// ===============================

const skaterSVG = `
  <svg width="45" height="60" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 30 25 C 30 10, 65 10, 65 25 Z" fill="#E74C3C" />
    <path d="M 20 25 L 45 23" stroke="#E74C3C" stroke-width="5" stroke-linecap="round"/>

    <circle cx="50" cy="30" r="14" fill="#F39C12" />
    <circle cx="48" cy="32" r="12" fill="#F5CBA7" />

    <circle cx="42" cy="32" r="2" fill="#000" />

    <path d="M 32 44 L 64 44 L 60 80 L 36 80 Z" fill="#2980B9" />

    <path d="M 34 48 L 15 60"
      stroke="#F5CBA7"
      stroke-width="6"
      stroke-linecap="round"/>

    <path d="M 62 48 L 80 55"
      stroke="#F5CBA7"
      stroke-width="6"
      stroke-linecap="round"/>

    <!-- Perna de apoio -->
    <path d="M 60 80 L 68 108"
      stroke="#34495E"
      stroke-width="8"
      stroke-linecap="round"/>

    <ellipse cx="73" cy="110" rx="8" ry="4" fill="#ECF0F1" />

    <!-- Perna de remada -->
    <g class="leg-push">
      <path d="M 36 80 L 28 108"
        stroke="#34495E"
        stroke-width="8"
        stroke-linecap="round"/>

      <ellipse cx="23" cy="110" rx="8" ry="4" fill="#ECF0F1" />
    </g>

    <!-- Skate -->
    <g class="skate-deck">
      <rect x="5" y="114" width="86" height="7" rx="3" fill="#27AE60" />

      <circle cx="20" cy="124" r="5" fill="#34495E" />
      <circle cx="76" cy="124" r="5" fill="#34495E" />
    </g>
  </svg>
`;

// ===============================
// SVG DO CONE
// ===============================

const coneSVG = `
  <svg width="32" height="42" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="85" width="70" height="12" rx="2" fill="#D35400" />

    <path d="M 15 85 L 32 10 L 48 10 L 65 85 Z"
      fill="#E67E22" />

    <path d="M 23 60 L 28 42 L 52 42 L 57 60 Z"
      fill="#ECF0F1" />

    <path d="M 29 38 L 33 25 L 47 25 L 51 38 Z"
      fill="#ECF0F1" />
  </svg>
`;

// ===============================
// SVG DA VELHINHA
// ===============================

const velhinhaSVG = `
  <svg width="40" height="55" viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="35" r="26" fill="#BDC3C7" />

    <circle cx="50" cy="45" r="18" fill="#F5CBA7" />

    <path d="M 38 38 L 48 44"
      stroke="#4A2E18"
      stroke-width="3.5"
      stroke-linecap="round"/>

    <path d="M 62 38 L 52 44"
      stroke="#4A2E18"
      stroke-width="3.5"
      stroke-linecap="round"/>

    <circle cx="43" cy="45" r="2" fill="#000" />
    <circle cx="57" cy="45" r="2" fill="#000" />

    <path d="M 30 20 L 36 26 M 36 20 L 30 26"
      stroke="#E74C3C"
      stroke-width="2.5"
      stroke-linecap="round"/>

    <path d="M 42 56 Q 50 50 58 56"
      stroke="#000"
      stroke-width="3"
      fill="none"
      stroke-linecap="round"/>

    <path d="M 72 65 L 85 125"
      stroke="#6D4C41"
      stroke-width="5"
      stroke-linecap="round"/>

    <path d="M 72 65 C 72 55, 82 55, 82 65"
      stroke="#6D4C41"
      stroke-width="5"
      fill="none"
      stroke-linecap="round"/>

    <path d="M 35 65 L 65 65 L 70 115 L 30 115 Z"
      fill="#8E44AD" />

    <path d="M 35 70 L 20 85"
      stroke="#F5CBA7"
      stroke-width="6"
      stroke-linecap="round"/>

    <path d="M 65 70 L 78 75"
      stroke="#F5CBA7"
      stroke-width="6"
      stroke-linecap="round"/>

    <ellipse cx="40" cy="120" rx="8" ry="5" fill="#2C3E50" />
    <ellipse cx="60" cy="120" rx="8" ry="5" fill="#2C3E50" />
  </svg>
`;

// ===============================
// SVG DO PÁSSARO
// ===============================

const birdSVG = `
  <svg width="30" height="20" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 5 20 Q 20 5 35 20 Q 50 5 58 20"
      stroke="#2C3E50"
      stroke-width="4"
      stroke-linecap="round"
      fill="none"/>
  </svg>
`;

// ===============================
// INICIALIZAÇÃO DO PLAYER
// ===============================

player.innerHTML = skaterSVG;
player.classList.add('pushing');

// ===============================
// CONTROLES
// ===============================

document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return;

  e.preventDefault();

  if (isGameOver) {
    restartGame();
  } else {
    jump();
  }
});

container.addEventListener('touchstart', (e) => {
  e.preventDefault();

  if (isGameOver) {
    restartGame();
  } else {
    jump();
  }
}, { passive: false });

// Também permite jogar com mouse/toque
container.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') return;

  if (isGameOver) {
    restartGame();
  } else {
    jump();
  }
});

// ===============================
// PULO
// ===============================

function jump() {
  if (isGameOver || isJumping) return;

  isJumping = true;
  velocityY = 12.5;

  player.classList.remove('pushing');
  player.classList.add('jumping');
}

// ===============================
// CRIA OBSTÁCULO
// ===============================

function createObstacle() {
  if (isGameOver) return;

  const lastObs = obstacles[obstacles.length - 1];

  // Mantém uma distância mínima entre obstáculos
  if (!lastObs || (600 - lastObs.left) >= 300) {
    const obstacle = document.createElement('div');

    obstacle.classList.add('obstacle');

    const isVelhinha = Math.random() > 0.5;

    obstacle.innerHTML = isVelhinha
      ? velhinhaSVG
      : coneSVG;

    const obstacleLeft = container.clientWidth || 600;

    obstacle.style.left = obstacleLeft + 'px';

    container.appendChild(obstacle);

    obstacles.push({
      element: obstacle,
      left: obstacleLeft
    });
  }

  // Novo timer controlado
  const randomTime = Math.random() * 1200 + 1500;

  obstacleTimer = setTimeout(() => {
    createObstacle();
  }, randomTime);
}

// ===============================
// CRIA PÁSSARO
// ===============================

function createBird() {
  if (isGameOver) return;

  const bird = document.createElement('div');

  bird.classList.add('bird');
  bird.innerHTML = birdSVG;

  const birdLeft = container.clientWidth || 600;

  bird.style.left = birdLeft + 'px';

  container.appendChild(bird);

  birds.push({
    element: bird,
    left: birdLeft
  });

  const randomBirdTime = Math.random() * 8000 + 7000;

  birdTimer = setTimeout(() => {
    createBird();
  }, randomBirdTime);
}

// ===============================
// COLISÃO
// ===============================

function checkCollision(element1, element2) {
  if (!element1 || !element2) return false;

  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  // Pequena margem para deixar a colisão mais justa
  const margin = 5;

  return (
    rect1.left + margin < rect2.right - margin &&
    rect1.right - margin > rect2.left + margin &&
    rect1.top + margin < rect2.bottom - margin &&
    rect1.bottom - margin > rect2.top + margin
  );
}

// ===============================
// ATUALIZAÇÃO DO JOGO
// ===============================

function updateGame() {
  if (isGameOver) return;

  // ============================
  // BACKGROUND
  // ============================

  bgX -= gameSpeed * 0.5;

  backgroundCity.style.backgroundPositionX =
    bgX + 'px';

  // ============================
  // FÍSICA DO PULO
  // ============================

  if (isJumping) {
    playerBottom += velocityY;
    velocityY -= gravity;

    if (playerBottom <= 12) {
      playerBottom = 12;
      velocityY = 0;
      isJumping = false;

      player.classList.remove('jumping');
      player.classList.add('pushing');
    }

    player.style.bottom =
      playerBottom + 'px';
  }

  // ============================
  // OBSTÁCULOS
  // ============================

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];

    obs.left -= gameSpeed;

    obs.element.style.left =
      obs.left + 'px';

    // Colisão real
    if (checkCollision(player, obs.element)) {
      endGame();
      return;
    }

    // Remove quando sai da tela
    if (obs.left < -100) {
      obs.element.remove();
      obstacles.splice(i, 1);

      score += 10;

      scoreElement.innerText = score;

      // Aumenta a velocidade gradualmente
      if (score >= 200) {
        gameSpeed =
          5 + Math.floor((score - 200) / 50) * 0.4;
      }
    }
  }

  // ============================
  // PÁSSAROS
  // ============================

  for (let i = birds.length - 1; i >= 0; i--) {
    const bird = birds[i];

    bird.left -= gameSpeed * 0.7;

    bird.element.style.left =
      bird.left + 'px';

    // Colisão com pássaro
    if (checkCollision(player, bird.element)) {
      endGame();
      return;
    }

    // Remove quando sai da tela
    if (bird.left < -100) {
      bird.element.remove();
      birds.splice(i, 1);
    }
  }

  animationFrame =
    requestAnimationFrame(updateGame);
}

// ===============================
// FIM DE JOGO
// ===============================

function endGame() {
  if (isGameOver) return;

  isGameOver = true;

  // Para os timers
  clearTimeout(obstacleTimer);
  clearTimeout(birdTimer);

  obstacleTimer = null;
  birdTimer = null;

  // Para o loop
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  player.classList.remove(
    'pushing',
    'jumping'
  );

  gameOverScreen.style.display = 'flex';
}

// ===============================
// REINICIAR
// ===============================

function restartGame() {
  // Cancela timers antigos
  clearTimeout(obstacleTimer);
  clearTimeout(birdTimer);

  obstacleTimer = null;
  birdTimer = null;

  // Cancela animação anterior
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  // Remove obstáculos
  obstacles.forEach((obs) => {
    if (obs.element) {
      obs.element.remove();
    }
  });

  // Remove pássaros
  birds.forEach((bird) => {
    if (bird.element) {
      bird.element.remove();
    }
  });

  obstacles = [];
  birds = [];

  // Reset dos valores
  score = 0;
  gameSpeed = 5;
  playerBottom = 12;
  velocityY = 0;
  isJumping = false;
  isGameOver = false;
  bgX = 0;

  // Atualiza tela
  scoreElement.innerText = score;

  player.style.bottom =
    '12px';

  player.classList.remove(
    'jumping'
  );

  player.classList.add(
    'pushing'
  );

  gameOverScreen.style.display =
    'none';

  backgroundCity.style.backgroundPositionX =
    '0px';

  // Reinicia os geradores
  createObstacle();

  birdTimer = setTimeout(() => {
    createBird();
  }, 3000);

  // Reinicia o loop
  updateGame();
}

// ===============================
// INÍCIO DO JOGO
// ===============================

createObstacle();

birdTimer = setTimeout(() => {
  createBird();
}, 3000);

updateGame();
