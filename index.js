
let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  // transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 800,
      height: 600
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);
let platforms;
let player;
let coints;
let cursors;
let bombs;
let bats;
let chest;
let key;
let restartButton;
let winButton;
let glory;
let aim;

let arrowUp;
let arrowLeft;
let arrowRight;
let arrowUpIsActive = false;
let arrowLeftIsActive = false;
let arrowRightIsActive = false;

let keyNum = 0;
let keyNumText;
let hadKey = false;

function preload() {
  this.load.image('back-ground', './assets/back-ground.png');
  this.load.image('ground', './assets/platform.png');
  this.load.image('greenLand', './assets/ground.png');
  this.load.image('key', './assets/key.png');
  this.load.image('header-key', './assets/key.png');
  this.load.image('restart', './assets/restart.png');
  this.load.image('win', './assets/win.png');
  this.load.image('glory', './assets/glory.png');

  this.load.spritesheet('woof', './assets/woof.png', { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('bat', './assets/bat.png', { frameWidth: 50, frameHeight: 50 });

  this.load.spritesheet('bronze-chest', './assets/bronze-chest.png', { frameWidth: 80, frameHeight: 60 });
  this.load.spritesheet('purple-chest', './assets/purple-chest.png', { frameWidth: 80, frameHeight: 60 });
  this.load.spritesheet('green-chest', './assets/green-chest.png', { frameWidth: 80, frameHeight: 60 });

  this.load.image('arrow-up', './assets/arrow-up.png');
  this.load.image('arrow-left', './assets/arrow-left.png');
  this.load.image('arrow-right', './assets/arrow-right.png');

}

function create() {
  this.add.image(400, 300, 'back-ground');

  // let myCanvas = document.getElementsByTagName("canvas")
  // myCanvas[0].style.width = `${window.innerWidth > 300 ? window.innerWidth : 300}px`;
  // console.log(`${window.innerWidth > 300 ? window.innerWidth : 300}px`)
  // myCanvas[0].style.height = `${window.innerWidth > 300 ? window.innerWidth - 100 : 200}px`;

  // add underground
  platforms = this.physics.add.staticGroup();
  greenLand = this.physics.add.staticGroup();

  // greenLand.create(400, 568, 'greenLand').setScale(2).refreshBody();
  greenLand.create(400, 568, 'greenLand');
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');
  platforms.create(400, 100, 'ground').setScale(0.5).refreshBody();

  // add character
  player = this.physics.add.sprite(0, 150, 'woof');
  player.setBounce(0.3);
  player.setCollideWorldBounds(true); // hold character stay in the boundary!

  bronzeChest = this.physics.add.sprite(800, 500, 'bronze-chest');
  bronzeChest.setCollideWorldBounds(true);
  purpleChest = this.physics.add.sprite(800, 350, 'purple-chest');
  purpleChest.setCollideWorldBounds(true);
  greenChest = this.physics.add.sprite(800, 150, 'green-chest');
  greenChest.setCollideWorldBounds(true);

  // key = this.physics.add.sprite(0, 0, 'key');
  key = this.physics.add.sprite(400, 0, 'key');
  key.setCollideWorldBounds(true);

  // 3 animations for the character
  // go left use frame 0, 1
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('woof', { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1
  });
  // go right use frame 2, 3
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('woof', { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  // when turn use frame 2
  this.anims.create({
    key: 'turn',
    frames: [{ key: 'woof', frame: 2 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'bronze-open',
    frames: this.anims.generateFrameNumbers('bronze-chest', { start: 1, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'purple-open',
    frames: this.anims.generateFrameNumbers('purple-chest', { start: 1, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'green-open',
    frames: this.anims.generateFrameNumbers('green-chest', { start: 1, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'fly-left-to-right',
    frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 4 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'fly-right-to-left',
    frames: this.anims.generateFrameNumbers('bat', { start: 5, end: 9 }),
    frameRate: 10,
    repeat: -1
  });

  // setup for the assets stay on platforms [ground]
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(player, greenLand);
  this.physics.add.collider(bronzeChest, greenLand);
  this.physics.add.collider(bronzeChest, platforms);
  this.physics.add.collider(purpleChest, greenLand);
  this.physics.add.collider(purpleChest, platforms);
  this.physics.add.collider(greenChest, greenLand);
  this.physics.add.collider(greenChest, platforms);
  this.physics.add.collider(key, platforms);
  this.physics.add.collider(key, greenLand);


  // add header text
  heeaderKey = this.add.image(600, 23, 'header-key');
  keyNumText = this.add.text(600, 16, ` x ${keyNum}`, { fontSize: '25px', fill: '#333' });

  // adding event listener for key board
  cursors = this.input.keyboard.createCursorKeys();

  bats = this.physics.add.group();

  this.physics.add.collider(bats, platforms);
  this.physics.add.collider(bats, greenLand);
  // this.physics.add.collider(player, bats, hitBats, null, this);
  this.physics.add.collider(player, key, getKey, null, this);

  this.physics.add.collider(player, bronzeChest, openTheChest, null, this);
  this.physics.add.collider(player, purpleChest, openTheChest, null, this);
  this.physics.add.collider(player, greenChest, openTheChest, null, this);

  // create bats
  for (let i = 0; i < 3; i++) {
    let ibat = bats.create(800, 16, '');
    ibat.setBounce(1); // jumpping
    ibat.setCollideWorldBounds(true);
    ibat.setVelocity(Phaser.Math.Between(-200, 200), 20);
    ibat.anims.play('fly-right-to-left');
  }

  // add event click for button
  // add arrow
  this.input.addPointer(5);
  arrowUp = this.add.sprite(680, 550, 'arrow-up').setInteractive();
  arrowLeft = this.add.sprite(47, 550, 'arrow-left').setInteractive();
  arrowRight = this.add.sprite(194, 550, 'arrow-right').setInteractive();

  this.input.on('gameobjectdown', (pointer, gameObject) => {
    switch (gameObject?.texture?.key) {
      case 'arrow-up':
        arrowUpIsActive = true;
        break;
      case 'arrow-left':
        arrowLeftIsActive = true;
        break;
      case 'arrow-right':
        arrowRightIsActive = true;
        break;

      default:
        break;
    }

  });

  this.input.on('gameobjectup', (pointer, gameObject) => {

    switch (gameObject?.texture?.key) {
      case 'arrow-up':
        arrowUpIsActive = false;
        break;
      case 'arrow-left':
        arrowLeftIsActive = false;
        break;
      case 'arrow-right':
        arrowRightIsActive = false;
        break;

      default:
        break;
    }

  });

}

function update() {
  if (cursors.left.isDown || arrowLeftIsActive === true) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  }
  else if (cursors.right.isDown || arrowRightIsActive === true) {
    player.setVelocityX(160);

    player.anims.play('right', true);
  }
  else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if ((cursors.up.isDown && player.body.touching.down) || (arrowUpIsActive === true && player.body.touching.down)) {
    player.setVelocityY(-330);
  }

  bats.children.iterate(function (bat) {
    // console.log(bat.x)
    if (bat.x <= 25) {
      //bat.x < 25, 25 means bat img width frame / 2
      bat.anims.play('fly-right-to-left');
    } else if (bat.x >= 793) {
      bat.anims.play('fly-left-to-right');
    }
  });
}

function getKey(player, key) {
  hadKey = true;

  keyNum = keyNum + 1;
  keyNumText.setText(' x ' + keyNum);

  key.disableBody(true, true);
}

function hitBats(player, bat) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;

  restartButton = this.add.sprite(400, 300, 'restart').setInteractive();
  restartButton.on('pointerup', function (pointer) {
    game.scene.start("default");
  });
}

function openTheChest(touch, isTouched) {
  let chestKey = isTouched.texture.key
  if (hadKey) {
    switch (chestKey) {
      case 'bronze-chest':
        bronzeChest.anims.play('bronze-open');
        break;
      case 'purple-chest':
        purpleChest.anims.play('purple-open');
        break;
      case 'green-chest':
        greenChest.anims.play('green-open');
        break;

      default:
        break;
    }

    this.physics.pause();
    glory = this.add.sprite(400, 300, 'glory').setInteractive();
    this.tweens.add({
      targets: glory,
      angle: '+=360',
      duration: 5000,
      repeat: -1
    });

    winButton = this.add.sprite(400, 300, 'win').setInteractive();
    winButton.on('pointerup', function (pointer) {
      hadKey = false
      game.scene.start("default");
    });
  }
}
