const game = new Phaser.Game(1080, 608, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

game.state.add('boot', BootState);