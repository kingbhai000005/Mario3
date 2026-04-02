/* ============================================
   CONFIGURATION & CONSTANTS
   ============================================ */
const CONFIG = {
    PLAYER: {
        SPEED: 380,
        JUMP: -880,
        GRAVITY: 2300,
        WIDTH: 35,
        HEIGHT: 48
    },
    WEAPON: {
        PISTOL_SPEED: 950,
        KATANA_DURATION: 0.4,
        ATTACK_COOLDOWN: 0.5
    },
    LEVEL: {
        PLATFORM_MIN_GAP: 120,
        PLATFORM_MAX_GAP: 205,
        PLATFORM_MIN_WIDTH: 200,
        PLATFORM_MAX_WIDTH: 500,
        PLATFORM_HEIGHT: 50,
        ENEMY_SPAWN_CHANCE: 0.55
    },
    SCORE: {
        DISTANCE_MULTIPLIER: 0.12,
        BULLET_KILL: 400,
        STOMP_KILL: 250,
        JUMP_PROJECTILE: 200,
        PROJECTILE_SPEED: 250
    }
};

const THEMES = [
    { name: 'Day', bg: 'linear-gradient(#4facfe, #00f2fe)', req: 0 },
    { name: 'Night', bg: '#0f172a', req: 2000 },
    { name: 'Sunset', bg: 'linear-gradient(#ff8c00, #ff0080)', req: 5000 }
];

const WEAPONS = [
    { name: 'None', req: 0 },
    { name: 'Katana', req: 4000 },
    { name: 'Pistol', req: 8000 }
];

const SKINS = [
    { name: 'Classic', color: '#ffeb3b', overall: '#0055ff', req: 0 },
    { name: 'Ninja', color: '#333', overall: '#111', req: 1000 },
    { name: 'Gold', color: '#ffd700', overall: '#ff8c00', req: 3000 },
    { name: 'Diamond', color: '#b9f2ff', overall: '#00d4ff', req: 12000 },
    { name: 'Ice', color: '#ffffff', overall: '#a5f3fc', req: 20000 }
];

const ENEMY_TYPES = {
    NORMAL: 'Normal',
    TANK: 'Tank',
    FLYER: 'Flyer',
    RUNNER: 'Runner',
    FIRE: 'FireEnemy'
};

const ENEMIES = [
    {
        name: 'Normal',
        color: '#222',
        health: 1,
        speed: '140 px/s',
        description: 'Basic enemy that walks back and forth on platforms.',
        special: 'None'
    },
    {
        name: 'Tank',
        color: '#f00',
        health: 2,
        speed: '140 px/s',
        description: 'Heavy armored enemy with more durability.',
        special: 'Requires 2 hits to defeat'
    },
    {
        name: 'Flyer',
        color: '#a0f',
        health: 1,
        speed: '140 px/s',
        description: 'Flying enemy that stays above platforms.',
        special: 'Flies in the air'
    },
    {
        name: 'Runner',
        color: '#ff8800',
        health: 1,
        speed: '260 px/s',
        description: 'Fast moving enemy that charges across platforms.',
        special: 'Moves 2x faster'
    },
    {
        name: 'Fire Enemy',
        color: '#ff4444',
        health: 1,
        speed: '140 px/s',
        description: 'Dangerous enemy that shoots projectiles at you.',
        special: 'Fires projectiles every 2-3 seconds'
    }
];

/* ============================================
   AUDIO MANAGER
   ============================================ */
class AudioManager {
    constructor() {
        this.bg = new Audio('bgsound.mp3');
        this.bg.loop = true;
        this.jump = new Audio('jumpsound.mp3');
        this.katana = new Audio('katanasound.mp3');
        this.bullet = new Audio('bulletsound.mp3');
        this.rgbSounds = [];
        for (let i = 1; i <= 20; i++) {
            this.rgbSounds.push(new Audio(`m${i}.mp3`));
        }
    }

    playBg() {
        this.bg.play().catch(() => {});
    }

    stopBg() {
        this.bg.pause();
        this.bg.currentTime = 0;
    }

    playJump(isRGB) {
        if (isRGB) {
            const r = Math.floor(Math.random() * 20);
            this.rgbSounds[r].currentTime = 0;
            this.rgbSounds[r].play().catch(() => {});
        } else {
            this.jump.currentTime = 0;
            this.jump.play().catch(() => {});
        }
    }

