var WinState = {
    create: function () {
        //add the sprite for the sky background
        game.add.sprite(0, 0, 'winBackground');

        //Calculate center 
        let yPos = game.world.height / 2;

        //Add game title text
        game.add.text(64, yPos, textMessages.winGameTitle, { fontSize: '72px', fill: textMessages.winGameTitleColor });

        //Add game start instruction 
        game.add.text(80, yPos + 64, textMessages.winGameInstruction, { fontSize: '48px', fill: textMessages.winGameTitleColor });


        //Add game score
        game.add.text(120, yPos + 128, "Score: " + GAME_FINAL_SCORE, { fontSize: '48px', fill: textMessages.loseGameTitleColor });


        //Assign start key
        let startKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //wait for the input
        startKey.onDown.addOnce(this.start, this);
    },
    render: function () {
        //Scale the window
        scaleWindow(game);
    },
    start: function () {
        //Restart Game
        game.state.start('play');
    }
}