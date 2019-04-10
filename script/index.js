    let document_width = document.getElementById("GameContainer").clientWidth;
    let document_height = document.getElementById("GameContainer").clientHeight;


    let config = {
        type: Phaser.AUTO,
        width: document_width,
        height: document_height,
        parent: "GameContainer",
        physics: {
            default: 'arcade',
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    let player;
    let player2;
    let blocks;
    let cursors;

    let game = new Phaser.Game(config);

    function preload () {
        this.load.image('background', 'files/fond.jpg');
        this.load.image('caisse', 'files/block.png');


        this.load.spritesheet('dude',
            'files/dude.png',
            { frameWidth: 32, frameHeight: 34 }
        );
        this.load.spritesheet('dude2',
            'files/dude2.png',
            { frameWidth: 32, frameHeight: 34 }
        );
    }

    function create () {
        blocks = this.physics.add.staticGroup();
        this.add.image(document_width / 2, document_height / 2, 'background');
        let demi = document_width / 22;
        for(let i = 1; i <=11; i +=2){
            for(let j = 1; j<=11; j +=2){
                blocks.create((document_width / 11)*i + demi, (document_height / 11)*j + demi, 'caisse');
            }
        }

        player = this.physics.add.sprite(demi, demi, 'dude');
        player.setCollideWorldBounds(true);
        
        player2 = this.physics.add.sprite(document_width - demi, document_height - demi, 'dude2');
        player2.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 10
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'down',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 10,
            repeat: -1
        });
        
        
        this.anims.create({
            key: 'left2',
            frames: this.anims.generateFrameNumbers('dude2', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn2',
            frames: [ { key: 'dude2', frame: 4 } ],
            frameRate: 10
        });

        this.anims.create({
            key: 'right2',
            frames: this.anims.generateFrameNumbers('dude2', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'down2',
            frames: [ { key: 'dude2', frame: 4 } ],
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up2',
            frames: [ { key: 'dude2', frame: 4 } ],
            frameRate: 10,
            repeat: -1
        });

        cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.collider(player, blocks);
        this.physics.add.collider(player2, blocks);
    }
    
    function update() {
        if (cursors.left.isDown){
            player2.setVelocityX(-160);
            player2.setVelocityY(0);

            player2.anims.play('left2', true);
        } else if (cursors.right.isDown) {
            player2.setVelocityX(160);
            player2.setVelocityY(0);

            player2.anims.play('right2', true);
        } else if(cursors.down.isDown) {
            player2.setVelocityX(0);
            player2.setVelocityY(160);

            player2.anims.play('down2', true);
        } else if(cursors.up.isDown) {
            player2.setVelocityX(0);
            player2.setVelocityY(-160);

            player2.anims.play('up2', true);
        } else {
            player2.setVelocityX(0);
            player2.setVelocityY(0);

            player2.anims.play('turn2');
        }
        if (cursors.up.isDown && player2.body.touching.down) {
            player2.setVelocityY(-330);
        }
        
        
        this.keyLeft = this.input.keyboard.addKey(81);
        this.keyRight = this.input.keyboard.addKey(68);
        this.keyUp = this.input.keyboard.addKey(90);
        this.keyDown = this.input.keyboard.addKey(83);
        
        if (this.keyLeft.isDown){
            player.setVelocityX(-160);
            player.setVelocityY(0);

            player.anims.play('left', true);
        } else if (this.keyRight.isDown) {
            player.setVelocityX(160);
            player.setVelocityY(0);

            player.anims.play('right', true);
        } else if(this.keyDown.isDown) {
            player.setVelocityX(0);
            player.setVelocityY(160);

            player.anims.play('down', true);
        } else if(this.keyUp.isDown) {
            player.setVelocityX(0);
            player.setVelocityY(-160);

            player.anims.play('up', true);
        } else {
            player.setVelocityX(0);
            player.setVelocityY(0);

            player.anims.play('turn');
        }
        if (this.keyUp.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }

