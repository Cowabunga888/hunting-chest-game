class BackgroundScene extends Phaser.Scene {
    gameScene;
    layer;

    constructor() {
        super('BackgroundScene');
    }

    preload() {
        // this.load.atlas('clouds', 'assets/atlas/clouds.png', 'assets/atlas/clouds.json');
        this.load.image('bg', './assets/back-ground.png');
        this.load.image('ground', './assets/platform.png');

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

    create() {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0);

        // this.time.addEvent({ delay: 3000, callback: this.spawnCloud, callbackScope: this, repeat: 12 });

        this.scene.launch('GameScene');

        this.gameScene = this.scene.get('GameScene');
    }

    updateCamera() {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const camera = this.cameras.main;

        const zoom = this.gameScene.getZoom();
        const offset = 120 * zoom;

        camera.setZoom(zoom);
        camera.centerOn(1400 / 2, (1200 / 2) + 120);
    }

    // spawnCloud (cloud)
    // {
    //     const cloudType = Phaser.Math.Between(1, 3);

    //     const x = 1400;
    //     const y = Phaser.Math.Between(0, this.scale.height / 1.25);

    //     if (!cloud)
    //     {
    //         cloud = this.add.image(x, y, 'clouds', 'cloud' + cloudType);
    //     }
    //     else
    //     {
    //         cloud.setPosition(x, y);
    //     }

    //     this.tweens.add({
    //         targets: cloud,
    //         x: -400,
    //         duration: Phaser.Math.Between(20000, 60000),
    //         ease: 'linear',
    //         onComplete: () => this.spawnCloud(cloud)
    //     });
    // }
}

class GameScene extends Phaser.Scene {
    GAME_WIDTH = 640;
    GAME_HEIGHT = 960;

    backgroundScene;
    parent;
    sizer;
    player;
    platforms;
    cursors;
    bats;
    gameOver;
    scoreText;

    bronzeChest;
    purpleChest;
    greenChest;

    hadKey;
    headerKey;
    keyNum;
    keyNumText;

    glory;
    winButton;

    arrowUp;
    arrowLeft;
    arrowRight;
    arrowUpIsActive;
    arrowLeftIsActive;
    arrowRightIsActive;

    constructor() {
        super('GameScene');
    }

    create() {
        this.gameOver = false;
        this.hadKey = false;
        this.keyNum = 0;

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        this.parent = new Phaser.Structs.Size(width, height);
        this.sizer = new Phaser.Structs.Size(this.GAME_WIDTH, this.GAME_HEIGHT, Phaser.Structs.Size.FIT, this.parent);

        this.parent.setSize(width, height);
        this.sizer.setSize(width, height);

        this.backgroundScene = this.scene.get('BackgroundScene');

        this.updateCamera();

        this.scale.on('resize', this.resize, this);

        //=================Normal game stuff from here on down============================

        this.physics.world.setBounds(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();
        this.bats = this.physics.add.group();
        this.key = this.physics.add.sprite(0, 50, 'key');

        this.headerKey = this.add.image(300, 23, 'header-key');
        this.keyNumText = this.add.text(300, 16, ` x ${this.keyNum}`, { fontSize: '25px', fill: '#333' });

        this.bronzeChest = this.physics.add.sprite(800, 500, 'bronze-chest');
        this.bronzeChest.setCollideWorldBounds(true);
        this.purpleChest = this.physics.add.sprite(800, 350, 'purple-chest');
        this.purpleChest.setCollideWorldBounds(true);
        this.greenChest = this.physics.add.sprite(800, 150, 'green-chest');
        this.greenChest.setCollideWorldBounds(true);

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(320, 944, 'ground').setDisplaySize(640, 32).refreshBody();

        this.platforms.create(750, 220, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(600, 600, 'ground');
        this.platforms.create(320, 520, 'ground').setScale(0.3, 1).refreshBody();;
        this.platforms.create(50, 650, 'ground');
        this.platforms.create(600, 780, 'ground');

        //  Adding pointer
        this.arrowUp = this.add.sprite(600, this.GAME_HEIGHT - 70, 'arrow-up').setInteractive();
        this.arrowLeft = this.add.sprite(47, this.GAME_HEIGHT - 70, 'arrow-left').setInteractive();
        this.arrowRight = this.add.sprite(194, this.GAME_HEIGHT - 70, 'arrow-right').setInteractive();

        // The player and its settings
        this.player = this.physics.add.sprite(0, height / 2, 'woof');

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.1);
        //  Gravity for our character
        this.player.setCollideWorldBounds(true);
        this.key.setCollideWorldBounds(true);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('woof', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'woof', frame: 2 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('woof', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // chest open
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

        // bat fly
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

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        //  Collide the player with the platforms
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.bats, this.platforms);
        this.physics.add.collider(this.key, this.platforms);
        this.physics.add.collider(this.bronzeChest, this.platforms);
        this.physics.add.collider(this.purpleChest, this.platforms);
        this.physics.add.collider(this.greenChest, this.platforms);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(this.player, this.key, this.getKey, null, this);
        this.physics.add.overlap(this.player, this.bronzeChest, this.collectChest, null, this);
        this.physics.add.overlap(this.player, this.purpleChest, this.collectChest, null, this);
        this.physics.add.overlap(this.player, this.greenChest, this.collectChest, null, this);

        // Create bats
        for (let i = 0; i < 3; i++) {
            let ibat = this.bats.create(800, 16, 'bat');
            ibat.setBounce(1); // jumpping
            ibat.setCollideWorldBounds(true);
            ibat.setVelocity(Phaser.Math.Between(-200, 200), 20);
            ibat.anims.play('fly-left-to-right');
        }

        // Pointer up left right clicked
        this.input.addPointer(5);
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            switch (gameObject?.texture?.key) {
                case 'arrow-up':
                    this.arrowUpIsActive = true;
                    break;
                case 'arrow-left':
                    this.arrowLeftIsActive = true;
                    break;
                case 'arrow-right':
                    this.arrowRightIsActive = true;
                    break;

                default:
                    break;
            }
        });
        this.input.on('gameobjectup', (pointer, gameObject) => {

            switch (gameObject?.texture?.key) {
                case 'arrow-up':
                    this.arrowUpIsActive = false;
                    break;
                case 'arrow-left':
                    this.arrowLeftIsActive = false;
                    break;
                case 'arrow-right':
                    this.arrowRightIsActive = false;
                    break;

                default:
                    break;
            }

        });
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.parent.setSize(width, height);
        this.sizer.setSize(width, height);

        this.updateCamera();
    }

