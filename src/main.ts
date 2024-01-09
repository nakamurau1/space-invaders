import "./style.css";
import spaceshipUrl from "./assets/spaceship.png";
import invaderUrl from "./assets/invader.png";

const canvas = document.querySelector("canvas")!;
const c = canvas?.getContext("2d")!;

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

class Player {
  position: Position = { x: 0, y: 0 };
  velocity: Velocity = { x: 0, y: 0 };
  rotation = 0;
  width = 0;
  height = 0;
  image: HTMLImageElement | undefined = undefined;

  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.rotation = 0;

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
    c.fillStyle = "white";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player();
const projectiles: Projectile[] = [];
const invaderProjectiles: InvaderProjectile[] = [];
const grids: Grid[] = [];

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

function animate() {
  requestAnimationFrame(animate);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

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
      console.log("you loose");
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
          setTimeout(() => {
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

addEventListener("keydown", ({ key }) => {
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
  }
});