    playKatana() {
        this.katana.currentTime = 0;
        this.katana.play().catch(() => {});
    }

    playBullet() {
        this.bullet.currentTime = 0;
        this.bullet.play().catch(() => {});
    }
}

/* ============================================
   GAME STATE
   ============================================ */
const GameState = {
    canvas: null,
    ctx: null,
    audio: new AudioManager(),

    // Game variables
    score: 0,
    maxDist: 0,
    cameraX: 0,
    rgbHue: 0,
    lastTime: 0,
    gameActive: false,

    // UI variables
    selectedSkin: 'Classic',
    selectedTheme: 'Day',
    selectedWeapon: 'None',
    isRGB: false,
    hiScore: 0,

    // Game objects
    player: null,
    platforms: [],
    enemies: [],
    bullets: [],
    enemyProjectiles: [],

    // Tracking
    lastX: 0,
    keys: {}
};

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function loadHiScore() {
    GameState.hiScore = parseInt(localStorage.getItem('marioHiScore')) || 0;
    document.getElementById('hiScoreDisp').innerText = GameState.hiScore;
}

function saveHiScore() {
    if (GameState.score > GameState.hiScore) {
        localStorage.setItem('marioHiScore', Math.floor(GameState.score));
    }
}

/* ============================================
   OBJECT CREATORS
   ============================================ */
function createPlayer() {
    const skin = SKINS.find(s => s.name === GameState.selectedSkin);
    return {
        x: 100,
        y: 100,
        w: CONFIG.PLAYER.WIDTH,
        h: CONFIG.PLAYER.HEIGHT,
        dx: 0,
        dy: 0,
        speed: CONFIG.PLAYER.SPEED,
        jump: CONFIG.PLAYER.JUMP,
        gravity: CONFIG.PLAYER.GRAVITY,
        grounded: false,
        stretch: 1,
        dir: 1,
        color: skin.color,
        overall: skin.overall,
        name: skin.name,
        slash: 0,
        slashAngle: 0,
        atkCooldown: 0,
        gunFlash: 0
    };
}

function createEnemy(type, x, y, platformWidth, platformX) {
    const hp = type === ENEMY_TYPES.TANK ? 2 : 1;
    const speed = type === ENEMY_TYPES.RUNNER ? 260 : 140;
    
    return {
        x: x,
        y: y,
        w: 35,
        h: 35,
        startX: platformX,
        range: platformWidth - 40,
        speed: speed,
        alive: true,
        type: type,
        hp: hp,
        fireTimer: 0,
        fireInterval: 2 + Math.random() * 1
    };
}

function createBullet(fromX, fromY, dirX) {
    return {
        x: fromX + (dirX * 30),
        y: fromY + 22,
        dx: dirX * 950,
        w: 12,
        h: 6,
        life: 0.3
    };
}

function createProjectile(fromX, fromY, dirX, dirY) {
    return {
        x: fromX + 8,
        y: fromY + 8,
        dx: dirX * CONFIG.SCORE.PROJECTILE_SPEED,
        dy: dirY * CONFIG.SCORE.PROJECTILE_SPEED,
        w: 15,
        h: 15,
        life: 5
    };
}

/* ============================================
   MENU RENDERING
   ============================================ */
function renderMenus() {
    renderThemeMenu();
    renderWeaponMenu();
    renderSkinMenu();
}

function renderThemeMenu() {
    const list = document.getElementById('themeList');
    list.innerHTML = '';
    THEMES.forEach(t => {
        const isLocked = GameState.hiScore < t.req;
        const card = document.createElement('div');
        card.className = `card ${isLocked ? 'locked' : ''} ${GameState.selectedTheme === t.name ? 'selected' : ''}`;
        card.innerHTML = `${t.name}${isLocked ? '<br>🔒' + t.req : ''}`;
        if (!isLocked) {
            card.onclick = () => {
                GameState.selectedTheme = t.name;
                renderMenus();
            };
        }
        list.appendChild(card);
    });
}

