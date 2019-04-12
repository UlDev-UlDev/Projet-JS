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
    let stones = [];
    let stonetest;
    let that = "";
    let nb_breakable = 0;
    let breakable_created = false;
    let VARtime = 0;
    let VARscore1 = 0;
    let VARscore2 = 0;
    let VARbombs_posed = 0;
    let VARnb_tour = 0;
    let tab_breakable = [];

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
        this.load.image('stone', 'files/caillou.png');
        this.load.image('star', 'files/bombe.png');
        this.load.spritesheet('explosion', 'files/explosion.png', { frameWidth: 64, frameHeight: 64, endFrame: 23 });


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

        let configAnim = {
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 23, first: 23 }),
            frameRate: 30,
        };
        this.anims.create(configAnim);

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

        var timer = this.time.addEvent({
           delay: 1000,                // ms
           callback: MajSec,
           loop: true
        });

    }

    function update() {


        if(that==""){
            that = this;
        }

        if (breakable_created == false) {
            create_breakable();
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
        this.keyBomb2 = this.input.keyboard.addKey(16);

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
                    setXY: { x: c.getX(), y: c.getY()},
                    setScale: { x: document_width/17000, y: document_height/17000}
                });
                MajNbBombes();
            }
        }

        if (this.keyBomb2.isDown){
            if(p2.getBomb() === 1){
                p2.poseBombe();
                let c = calcDist(player2.getCenter().x, player2.getCenter().y);
                stars = this.physics.add.group({
                    key: 'star',
                    setXY: { x: c.getX(), y: c.getY()},
                    setScale: { x: document_width/17000, y: document_height/17000}
                });
                MajNbBombes();
            }
        }

    }

    function create_breakable(){
        while(nb_breakable<70){
            let aleatnumber = Math.floor(Math.random() * (tab.length));
                let aleatcell = tab[aleatnumber];
            while(aleatcell.fill || calcDist(player.x,player.y) == aleatcell || calcDist(player2.x,player2.y) == aleatcell) {
                aleatnumber = Math.floor(Math.random() * (tab.length));
                aleatcell = tab[aleatnumber];
            };

            stones = that.physics.add.group({
                        key: 'stone',
                        setXY: { x: aleatcell.getX(), y: aleatcell.getY()},
                        setScale: { x: document_width/10000, y: document_height/10000},
                        immovable: true,
                        moves: false
                    });
            that.physics.add.collider(player, stones);
            that.physics.add.collider(player2, stones);
            aleatcell.fill == true;
            nb_breakable++;
            tab_breakable.push(stones);
        }
        breakable_created = true;


        let c = new Cell(demi, demi);
        tab.push(c);
        c = new Cell(demi*3, demi);
        tab.push(c);
        c = new Cell(demi, demi*3);
        tab.push(c);
        c = new Cell(document_width-demi, document_width-demi);
        tab.push(c);
        c = new Cell(document_width-(demi*3), document_width-demi);
        tab.push(c);
        c = new Cell(document_width-demi, document_width-(demi*3));
        tab.push(c);
    }

    function take_item() {

    }

    function MajSec() {
        VARtime = VARtime + 1;
        if(VARtime>59){
            let minutes = Math.floor(VARtime/60);
            let secondes = VARtime%60;
            document.getElementById("Time").innerHTML = "&nbsp;" + minutes + " min " + secondes + " sec.";
        }else{
            document.getElementById("Time").innerHTML = "&nbsp;" + VARtime + " sec.";
        }
    }

    function MajNbBombes() {
        VARbombs_posed = VARbombs_posed + 1;
        document.getElementById("BombsPosed").innerHTML = VARbombs_posed;
    }

    function Win(winner){
        if(winner==player){
            VARscore1++;
            document.getElementById("Score1").innerHTML = VARscore1;
        }

        if(winner==player2){
            VARscore2++;
            document.getElementById("Score2").innerHTML = VARscore2;
        }
        nb_breakable = 0;
        breakable_created = false;
        VARnb_tour++;
        document.getElementById("nbParties").innerHTML = VARnb_tour;
        that.scene.restart()
    }

    function recupCell(x, y) {
        for (let i = 0; i < tab.length; ++i) {
            if (x === tab[i].getX() && y === tab[i].getY()) {
                return tab[i];
            }
        }
        return false;
    }

    function displayAnim(x, y) {
        var boom = that.add.sprite(x, y, 'esplosion', 23);
        boom.anims.delayedPlay(Math.random() * 3, 'explode');
    }

    function recupStone(x, y) {
        for(let i = 0; i < tab_breakable.length; i++){
            if (tab_breakable[i].children.entries[0].x == x && tab_breakable[i].children.entries[0].y == y){
                return tab_breakable[i];
            }
        }
        return false;
    }
