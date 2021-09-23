import 'phaser';

export default class PreloaderScene extends Phaser.Scene {
  constructor () {
    super('Preloader');
  }
  preload () {

	game.load.image('player', 'assets/player1.png');
	game.load.image('ghost', 'assets/ghost.png');
	game.load.image('dot', 'assets/dot.png');
	game.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);

	game.load.image('tiles', 'assets/sokoban_tilesheet.png');
	game.load.image('wall', 'assets/wall.png');
	game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);

  }
  create () {
	this.game.state.start("Main");
  }
};