function renderWeaponMenu() {
    const list = document.getElementById('weaponList');
    list.innerHTML = '';
    WEAPONS.forEach(w => {
        const isLocked = GameState.hiScore < w.req;
        const card = document.createElement('div');
        card.className = `card ${isLocked ? 'locked' : ''} ${GameState.selectedWeapon === w.name ? 'selected' : ''}`;
        card.innerHTML = `${w.name}${isLocked ? '<br>🔒' + w.req : ''}`;
        if (!isLocked) {
            card.onclick = () => {
                GameState.selectedWeapon = w.name;
                renderMenus();
            };
        }
        list.appendChild(card);
    });
}

function renderSkinMenu() {
    const list = document.getElementById('skinList');
    list.innerHTML = '';
    SKINS.forEach(s => {
        const isLocked = GameState.hiScore < s.req;
        const card = document.createElement('div');
        card.className = `card ${isLocked ? 'locked' : ''} ${GameState.selectedSkin === s.name ? 'selected' : ''}`;
        card.innerHTML = `<div style="background:${s.color}; width:15px; height:15px; margin:auto"></div>${s.name}${isLocked ? '<br>🔒' + s.req : ''}`;
        if (!isLocked) {
            card.onclick = () => {
                GameState.selectedSkin = s.name;
                renderMenus();
            };
        }
        list.appendChild(card);
    });
}

function renderEnemyInfo() {
    const container = document.getElementById('enemyInfoBox');
    if (!container) return;
    
    container.innerHTML = '';
    const title = document.createElement('h3');
    title.style.margin = '0 0 15px 0';
    title.style.color = '#ffcc00';
    title.innerText = 'ENEMIES IN GAME';
    container.appendChild(title);

    const enemiesGrid = document.createElement('div');
    enemiesGrid.style.display = 'grid';
    enemiesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
    enemiesGrid.style.gap = '10px';
    enemiesGrid.style.maxHeight = '250px';
    enemiesGrid.style.overflowY = 'auto';
    enemiesGrid.style.paddingRight = '5px';

    ENEMIES.forEach(enemy => {
        const card = document.createElement('div');
        card.className = 'enemy-card';
        card.innerHTML = `
            <div style="background:${enemy.color}; width:30px; height:30px; margin:0 auto 8px; border-radius:4px;"></div>
            <div style="font-weight:bold; font-size:12px; margin-bottom:5px;">${enemy.name}</div>
            <div style="font-size:10px; color:#aaa; margin-bottom:3px;">❤️ HP: ${enemy.health}</div>
            <div style="font-size:10px; color:#aaa; margin-bottom:5px;">⚡ ${enemy.speed}</div>
            <div style="font-size:9px; color:#ffeb3b; margin-bottom:3px;"><strong>Special:</strong></div>
            <div style="font-size:9px; color:#fff;">${enemy.special}</div>
        `;
        enemiesGrid.appendChild(card);
    });

    container.appendChild(enemiesGrid);
}

/* ============================================
   RGB MODE
   ============================================ */
function toggleRGB() {
    GameState.isRGB = !GameState.isRGB;
    const btn = document.getElementById('rgbToggle');
    btn.innerText = `RGB MODE: ${GameState.isRGB ? 'ON' : 'OFF'}`;
    btn.classList.toggle('active', GameState.isRGB);
}

function testUnlockAll() {
    GameState.hiScore = 999999;
    renderMenus();
    renderEnemyInfo();
}

/* ============================================
   GAME INITIALIZATION
   ============================================ */
function initGame() {
    document.getElementById('startMenu').style.display = 'none';
    
    if (!GameState.isRGB) {
        const theme = THEMES.find(t => t.name === GameState.selectedTheme);
        document.getElementById('gameContainer').style.background = theme.bg;
    } else {
        document.getElementById('gameContainer').style.background = '#000';
    }
    
    document.getElementById('curWep').innerText = GameState.selectedWeapon;
    GameState.audio.playBg();
    resetGame();
}

function resetGame() {
    GameState.canvas.width = window.innerWidth;
    GameState.canvas.height = window.innerHeight;

    GameState.score = 0;
    GameState.cameraX = 0;
    GameState.maxDist = 0;
    GameState.gameActive = true;
    GameState.lastTime = performance.now();
    GameState.keys = {};

    GameState.player = createPlayer();
    GameState.platforms = [{ x: 0, y: GameState.canvas.height - 80, w: 1500, h: 80 }];
    GameState.lastX = 1500;
    GameState.enemies = [];
    GameState.bullets = [];
    GameState.enemyProjectiles = [];

    requestAnimationFrame(gameLoop);
}

