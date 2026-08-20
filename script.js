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

// Garoto no Skate com elementos separados para animação
const skaterSVG = `
  <svg width="45" height="60" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 30 25 C 30 10, 65 10, 65 25 Z" fill="#E74C3C" />
    <path d="M 20 25 L 45 23" stroke="#E74C3C" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="30" r="14" fill="#F39C12" />
    <circle cx="48" cy="32" r="12" fill="#F5CBA7" />
    <circle cx="42" cy="32" r="2" fill="#000" />
    <path d="M 32 44 L 64 44 L 60 80 L 36 80 Z" fill="#2980B9" />
    <path d="M 34 48 L 15 60" stroke="#F5CBA7" stroke-width="6" stroke-linecap="round"/>
    <path d="M 62 48 L 80 55" stroke="#F5CBA7" stroke-width="6" stroke-linecap="round"/>
    
    <!-- Perna de apoio -->
    <path d="M 60 80 L 68 108" stroke="#34495E" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="73" cy="110" rx="8" ry="4" fill="#ECF0F1" />
    
    <!-- Perna de remada -->
    <g class="leg-push">
      <path d="M 36 80 L 28 108" stroke="#34495E" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="23" cy="110" rx="8" ry="4" fill="#ECF0F1" />
    </g>

    <!-- Skate agrupado para fazer o flip -->
    <g class="skate-deck">
      <rect x="5" y="114" width="86" height="7" rx="3" fill="#27AE60" />
      <circle cx="20" cy="124" r="5" fill="#34495E" />
      <circle cx="76" cy="124" r="5" fill="#34495E" />
    </g>
  </svg>
`;

const coneSVG = `
  <svg width="32" height="42" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="85" width="70" height="12" rx="2" fill="#D35400" />
    <path d="M 15 85 L 32 10 L 48 10 L 65 85 Z" fill="#E67E22" />
    <path d="M 23 60 L 28 42 L 52 42 L 57 60 Z" fill="#ECF0F1" />
    <path d="M 29 38 L 33 25 L 47 25 L 51 38 Z" fill="#ECF0F1" />
  </svg>
`;

const velhinhaSVG = `
  <svg width="40" height="55" viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="35" r="26" fill="#BDC3C7" />
    <circle cx="50" cy="45" r="18" fill="#F5CBA7" />
    <path d="M 38 38 L 48 44" stroke="#4A2E18" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M 62 38 L 52 44" stroke="#4A2E18" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="43" cy="45" r="2" fill="#000" />
    <circle cx="57" cy="45" r="2" fill="#000" />
    <path d="M 30 20 L 36 26 M 36 20 L 30 26" stroke="#E74C3C" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 42 56 Q 50 50 58 56" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 72 65 L 85 125" stroke="#6D4C41" stroke-width="5" stroke-linecap="round"/>
    <path d="M 72 65 C 72 55, 82 55, 82 65" stroke="#6D4C41" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M 35 65 L 65 65 L 70 115 L 30 115 Z" fill="#8E44AD" />
    <path d="M 35 70 L 20 85" stroke="#F5CBA7" stroke-width="6" stroke-linecap="round"/>
    <path d="M 65 70 L 78 75" stroke="#F5CBA7" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="40" cy="120" rx="8" ry="5" fill="#2C3E50" />
    <ellipse cx="60" cy="120" rx="8" ry="5" fill="#2C3E50" />
  </svg>
`;

const birdSVG = `
  <svg width="30" height="20" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 5 20 Q 20 5 35 20 Q 50 5 58 20" stroke="#2C3E50" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>
`;

player.innerHTML = skaterSVG;
player.classList.add('pushing'); // Inicia a animação de remada

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (isGameOver) {
      restartGame();
    } else {
      jump();
    }
  }
});

container.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (isGameOver) {
    restartGame();
  } else {
    jump();
  }
});

function jump() {
  if (!isJumping) {
    isJumping = true;
    velocityY = 12.5;
    player.classList.remove('pushing');
    player.classList.add('jumping');
  }
}

function createObstacle() {
  if (isGameOver) return;

  const lastObs = obstacles[obstacles.length - 1];
  if (!lastObs || (600 - lastObs.left) >= 300) {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    const isVelhinha = Math.random() > 0.5;
    obstacle.innerHTML = isVelhinha ? velhinhaSVG : coneSVG;
    
    let obstacleLeft = 600;
    obstacle.style.left = obstacleLeft + 'px';
    
    container.appendChild(obstacle);

    obstacles.push({
      element: obstacle,
      left: obstacleLeft
    });
  }

  const randomTime = Math.random() * 1200 + 1500;
  setTimeout(createObstacle, randomTime);
}

function createBird() {
  if (isGameOver) return;

  const bird = document.createElement('div');
  bird.classList.add('bird');
  bird.innerHTML = birdSVG;

  let birdLeft = 600;
  bird.style.left = birdLeft + 'px';

  container.appendChild(bird);

  birds.push({
    element: bird,
    left: birdLeft
  });

  const randomBirdTime = Math.random() * 8000 + 7000;
  setTimeout(createBird, randomBirdTime);
}

function updateGame() {
  if (isGameOver) return;

  bgX -= gameSpeed * 0.5;
  backgroundCity.style.backgroundPositionX = bgX + 'px';

  if (isJumping) {
    playerBottom += velocityY;
    velocityY -= gravity;

    if (playerBottom <= 12) {
      playerBottom = 12;
      isJumping = false;
      player.classList.remove('jumping');
      player.classList.add('pushing'); // Volta a remar ao tocar o chão
    }
    player.style.bottom = playerBottom + 'px';
  }

  for (let i = 0; i < obstacles.length; i++) {
    let obs = obstacles[i];
    obs.left -= gameSpeed;
    obs.element.style.left = obs.left + 'px';

    if (
      obs.left > 40 && 
      obs.left < 80 && 
      playerBottom < 52
    ) {
      endGame();
    }

    if (obs.left < -40) {
      obs.element.remove();
      obstacles.splice(i, 1);
      i--;
      score += 10;
      scoreElement.innerText = score;

      if (score >= 200 && score % 50 === 0) {
        gameSpeed += 0.4;
      }
    }
  }

  for (let i = 0; i < birds.length; i++) {
    let bird = birds[i];
    bird.left -= (gameSpeed * 0.7);
    bird.element.style.left = bird.left + 'px';

    if (bird.left < -40) {
      bird.element.remove();
      birds.splice(i, 1);
      i--;
    }
  }

  requestAnimationFrame(updateGame);
}

function endGame() {
  isGameOver = true;
  player.classList.remove('pushing', 'jumping');
  gameOverScreen.style.display = 'flex';
}

function restartGame() {
  obstacles.forEach(obs => obs.element.remove());
  birds.forEach(bird => bird.element.remove());
  obstacles = [];
  birds = [];

  score = 0;
  gameSpeed = 5;
  playerBottom = 12;
  isJumping = false;
  isGameOver = false;

  scoreElement.innerText = score;
  player.style.bottom = '12px';
  player.classList.add('pushing');
  gameOverScreen.style.display = 'none';

  createObstacle();
  createBird();
  updateGame();
}

createObstacle();
setTimeout(createBird, 3000);
updateGame();