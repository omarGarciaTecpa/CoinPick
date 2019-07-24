const game = new Phaser.Game(1080, 608, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
});


//General Config
const config = {
    tileOffSet: 64,
    showDebug: true
}

//Text Message Config
const textMessages = {
    timerColor: '#000',
    timerMinutes: 2,
    timerSeconds: 0
}

//Environment related Config
const environment = {
    backgroundImage: 'assets/Background.png',
    grassImage: 'assets/Ground/GrassMid.png',
    grassYOffset: 10,
    maceImage: 'assets/env/mace.png',
    //Coin Sprite config ---------------------------
    coinImage: 'assets/env/coin.png',
    coinSizeX: 64,
    coinSizeY: 64,
    coinAnimationArray: [0, 1, 2, 3, 4],
    coinFramerate: 5
};


const playerConfig = {
    playerImage: 'assets/player.png',
    playerSizeX: 64,
    playerSizeY: 64,
    idleAnimationArray: [0, 1, 2, 3, 4],
    idleFramerate: 5
}

//Gameplay Config
const gamePlay = {
    //Damage Item Config ---------------------------
    damageItemTime: 1000,
    damageItemAmount: 120,
    damageItemDamage: 20,
    damageItemLifespan: 3000,
    damageItemGravity: 1000,
    damageItemXMin: 2,
    damageItemXMax: 14,
    //Healing Item Config --------------------------
    healingItemTime: 3000,
    healingItemAmount: 40,
    healingItemDamage: -10,
    healingItemLifespan: 5000,
    healingItemGravity: 700,
    healingItemXMin: 2,
    healingItemXMax: 14
};


//Internal variables, these are not configurable with koji
let platforms;
let damageItems;
let healingItems;
let timerText;
let cursors;
let player;



function preload() {
    //Preload asset images 
    game.load.image('background', environment.backgroundImage);
    game.load.image('grass-mid', environment.grassImage);
    game.load.image('mace', environment.maceImage);
    game.load.spritesheet(
        'coin',
        environment.coinImage,
        environment.coinSizeX,
        environment.coinSizeY
    );
    game.load.spritesheet(
        'player',
        playerConfig.playerImage,
        playerConfig.playerSizeX,
        playerConfig.playerSizeY
    );
}



function create() {
    //start physics system
    game.physics.startSystem(Phaser.Physics.Arcade);

    //add the sprite for the sky background
    game.add.sprite(0, 0, 'background');

    //add a group for platforms
    platforms = game.add.group();
    platforms.enableBody = true;

    //Create the platforms
    createPlatform(platforms, 2, 15, 2);
    createPlatform(platforms, 3, 5, 4);
    createPlatform(platforms, 12, 14, 5);
    createPlatform(platforms, 6, 10, 6);

    //declare group for damage items
    damageItems = game.add.group();
    damageItems.enableBody = true;

    //delare group for healing items
    healingItems = game.add.group();
    healingItems.enableBody = true;

    //Create curson keys
    cursors = game.input.keyboard.createCursorKeys();

    createPlayer();
    startTimer();
    createLoopedGenerators();
    scaleWindow();
}



function update() {
    //Collision between falling damageItem and Platforms
    game.physics.arcade.collide(damageItems, platforms);
    game.physics.arcade.collide(damageItems, damageItems);
    game.physics.arcade.collide(damageItems, healingItems);

    //Collision betweem falling healing items and platforms
    game.physics.arcade.collide(healingItems, platforms);
    game.physics.arcade.collide(healingItems, healingItems);
    game.physics.arcade.collide(healingItems, damageItems);

    game.physics.arcade.collide(player, platforms);


}


function render() {
    // If our timer is running, show the time in a nicely formatted way, else show 'Done!'
    if (timer.running) {
        timerText.text = formatTime(timerEvent.delay - timer.ms);
    }

    if (config.showDebug) {
        // call renderGroup on each of the alive members    
        damageItems.forEachAlive(renderGroup, this);
        healingItems.forEachAlive(renderGroup, this);
        platforms.forEachAlive(renderGroup, this);
        renderGroup(player);

    }
}