    updateCamera() {
        const camera = this.cameras.main;

        const x = Math.ceil((this.parent.width - this.sizer.width) * 0.5);
        const y = 0;
        const scaleX = this.sizer.width / this.GAME_WIDTH;
        const scaleY = this.sizer.height / this.GAME_HEIGHT;

        camera.setViewport(x, y, this.sizer.width, this.sizer.height);
        camera.setZoom(Math.max(scaleX, scaleY));
        camera.centerOn(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);

        this.backgroundScene.updateCamera();
    }

    getZoom() {
        return this.cameras.main.zoom;
    }

    update() {
        const gameWidth = this.GAME_WIDTH
        const gameHeight = this.GAME_HEIGHT

        if (this.gameOver) {
            return;
        }

        const cursors = this.cursors;
        const player = this.player;

        if (cursors.left.isDown || this.arrowLeftIsActive === true) {
            player.setVelocityX(-160);

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown || this.arrowRightIsActive === true) {
            player.setVelocityX(160);

            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        if ((cursors.up.isDown && player.body.touching.down) || (this.arrowUpIsActive === true && player.body.touching.down)) {
            player.setVelocityY(-330);
        }

        this.bats.children.iterate(function (bat) {
            // console.log(bat.x)
            if (bat.x <= 25) {
                //bat.x < 25, 25 means bat img width frame / 2
                bat.anims.play('fly-right-to-left');
            } else if (bat.x >= gameWidth - 50) {
                bat.anims.play('fly-left-to-right');
            }
        });

    }

    getKey(player, key) {
        this.hadKey = true;

        this.keyNum = this.keyNum + 1;
        this.keyNumText.setText(' x ' + this.keyNum);

        key.disableBody(true, true);
    }

    collectChest(touch, isTouched) {
        let chestKey = isTouched.texture.key;
        console.log(chestKey)
        if (this.hadKey) {
            switch (chestKey) {
                case 'bronze-chest':
                    this.bronzeChest.anims.play('bronze-open');
                    break;
                case 'purple-chest':
                    this.purpleChest.anims.play('purple-open');
                    break;
                case 'green-chest':
                    this.greenChest.anims.play('green-open');
                    break;

                default:
                    break;
            }

            this.gameOver = true;
            this.hadKey = false;

            this.physics.pause();
            this.glory = this.add.sprite(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2, 'glory').setInteractive();
            this.tweens.add({
                targets: this.glory,
                angle: '+=360',
                duration: 5000,
                repeat: -1
            });

            this.winButton = this.add.sprite(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2, 'win').setInteractive();
            this.winButton.on('pointerup', function (pointer) {
                game.scene.start();
                game.scene.start('BackgroundScene');
            });
        }
    }

}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-example',
        width: 640,
        height: 960,
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 1400,
            height: 1200
        }
    },
    scene: [BackgroundScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