/* ============================================
   INPUT HANDLING
   ============================================ */
function setupInputBindings() {
    window.onkeydown = (e) => {
        GameState.keys[e.code] = true;
        if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) handleJump();
        if (e.code === 'KeyE') handleAttack();
    };
    window.onkeyup = (e) => {
        GameState.keys[e.code] = false;
    };

    // Touch controls
    bindTouchButton('leftBtn', 'ArrowLeft');
    bindTouchButton('rightBtn', 'ArrowRight');
    document.getElementById('jumpBtn').ontouchstart = (e) => {
        e.preventDefault();
        handleJump();
    };
    document.getElementById('attackBtn').ontouchstart = (e) => {
        e.preventDefault();
        handleAttack();
    };
}

function bindTouchButton(id, key) {
    const el = document.getElementById(id);
    el.ontouchstart = (e) => {
        e.preventDefault();
        GameState.keys[key] = true;
    };
    el.ontouchend = (e) => {
        e.preventDefault();
        GameState.keys[key] = false;
    };
}

function handleJump() {
    if (GameState.player.grounded) {
        GameState.player.dy = GameState.player.jump;
        GameState.player.grounded = false;
        GameState.player.stretch = 1.3;
        GameState.audio.playJump(GameState.isRGB);
    }
}

function handleAttack() {
    if (GameState.player.atkCooldown > 0) return;

    if (GameState.selectedWeapon === 'Pistol') {
        GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
        GameState.player.gunFlash = 0.1;
        GameState.player.atkCooldown = CONFIG.WEAPON.ATTACK_COOLDOWN;
        GameState.audio.playBullet();
    } else if (GameState.selectedWeapon === 'Katana') {
        GameState.player.slash = CONFIG.WEAPON.KATANA_DURATION;
        GameState.player.slashAngle = 0;
        GameState.player.atkCooldown = CONFIG.WEAPON.ATTACK_COOLDOWN;
        GameState.audio.playKatana();
    }
}

/* ============================================
   GAME LOGIC
   ============================================ */
function generatePlatforms() {
    while (GameState.lastX < GameState.player.x + GameState.canvas.width + 500) {
        const gap = CONFIG.LEVEL.PLATFORM_MIN_GAP + Math.random() * (CONFIG.LEVEL.PLATFORM_MAX_GAP - CONFIG.LEVEL.PLATFORM_MIN_GAP);
        const width = CONFIG.LEVEL.PLATFORM_MIN_WIDTH + Math.random() * (CONFIG.LEVEL.PLATFORM_MAX_WIDTH - CONFIG.LEVEL.PLATFORM_MIN_WIDTH);
        const prevPlatform = GameState.platforms[GameState.platforms.length - 1];
        const y = Math.max(
            GameState.canvas.height * 0.4,
            Math.min(prevPlatform.y + (Math.random() * 140 - 70), GameState.canvas.height - 100)
        );

        GameState.platforms.push({ x: GameState.lastX + gap, y: y, w: width, h: CONFIG.LEVEL.PLATFORM_HEIGHT });

        if (Math.random() > 0.55) {
            const types = Object.values(ENEMY_TYPES);
            const type = types[Math.floor(Math.random() * types.length)];
            GameState.enemies.push(createEnemy(type, GameState.lastX + gap + 50, y - 35, width, GameState.lastX + gap));
        }

        GameState.lastX += gap + width;
    }
}

