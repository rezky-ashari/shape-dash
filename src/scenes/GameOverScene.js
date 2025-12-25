import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.score = data.score || 0;
    }

    create() {
        this.add.text(400, 100, 'GAME OVER', { fontSize: '64px', fill: '#ff0000', align: 'center' }).setOrigin(0.5);

        this.add.text(400, 180, `Distance: ${this.score}`, { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);

        // Press Space Hint (Above Restart)
        const spaceHint = this.add.text(400, 260, 'Press Space', { fontSize: '18px', fill: '#aaa' }).setOrigin(0.5);
        spaceHint.setVisible(false);

        // Restart Button
        const restartBtn = this.add.text(400, 300, 'RESTART', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        restartBtn.on('pointerover', () => restartBtn.setStyle({ fill: '#0f0' }));
        restartBtn.on('pointerout', () => restartBtn.setStyle({ fill: '#fff' }));
        restartBtn.on('pointerdown', () => this.restart());

        // Menu Button (Closer to Restart)
        const menuBtn = this.add.text(400, 380, 'MAIN MENU', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#0f0' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#fff' }));
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Handle Input Delay
        this.canRestart = false;
        this.time.delayedCall(1500, () => {
            this.canRestart = true;
            spaceHint.setVisible(true);
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.canRestart) {
                this.restart();
            }
        });
    }

    restart() {
        this.scene.start('GameScene');
    }
}
