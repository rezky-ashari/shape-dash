import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.text(400, 80, 'SHAPE DASH', { fontSize: '48px', fill: '#00ffff', align: 'center', stroke: '#fff', strokeThickness: 4 }).setOrigin(0.5);
        this.add.text(400, 150, 'SELECT CHARACTER', { fontSize: '28px', fill: '#fff', align: 'center' }).setOrigin(0.5);

        const shapes = ['square', 'circle', 'triangle'];
        let selected = 'square';
        const buttons = [];

        // Selection Indicator Text
        const selectionText = this.add.text(400, 280, 'Selected: Square', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);

        // Best Score (Displayed below Start Game button, see end of create)
        const bestScore = this.registry.get('bestScore') || 0;
        // this.add.text(400, 150, `Best Distance: ${bestScore}`, { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5);

        shapes.forEach((shape, index) => {
            const x = 300 + index * 100;
            const y = 200; // Moved up from 300

            // Add a background for the button area
            const bg = this.add.rectangle(x, y, 60, 60, 0x333333).setInteractive();

            const btn = this.add.image(x, y, shape);

            bg.on('pointerdown', () => {
                selected = shape;
                updateSelection();
            });

            buttons.push({ bg, btn, shape });
        });

        const updateSelection = () => {
            buttons.forEach(b => {
                if (b.shape === selected) {
                    b.bg.setStrokeStyle(4, 0x00ff00); // Highlight selected
                    b.bg.setFillStyle(0x555555);
                } else {
                    b.bg.setStrokeStyle(0);
                    b.bg.setFillStyle(0x333333);
                }
            });
            selectionText.setText(`Selected: ${selected.charAt(0).toUpperCase() + selected.slice(1)}`);
        };

        // Initial state
        updateSelection();

        const startBtn = this.add.text(400, 350, 'START GAME', {
            fontSize: '32px',
            fill: '#0f0',
            backgroundColor: '#222',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => startBtn.setStyle({ fill: '#fff' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ fill: '#0f0' }));

        startBtn.on('pointerdown', () => {
            this.scene.start('GameScene', { character: selected });
        });

        if (bestScore > 0) {
            this.add.text(400, 420, `Best Distance: ${bestScore}`, { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5);
        }

    }
}