function updatePlayer(dt) {
    // Horizontal movement
    if (GameState.keys['ArrowRight'] || GameState.keys['KeyD']) {
        GameState.player.dx = GameState.player.speed;
        GameState.player.dir = 1;
    } else if (GameState.keys['ArrowLeft'] || GameState.keys['KeyA']) {
        GameState.player.dx = -GameState.player.speed;
        GameState.player.dir = -1;
    } else {
        GameState.player.dx *= 0.8;
    }

    // Physics
    GameState.player.dy += GameState.player.gravity * dt;
    GameState.player.x += GameState.player.dx * dt;
    GameState.player.y += GameState.player.dy * dt;

    // Collision with platforms
    GameState.player.grounded = false;
    GameState.platforms.forEach(p => {
        if (GameState.player.x < p.x + p.w && GameState.player.x + GameState.player.w > p.x &&
            GameState.player.y + GameState.player.h > p.y && GameState.player.y < p.y + p.h) {
            if (GameState.player.dy > 0 && GameState.player.y + GameState.player.h < p.y + 30) {
                GameState.player.dy = 0;
                GameState.player.y = p.y - GameState.player.h;
                GameState.player.grounded = true;
                GameState.player.stretch = 0.85;
            }
        }
    });

    // Stretch animation
    GameState.player.stretch += (1 - GameState.player.stretch) * 0.15;

    // Fall out of bounds
    if (GameState.player.y > GameState.canvas.height + 150) {
        endGame();
    }
}

function updateBullets(dt) {
    GameState.bullets.forEach((b, bi) => {
        b.x += b.dx * dt;
        b.life -= dt;

        GameState.enemies.forEach((en, ei) => {
            if (en.alive && b.x < en.x + en.w && b.x + b.w > en.x &&
                b.y < en.y + en.h && b.y + b.h > en.y) {
                en.hp--;
                if (en.hp <= 0) {
                    en.alive = false;
                    GameState.score += CONFIG.SCORE.BULLET_KILL;
                }
                GameState.bullets.splice(bi, 1);
            }
        });
    });

    GameState.bullets = GameState.bullets.filter(b => b.life > 0);
}

function updateEnemyProjectiles(dt) {
    GameState.enemyProjectiles.forEach((ep, epi) => {
        ep.x += ep.dx * dt;
        ep.y += ep.dy * dt;

        if (GameState.player.x < ep.x + ep.w && GameState.player.x + GameState.player.w > ep.x &&
            GameState.player.y < ep.y + ep.h && GameState.player.y + GameState.player.h > ep.y) {
            if (GameState.player.dy > 10) {
                GameState.player.dy = -600;
                GameState.score += CONFIG.SCORE.JUMP_PROJECTILE;
                GameState.enemyProjectiles.splice(epi, 1);
            } else {
                endGame();
            }
        }
    });

    GameState.enemyProjectiles = GameState.enemyProjectiles.filter(ep => ep.life > 0);
    GameState.enemyProjectiles.forEach(ep => (ep.life -= dt));
}

function updateEnemies(dt) {
    GameState.enemies.forEach(en => {
        if (!en.alive) return;

        // Katana damage
        if (GameState.player.slash > 0 && Math.abs(GameState.player.x - en.x) < 95 && Math.abs(GameState.player.y - en.y) < 55) {
            en.alive = false;
            GameState.score += CONFIG.SCORE.BULLET_KILL;
        }

        // Enemy collision with player
        if (GameState.player.x < en.x + en.w && GameState.player.x + GameState.player.w > en.x &&
            GameState.player.y < en.y + en.h && GameState.player.y + GameState.player.h > en.y) {
            if (GameState.player.dy > 10) {
                en.alive = false;
                GameState.player.dy = -600;
                GameState.score += CONFIG.SCORE.STOMP_KILL;
            } else {
                endGame();
            }
        }

        // Enemy movement
        en.x += en.speed * dt;
        if (Math.abs(en.x - en.startX) > en.range) en.speed *= -1;

        // FireEnemy attack
        if (en.type === ENEMY_TYPES.FIRE) {
            en.fireTimer += dt;
            if (en.fireTimer > en.fireInterval) {
                en.fireTimer = 0;
                fireEnemyAttack(en);
            }
        }
    });
}

function fireEnemyAttack(enemy) {
    const dirX = GameState.player.x - enemy.x;
    const dirY = GameState.player.y - enemy.y;
    const dist = Math.sqrt(dirX * dirX + dirY * dirY);
    
    if (dist > 0) {
        const normalizedX = dirX / dist;
        const normalizedY = dirY / dist;
        GameState.enemyProjectiles.push(createProjectile(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, normalizedX, normalizedY));
    }
}

function updateScore(dt) {
    if (GameState.player.x > GameState.maxDist) {
        GameState.score += (GameState.player.x - GameState.maxDist) * CONFIG.SCORE.DISTANCE_MULTIPLIER;
        GameState.maxDist = GameState.player.x;
    }
    document.getElementById('scoreVal').innerText = Math.floor(GameState.score);
}

