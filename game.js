const game = new Phaser.Game(1080, 608, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

const tileOffset = 64;

function preload() {
    //Preload asset images 
    game.load.image('background', 'assets/Background.png');
    game.load.image('grass-mid', 'assets/Ground/GrassMid.png');
    game.load.image('mace', 'assets/env/mace.png');
}

let platforms;
let damageItems;
let player1;
let player2;
let player1Damage = 0;
let player2Damage = 0;
let player1DamageText = 0;
let player2DamageText = 0;
let timerText;
let cursors;
//let diamonds;
//let scoreText;
//let score = 0;



function create() {
    //start physics system
    game.physics.startSystem(Phaser.Physics.Arcade);

    //add the sprite for the sky background
    game.add.sprite(0, 0, 'background');

    //add a group for platforms
    platforms = game.add.group();
    platforms.enableBody = true;

    createPlatform(platforms, 2, 15, 2);
    createPlatform(platforms, 3, 5, 4);
    createPlatform(platforms, 12, 14, 5);
    createPlatform(platforms, 6, 10, 6);

    damageItems = game.add.group();
    damageItems.enableBody = true;

    //set player
    //player = game.add.sprite(32, game.world.height - 150, 'woof');
    //game.physics.arcade.enable(player);
    //player.body.bounce.y = 0.2;
    //player.body.gravity.y = 800;
    //player.body.collideWorldBounds = true;

    //player.animations.add('left', [0, 1], 10, true);
    //player.animations.add('right', [2, 3], 10, true);


    //set diamonds
    //diamonds = game.add.group();
    //diamonds.enableBody = true;

    /*
    for (var i = 0; i < 12; i++) {
        let diamond = diamonds.create(i * 70, 0, 'diamond');
        diamond.body.gravity.y = 1000;
        diamond.body.bounce.y = 0.3 + Math.random() * 0.2;
        diamond.body.collideWorldBounds = true;
    }*/


    cursors = game.input.keyboard.createCursorKeys();

    setPlayerText();
    startTimer();
    game.time.events.repeat(Phaser.Timer.SECOND * 1, 120, createFallingDamageItem, this);
    scaleWindow();
}



function update() {
    //Collision between falling damageItem and Platforms
    game.physics.arcade.collide(damageItems, platforms);
    //COllisions between player and platforms
    /*game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(diamonds, platforms);
    game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this);

    player.body.velocity.x = 0;*/

    /*
    if (cursors.left.isDown) {
        player.body.velocity.x = -150;
        player.animations.play('left');
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 150;
        player.animations.play('right');
    }else{
        player.animations.stop();
    }*/

    /*
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -400;
    }*/


}


function render() {
    // If our timer is running, show the time in a nicely formatted way, else show 'Done!'
    if (timer.running) {
        timerText.text = formatTime(timerEvent.delay - timer.ms);
    }
}

/*
function collectDiamond(player, diamond) {
    diamond.kill();
    score += 10;
    scoreText.text = 'SCORE: ' + score;
}*/

/**
 * Creates a platform and adds it to a group.
 * 
 * Horizontally, at 0 would be the tile most to the left and at 17 the tile most to the right.
 * Vertically, at 0 would be the tile on the bottom, and at 10 the tile on the top.
 * @param {game group} group group where the platform is added
 * @param {number} horizontalStart horizontal startPoint relative to the tile array. 
 * @param {number} horizontalEnd horizontal endPoint relative to the tile array
 * @param {number} verticalStart vertical startpoint of the platform
 */
function createPlatform(group, horizontalStart, horizontalEnd, verticalStart) {
    let ground;
    for (i = horizontalStart; i < horizontalEnd; i++) {
        ground = group.create(i * tileOffset, game.world.height - (tileOffset * verticalStart), 'grass-mid');
        ground.body.immovable = true;
    }
}

/**
 * Creates a falling item. 
 * @param {game group} group 
 * @param {number} horizontalStart 
 * @param {number} verticalStart 
 * @param {number} damage 
 */
function createFallingItem(group, horizontalStart, verticalStart, gravity, lifespan) {
    let tempItem = group.create(
        horizontalStart * tileOffset,
        game.world.height - (verticalStart * tileOffset),
        'mace'
    );
    tempItem.body.gravity.y = gravity;
    tempItem.body.bounce.y = 0.2;
    tempItem.lifespan = lifespan;
}

function createFallingDamageItem() {
    let random = game.rnd.integerInRange(2, 14);
    createFallingItem(damageItems, random, 11, 1000, 2500);
}


/** Setup Player related text*/
function setPlayerText() {
    player1DamageText = game.add.text(2 * tileOffset, 16, '0', { fontSize: '64px', fill: '#000' });
    player2DamageText = game.add.text(game.world.width - 2 * tileOffset, 16, '0', { fontSize: '64px', fill: '#000' });
}

/** Scale game window to window size*/
function scaleWindow() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true);
}



/**Set timer */
function startTimer() {
    timerText = game.add.text(8 * tileOffset, 16, '0', { fontSize: '64px', fill: '#000' });
    timer = game.time.create();
    // Create a delayed event 1m and 30s from now
    timerEvent = timer.add(Phaser.Timer.MINUTE * 2 + Phaser.Timer.SECOND * 00, endBattle, game);
    // Start the timer
    timer.start();
}

function endBattle() {
    // Stop the timer when the delayed event triggers
    timer.stop();
    //End battle events
}

/**
 * Formats the time nively
 * @param {*} miliseconds milliseconds from event
 */
function formatTime(miliseconds) {
    let toSeconds = Math.round(miliseconds/ 1000);
    // Convert seconds (s) to a nicely formatted and padded time string
    var minutes = "0" + Math.floor(toSeconds / 60);
    var seconds = "0" + (toSeconds - minutes * 60);
    return minutes.substr(-2) + ":" + seconds.substr(-2);   
}

