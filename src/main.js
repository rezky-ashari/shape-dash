import Phaser from 'phaser';
import './style.css';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';

import GameOverScene from './scenes/GameOverScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Will be set in game scene
      debug: false
    }
  },
  scene: [PreloadScene, MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