function updateCamera() {
    GameState.cameraX += (GameState.player.x - GameState.cameraX - GameState.canvas.width * 0.35) * 0.1;
}

function endGame() {
    GameState.gameActive = false;
    saveHiScore();
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('finalScore').innerText = 'SCORE: ' + Math.floor(GameState.score);
}

/* ============================================
   GAME LOOP
   ============================================ */
function gameLoop(timestamp) {
    if (!GameState.gameActive) return;

    const dt = Math.min((timestamp - GameState.lastTime) / 1000, 0.1);
    GameState.lastTime = timestamp;

    if (GameState.isRGB) GameState.rgbHue = (GameState.rgbHue + 3) % 360;

    // Update timers
    if (GameState.player.atkCooldown > 0) GameState.player.atkCooldown -= dt;
    if (GameState.player.slash > 0) {
        GameState.player.slash -= dt;
        GameState.player.slashAngle = (1 - GameState.player.slash / CONFIG.WEAPON.KATANA_DURATION) * Math.PI;
    }
    if (GameState.player.gunFlash > 0) GameState.player.gunFlash -= dt;

    // Generate platforms and enemies
    generatePlatforms();

    // Update game state
    updatePlayer(dt);
    updateBullets(dt);
    updateEnemyProjectiles(dt);
    updateEnemies(dt);
    updateScore(dt);
    updateCamera();

    // Render
    draw();
    requestAnimationFrame(gameLoop);
}

/* ============================================
   RENDERING
   ============================================ */
function draw() {
    GameState.ctx.clearRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    GameState.ctx.save();
    GameState.ctx.translate(-GameState.cameraX, 0);

    drawPlatforms();
    drawEnemies();
    drawEnemyProjectiles();
    drawBullets();
    drawPlayer();

    GameState.ctx.restore();
}

function drawPlatforms() {
    GameState.platforms.forEach(p => {
        if (GameState.isRGB) {
            GameState.ctx.strokeStyle = `hsl(${GameState.rgbHue}, 100%, 50%)`;
            GameState.ctx.strokeRect(p.x, p.y, p.w, 12);
            GameState.ctx.fillStyle = '#111';
        } else {
            GameState.ctx.fillStyle = GameState.selectedTheme === 'Night' ? '#1e293b' : '#5d4037';
        }
        GameState.ctx.fillRect(p.x, p.y, p.w, p.h);

        if (!GameState.isRGB) {
            GameState.ctx.fillStyle = GameState.selectedTheme === 'Night' ? '#334155' : '#4caf50';
            GameState.ctx.fillRect(p.x, p.y, p.w, 12);
        }
    });
}

function drawEnemies() {
    GameState.enemies.forEach(en => {
        if (!en.alive) return;

        let color = '#222';
        if (en.type === ENEMY_TYPES.TANK) color = '#f00';
        else if (en.type === ENEMY_TYPES.FLYER) color = '#a0f';
        else if (en.type === ENEMY_TYPES.RUNNER) color = '#ff8800';
        else if (en.type === ENEMY_TYPES.FIRE) color = '#ff4444';

        if (GameState.isRGB) color = `hsl(${(GameState.rgbHue + 180) % 360}, 100%, 50%)`;

        GameState.ctx.fillStyle = color;
        GameState.ctx.fillRect(en.x, en.y, en.w, en.h);

        // Fire enemy glow
        if (en.type === ENEMY_TYPES.FIRE) {
            GameState.ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            GameState.ctx.beginPath();
            GameState.ctx.arc(en.x + en.w / 2, en.y + en.h / 2, 25, 0, Math.PI * 2);
            GameState.ctx.fill();
        }

        // Eyes
        GameState.ctx.fillStyle = '#fff';
        GameState.ctx.fillRect(en.x + (en.speed > 0 ? 22 : 5), en.y + 8, 8, 8);
    });
}

function drawEnemyProjectiles() {
    GameState.enemyProjectiles.forEach(ep => {
        GameState.ctx.fillStyle = '#ff6b6b';
        GameState.ctx.beginPath();
        GameState.ctx.arc(ep.x, ep.y, ep.w / 2, 0, Math.PI * 2);
        GameState.ctx.fill();

        GameState.ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
        GameState.ctx.lineWidth = 2;
        GameState.ctx.stroke();
    });
}