/** Debug rendering for the elements of the group*/
function renderGroup(member) {
    game.debug.body(member);
}


function createPlayer() {
    player = game.add.sprite(config.tileOffSet * 3, game.world.height - config.tileOffSet * 3, 'player');
    game.physics.arcade.enable(player);
    player.body.gravity.y = 800;
    player.body.bounce.y = 0.2;

    player.animations.add(
        'idle',
        player.idleAnimationArray,
        player.idleFramerate,
        true);

    player.animations.play('idle');
}


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
        ground = group.create(i * config.tileOffSet, game.world.height - (config.tileOffSet * verticalStart), 'grass-mid');
        ground.body.setSize(config.tileOffSet, config.tileOffSet, 0, environment.grassYOffset);
        ground.body.immovable = true;
    }
}


function createLoopedGenerators() {
    //Generate damage items with random position
    game.time.events.repeat(
        gamePlay.damageItemTime,
        gamePlay.damageItemAmount,
        createFallingDamageItem,
        this
    );

    //Generate damage items with random position
    game.time.events.repeat(
        gamePlay.healingItemTime,
        gamePlay.healingItemAmount,
        createFallingHealingItem,
        this
    );

}


/**
 * Creates a falling item. 
 * @param {game group} group 
 * @param {number} horizontalStart 
 * @param {number} verticalStart 
 * @param {number} damage 
 */
function createStaticFallingItem(group, horizontalStart, verticalStart, gravity, lifespan, sprite) {
    let tempItem = group.create(
        horizontalStart * config.tileOffSet,
        game.world.height - (verticalStart * config.tileOffSet),
        sprite
    );
    tempItem.body.gravity.y = gravity;
    tempItem.body.bounce.y = 0.2;
    tempItem.lifespan = lifespan;

    return tempItem;
}


/** Creates a falling item that belongs to the damageGroup*/
function createFallingDamageItem() {
    let random = game.rnd.integerInRange(gamePlay.damageItemXMin, gamePlay.damageItemXMax);
    createStaticFallingItem(
        damageItems,
        random,
        11,
        gamePlay.damageItemGravity,
        gamePlay.damageItemLifespan,
        'mace'
    );
}


/** Creates a Falling item that belongs to the HealingGroup */
function createFallingHealingItem() {
    let random = game.rnd.integerInRange(gamePlay.healingItemXMax, gamePlay.healingItemXMax);
    let tempItem = createStaticFallingItem(
        healingItems,
        random,
        11,
        gamePlay.healingItemGravity,
        gamePlay.healingItemLifespan,
        'coin'
    );

    //Add Animation to the coin sprite
    tempItem.animations.add(
        'spin',
        environment.coinAnimationArray,
        environment.coinFramerate,
        true);

    tempItem.animations.play('spin');
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
    timerText = game.add.text(8 * config.tileOffSet, 16, '0', { fontSize: '64px', fill: textMessages.timerColor });
    timer = game.time.create();

    // Create a delayed event 1m and 30s from now
    timerEvent = timer.add(
        Phaser.Timer.MINUTE * textMessages.timerMinutes + Phaser.Timer.SECOND * textMessages.timerSeconds,
        endGame,
        game
    );

    // Start the timer
    timer.start();
}



function endGame() {
    // Stop the timer when the delayed event triggers
    timer.stop();
    //End battle events
}

/**
 * Formats the time nively
 * @param {*} miliseconds milliseconds from event
 */
function formatTime(miliseconds) {
    let toSeconds = Math.round(miliseconds / 1000);
    // Convert seconds (s) to a nicely formatted and padded time string
    var minutes = "0" + Math.floor(toSeconds / 60);
    var seconds = "0" + (toSeconds - minutes * 60);
    return minutes.substr(-2) + ":" + seconds.substr(-2);
}

