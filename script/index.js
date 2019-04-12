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
    let stars2;
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
    let isDown = 0;
    let isDown2 = 0;
    let temp;
    let fin = false;
    let restart = false;

    //retournle la position du centre de la case la plus proche
    function calcDist(x,y,strict = false){
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

        if(strict === false){
            return cell;
        }


        for(let i = 0; i < tab.length; ++i){
            cell = tab[i];
            if(cell.getX() <= x+demi && cell.getX() >= x-demi && cell.getY() <= y+demi && cell.getY() >= y-demi ){
                return cell;
            }
        }

        return false;

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

        if (restart == true && fin == false){
            console.log("restart demandé");
            restart = false;
            that.scene.restart();
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



        if (this.keyBomb.isDown && isDown == 0){
            isDown = 1;
            if(p1.getBomb() >= 1){
                p1.poseBombe();
                let c = calcDist(player.getCenter().x, player.getCenter().y,false);
                stars = this.physics.add.group({
                    key: 'star',
                    setXY: { x: c.getX(), y: c.getY()},
                    setScale: { x: document_width/17000, y: document_height/17000}
                });
                MajNbBombes();

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

        if (this.keyBomb2.isDown && isDown2 == 0){
            isDown2 = 1;
            if(p2.getBomb() >= 1){
                p2.poseBombe();
                let c = calcDist(player2.getCenter().x, player2.getCenter().y,false);
                stars2 = this.physics.add.group({
                    key: 'star',
                    setXY: { x: c.getX(), y: c.getY()},
                    setScale: { x: document_width/17000, y: document_height/17000}
                });
                MajNbBombes();

                let t2 = this.time.addEvent({
                    delay: 2000,                // ms
                    callback: explosion,
                    args: [c, p2],
                    loop: false
                });
            }
        }
        if (this.keyBomb2.isUp && isDown2 == 1){
            isDown2 = 0;
        }

    }

    function create_breakable(){
        while(nb_breakable<70){
            let aleatnumber = Math.floor(Math.random() * (tab.length));
                let aleatcell = tab[aleatnumber];
            while(aleatcell.fill || calcDist(player.x,player.y,false) == aleatcell || calcDist(player2.x,player2.y,false) == aleatcell) {
                aleatnumber = Math.floor(Math.random() * (tab.length));
                aleatcell = tab[aleatnumber];
            };

            stones[nb_breakable] = that.physics.add.group({
                        key: 'stone',
                        setXY: { x: aleatcell.getX(), y: aleatcell.getY()},
                        setScale: { x: document_width/10000, y: document_height/10000},
                        immovable: true,
                        moves: false
                    });
            that.physics.add.collider(player, stones);
            that.physics.add.collider(player2, stones);
            tab[aleatnumber].fill = true;
            nb_breakable++;
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
        console.log("debut win");
        fin = true;
        if(winner===player){
            console.log("win p1");
            VARscore1++;
            document.getElementById("Score1").innerHTML = VARscore1;
        }

        if(winner===player2){
            VARscore2++;
            document.getElementById("Score2").innerHTML = VARscore2;
        }
        console.log("après win p1");
        nb_breakable = 0;
        breakable_created = false;
        VARnb_tour++;
        document.getElementById("nbParties").innerHTML = VARnb_tour;
        console.log("avant restart");
        restart = true;
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
        for(let i = 0; i < stones.length; i++){
            if (stones[i].children.entries[0].x == x && stones[i].children.entries[0].y == y){
                temp = i;
                return stones[i];
            }
        }
        return false;
    }
    function supprStone(x, y) {
        for(let i = 0; i < stones.length; i++){
            if (stones[i].children.entries[0].x == x && stones[i].children.entries[0].y == y){
                stones.splice(i,1);
            }
        }
        return false;
    }

    function explosion(cell, player){
        //supprimer la bombe
        if(player.num == 1){
            stars.children.entries[0].destroy();
        }
        if(player.num == 2){
            stars2.children.entries[0].destroy();
        }
        //faire l'explosion de la case présente en argument
        let compt = 1;
        player.bomb++;
        let gauche = false;
        let droite = false;
        let haut = false;
        let bas = false;
        fin = false;
        let cellg = false;
        let cellG = false;
        let celld = false;
        let cellD = false;
        let cellh = false;
        let cellH = false;
        let cellb = false;
        let cellB = false;

        while(compt <= player.range && fin == false){
        console.log("coucou" + compt);
            cellB = false;
            cellH = false;
            cellG = false;
            cellD = false;

            dist = compt * demi * 2;

            cellg = calcDist(cell.getX() - dist, cell.getY(),true);
            if(cellg != false){
                cellG = recupCell(cellg.getX(), cell.getY());
            }
            celld = calcDist(cell.getX() + dist, cell.getY(),true);
            if(celld != false){
                cellD = recupCell(celld.getX(), cell.getY());
            }
            cellh = calcDist(cell.getX(), cell.getY() - dist,true);
            if(cellh != false){
                cellH = recupCell(cell.getX(), cellh.getY());
            }
            cellb = calcDist(cell.getX(), cell.getY() + dist,true);
            if(cellb != false){
                cellB = recupCell(cell.getX(), cellb.getY());
            }
            console.log(cellG);
            console.log(cellD);
            console.log(cellH);
            console.log(cellB);
            if(gauche === false){
                if(!(cellG === false)){
                    if(cellG.fill) {
                        gauche = true;
                    }
                    destroy(cellG);
                    console.log("12");
                    if(fin){fin = false; return;};
                } else {
                    console.log("1: true ");
                    gauche = true;
                }
            }

            if(droite === false){
                if(!(cellD === false)){
                    if(cellD.fill) {
                        droite = true;
                    }
                    destroy(cellD);
                    console.log("22");
                    if(fin){fin = false; return;};
                } else {
                    console.log("2: true ");
                    droite = true;
                }
            }

            if(haut === false){
                if(!(cellH === false)){
                    if(cellH.fill) {
                        haut = true;
                    }
                    destroy(cellH);
                    console.log("32");
                    if(fin){fin = false; return;};
                } else {
                    console.log("3: true ");
                    haut = true;
                }
            }

            if(bas === false){
                if(!(cellB === false)){
                    if(cellB.fill) {
                        bas = true;
                    }
                    destroy(cellB);
                    console.log("41");
                    if(fin){fin = false; return;};
                } else {
                    console.log("4: true ");
                    bas = true;
                }
            }

            compt++;
            console.log("cpt :" + compt);
            console.log("fin :" + fin);
            console.log("range :" + player.range);

        }
    }

    function destroy(cell){
        displayAnim(cell.getX(),cell.getY());
        let stone = recupStone(cell.getX(),cell.getY());
        if (stone != false){
            stone.fill = false;
            stone.children.entries[0].destroy();
            stones.splice(temp,1);
        }
        cell.fill = false;
        winCondition(cell);
    }
    //cell.children.entries[0].destroy()


    function winCondition(cell){
        console.log("b1");
        let winp1 = false;
        let winp2 = false;
        if(calcDist(player.getCenter().x, player.getCenter().y,true) == cell){
            winp2 = true;
        }
        console.log("b2");

        if(calcDist(player2.getCenter().x, player2.getCenter().y,true) == cell){
            winp1 = true;
        }

        console.log(calcDist(player2.getCenter().x, player2.getCenter().y,true));
        console.log(cell);


        if(winp1 && winp2){
            console.log("b3");
            Win(null);
            return ;
        }

        if(winp1){
            console.log("b4");
            Win(player);
        }

        if(winp2){
            console.log("b5");
            Win(player2);
        }
    }
