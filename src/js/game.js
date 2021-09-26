import 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor () {
    super('Game');
  }
  preload () {
    // load images
    // this.load.image('logo', 'src/assets/crate_11.png');
    this.load.image("pacman-tiles", "../src/assets/monochrome_tilemap_packed.png");

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

  }
  create () {
    var level = [
      [299, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 319, 299, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 319],
      [217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215],
      [217, 131, 195, 196, 196, 197, 131, 195, 196, 196, 196, 197, 131, 215, 217, 131, 195, 196, 196, 196, 197, 131, 195, 196, 196, 197, 131, 215],
      [217, 131, 215, 378, 378, 217, 131, 215, 378, 378, 378, 217, 131, 215, 217, 131, 215, 378, 378, 378, 217, 131, 215, 378, 378, 217, 131, 215],
      [217, 131, 235, 236, 236, 237, 131, 235, 236, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 236, 237, 131, 235, 236, 236, 237, 131, 215],
      [217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215],
      [217, 131, 195, 196, 196, 197, 131, 195, 197, 131, 195, 196, 196, 196, 196, 196, 196, 197, 131, 195, 197, 131, 195, 196, 196, 197, 131, 215],
      [217, 131, 235, 236, 236, 237, 131, 215, 217, 131, 235, 236, 236, 319, 299, 236, 236, 237, 131, 215, 217, 131, 235, 236, 236, 237, 131, 215],
      [217, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 215],
      [279, 196, 196, 196, 196, 197, 131, 215, 279, 196, 196, 197, 131, 215, 217, 131, 195, 196, 196, 378, 217, 131, 195, 196, 196, 196, 196, 339],
      [378, 378, 378, 378, 378, 217, 131, 215, 299, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 319, 217, 131, 215, 378, 378, 378, 378, 378],
      [378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
      [378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 195, 196, 196, 196, 196, 196, 196, 197, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
      [378, 378, 378, 378, 378, 217, 131, 235, 237, 131, 215, 378, 378, 378, 378, 378, 378, 217, 131, 235, 237, 131, 215, 378, 378, 378, 378, 378],
      [378, 378, 378, 378, 378, 217, 131, 131, 131, 131, 215, 378, 378, 378, 378, 378, 378, 217, 131, 131, 131, 131, 215, 378, 378, 378, 378, 378],
      [378, 378, 378, 378, 378, 217, 131, 195, 197, 131, 215, 378, 378, 378, 378, 378, 378, 217, 131, 195, 197, 131, 215, 378, 378, 378, 378, 378],
      [378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 235, 236, 236, 236, 236, 236, 236, 237, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
      [378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
      [378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 195, 196, 196, 196, 196, 196, 196, 197, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
      [299, 236, 236, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 319, 299, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 236, 236, 319],
      [217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215],
      [217, 131, 195, 196, 196, 197, 131, 195, 196, 196, 196, 197, 131, 215, 217, 131, 195, 196, 196, 196, 197, 131, 195, 196, 196, 197, 131, 215],
      [217, 131, 235, 236, 319, 217, 131, 235, 236, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 236, 237, 131, 215, 299, 236, 237, 131, 215],
      [217, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 215],
      [279, 196, 197, 131, 215, 217, 131, 195, 197, 131, 195, 196, 196, 196, 196, 196, 196, 197, 131, 195, 197, 131, 215, 217, 131, 195, 196, 339],
      [299, 236, 237, 131, 235, 237, 131, 215, 217, 131, 235, 236, 236, 319, 299, 236, 236, 237, 131, 215, 217, 131, 235, 237, 131, 235, 236, 319],
      [217, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 215],
      [217, 131, 195, 196, 196, 196, 196, 339, 279, 196, 196, 197, 131, 215, 217, 131, 195, 196, 196, 339, 279, 196, 196, 196, 196, 197, 131, 215],
      [217, 131, 235, 236, 236, 236, 236, 236, 236, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 236, 236, 236, 236, 236, 236, 237, 131, 215],
      [217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215],
      [279, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 339]
    ];

    // // When loading from an array, make sure to specify the tileWidth and tileHeight
    // const map = this.make.tilemap({ data: level, tileWidth: 16, tileHeight: 16 });
    // const tiles = map.addTilesetImage("pacman-tiles");
    // const layer = map.createLayer(0, tiles, 0, 0);

    this.walls = this.add.group();
		this.walls.enableBody = true;
		this.walls.immovable = true;
		this.walls.createMultiple(100, 'wall');
		this.world.bringToTop(this.walls);

		var tile;
		crates.length = 0;
		for (var i = 0; i < level.length; i++) {
			crates[i] = [];
			for (var j = 0; j < level[i].length; j++) {
				crates[i][j] = null;
				switch (level[i][j]) {
					case 195:
						tile = game.add.sprite(16 * j, 16 * i, "top-left");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

          case 196:
            tile = game.add.sprite(16 * j, 16 * i, "top");
            this.game.physics.arcade.enable(tile);
            tile.enableBody = true;
            tile.body.immovable = true;
            this.walls.add(tile);
            break;

          case 197:
            tile = game.add.sprite(16 * j, 16 * i, "top-right");
            this.game.physics.arcade.enable(tile);
            tile.enableBody = true;
            tile.body.immovable = true;
            this.walls.add(tile);
            break;

          case 215:
            tile = game.add.sprite(16 * j, 16 * i, "left");
            this.game.physics.arcade.enable(tile);
            tile.enableBody = true;
            tile.body.immovable = true;
            this.walls.add(tile);
            break;

          case 217:
            tile = game.add.sprite(16 * j, 16 * i, "right");
            this.game.physics.arcade.enable(tile);
            tile.enableBody = true;
            tile.body.immovable = true;
            this.walls.add(tile);
            break;
				}
			}
		}
    
  }
};