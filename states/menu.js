var MenuState = {
    bgm: undefined,

    create: function () {
        //add the sprite for the sky background
        game.add.sprite(0, 0, 'menuBackground');

        //Calculate center 
        let yPos = game.world.height / 2;

        //Add game title text
        game.add.text(64, yPos, textMessages.gameTitle, { fontSize: '72px', fill: textMessages.gameTitleColor });

        //Add game start instruction 
        game.add.text(80, yPos + 64, textMessages.instructionMsg, { fontSize: '48px', fill: textMessages.instructionColor });

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
        game.state.start('play');
    }
}