function drawBullets() {
    GameState.bullets.forEach(b => {
        GameState.ctx.fillStyle = 'yellow';
        GameState.ctx.fillRect(b.x, b.y, b.w, b.h);

        GameState.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        GameState.ctx.fillRect(b.x - 10, b.y, 10, b.h);
    });
}

function drawPlayer() {
    GameState.ctx.save();
    GameState.ctx.translate(GameState.player.x + GameState.player.w / 2, GameState.player.y + GameState.player.h);
    GameState.ctx.scale(2 - GameState.player.stretch, GameState.player.stretch);

    if (GameState.isRGB) {
        GameState.ctx.shadowBlur = 20;
        GameState.ctx.shadowColor = `hsl(${GameState.rgbHue}, 100%, 50%)`;
        GameState.ctx.fillStyle = `hsl(${GameState.rgbHue}, 100%, 50%)`;
        GameState.ctx.fillRect(-GameState.player.w / 2, -GameState.player.h, GameState.player.w, GameState.player.h);
    } else {
        if (GameState.player.name === 'Diamond') {
            GameState.ctx.shadowBlur = 15;
            GameState.ctx.shadowColor = '#00d4ff';
        }

        // Body
        GameState.ctx.fillStyle = GameState.player.overall;
        GameState.ctx.fillRect(-GameState.player.w / 2, -GameState.player.h + 15, GameState.player.w, GameState.player.h - 15);

        // Face
        GameState.ctx.fillStyle = '#ffdbac';
        GameState.ctx.fillRect(-GameState.player.w / 2 + 2, -GameState.player.h + 10, GameState.player.w - 4, GameState.player.h - 25);

        // Hair
        GameState.ctx.fillStyle = GameState.player.color;
        GameState.ctx.fillRect(-GameState.player.w / 2, -GameState.player.h + 20, GameState.player.w, 12);

        // Hat
        GameState.ctx.fillStyle = '#f00';
        GameState.ctx.fillRect(-GameState.player.w / 2 - 2, -GameState.player.h + 5, GameState.player.w + 4, 10);
    }

    drawWeapon();

    GameState.ctx.fillStyle = '#000';
    GameState.ctx.fillRect(GameState.player.dir === 1 ? 5 : -11, -GameState.player.h + 15, 6, 6);

    GameState.ctx.restore();
}

