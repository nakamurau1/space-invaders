import "./style.css";
import spaceshipUrl from "./assets/spaceship.png";
import invaderUrl from "./assets/invader.png";
import invaderExplosionUrl from "./assets/invader_explosion.mp3";
import starshipExplosionUrl from "./assets/starship_explosion.mp3";
import backgroundMarsUrl from "./assets/background_mars.mp3";

const scoreEl = document.querySelector("#scoreEl");
const canvas = document.querySelector("canvas")!;
const c = canvas?.getContext("2d")!;

const backgroundMusic = new Audio(backgroundMarsUrl);
backgroundMusic.loop = true;

canvas.height = innerHeight;
canvas.width = innerWidth;

type Position = {
  x: number;
  y: number;
};

type Velocity = {
  x: number;
  y: number;
};

type Object = {
  position: Position;
  width: number;
  height: number;
};

class Player {
  position: Position = { x: 0, y: 0 };
  velocity: Velocity = { x: 0, y: 0 };
  rotation = 0;
  width = 0;
  height = 0;
  image: HTMLImageElement | undefined = undefined;
  opacity: number;

  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.rotation = 0;
    this.opacity = 1;

    const image = new Image();
    image.src = spaceshipUrl;
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20,
      };
    };
  }

  draw() {
    if (this.image) {
      c.save();
      c.globalAlpha = this.opacity;
      // キャンバスの原点を宇宙船の中心に移動
      c.translate(
        player.position.x + player.width / 2,
        player.position.y + player.height / 2
      );
      // キャンバスを回転
      c.rotate(this.rotation);
      c.translate(
        -player.position.x - player.width / 2,
        -player.position.y - player.height / 2
      );

      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
      c.restore();
    }
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  position: Position = { x: 0, y: 0 };
  velocity: Velocity = { x: 0, y: 0 };
  width = 0;
  height = 0;
  image: HTMLImageElement | undefined = undefined;

  constructor({ position }: { position: Position }) {
    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();
    image.src = invaderUrl;
    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    if (this.image) {
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }

  update({ velocity }: { velocity: Velocity }) {
    this.draw();
    this.position.x += velocity.x;
    this.position.y += velocity.y;
  }

  shoot(invaderProjectiles: InvaderProjectile[]) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      })
    );
  }
}

class Grid {
  position: Position;
  velocity: Velocity;
  invaders: Invader[];
  width: number;

  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 3, y: 0 };
    this.invaders = [];
    const cols = Math.floor(Math.random() * 10 + 5);
    const rows = Math.floor(Math.random() * 5 + 2);
    this.width = cols * 30;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(new Invader({ position: { x: x * 30, y: y * 30 } }));
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y = 0;
    if (this.position.x + this.width >= canvas.width || this.position.x < 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
    this.invaders.forEach((invader) => {
      invader.update({ velocity: this.velocity });
    });
  }
}

class Projectile {
  position: Position;
  velocity: Velocity;
  radius: number;

  constructor({
    position,
    velocity,
  }: {
    position: Position;
    velocity: Velocity;
  }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 4;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class InvaderProjectile {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;

  constructor({
    position,
    velocity,
  }: {
    position: Position;
    velocity: Velocity;
  }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = 10;
  }

  draw() {
    c.fillStyle = "green";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  position: Position;
  velocity: Velocity;
  radius: number;
  color: string;
  opacity: number;
  fades: boolean;

  constructor({
    position,
    velocity,
    radius,
    color,
    fades = true,
  }: {
    position: Position;
    velocity: Velocity;
    radius: number;
    color: string;
    fades?: boolean;
  }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.fades) {
      this.opacity -= 0.01;
    }
  }
}

class ScoreLabel {
  position: Position;
  value: string;
  opacity: number;
  duration: number;
  startTime: number;

  constructor(position: Position, value: string, duration = 1000) {
    this.position = position;
    this.value = value;
    this.opacity = 1;
    this.duration = duration;
    this.startTime = Date.now();
  }

  draw() {
    const timeElapsed = Date.now() - this.startTime;
    if (timeElapsed < this.duration) {
      this.opacity = 1 - timeElapsed / this.duration;
      c.save();
      c.globalAlpha = this.opacity;
      c.fillStyle = "white";
      c.font = "20px Arial";
      c.fillText(
        this.value,
        this.position.x,
        this.position.y - 20 * (timeElapsed / this.duration)
      );
      c.restore();
    }
  }
}

const player = new Player();
const projectiles: Projectile[] = [];
const invaderProjectiles: InvaderProjectile[] = [];
const grids: Grid[] = [];
const particles: Particle[] = [];
const scoreLabels: ScoreLabel[] = [];

let gameStarted = false;
let game = {
  over: false,
  active: false,
};
let score = 0;

const keys = {
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowDown: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);

function createStars() {
  for (let i = 0; i < 100; i++) {
    particles.push(
      new Particle({
        position: {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
        },
        velocity: {
          x: 0,
          y: 1,
        },
        radius: Math.random() * 3,
        color: "white",
        fades: false,
      })
    );
  }
}

function playInvaderExplosionSound() {
  const explosionSound = new Audio(invaderExplosionUrl);
  explosionSound.play();
}

function playStarshipExplosionSound() {
  const explosionSound = new Audio(starshipExplosionUrl);
  explosionSound.play();
}

function createParticles(object: Object) {
  for (let i = 0; i < 15; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 3,
        color: "yellow",
      })
    );
  }
}

