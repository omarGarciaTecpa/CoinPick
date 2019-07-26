const game = new Phaser.Game(1080, 608, Phaser.CANVAS, '');


game.state.add('boot', bootState);
game.state.add('load', LoadState);
game.state.add('menu', MenuState);
game.state.add('play', PlayState);
game.state.add('lose', LoseState);
game.state.add('win', WinState);

game.state.start('boot');
