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

        this.physics.world.bounds.height = 600; // Match height
        // We want the world to expand horizontally indefinitely, but for now bounds don't limit X by default if we don't set checkCollision.

        // 2. Create Ground
        // Use a TileSprite for infinite scrolling feeling if we wanted, but for physics a StaticGroup is easy.
        this.ground = this.physics.add.staticGroup();

        // 3. Create Player
        this.player = this.physics.add.sprite(200, 450, this.characterShape);
        this.player.setCollideWorldBounds(false); // Can fall off world (death)
        this.player.setGravityY(2500); // Increased Gravity for snappy feel (Geometry Dash style)

        this.player.body.setSize(30, 30);
        if (this.characterShape === 'circle') {
            this.player.setCircle(15); // Circular physics body (Radius 10)
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
        this.cameras.main.startFollow(this.player, true, 1, 0.1, -200, 0); // Offset player to left
        this.cameras.main.setZoom(1);

        // 6. Controls
        this.input.on('pointerdown', this.jump, this);
        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.keyboard.on('keydown-UP', this.jump, this);

        // 7. Initial Velocity & Acceleration
        // Switch to Acceleration for smoother physics interaction (prevents stutter)
        this.player.setMaxVelocity(350, 3000); // Cap X at 350, allow high Y for falling
        this.player.setAccelerationX(1500);    // Constant push forward

        if (this.characterShape === 'circle') {
            this.player.setAngularVelocity(360); // Start rolling immediately
        }

        // 8. Obstacles & Level Generation
        this.spikes = this.physics.add.staticGroup();

        // Infinite Level State
        this.levelX = 0;
        this.levelY = 568;

        // Generate Initial World (Safe start + initial challenges)
        this.generateChunk(600, true); // Safe zone
        this.generateChunk(2400); // First meaningful chunk

        this.physics.add.collider(this.player, this.spikes, this.gameOver, null, this);

        // 9. Score UI
        this.scoreText = this.add.text(20, 20, 'Distance: 0', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        }).setScrollFactor(0); // Fix to screen

        // // Debug UI: Show when next chunk is coming
        // this.debugText = this.add.text(20, 50, 'Next Chunk: 0', {
        //     fontSize: '16px',
        //     fill: '#0f0', // Green
        //     stroke: '#000',
        //     strokeThickness: 2
        // }).setScrollFactor(0);

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

    generateChunk(length, forceSafe = false) {
        let targetX = this.levelX + length;
        const tileWidth = 32;

        // Helper: Create a flat segment of length N
        const createFlatSegment = (segmentLen, allowSpikes = true) => {
            for (let i = 0; i < segmentLen; i++) {
                this.ground.create(this.levelX, this.levelY, 'block').setOrigin(0, 0).refreshBody();

                // Spike Logic: Only if allowed, not at start/end of segment
                if (allowSpikes && i > 2 && i < segmentLen - 2) {
                    // Reduced chance: 15%
                    if (Phaser.Math.Between(0, 100) < 15) {
                        this.spikes.create(this.levelX + 16, this.levelY - 16, 'spike');
                        // Force a small safe buffer after a spike so we don't get double spikes too close
                        i += 2;
                        this.ground.create(this.levelX + tileWidth, this.levelY, 'block').setOrigin(0, 0).refreshBody();
                        this.ground.create(this.levelX + tileWidth * 2, this.levelY, 'block').setOrigin(0, 0).refreshBody();
                        this.levelX += tileWidth * 2;
                    }
                }
                this.levelX += tileWidth;
            }
        };

        if (forceSafe) {
            createFlatSegment(Math.floor(length / tileWidth), false);
            return;
        }

        while (this.levelX < targetX) {
            const action = Phaser.Math.Between(0, 100);

            if (action < 30) {
                // GAP (HOLE)
                const gapSize = Phaser.Math.Between(2, 3);
                this.levelX += gapSize * tileWidth;

                // Landing: Always safe flat ground after a gap
                createFlatSegment(8, false);

            } else if (action < 60) {
                // CLIFF (Height Change)
                const dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                const change = dir * tileWidth * Phaser.Math.Between(1, 2);

                // Check bounds (don't go too high/low)
                const newY = this.levelY + change;
                if (newY > 300 && newY < 580) {
                    this.levelY = newY;
                }

                // Create the block at the new height immediately
                createFlatSegment(Phaser.Math.Between(8, 12), true);

            } else {
                // LONG FLAT RUN
                createFlatSegment(Phaser.Math.Between(10, 20), true);
            }
        }
    }

    cleanupOldChunks() {
        const killThresholdX = this.player.x - 2000;

        // Clean Ground
        this.ground.children.each((child) => {
            if (child.active && child.x < killThresholdX) {
                this.ground.killAndHide(child);
                this.physics.world.disableBody(child.body);
                child.destroy(); // Properly destroy for simplicity in prototype
            }
        });

        // Clean Spikes
        this.spikes.children.each((child) => {
            if (child.active && child.x < killThresholdX) {
                this.spikes.killAndHide(child);
                this.physics.world.disableBody(child.body);
                child.destroy();
            }
        });
    }

    update() {
        if (this.isGameOver) return;

        // Update Score
        const distance = Math.floor(this.player.x / 100); // Score based on distance
        this.scoreText.setText('Distance: ' + distance);

        // Infinite Generation Trigger
        // If player is close to the end of currently generated world (with 2000px buffer)
        const triggerX = this.levelX - 2000;
        const distToGen = Math.floor(triggerX - this.player.x);

        if (this.debugText) {
            this.debugText.setText('Next Chunk In: ' + distToGen + 'px');
        }

        if (this.player.x > triggerX) {
            this.generateChunk(2000); // Generate another chunk
            this.cleanupOldChunks(); // Cleanup behind
        }

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
