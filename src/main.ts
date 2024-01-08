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

  constructor() {
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
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height / 2,
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

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
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

    this.radius = 3;
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

const player = new Player();
const projectiles: Projectile[] = [];
const invader = new Invader();

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

function animate() {
  requestAnimationFrame(animate);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  invader.update();
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
      console.log(projectiles);
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
