//General Config
const config = {
    tileOffSet: 64,
    showDebug: true
}

//Text Message Config
const textMessages = {
    gameTitle: 'Coin Pick Ninja',
    gameTitleColor: '#fff',
    instructionMsg: 'Press "space" to Start',
    instructionColor: '#fff',
    timerColor: '#000',
    timerMinutes: 2,
    timerSeconds: 0,
    scoreColor: '#000',
    healthColor: '#000',
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
    //Health
    playerHealth: 100,
    playerMaxHealth: 100,
    maceDamage: 20,
    itemHeal: 5,
    itemScore: 20,
    //Idle animation ------
    idleLeftAnimationArray: [0, 1, 2, 3, 4, 5],
    idleRightAnimationArray: [20, 21, 22, 23, 24, 25],
    idleFramerate: 10,
    idleSpeed: 8,
    //Jump animation  -----
    jumpLeftAnimationArray: [6, 7, 7, 7, 8, 9],
    jumpRightAnimationArray: [26, 27, 27, 27, 28, 29],
    jumpFramerate: 10,
    jumpSpeed: 8,
    jumpMovementSpeed: 550,
    //Run animation  -----
    runLeftAnimationArray: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    runRightAnimationArray: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
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



var LoadState = {
    preload: function () {
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
    },
    create: function () {
        game.state.start('menu');
    }
};