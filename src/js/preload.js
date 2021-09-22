var Preload = function(game){};

Preload.prototype = {

	preload: function(){ 

		// game.load.tilemap('soko', 'assets/soko.json', null, Phaser.Tilemap.TILED_JSON);
		// game.load.image('tiles', 'assets/sokoban_tilesheet@2.png');
		// game.load.image('player', 'assets/hulk.png');
		// game.load.image('ground', 'assets/ground.png');
		// game.load.image('wall', 'assets/ground_06.png');
		game.load.image('player', 'assets/player1.png');
		game.load.image('ghost', 'assets/ghost.png');
		game.load.image('dot', 'assets/dot.png');
		game.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);

		game.load.image('tiles', 'assets/sokoban_tilesheet.png');
		game.load.image('wall', 'assets/wall.png');
		// this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
		game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
	},

	create: function(){
		this.game.state.start("Main");
	}
}