function drawWeapon() {
    if (GameState.selectedWeapon === 'Katana') {
        if (GameState.player.slash > 0) {
            GameState.ctx.save();
            GameState.ctx.rotate(GameState.player.dir === 1 ? GameState.player.slashAngle : -GameState.player.slashAngle);
            
            // Blade - main body with gradient
            GameState.ctx.fillStyle = '#e8e8e8';
            GameState.ctx.fillRect(GameState.player.dir * 15, -40, 6, 50);
            
            // Blade shine/edge
            GameState.ctx.fillStyle = '#ffffff';
            GameState.ctx.fillRect(GameState.player.dir * 15, -40, 2, 50);
            
            // Blade shadow
            GameState.ctx.fillStyle = '#999999';
            GameState.ctx.fillRect(GameState.player.dir * 16.5, -40, 1.5, 50);
            
            // Sword glow during attack
            GameState.ctx.strokeStyle = `rgba(100, 200, 255, ${GameState.player.slash * 2})`;
            GameState.ctx.lineWidth = 3;
            GameState.ctx.strokeRect(GameState.player.dir * 14, -41, 8, 52);
            
            GameState.ctx.restore();
        } else {
            // Resting position - more detailed
            GameState.ctx.fillStyle = '#d0d0d0';
            GameState.ctx.fillRect(GameState.player.dir * 15, -35, 6, 40);
            
            // Blade shine
            GameState.ctx.fillStyle = '#ffffff';
            GameState.ctx.fillRect(GameState.player.dir * 15, -35, 2, 40);
            
            // Blade shadow
            GameState.ctx.fillStyle = '#808080';
            GameState.ctx.fillRect(GameState.player.dir * 19, -35, 1, 40);
            
            // Handle/Guard - golden
            GameState.ctx.fillStyle = '#ffd700';
            GameState.ctx.fillRect(GameState.player.dir * 13, 2, 10, 5);
            
            // Handle grip - brown
            GameState.ctx.fillStyle = '#8b4513';
            GameState.ctx.fillRect(GameState.player.dir * 15, 7, 6, 10);
            
            // Handle grip texture lines
            GameState.ctx.strokeStyle = '#654321';
            GameState.ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                GameState.ctx.beginPath();
                GameState.ctx.moveTo(GameState.player.dir * 15, 8 + i * 2);
                GameState.ctx.lineTo(GameState.player.dir * 21, 8 + i * 2);
                GameState.ctx.stroke();
            }
        }
    } else if (GameState.selectedWeapon === 'Pistol') {
        // Pistol barrel and body - advanced design
        
        // Main barrel
        GameState.ctx.fillStyle = '#1a1a1a';
        GameState.ctx.fillRect(GameState.player.dir * 15, -28, 20, 10);
        
        // Barrel shine
        GameState.ctx.fillStyle = '#333333';
        GameState.ctx.fillRect(GameState.player.dir * 15, -27, 20, 3);
        
        // Slide/Top - metallic
        GameState.ctx.fillStyle = '#555555';
        GameState.ctx.fillRect(GameState.player.dir * 15, -30, 18, 3);
        
        // Sight on top - red dot
        GameState.ctx.fillStyle = '#ff0000';
        GameState.ctx.beginPath();
        GameState.ctx.arc(GameState.player.dir * (15 + 8), -28, 2, 0, Math.PI * 2);
        GameState.ctx.fill();
        
        // Hammer/Back detail
        GameState.ctx.fillStyle = '#222222';
        GameState.ctx.fillRect(GameState.player.dir * 10, -26, 4, 8);
        
        // Trigger guard
        GameState.ctx.strokeStyle = '#444444';
        GameState.ctx.lineWidth = 1.5;
        GameState.ctx.beginPath();
        GameState.ctx.moveTo(GameState.player.dir * 24, -25);
        GameState.ctx.lineTo(GameState.player.dir * 28, -20);
        GameState.ctx.lineTo(GameState.player.dir * 28, -18);
        GameState.ctx.lineTo(GameState.player.dir * 24, -23);
        GameState.ctx.stroke();
        
        // Grip texture
        GameState.ctx.fillStyle = '#333333';
        GameState.ctx.fillRect(GameState.player.dir * 10, -20, 3, 12);
        
        // Grip lines
        GameState.ctx.strokeStyle = '#1a1a1a';
        GameState.ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
            GameState.ctx.beginPath();
            GameState.ctx.moveTo(GameState.player.dir * 10, -18 + i * 2);
            GameState.ctx.lineTo(GameState.player.dir * 13, -17 + i * 2);
            GameState.ctx.stroke();
        }

        // Gun muzzle flash - enhanced
        if (GameState.player.gunFlash > 0) {
            // Flash burst
            GameState.ctx.fillStyle = `rgba(255, 200, 0, ${GameState.player.gunFlash * 8})`;
            const flashSize = (1 - GameState.player.gunFlash / 0.1) * 20;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * (15 + 20), -23, flashSize, 0, Math.PI * 2);
            GameState.ctx.fill();
            
            // Inner bright flash
            GameState.ctx.fillStyle = `rgba(255, 255, 150, ${GameState.player.gunFlash * 12})`;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * (15 + 20), -23, flashSize * 0.6, 0, Math.PI * 2);
            GameState.ctx.fill();
            
            // Muzzle smoke particle effect
            GameState.ctx.fillStyle = `rgba(100, 100, 100, ${GameState.player.gunFlash * 4})`;
            for (let i = 0; i < 3; i++) {
                GameState.ctx.beginPath();
                GameState.ctx.arc(GameState.player.dir * (15 + 20 + i * 3), -23 + (Math.random() - 0.5) * 4, Math.random() * 3, 0, Math.PI * 2);
                GameState.ctx.fill();
            }
        }
    }
}

/* ============================================
   INITIALIZATION
   ============================================ */
window.addEventListener('DOMContentLoaded', () => {
    GameState.canvas = document.getElementById('game');
    GameState.ctx = GameState.canvas.getContext('2d');
    
    loadHiScore();
    renderMenus();
    renderEnemyInfo();
    setupInputBindings();
});
