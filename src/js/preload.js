var Preload = function(game){};

Preload.prototype = {

	preload: function(){ 
			// this.load.image("pacman-tiles", "../src/assets/monochrome_tilemap_packed.png");
	
			this.load.image('player', '../src/assets/player.png');
			this.load.image('ghost1', '../src/assets/ghost1.png');
			this.load.image('ghost2', '../src/assets/ghost2.png');
			this.load.image('ghost3', '../src/assets/ghost3.png');
			this.load.image('dot', '../src/assets/dot.png');
	
			this.load.image('wall', '../src/assets/tile_0378.png');
			this.load.image('top-left', '../src/assets/tile_0195.png');
			this.load.image('top', '../src/assets/tile_0196.png');
			this.load.image('top-right', '../src/assets/tile_0197.png');
			this.load.image('left', '../src/assets/tile_0215.png');
			this.load.image('right', '../src/assets/tile_0217.png');
			this.load.image('bottom-left', '../src/assets/tile_0235.png');
			this.load.image('bottom', '../src/assets/tile_0236.png');
			this.load.image('bottom-right', '../src/assets/tile_0237.png');
			this.load.image('inner-top-right', '../src/assets/tile_0199.png');
			this.load.image('inner-bottom-right', '../src/assets/tile_0219.png');
			this.load.image('inner-bottom-left', '../src/assets/tile_0239.png');
			this.load.image('inner-top-left', '../src/assets/tile_0259.png');
	},

	create: function(){
		this.game.state.start("Main");
	}
}