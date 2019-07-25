/**
 *  Scale game window to window size, will be used by the states that use render function
 * @param {any} _game
 */
function scaleWindow(_game) {
    _game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    _game.scale.pageAlignHorizontally = true;
    _game.scale.pageAlignVertically = true;
    _game.scale.setScreenSize(true);
}

var bootState = {
    create: function () {
        //start physics system
        game.physics.startSystem(Phaser.Physics.Arcade);

        //Go to load state
        game.state.start('load');
    }
};