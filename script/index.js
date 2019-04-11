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

    class Player {
        constructor(num){
            this.num = num;
            this.velocity = 160;
            this.range = 0;
            this.bomb = 1;
        }

        getNum(){
            return this.num;
        }
        getVelocity(){
            return this.velocity;
        }
        getRange(){
            return this.range;
        }
        getBomb(){
            return this.bomb;
        }

        setVelocity(vel){
            this.velocity = vel;
        }
        setRange(rng){
            this.range = rng;
        }
        setBomb(nb){
            this.bomb = nb;
        }

        poseBombe(){
            if(this.getBomb()>0){
                this.setBomb(0);
            }
        }
    }

    class Cell {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.fill = false;
        }

        getX(){
            return this.x;
        }
        getY(){
            return this.y;
        }
        fill(){
            this.fill = true;
        }
        empty(){
            this.fill = false;
        }
    }


    let tab = [];
    let demi = document_width / 22;
    //initialisation du tableau des cases vides
    //row : i
    for(let i = 0; i <11; ++i){
        //col : j
        for(let j = 0; j<11; ++j){
            if(!((i == 0 && j == 0)||(i == 0 && j == 1)||(i == 1 && j == 0)||(i == 10 && j == 10)||(i == 9 && j == 10)||(i == 10 && j == 9))){
                if((i%2 == 0)||(j%2==0)){
                    let c = new Cell(demi + i * (document_width/11), demi + j * (document_height/11));
                    tab.push(c);
                }
            }
        }
    }

    let player;
    let p1 = new Player(1);
    let player2;
    let p2 = new Player(2);
    let blocks;
    let cursors;
    let stars;
    let stones;
    let that = "";
    let nb_breakable = 0;

    //retournle la position du centre de la case la plus proche
    function calcDist(x,y){
        let cell = null;
        let dist = 0;
        let newDist = 0;
        for(let i = 0; i < tab.length; ++i){
            newDist = Math.sqrt(Math.pow(tab[i].getX() - x,2) + Math.pow(tab[i].getY() - y,2));
            if((newDist < dist) || dist == 0){
                cell = tab[i];
                dist = newDist;
            }
        }
        return cell;
    }


    let game = new Phaser.Game(config);

    function preload () {
        this.load.image('background', 'files/fond.jpg');
        this.load.image('caisse', 'files/block.png');
        this.load.image('stone', 'files/blockTest.png');
        this.load.image('star', 'files/star.png');


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
        //test pour faire apparaitre des block cassables dans les ceses appropriés
        /*
        for(let i = 0; i < tab.length; ++i){
            blocks.create(tab[i].getX(), tab[i].getY(), 'usable');
        }
        */
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

        var timerBreakable = this.time.addEvent({
            delay: 5000,
            callback: create_breakable,
            loop: true
        });
    }
    
    function update() {
        if(that==""){
            that = this;
        }

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
        this.keyBomb = this.input.keyboard.addKey(65);
        
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
        if (this.keyLeft.isDown){
            player.setVelocityX(-160);
            player.setVelocityY(0);

            player.anims.play('left', true);
        }

        if (this.keyBomb.isDown){
            if(p1.getBomb() === 1){
                p1.poseBombe();
                let c = calcDist(player.getCenter().x, player.getCenter().y);
                stars = this.physics.add.group({
                    key: 'star',
                    setXY: { x: c.getX(), y: c.getY()}
                });
            }

        }

    }

    function create_breakable(){
        if(nb_breakable>40){
            return false;
        }
        let aleatnumber = Math.floor(Math.random() * (tab.length));
            let aleatcell = tab[aleatnumber];
        while(aleatcell.fill || calcDist(player.x,player.y) == aleatcell || calcDist(player2.x,player2.y) == aleatcell) {
            aleatnumber = Math.floor(Math.random() * (tab.length));
            aleatcell = tab[aleatnumber];
        };

        stones = that.physics.add.group({
                    key: 'stone',
                    setXY: { x: aleatcell.getX(), y: aleatcell.getY()},
                    immovable: true,
                    moves: false
                });
        that.physics.add.collider(player, stones);
        that.physics.add.collider(player2, stones);
        aleatcell.fill = true;
        nb_breakable++;
        return true;
    }

    function create_item() {

    }