function updateParticles() {
  particles.forEach((particle, particleIndex) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = particle.radius;
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(particleIndex, 1);
      }, 0);
    } else {
      particle.update();
    }
  });
}

function createScoreLabel({ position }: { position: Position }) {
  const scoreLabel = new ScoreLabel({ x: position.x, y: position.y }, "+100");
  scoreLabels.push(scoreLabel);
}

function drawGameOver() {
  if (game.over) {
    c.save();
    c.fillStyle = "white";
    c.font = "40px Arial";
    c.textAlign = "center";
    c.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    c.restore();
  }
}

// 星を描画
c.fillStyle = "black";
c.fillRect(0, 0, canvas.width, canvas.height);
createStars();
updateParticles();

function animate() {
  if (game.over) {
    drawGameOver();
  }
  if (!game.active) return;

  requestAnimationFrame(animate);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  updateParticles();

  player.update();

  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius < 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  invaderProjectiles.forEach((projectile, index) => {
    if (projectile.position.y >= canvas.height) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }

    if (
      projectile.position.y + projectile.height <=
        player.position.y + player.height &&
      projectile.position.y + projectile.height >= player.position.y &&
      projectile.position.x + projectile.width >= player.position.x &&
      projectile.position.x <= player.position.x + player.width
    ) {
      playStarshipExplosionSound();

      setTimeout(() => {
        player.opacity = 0;
        game.over = true;
        backgroundMusic.pause();
      }, 0);

      setTimeout(() => {
        game.active = false;
      }, 2000);

      createParticles(player);
    }
  });

  grids.forEach((grid, gridIndex) => {
    grid.update();

    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    grid.invaders.forEach((invader, i) => {
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.y + projectile.radius >= invader.position.y &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x + projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          score += 100;
          if (scoreEl) {
            scoreEl.innerHTML = score.toString();
          }

          setTimeout(() => {
            createParticles(invader);
            createScoreLabel(invader);
            playInvaderExplosionSound();

            grid.invaders.splice(i, 1);
            projectiles.splice(j, 1);

            if (grid.invaders.length > 0) {
              const firstInvader = grid.invaders[0];
              const lastInvader = grid.invaders[grid.invaders.length - 1];

              grid.width =
                lastInvader.position.x -
                firstInvader.position.x +
                lastInvader.width;
              grid.position.x = firstInvader.position.x;
            } else {
              grid.invaders.splice(gridIndex, 1);
            }
          }, 0);
        }
      });
    });

    scoreLabels.forEach((label, index) => {
      label.draw();
      if (Date.now() - label.startTime > label.duration) {
        scoreLabels.splice(index, 1);
      }
    });
  });

  if (keys.ArrowLeft.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
    player.rotation = -0.15;
  } else if (
    keys.ArrowRight.pressed &&
    player.position.x <= canvas.width - player.width
  ) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  } else if (keys.ArrowUp.pressed && player.position.y >= 0) {
    player.velocity.y = -5;
  } else if (
    keys.ArrowDown.pressed &&
    player.position.y <= canvas.height - player.height
  ) {
    player.velocity.y = 5;
  } else {
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.rotation = 0;
  }

  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    frames = 0;
    randomInterval = Math.floor(Math.random() * 500 + 500);
  }

  frames++;
}

animate();

// Event Listeners
addEventListener("keydown", ({ key }) => {
  if (key === " " && !gameStarted) {
    game.active = true;
    gameStarted = true;
    backgroundMusic.play();
    animate();
  }

  if (game.over) return;

  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = true;
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = true;
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = false;
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = false;
      break;
    case " ":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: { x: 0, y: -10 },
        })
      );
      break;
  }
});

// タブの可視性が変更されたときのイベント処理
addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // タブがアクティブなときに音楽を再生
    if (game.active && !game.over) {
      backgroundMusic.play();
    }
  } else {
    // タブが非アクティブなときに音楽を一時停止
    backgroundMusic.pause();
  }
});
