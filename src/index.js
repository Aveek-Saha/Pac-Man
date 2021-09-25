import Phaser from 'phaser';
import config from './config/config';
import GameScene from './js/game';
import PreloaderScene from './js/preload';

class Game extends Phaser.Game {
    constructor () {
        super(config);
        this.scene.add('Game', GameScene);
        this.scene.add('Preloader', PreloaderScene);
        this.scene.start('Game');
    }
}
  
window.game = new Game();
