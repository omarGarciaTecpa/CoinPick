const FACING_STATE = {
    left: 0,
    right: 1
}


var PlayState = {
    //State properties   _____________________________________________________________________
    platformsGroup: undefined,
    damageItemsGroup: undefined,
    healingItemsGroup: undefined,
    timerText: undefined,
    cursors: undefined,
    player: {},
    healthText: '',
    jumpButton: undefined,
    score: 0,
    scoreText: '',
    timer: undefined,
    lastFacing: FACING_STATE.right,


    //Main functions ____________________________________________________________________________
    create: function () {
        GAME_FINAL_SCORE = 0;
        //add the sprite for the sky background
        game.add.sprite(0, 0, 'background');

        //add a group for platforms
        this.platformsGroup = game.add.group();
        this.platformsGroup.enableBody = true;

        //Create the platforms that are required
        this.platforms.createPlatform(this.platformsGroup, 2, 15, 2);
        this.platforms.createPlatform(this.platformsGroup, 3, 5, 4);
        this.platforms.createPlatform(this.platformsGroup, 12, 14, 6);
        this.platforms.createPlatform(this.platformsGroup, 6, 10, 6);

        //declare group for damage items
        this.damageItemsGroup = game.add.group();
        this.damageItemsGroup.enableBody = true;

        //declare group for healing items
        this.healingItemsGroup = game.add.group();
        this.healingItemsGroup.enableBody = true;

        //Create cursor keys
        this.cursors = game.input.keyboard.createCursorKeys();

        //Create custom jump button
        this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //Create the player
        this.playerFunctions.create(this);

        //Create the score text
        this.scoreText = game.add.text(
            2 * config.tileOffSet,
            16,
            'Score: 0',
            { fontSize: '64px', fill: textMessages.scoreColor }
        );

        //Create the health Text
        this.healthText = game.add.text(
            11 * config.tileOffSet,
            16,
            "HP: " + this.player.health + "/" + this.player.maxHealth,
            { fontSize: '64px', fill: textMessages.scoreColor }
        );

        //Start automatic generations for the items
        this.loopItemGenerate();

        //Initializes the game timer
        this.timerSetup();
    },


    update: function () {
        //Player died, lose game
        if (!this.player.alive) {
            this.loseGame();
        } else { //Player still alive
            //Colliders for damage Item .......................................................
            //Collision between falling damageItem and Platforms
            game.physics.arcade.collide(this.damageItemsGroup, this.platformsGroup);

            //Do this to pile items
            game.physics.arcade.collide(this.damageItemsGroup, this.damageItemsGroup);

            //DO this to push other items down
            game.physics.arcade.collide(this.damageItemsGroup, this.healingItemsGroup);




            //Colliders form healing item ......................................................
            //Collision betweem falling healing items and platforms
            game.physics.arcade.collide(this.healingItemsGroup, this.platformsGroup);

            //DO this to stack items
            game.physics.arcade.collide(this.healingItemsGroup, this.healingItemsGroup);

            //Do this to push other items down
            game.physics.arcade.collide(this.healingItemsGroup, this.damageItemsGroup);



            //Colliders for player...............................................................
            game.physics.arcade.collide(this.player, this.platformsGroup);
            game.physics.arcade.overlap(this.player, this.healingItemsGroup, this.playerFunctions.heal, null, this);
            game.physics.arcade.overlap(this.player, this.damageItemsGroup, this.playerFunctions.damage, null, this);

            //Setups the controls for the user
            this.playerFunctions.setupControls(this);
        }
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
        GAME_FINAL_SCORE = this.score;
        game.state.start('lose');
    },

    //Activated when game is won
    winGame: function () {
        game.state.start('win');
    },

    //Renders the collider debug of the sprites
    renderDebug: function (member) {
        game.debug.body(member);
    },


    /** Initializes the game timer */
    timerSetup: function () {
        //Set the timer text
        this.timerText = game.add.text(8 * config.tileOffSet, 16, '0', { fontSize: '64px', fill: textMessages.timerColor });

        //create the timer
        this.timer = game.time.create();

        // Create a delayed event 
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
    //Holder object for functions related to the platform
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
    playerFunctions: {
        /**
         * Calculates the offset needed to center the collider box o either x o y
         * @param {any} size
         * @param {any} desiredSize
         */
        calculateCBOffset: function (size, desiredSize) {
            return (size / 2) - (desiredSize / 2);
        },


        /** Creates and configures the player sprite */
        create: function (main) {
            //Place the sprite
            main.player = game.add.sprite(config.tileOffSet * 1, game.world.height - config.tileOffSet * 4, 'player');

            //Set player health
            main.player.maxHealth = playerConfig.playerMaxHealth;
            main.player.health = playerConfig.playerHealth;

            //Add physics properties to the player sprite
            game.physics.arcade.enable(main.player);
            main.player.body.gravity.y = playerConfig.playerGravity;
            main.player.body.bounce.y = 0.2;

            //Check if player is out of bound
            main.player.checkWorldBounds = true;

            //Set player to die if out of bounds
            main.player.outOfBoundsKill = true;

            //Sets collide box size and position
            main.player.body.setSize(
                playerConfig.playerCBWidth,
                playerConfig.playerCBHeight,
                this.calculateCBOffset(playerConfig.playerSizeX, playerConfig.playerCBWidth),
                this.calculateCBOffset(playerConfig.playerSizeY, playerConfig.playerCBHeight)
            );

            //Create left and right idle Animation
            main.player.animations.add(
                'idle-left',
                playerConfig.idleLeftAnimationArray,
                playerConfig.idleFramerate,
                true
            );

            main.player.animations.add(
                'idle-right',
                playerConfig.idleRightAnimationArray,
                playerConfig.idleFramerate,
                true
            );

            //Create left and right Jump animation. These should not loop
            main.player.animations.add(
                'jump-left',
                playerConfig.jumpLeftAnimationArray,
                playerConfig.jumpFramerate,
                false
            );

            main.player.animations.add(
                'jump-right',
                playerConfig.jumpRightAnimationArray,
                playerConfig.jumpFramerate,
                false
            );

            //Create the left and right run animation
            main.player.animations.add(
                'run-left',
                playerConfig.runLeftAnimationArray,
                playerConfig.runFramerate,
                true
            );

            main.player.animations.add(
                'run-right',
                playerConfig.runRightAnimationArray,
                playerConfig.runFramerate,
                true
            );


            //Start the default animation
            main.player.animations.play('idle-right');

            //Set the speed for that animation
            main.player.animations.currentAnim.speed = playerConfig.idleSpeed;
        },


        /**
         *  Takes effect when player collects a coin
         * @param {any} player player sprite
         * @param {any} item item that overlapped
         */
        heal: function (player, item) {
            //Destroys the item
            item.kill(); 

            //Set health taking into account max health
            player.health = Math.min(100, player.health + playerConfig.itemHeal);

            //Increase score
            this.score += playerConfig.itemScore;
            this.scoreText.text = "Score: " + this.score;
            this.playerFunctions.updateHealth(this);
        },

        /**
         * Takes effect when player is damaged
         * @param {any} player player sprite
         * @param {any} item item that overlapped

         */
        damage: function (player, item) {
            item.kill();
            player.damage(playerConfig.maceDamage);
            this.playerFunctions.updateHealth(this);
        },


        /**
         * Updats value of the health
         * @param {any} main reference to PlayState, needed to update health
         */
        updateHealth: function (main) {
            main.healthText.text = "HP: " + main.player.health + "/" + main.player.maxHealth;
        },


        /** Setup basic animations and movement */
        setupControls: function (main) {
            //  We want the player to stop when not moving
            main.player.body.velocity.x = 0

            if (main.cursors.left.isDown) {
                main.player.body.velocity.x = -1 * playerConfig.runMovementSpeed;
                main.lastFacing = FACING_STATE.left;
                if (main.player.body.touching.down) {
                    main.player.animations.play('run-left');
                    main.player.animations.currentAnim.speed = playerConfig.runSpeed;
                }
            } else if (main.cursors.right.isDown) {
                main.player.body.velocity.x = playerConfig.runMovementSpeed;
                main.lastFacing = FACING_STATE.right;
                if (main.player.body.touching.down) {
                    main.player.animations.play('run-right');
                    main.player.animations.currentAnim.speed = playerConfig.runSpeed;
                }
            } else {
                // If no movement keys are pressed, stop the player
                if (main.lastFacing == FACING_STATE.right) {
                    main.player.animations.play('idle-right');
                } else {
                    main.player.animations.play('idle-left');
                }
                main.player.animations.currentAnim.speed = playerConfig.idleSpeed;
            }

            if (main.jumpButton.isDown && main.player.body.touching.down) {
                main.player.body.velocity.y = -1 * playerConfig.jumpMovementSpeed;
                if (main.lastFacing == FACING_STATE.right) {
                    main.player.animations.play('jump-right');
                } else {
                    main.player.animations.play('jump-left');
                }

                main.player.animations.currentAnim.speed = playerConfig.jumpSpeed;
            }
        },
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