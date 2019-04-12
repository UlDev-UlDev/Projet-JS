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
            this.range = 2;
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
    let isDown= 0;

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

    function testInsideField(x,y) {
        if(x > 0 && x < document_width && y > 0 && y < document_height){
            return true;
        } else {
            return false;
        }
    }

    function recupCell(x,y){
        for(let i = 0; i < tab.length; ++i){
            if(x === tab[i].getX() && y === tab[i].getY()){
                return tab[i];
            }
        }
        return false;
    }

    function winCondition(cell){
        let winp1 = false;
        let winp2 = false;
        if(calcDist(player.getCenter().x, player.getCenter().y) === cell){
            winp2 = true;
        }
        if(calcDist(player2.getCenter().x, player2.getCenter().y) === cell){
            winp1 = true;
        }

        if(winp1 && winp2){
            win(null);
            return ;
        }

        if(winp1){
            win(player);
        }
        if(winp2){
            win(player2);
        }


    }

    function explosion(cell, player){
        //supprimer la bombe
        //faire l'explosion de la case présente en argument
        let compt = 1;
        player.bomb++;
        let gauche = false;
        let droite = false;
        let haut = false;
        let bas = false;
        let fin = false;

        while(compt <= player.range && fin == false){
            dist = compt * demi * 2;
            cellG = recupCell(calcDist(cell.getX() - dist, cell.getY()).getX(), cell.getY());
            cellD = recupCell(calcDist(cell.getX() + dist, cell.getY()).getX(), cell.getY());
            cellH = recupCell(cell.getX(), calcDist(cell.getX(), cell.getY()-dist).getY());
            cellB = recupCell(cell.getX(), calcDist(cell.getX(), cell.getY() + dist).getY());
            console.log(cellG);
            console.log(cellD);
            console.log(cellH);
            console.log(cellB);
            if(gauche === false){
                if(!(cellG === false)){
                    if(cellG.fill === false) {
                        gauche = true;
                    }
                    //destroy(cellG);
                    console.log("12");
                    winCondition(cellG);
                } else {
                    console.log("1: true ");
                    gauche = true;
                }
            }

            if(droite === false){
                if(!(cellD === false)){
                    if(cellD.fill === false) {
                        droite = true;
                    }
                    //destroy(cellD);
                    console.log("22");
                    winCondition(cellD);
                } else {
                    console.log("2: true ");
                    droite = true;
                }
            }

            if(haut === false){
                if(!(cellH === false)){
                    if(cellH.fill === false) {
                        haut = true;
                    }
                    //destroy(cellH);
                    console.log("32");
                    winCondition(cellH);
                } else {
                    console.log("3: true ");
                    haut = true;
                }
            }

            if(bas === false){
                if(!(cellB === false)){
                    if(cellB.fill === true) {
                        bas = true;
                    }
                    //destroy(cellB);
                    console.log("41");
                    winCondition(cellB);
                } else {
                    console.log("4: true ");
                    bas = true;
                }
            }

            ++compt;
            if(gauche === droite === bas === haut === true){
                fin = true;
            }
            console.log("cpt :" + compt);
            console.log("fin :" + fin);
            console.log("range :" + player.range);

        }
    }


    let game = new Phaser.Game(config);

    function preload () {
        this.load.image('background', 'files/fond.jpg');
        this.load.image('caisse', 'files/block.png');
        this.load.image('usable', 'files/blockTest.png');
        this.load.image('star', 'files/star.png');


        this.load.spritesheet('dude',
            'files/dude.png',
            { frameWidth: 31, frameHeight: 34 }
        );
        this.load.spritesheet('dude2',
            'files/dude2.png',
            { frameWidth: 31, frameHeight: 34 }
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

        if (this.keyBomb.isDown && isDown == 0){
            isDown = 1;
            if(p1.getBomb() >= 1){
                p1.poseBombe();
                let c = calcDist(player.getCenter().x, player.getCenter().y);
                stars = this.physics.add.group({
                    key: 'star',
                    setXY: { x: c.getX(), y: c.getY()}
                });

                let t = this.time.addEvent({
                    delay: 2000,                // ms
                    callback: explosion,
                    args: [c, p1],
                    loop: false
                });
            }
        }
        if (this.keyBomb.isUp && isDown == 1){
            isDown = 0;
        }

    }

