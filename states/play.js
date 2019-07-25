var PlayState = {
    //State properties   _____________________________________________________________________
    platformsGroup: undefined,
    damageItemsGroup: undefined,
    healingItemsGroup: undefined,
    timerText: undefined,
    cursors: undefined,
    player: undefined,
    healthText: undefined,
    jumpButton: undefined,
    score: 0,
    scoreText: '',
    timer: undefined,

    //Main functions ____________________________________________________________________________
    create: function () {
        //add the sprite for the sky background
        game.add.sprite(0, 0, 'background');

        //add a group for platforms
        this.platformsGroup = game.add.group();
        this.platformsGroup.enableBody = true;

        //Create the platforms that are required
        this.platforms.createPlatform(this.platformsGroup, 2, 15, 2);
        this.platforms.createPlatform(this.platformsGroup, 3, 5, 4);
        this.platforms.createPlatform(this.platformsGroup, 12, 14, 5);
        this.platforms.createPlatform(this.platformsGroup, 6, 10, 6);

        //declare group for damage items
        this.damageItemsGroup = game.add.group();
        this.damageItemsGroup.enableBody = true;

        //delare group for healing items
        this.healingItemsGroup = game.add.group();
        this.healingItemsGroup.enableBody = true;

        //Create curson keys
        this.cursors = game.input.keyboard.createCursorKeys();
        this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.loopItemGenerate();
        this.timerSetup();
    },


    update: function () {
        //Collision between falling damageItem and Platforms
        game.physics.arcade.collide(this.damageItemsGroup, this.platformsGroup);

        //Do this to pile items
        game.physics.arcade.collide(this.damageItemsGroup, this.damageItemsGroup); 

        //DO this to push other items down
        game.physics.arcade.collide(this.damageItemsGroup, this.healingItemsGroup);

        //Collision betweem falling healing items and platforms
        game.physics.arcade.collide(this.healingItemsGroup, this.platformsGroup);

        //DO this to stack items
        game.physics.arcade.collide(this.healingItemsGroup, this.healingItemsGroup);

        //Do this to push other items down
        game.physics.arcade.collide(this.healingItemsGroup, this.damageItemsGroup);
    },


    render: function () {
        // If our timer is running, show the time in a nicely formatted way, else show 'Done!'
        if (this.timer.running) {
            this.timerText.text = this.formatTime(timerEvent.delay - this.timer.ms);
        } else {
            //Time finished without dying
            this.winGame();
        }

        if (config.showDebug) {
            // call renderGroup on each of the alive members 
            this.platformsGroup.forEachAlive(this.renderDebug, this);
            this.damageItemsGroup.forEachAlive(this.renderGroupDebug, this);
            this.healingItemsGroup.forEachAlive(this.renderGroupDebug, this);
            this.renderDebug(this.player);
        }
    },


    // Miscellaneous   ___________________________________________________________________________
    //activated when game is lost
    loseGame: function () {

    },

    //Activated when game is won
    winGame: function () {

    },

    //Renders the collider debug of the sprites
    renderDebug: function (member) {
        game.debug.body(member);
    },


    /** Initializes the game timer */
    timerSetup: function () {
        this.timerText = game.add.text(8 * config.tileOffSet, 16, '0', { fontSize: '64px', fill: textMessages.timerColor });
        this.timer = game.time.create();

        // Create a delayed event 1m and 30s from now
        timerEvent = this.timer.add(
            Phaser.Timer.MINUTE * textMessages.timerMinutes + Phaser.Timer.SECOND * textMessages.timerSeconds,
            this.winGame,
            game
        );

        // Start the timer
        this.timer.start();
    },



    /**
     * Formats the time nicely
     * @param {*} miliseconds milliseconds from event
     */
    formatTime: function (miliseconds) {
        let toSeconds = Math.round(miliseconds / 1000);
        // Convert seconds (s) to a nicely formatted and padded time string
        var minutes = "0" + Math.floor(toSeconds / 60);
        var seconds = "0" + (toSeconds - minutes * 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);
    },

    //Platform Functions ________________________________________________________________________
    platforms: {
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
        createPlatform: function (group, horizontalStart, horizontalEnd, verticalStart) {
            let platformTile;
            for (i = horizontalStart; i < horizontalEnd; i++) {
                //Place the sprite where specified based on the tileOffset
                platformTile = group.create(i * config.tileOffSet, game.world.height - (config.tileOffSet * verticalStart), 'grass-mid');

                //COnfigure the hitbox
                platformTile.body.setSize(config.tileOffSet, config.tileOffSet, 0, environment.grassYOffset);

                //Make unmovable so it won´t fall if pushed
                platformTile.body.immovable = true;

                //Configure collision checking only on the top
                platformTile.body.checkCollision.left = false;
                platformTile.body.checkCollision.right = false;
                platformTile.body.checkCollision.down = false;
            }
        }
    },

    //Player Functions ___________________________________________________________________________
    player: {
    },

    // Item Functions ___________________________________________________________________________
    /**
     * Creates a falling item. 
     * @param {game group} group 
     * @param {number} horizontalStart 
     * @param {number} verticalStart 
     * @param {number} damage 
     */
    ItemCreate: function (group, horizontalStart, verticalStart, gravity, lifespan, sprite, animationConfig) {
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

    },

    /**
     * Creates a falling item that belongs to the damageGroup
     * @param {any} main refenrece to playstate
     */
    damageItemCreate: function () {
        //Random offset for x position
        let random = game.rnd.integerInRange(gamePlay.damageItemXMin, gamePlay.damageItemXMax);
        this.ItemCreate(
            this.damageItemsGroup,
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
    },


    /** Creates a Falling item that belongs to the HealingGroup */
    healingItemCreate: function () {
        //Random offset for x position
        let random = game.rnd.integerInRange(gamePlay.healingItemXMin, gamePlay.healingItemXMax);
        this.ItemCreate(
            this.healingItemsGroup,
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
    },


    /** Sets up the random generators for damage and healing items */
    loopItemGenerate: function () {
        //Generate damage items with random position
        game.time.events.repeat(
            gamePlay.damageItemTime,
            gamePlay.damageItemAmount,
            this.damageItemCreate,
            this
        );

        //Generate damage items with random position
        game.time.events.repeat(
            gamePlay.healingItemTime,
            gamePlay.healingItemAmount,
            this.healingItemCreate,
            this
        );

    }





}