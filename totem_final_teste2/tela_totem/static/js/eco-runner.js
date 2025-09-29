class EcoRunner {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = false;
        this.score = 0;
        
        // Configurações do jogo
        this.groundY = this.canvas.height - 50;
        this.gravity = 0.6;
        this.jumpForce = -12;
        this.gameSpeed = 4;
        this.lastObstacleTime = 0;
        this.minObstacleInterval = 1500; // Tempo mínimo entre obstáculos em ms
        this.spawnRate = 0.5;
        this.difficultyTimer = 0;
        this.maxGameSpeed = 8;
        
        // Player
        this.player = {
            x: 50,
            y: this.groundY,
            width: 40,
            height: 50,
            velocityY: 0,
            jumping: false
        };
        
        // Arrays de obstáculos e coletáveis
        this.obstacles = [];
        this.flyingObstacles = [];
        this.collectibles = [];
        
        // Cores
        this.colors = {
            sky: '#87CEEB',
            ground: '#4c9a76',
            player: '#32CD32',
            obstacle: '#8B0000',
            text: '#000000',
            collectible: '#FFD700'
        };
        
        // Sprites e imagens
        this.sprites = {
            trash: '🗑️',
            toxicCloud: '☁️',
            recyclable: '♻️',
            player: '🌱'
        };
        
        // Tipos de obstáculos
        this.obstacleTypes = {
            TRASH: 'trash',
            TOXIC_CLOUD: 'toxicCloud'
        };
        
        // Sistema de pontuação
        this.pointsSystem = {
            recyclableCollected: 50,
            survivalPoints: 1
        };

        // Bind dos eventos
        this.boundHandleStart = this.handleStart.bind(this);
        this.boundHandleJump = this.handleJump.bind(this);
    }

    init() {
        // Configura os event listeners
        this.canvas.addEventListener('click', this.boundHandleStart);
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.boundHandleJump();
            }
        });
        this.canvas.addEventListener('touchstart', this.boundHandleJump);
        
        // Desenha a tela inicial
        this.drawStartScreen();
    }

    increaseDifficulty() {
        if (this.gameSpeed < this.maxGameSpeed) {
            this.gameSpeed += 0.1;
        }
        this.spawnRate = Math.min(0.8, this.spawnRate + 0.02);
        this.minObstacleInterval = Math.max(1000, this.minObstacleInterval - 50);
    }

    drawStartScreen() {
        this.ctx.fillStyle = this.colors.sky;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '24px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Eco Runner', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.font = '20px Poppins';
        this.ctx.fillText('Toque para começar', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Desvie da poluição e colete recicláveis!', this.canvas.width / 2, this.canvas.height / 2 + 30);
        
        // Instruções com ícones
        this.ctx.font = '16px Poppins';
        this.ctx.fillText(`${this.sprites.trash} = Evite o lixo!`, this.canvas.width / 2, this.canvas.height / 2 + 70);
        this.ctx.fillText(`${this.sprites.toxicCloud} = Cuidado com a poluição!`, this.canvas.width / 2, this.canvas.height / 2 + 90);
        this.ctx.fillText(`${this.sprites.recyclable} = Colete para pontos extras!`, this.canvas.width / 2, this.canvas.height / 2 + 110);
    }

    handleStart() {
        if (!this.running) {
            this.running = true;
            this.score = 0;
            this.obstacles = [];
            this.flyingObstacles = [];
            this.gameLoop();
        }
    }

    handleJump() {
        if (this.running && !this.player.jumping) {
            this.player.velocityY = this.jumpForce;
            this.player.jumping = true;
        }
    }

    update() {
        // Atualiza o player
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;

        // Limita o player ao chão
        if (this.player.y > this.groundY) {
            this.player.y = this.groundY;
            this.player.velocityY = 0;
            this.player.jumping = false;
        }

        // Incrementa o timer de dificuldade
        this.difficultyTimer++;
        if (this.difficultyTimer % 1000 === 0) {
            this.increaseDifficulty();
        }

        // Gera obstáculos com tempo mínimo entre eles
        const currentTime = Date.now();
        if (currentTime - this.lastObstacleTime > this.minObstacleInterval) {
            if (Math.random() < this.spawnRate) {
                const isGroundObstacle = Math.random() < 0.6;
                if (isGroundObstacle) {
                    this.obstacles.push({
                        x: this.canvas.width,
                        y: this.groundY,
                        width: 30,
                        height: 40,
                        type: this.obstacleTypes.TRASH
                    });
                } else {
                    this.flyingObstacles.push({
                        x: this.canvas.width,
                        y: this.groundY - 100,
                        width: 40,
                        height: 30,
                        type: this.obstacleTypes.TOXIC_CLOUD
                    });
                }
                this.lastObstacleTime = currentTime;
            }
        }

        // Gera coletáveis
        if (Math.random() < 0.01) {
            this.collectibles.push({
                x: this.canvas.width,
                y: this.groundY - 70 - Math.random() * 50,
                width: 25,
                height: 25
            });
        }

        // Move e remove obstáculos
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.gameSpeed;
            return obstacle.x + obstacle.width > 0;
        });

        this.flyingObstacles = this.flyingObstacles.filter(obstacle => {
            obstacle.x -= this.gameSpeed * 1.2;
            // Movimento vertical suave para nuvens tóxicas
            obstacle.y += Math.sin(obstacle.x / 50) * 0.5;
            return obstacle.x + obstacle.width > 0;
        });

        // Move e remove coletáveis
        this.collectibles = this.collectibles.filter(collectible => {
            collectible.x -= this.gameSpeed;
            return collectible.x + collectible.width > 0;
        });

        // Verifica colisões com obstáculos
        const hitObstacle = [...this.obstacles, ...this.flyingObstacles].some(obstacle => 
            this.player.x < obstacle.x + obstacle.width &&
            this.player.x + this.player.width > obstacle.x &&
            this.player.y < obstacle.y + obstacle.height &&
            this.player.y + this.player.height > obstacle.y
        );

        if (hitObstacle) {
            this.gameOver();
        }

        // Verifica colisões com coletáveis
        this.collectibles = this.collectibles.filter(collectible => {
            const collected = 
                this.player.x < collectible.x + collectible.width &&
                this.player.x + this.player.width > collectible.x &&
                this.player.y < collectible.y + collectible.height &&
                this.player.y + this.player.height > collectible.y;
            
            if (collected) {
                this.score += this.pointsSystem.recyclableCollected;
            }
            return !collected;
        });

        // Incrementa score
        this.score += this.pointsSystem.survivalPoints;
    }

    draw() {
        // Limpa o canvas
        this.ctx.fillStyle = this.colors.sky;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenha o chão
        this.ctx.fillStyle = this.colors.ground;
        this.ctx.fillRect(0, this.groundY + this.player.height, this.canvas.width, 2);

        // Desenha o player
        this.ctx.font = '40px Arial';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(
            this.sprites.player,
            this.player.x,
            this.player.y
        );

        // Desenha os obstáculos
        this.ctx.font = '35px Arial';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillText(
                this.sprites.trash,
                obstacle.x,
                obstacle.y
            );
        });

        this.flyingObstacles.forEach(obstacle => {
            this.ctx.fillText(
                this.sprites.toxicCloud,
                obstacle.x,
                obstacle.y
            );
        });

        // Desenha os coletáveis
        this.ctx.font = '30px Arial';
        this.collectibles.forEach(collectible => {
            this.ctx.fillText(
                this.sprites.recyclable,
                collectible.x,
                collectible.y
            );
        });

        // Desenha o score
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '20px Poppins';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${Math.floor(this.score / 10)}`, 20, 30);
    }

    gameLoop() {
        if (!this.running) return;

        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    gameOver() {
        this.running = false;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '30px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.fillText(`Score: ${Math.floor(this.score / 10)}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.font = '20px Poppins';
        this.ctx.fillText('Toque para jogar novamente', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    destroy() {
        this.running = false;
        this.canvas.removeEventListener('click', this.boundHandleStart);
        document.removeEventListener('keydown', this.boundHandleJump);
        this.canvas.removeEventListener('touchstart', this.boundHandleJump);
    }
}