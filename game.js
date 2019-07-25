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
    //mace Sprite Config  -------------------------
    maceImage: 'assets/env/mace.png',
    maceSizeX: 64,
    maceSizeY: 64,
    maceAnimationArray: [0],
    maceFramerate: 10,
    maceSpeed: 15,
    //Coin Sprite config ---------------------------
    coinImage: 'assets/env/coin.png',
    coinSizeX: 64,
    coinSizeY: 64,
    coinAnimationArray: [0, 1, 2, 3, 4],
    coinFramerate: 10,
    coinSpeed: 15
};

//Player related configuration
const playerConfig = {
    playerImage: 'assets/player.png',
    playerSizeX: 160,
    playerSizeY: 80,
    playerCBWidth: 54, //Collider box desired width
    playerCBHeight: 60, //collider box desired height
    //Idle animation ------
    idleAnimationArray: [0, 1, 2, 3, 4, 5],
    idleFramerate: 10,
    idleSpeed: 8,
    //Jump animation  -----
    jumpAnimationArray: [6, 7, 7, 7, 8, 9],
    jumpFramerate: 10,
    jumpSpeed: 8,
    jumpMovementSpeed: 550,
    //Run animation  -----
    runAnimationArray: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    runFramerate: 10,
    runSpeed: 20,
    runMovementSpeed: 400
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
let jumpButton;
let jumpTimer = 0;



function preload() {
    //Preload asset images 
    game.load.image('background', environment.backgroundImage);
    game.load.image('grass-mid', environment.grassImage);

    game.load.spritesheet(
        'mace',
        environment.maceImage,
        environment.maceSizeX,
        environment.maceSizeY
    );

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
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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

    setupControls();

}


function render() {
    // If our timer is running, show the time in a nicely formatted way, else show 'Done!'
    if (timer.running) {
        timerText.text = formatTime(timerEvent.delay - timer.ms);
    }

    if (config.showDebug) {
        // call renderGroup on each of the alive members    
        //damageItems.forEachAlive(renderGroup, this);
        //healingItems.forEachAlive(renderGroup, this);
        //platforms.forEachAlive(renderGroup, this);
        renderGroup(player);

    }
}



/** Debug rendering for the elements of the group*/
function renderGroup(member) {
    game.debug.body(member);
}

/**
 * Calculates the offset needed to center the collider box o either x o y
 * @param {any} size
 * @param {any} desiredSize
 */
function calculateCBOffset(size, desiredSize) {
    return (size / 2) - (desiredSize / 2);
}


/** Creates and configures the player sprite */
function createPlayer() {
    //Place the sprite
    player = game.add.sprite(config.tileOffSet * 1, game.world.height - config.tileOffSet * 4, 'player');

    //Add physics properties to the player gif
    game.physics.arcade.enable(player);
    player.body.gravity.y = 900;
    player.body.bounce.y = 0.2;

    //Sets collide box size and position
    player.body.setSize(
        playerConfig.playerCBWidth,
        playerConfig.playerCBHeight,
        calculateCBOffset(playerConfig.playerSizeX, playerConfig.playerCBWidth),
        calculateCBOffset(playerConfig.playerSizeY, playerConfig.playerCBHeight)
    );

    //Create Jump Animation
    player.animations.add(
        'idle',
        playerConfig.idleAnimationArray,
        player.idleFramerate,
        true
    );

    //Create Jump animation. This one should not loop
    player.animations.add(
        'jump',
        playerConfig.jumpAnimationArray,
        player.jumpFramerate,
        false
    );

    //Create the run animation
    player.animations.add(
        'run',
        playerConfig.runAnimationArray,
        player.runFramerate,
        true
    );

    //Start the default animation
    player.animations.play('idle');

    //Set the speed for that animation
    player.animations.currentAnim.speed = playerConfig.idleSpeed;
}


/** Setup basic animations and movement */
function setupControls() {
    //  We want the player to stop when not moving
    player.body.velocity.x = 0

    if (cursors.left.isDown) {
        player.body.velocity.x = -1 * playerConfig.runMovementSpeed;
        if (player.body.touching.down) {
            player.animations.play('run');
            player.animations.currentAnim.speed = playerConfig.runSpeed;
        }
    } else if (cursors.right.isDown) {
        player.body.velocity.x = playerConfig.runMovementSpeed;
        if (player.body.touching.down) {
            player.animations.play('run');
            player.animations.currentAnim.speed = playerConfig.runSpeed;
        }
    } else {
        // If no movement keys are pressed, stop the player
        player.animations.play('idle');
        player.animations.currentAnim.speed = playerConfig.idleSpeed;
    }

    if (jumpButton.isDown && player.body.touching.down) {
        player.body.velocity.y = -1 * playerConfig.jumpMovementSpeed;
        player.animations.play('jump');
        player.animations.currentAnim.speed = playerConfig.jumpSpeed;
    }
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
        //Place the sprite where specified based on the tileOffset
        ground = group.create(i * config.tileOffSet, game.world.height - (config.tileOffSet * verticalStart), 'grass-mid');

        //COnfigure the hitbox
        ground.body.setSize(config.tileOffSet, config.tileOffSet, 0, environment.grassYOffset);

        //Make unmovable so it won´t fall if pushed
        ground.body.immovable = true;

        //Configure collision checking only on the top
        ground.body.checkCollision.left = false;
        ground.body.checkCollision.right = false;
        ground.body.checkCollision.down = false;
    }
}

/** Sets up the random generators for damage and healing items */
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
function createFallingItem(group, horizontalStart, verticalStart, gravity, lifespan, sprite, animationConfig) {
    let tempItem = group.create(
        horizontalStart * config.tileOffSet,
        game.world.height - (verticalStart * config.tileOffSet),
        sprite
    );
    tempItem.body.gravity.y = gravity;
    tempItem.body.bounce.y = 0.2;
    tempItem.lifespan = lifespan;

    if (animationConfig) {
        tempItem.animations.add(
            'animate',
            animationConfig.animationArray,
            animationConfig.frameRate,
            true);

        tempItem.animations.play('animate');
        tempItem.animations.currentAnim.speed = animationConfig.speed;
    }

}


/** Creates a falling item that belongs to the damageGroup*/
function createFallingDamageItem() {
    let random = game.rnd.integerInRange(gamePlay.damageItemXMin, gamePlay.damageItemXMax);
    let tempItem = createFallingItem(
        damageItems,
        random,
        11,
        gamePlay.damageItemGravity,
        gamePlay.damageItemLifespan,
        'mace',
        {
            animationArray: environment.maceAnimationArray,
            frameRate: environment.maceFramerate,
            speed: environment.maceSpeed
        }
    );
}


/** Creates a Falling item that belongs to the HealingGroup */
function createFallingHealingItem() {
    let random = game.rnd.integerInRange(gamePlay.healingItemXMin, gamePlay.healingItemXMax);
    let tempItem = createFallingItem(
        healingItems,
        random,
        11,
        gamePlay.healingItemGravity,
        gamePlay.healingItemLifespan,
        'coin',
        {
            animationArray: environment.coinAnimationArray,
            frameRate: environment.coinFramerate,
            speed: environment.coinSpeed
        }
    );
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

