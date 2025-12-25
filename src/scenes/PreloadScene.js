import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // We will generate textures here instead of loading files
    }

    create() {
        // Square
        const squareGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        squareGraphics.fillStyle(0xffff00); // Yellow
        squareGraphics.fillRect(0, 0, 32, 32);
        squareGraphics.generateTexture('square', 32, 32);

        // Circle (Pac-Man style)
        const circleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        circleGraphics.fillStyle(0xff0000); // Red
        circleGraphics.beginPath();
        circleGraphics.moveTo(16, 16); // Center
        // Draw arc from 30 degrees to 330 degrees (leaving 60 degree mouth)
        circleGraphics.arc(16, 16, 16, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(330), false);
        circleGraphics.closePath();
        circleGraphics.fillPath();
        circleGraphics.generateTexture('circle', 32, 32);

        // Plain Red Particle (for explosion)
        const redParticleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        redParticleGraphics.fillStyle(0xff0000);
        redParticleGraphics.fillCircle(16, 16, 16);
        redParticleGraphics.generateTexture('red_particle', 32, 32);

        // Triangle
        const triangleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        triangleGraphics.fillStyle(0x00ff00); // Green
        triangleGraphics.beginPath();
        triangleGraphics.moveTo(0, 32);
        triangleGraphics.lineTo(16, 0);
        triangleGraphics.lineTo(32, 32);
        triangleGraphics.closePath();
        triangleGraphics.fillPath();
        triangleGraphics.generateTexture('triangle', 32, 32);

        // Spike (Ice Shard)
        const spikeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        spikeGraphics.fillStyle(0xaaffff); // Light Cyan
        spikeGraphics.beginPath();
        spikeGraphics.moveTo(0, 32);
        spikeGraphics.lineTo(16, 0);
        spikeGraphics.lineTo(32, 32);
        spikeGraphics.closePath();
        spikeGraphics.fillPath();
        spikeGraphics.lineStyle(2, 0xffffff); // White outline
        spikeGraphics.strokePath();
        spikeGraphics.generateTexture('spike', 32, 32);

        // Block (Ice Ground)
        const blockGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        blockGraphics.fillStyle(0x88ccff); // Icy Blue
        blockGraphics.fillRect(0, 0, 32, 32);
        // Add some "ice" detail
        blockGraphics.fillStyle(0xffffff, 0.5);
        blockGraphics.fillRect(0, 0, 32, 4); // Snow/Ice top
        blockGraphics.generateTexture('block', 32, 32);

        this.scene.start('MenuScene');
    }
}
