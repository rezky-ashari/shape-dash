import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.characterShape = data.character || 'square';
    }

    create() {
        this.isGameOver = false;
        // 1. Setup World
        this.physics.world.bounds.height = 600; // Match height
        // We want the world to expand horizontally indefinitely, but for now bounds don't limit X by default if we don't set checkCollision.

        // 2. Create Ground
        // Use a TileSprite for infinite scrolling feeling if we wanted, but for physics a StaticGroup is easy.
        // For a simple geometry dash, we can create a long floor or generate it dynamically.
        // Let's create a static floor 10000px long for the prototype.
        this.ground = this.physics.add.staticGroup();
        // Complex level generation handles floor creation now

        // 3. Create Player
        this.player = this.physics.add.sprite(200, 450, this.characterShape);
        this.player.setCollideWorldBounds(false); // Can fall off world (death)
        this.player.setGravityY(2500); // Increased Gravity for snappy feel (Geometry Dash style)

        // Shrink hitbox slightly to avoid visual snagging when rotating
        this.player.body.setSize(24, 24);
        if (this.characterShape === 'circle') {
            this.player.setCircle(12); // Circular physics body (Radius 12)
        }

        // 4. Collision
        this.physics.add.collider(this.player, this.ground, () => {
            if (this.characterShape === 'square') {
                this.player.setAngularVelocity(0);
                this.player.angle = Math.round(this.player.angle / 90) * 90;
            } else if (this.characterShape === 'triangle') {
                this.player.setAngularVelocity(0);
                // Snap to nearest 120 (360/3) for triangle
                this.player.angle = Math.round(this.player.angle / 120) * 120;
            }
            // Circle: No angular reset, let it roll!
        });

        // 5. Camera Interaction
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1, -200, 0); // Offset player to left
        this.cameras.main.setZoom(1);

        // 6. Controls
        this.input.on('pointerdown', this.jump, this);
        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.keyboard.on('keydown-UP', this.jump, this);

        // 7. Initial Velocity
        this.player.setVelocityX(350);
        if (this.characterShape === 'circle') {
            this.player.setAngularVelocity(360); // Start rolling immediately
        }

        // 8. Obstacles & Level Generation
        this.spikes = this.physics.add.staticGroup();
        this.generateComplexLevel();

        this.physics.add.collider(this.player, this.spikes, this.gameOver, null, this);

        // 9. Score UI
        this.scoreText = this.add.text(20, 20, 'Distance: 0', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        }).setScrollFactor(0); // Fix to screen

        // 10. Particles (Explosion)
        let particleTexture = this.characterShape;
        if (this.characterShape === 'circle') {
            particleTexture = 'red_particle';
        }

        this.particles = this.add.particles(0, 0, particleTexture, {
            speed: { min: 500, max: 1200 }, // High outward speed (Fireworks)
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: 1000,
            rotate: { min: 0, max: 360 },
            // Tint removed to match player color
            emitting: false
        });
    }

    jump() {
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-850); // Increased jump force to match gravity
            if (this.characterShape === 'square') {
                this.player.setAngularVelocity(400); // Faster rotation
            } else if (this.characterShape === 'triangle') {
                this.player.setAngularVelocity(600); // Even faster spin for triangle
            } else if (this.characterShape === 'circle') {
                this.player.setAngularVelocity(360); // Roll
            }
        }
    }

    generateComplexLevel() {
        // Segment-based generation for guaranteed playability
        let currentX = 0;
        let currentY = 568; // Base ground level
        const tileWidth = 32;

        // Helper: Create a flat segment of length N
        const createFlatSegment = (length, allowSpikes = true) => {
            for (let i = 0; i < length; i++) {
                this.ground.create(currentX, currentY, 'block').setOrigin(0, 0).refreshBody();

                // Spike Logic: Only if allowed, not at start/end of segment
                if (allowSpikes && i > 2 && i < length - 2) {
                    // Reduced chance: 15%
                    if (Phaser.Math.Between(0, 100) < 15) {
                        this.spikes.create(currentX + 16, currentY - 16, 'spike');
                        // Force a small safe buffer after a spike so we don't get double spikes too close
                        i += 2;
                        this.ground.create(currentX + tileWidth, currentY, 'block').setOrigin(0, 0).refreshBody();
                        this.ground.create(currentX + tileWidth * 2, currentY, 'block').setOrigin(0, 0).refreshBody();
                        currentX += tileWidth * 2;
                    }
                }
                currentX += tileWidth;
            }
        };

        // 1. Initial Safe Zone (Start)
        createFlatSegment(20, false);

        // 2. Procedural loop
        while (currentX < 20000) {
            const action = Phaser.Math.Between(0, 100);

            if (action < 30) {
                // GAP (HOLE)
                // Max jump distance check: at 350 speed and -850 jump, player covers significant distance.
                // 2-3 blocks (64-96px) is very safe. 4 blocks might be tight.
                const gapSize = Phaser.Math.Between(2, 3);
                currentX += gapSize * tileWidth;

                // Landing: Always safe flat ground after a gap
                createFlatSegment(8, false);

            } else if (action < 60) {
                // CLIFF (Height Change)
                // Move Y up or down 1 block (32px). 
                // Max jump height is high enough for 2 blocks (64px) easily, but let's stick to 1-2 for flow.
                const dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                const change = dir * tileWidth * Phaser.Math.Between(1, 2);

                // Check bounds (don't go too high/low)
                const newY = currentY + change;
                if (newY > 300 && newY < 580) {
                    currentY = newY;
                }

                // Create the block at the new height immediately
                // Note: If going UP, we just place the block. If going DOWN, effectively a gap+cliff, but we just place block.
                createFlatSegment(10, true); // Safe run after cliff? Maybe allow spikes.

            } else {
                // LONG FLAT RUN
                // Good for picking up speed visual, maybe spikes
                createFlatSegment(Phaser.Math.Between(10, 20), true);
            }
        }
    }
    update() {
        if (this.isGameOver) return;

        // Maintain speed
        this.player.setVelocityX(350);

        // Update Score
        const distance = Math.floor(this.player.x / 100); // Score based on distance
        this.scoreText.setText('Distance: ' + distance);

        // Death if falls
        if (this.player.y > 800) {
            this.gameOver();
        }
    }

    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        // Calculate final score
        const score = Math.floor(this.player.x / 100);

        // Update Best Score Registry
        const currentBest = this.registry.get('bestScore') || 0;
        if (score > currentBest) {
            this.registry.set('bestScore', score);
        }

        console.log('Game Over. Score:', score);
        // Stop physics (Don't pause immediately so particles animate)
        // this.physics.pause();
        // Visuals
        this.cameras.main.shake(200, 0.02);
        this.player.setVisible(false);
        this.player.body.enable = false; // Disable physics

        // Explosion
        this.particles.emitParticleAt(this.player.x, this.player.y, 50); // Emit 50 particles for "shatter" effect

        // Delay then go to Game Over scene (1.5s to let explosion finish)
        this.time.delayedCall(1500, () => {
            this.scene.start('GameOverScene', { score: score });
        });
    }
}
