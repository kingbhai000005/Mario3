/* ============================================
   CONFIGURATION & CONSTANTS
   ============================================ */
const CONFIG = {
    PLAYER: {
        SPEED: 380,
        JUMP: -880,
        GRAVITY: 2300,
        WIDTH: 35,
        HEIGHT: 56
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



const HEROES = [
    { name: 'Classic', color: '#ffeb3b', overall: '#0055ff', req: 0, weapon: 'None', power: 'Basic abilities', icon: '🛡️' },
    { name: 'Ninja', color: '#333', overall: '#111', req: 4000, weapon: 'Katana', power: 'Swift katana strikes', icon: '🥷' },
    { name: 'Gold', color: '#ffd700', overall: '#ff8c00', req: 8000, weapon: 'Pistol', power: 'Accurate pistol shots', icon: '🔫' },
    { name: 'Diamond', color: '#b9f2ff', overall: '#00d4ff', req: 12000, weapon: 'Assault Rifle', power: 'Double pistol fire rate', icon: '🔧' },
    { name: 'Ice', color: '#ffffff', overall: '#a5f3fc', req: 20000, weapon: 'Ice Powers', power: 'Ice shield breaks for 2s invincibility', icon: '❄️' }
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
    width: 0,
    height: 0,

    // Game variables
    score: 0,
    maxDist: 0,
    cameraX: 0,
    rgbHue: 0,
    lastTime: 0,
    gameActive: false,

    // UI variables
    selectedHero: 'Classic',
    selectedTheme: 'Day',
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
    keys: {},
    showEnemyInfo: false,
    testMode: false
};

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function loadHiScore() {
    const savedHiScore = parseInt(localStorage.getItem('marioHiScore')) || 0;
    GameState.testMode = localStorage.getItem('marioTestMode') === '1';
    GameState.hiScore = GameState.testMode ? 999999 : savedHiScore;
    document.getElementById('hiScoreDisp').innerText = GameState.hiScore;
    updateTestModeButton();
}

function updateTestModeButton() {
    const btn = document.getElementById('testModeBtn');
    if (!btn) return;
    btn.textContent = GameState.testMode ? 'TEST MODE: ON' : 'TEST MODE: OFF';
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
    const hero = HEROES.find(h => h.name === GameState.selectedHero);
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
        color: hero.color,
        overall: hero.overall,
        name: hero.name,
        weapon: hero.weapon,
        power: hero.power,
        slash: 0,
        slashAngle: 0,
        atkCooldown: 0,
        gunFlash: 0,
        shield: hero.name === 'Ice' ? 1 : 0, // Ice has shield
        invincibleTime: 0, // For Ice invincibility after shield break
        isFiring: false // For continuous fire
    };
}

function createEnemy(type, x, y, platformWidth, platformX) {
    let hp = 1;
    let speed = 140;
    let w = 35;
    let h = 35;

    if (type === ENEMY_TYPES.TANK) {
        hp = 2;
        speed = 100;
        w = 48;
        h = 48;
    } else if (type === ENEMY_TYPES.RUNNER) {
        speed = 260;
    } else if (type === ENEMY_TYPES.FLYER) {
        speed = 90;
        w = 36;
        h = 36;
    } else if (type === ENEMY_TYPES.FIRE) {
        speed = 120;
    }

    const range = type === ENEMY_TYPES.FLYER
        ? (platformWidth > 0 ? Math.max(100, platformWidth - 20) : 120)
        : Math.max(80, platformWidth - 40);

    const minXFinal = x - range;
    const maxXFinal = x + range;

    return {
        x: x,
        y: y,
        baseY: y,
        w: w,
        h: h,
        startX: x,
        minX: minXFinal,
        maxX: maxXFinal,
        range: range,
        speed: speed,
        alive: true,
        type: type,
        hp: hp,
        fireTimer: 0,
        fireInterval: 2 + Math.random() * 1,
        hoverAngle: 0,
        dropTimer: 0
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
    renderHeroMenu();
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



function renderHeroMenu() {
    const list = document.getElementById('skinList');
    if (!list) return; // Early exit if the old list is removed from UI
    list.innerHTML = '';
    HEROES.forEach(h => {
        const isLocked = GameState.hiScore < h.req;
        const card = document.createElement('div');
        card.className = `card ${isLocked ? 'locked' : ''} ${GameState.selectedHero === h.name ? 'selected' : ''}`;
        card.innerHTML = `<div style="background:${h.color}; width:15px; height:15px; margin:auto"></div>${h.name}${isLocked ? '<br>🔒' + h.req : ''}<br><small>${h.power}</small>`;
        if (!isLocked) {
            card.onclick = () => {
                GameState.selectedHero = h.name;
                renderMenus();
                renderHeroPreview();
            };
        }
        list.appendChild(card);
    });
}

function renderHeroPreview() {
    const current = HEROES.find(h => h.name === GameState.selectedHero) || HEROES[0];
    const preview = document.getElementById('currentHeroPreview');
    if (!preview) return;
    preview.innerHTML = `
        <div class="hero-preview-row">
            <div class="hero-img" style="background:${current.overall};">
                <span>${current.icon}</span>
            </div>
            <div class="hero-details">
                <div class="hero-name">${current.name}</div>
                <div class="hero-power">${current.power}</div>
            </div>
        </div>
        <div class="hero-extra">Weapon: ${current.weapon}</div>
    `;
}

function openHeroSelection() {
    const overlay = document.getElementById('heroSelectionOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    renderHeroSelection();
}

function closeHeroSelection() {
    const overlay = document.getElementById('heroSelectionOverlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
}

function renderHeroSelection() {
    const grid = document.getElementById('heroSelectionGrid');
    if (!grid) return;
    grid.innerHTML = '';

    HEROES.forEach(h => {
        const isLocked = GameState.hiScore < h.req;
        const card = document.createElement('div');
        card.className = `card ${isLocked ? 'locked' : ''} ${GameState.selectedHero === h.name ? 'selected' : ''}`;
        card.style.width = '180px';
        card.style.minHeight = '95px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.padding = '12px';
        card.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><div style="background:${h.color}; width:16px; height:16px; border-radius:50%;"></div><strong>${h.name}</strong></div><small style="color:#ccc;">${h.power}</small><div style="font-size:11px;color:#bff;">${isLocked ? 'LOCKED 🔒' : 'Ready'}</div>`;

        if (!isLocked) {
            card.onclick = () => {
                GameState.selectedHero = h.name;
                renderMenus();
                renderHeroPreview();
                closeHeroSelection();
            };
        }
        grid.appendChild(card);
    });
}

function toggleEnemyInfo() {
    GameState.showEnemyInfo = !GameState.showEnemyInfo;
    const container = document.getElementById('enemyInfoBox');
    const btn = document.getElementById('toggleEnemyInfoBtn');
    if (!container || !btn) return;
    container.style.display = GameState.showEnemyInfo ? 'block' : 'none';
    btn.textContent = GameState.showEnemyInfo ? 'Hide Enemy Details' : 'Show Enemy Details';
}

function renderEnemyInfo() {
    const container = document.getElementById('enemyInfoBox');
    if (!container) return;
    
    container.innerHTML = '';
    container.style.display = GameState.showEnemyInfo ? 'block' : 'none';
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

function toggleTestMode() {
    GameState.testMode = !GameState.testMode;
    localStorage.setItem('marioTestMode', GameState.testMode ? '1' : '0');

    if (GameState.testMode) {
        GameState.hiScore = 999999;
    } else {
        GameState.hiScore = parseInt(localStorage.getItem('marioHiScore')) || 0;
    }

    updateTestModeButton();
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
    
    document.getElementById('curWep').innerText = HEROES.find(h => h.name === GameState.selectedHero).weapon;
    GameState.audio.playBg();
    resetGame();
}

function resetGame() {
    const dpr = window.devicePixelRatio || 1;
    GameState.width = window.innerWidth;
    GameState.height = window.innerHeight;

    GameState.canvas.style.width = `${GameState.width}px`;
    GameState.canvas.style.height = `${GameState.height}px`;
    GameState.canvas.width = Math.floor(GameState.width * dpr);
    GameState.canvas.height = Math.floor(GameState.height * dpr);
    GameState.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    GameState.score = 0;
    GameState.cameraX = 0;
    GameState.maxDist = 0;
    GameState.gameActive = true;
    GameState.lastTime = performance.now();
    GameState.keys = {};

    GameState.player = createPlayer();
    GameState.platforms = [{ x: 0, y: GameState.height - 80, w: 1500, h: 80 }];
    GameState.lastX = 1500;
    GameState.enemies = [];
    GameState.bullets = [];
    GameState.enemyProjectiles = [];

    // Ensure all 5 enemy types appear at least once in each run
    spawnInitialEnemies();

    requestAnimationFrame(gameLoop);
}

function spawnInitialEnemies() {
    const basePlatform = GameState.platforms[0];
    const groundY = basePlatform.y - 40;

    GameState.enemies.push(createEnemy(ENEMY_TYPES.NORMAL, 550, groundY, 180, basePlatform.x));
    GameState.enemies.push(createEnemy(ENEMY_TYPES.FLYER, 920, basePlatform.y - 120, 0, 0));
    GameState.enemies.push(createEnemy(ENEMY_TYPES.TANK, 1300, groundY, 220, basePlatform.x));
    GameState.enemies.push(createEnemy(ENEMY_TYPES.RUNNER, 1700, groundY, 170, basePlatform.x));
    GameState.enemies.push(createEnemy(ENEMY_TYPES.FIRE, 2100, groundY, 240, basePlatform.x));
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
        if (e.code === 'KeyE') {
            GameState.player.isFiring = false; // Stop continuous fire
        }
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
    document.getElementById('attackBtn').ontouchend = (e) => {
        e.preventDefault();
        GameState.player.isFiring = false;
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

    const hero = HEROES.find(h => h.name === GameState.selectedHero);

    if (hero.weapon === 'Katana') {
        GameState.player.slash = CONFIG.WEAPON.KATANA_DURATION;
        GameState.player.slashAngle = 0;
        GameState.player.atkCooldown = CONFIG.WEAPON.ATTACK_COOLDOWN;
        GameState.audio.playKatana();
    } else if (hero.weapon === 'Pistol' || hero.weapon === 'Assault Rifle' || hero.weapon === 'Ice Powers') {
        if (!GameState.player.isFiring) {
            GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
            GameState.player.gunFlash = 0.1;
            GameState.player.atkCooldown = (hero.weapon === 'Assault Rifle' || hero.weapon === 'Ice Powers') ? CONFIG.WEAPON.ATTACK_COOLDOWN * 0.5 : CONFIG.WEAPON.ATTACK_COOLDOWN;
            GameState.audio.playBullet();
            GameState.player.isFiring = true;
        }
    }
}

function startContinuousFire() {
    const fireInterval = setInterval(() => {
        if (!GameState.player.continuousFire || GameState.gameActive === false) {
            clearInterval(fireInterval);
            return;
        }
        GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
        GameState.player.gunFlash = 0.1;
        GameState.audio.playBullet();
    }, 100); // Fire every 100ms
}

/* ============================================
   GAME LOGIC
   ============================================ */
function generatePlatforms() {
    while (GameState.lastX < GameState.player.x + GameState.width + 500) {
        const gap = CONFIG.LEVEL.PLATFORM_MIN_GAP + Math.random() * (CONFIG.LEVEL.PLATFORM_MAX_GAP - CONFIG.LEVEL.PLATFORM_MIN_GAP);
        const width = CONFIG.LEVEL.PLATFORM_MIN_WIDTH + Math.random() * (CONFIG.LEVEL.PLATFORM_MAX_WIDTH - CONFIG.LEVEL.PLATFORM_MIN_WIDTH);
        const prevPlatform = GameState.platforms[GameState.platforms.length - 1];
        const y = Math.max(
            GameState.height * 0.4,
            Math.min(prevPlatform.y + (Math.random() * 140 - 70), GameState.height - 100)
        );

        GameState.platforms.push({ x: GameState.lastX + gap, y: y, w: width, h: CONFIG.LEVEL.PLATFORM_HEIGHT });

        if (Math.random() > 0.55) {
            const types = Object.values(ENEMY_TYPES);
            const type = types[Math.floor(Math.random() * types.length)];
            let enemyY = y - 35;
            if (type === ENEMY_TYPES.FLYER) {
                enemyY = y - 160 - Math.random() * 80; // keep flyers above the platform
            }
            enemyY = Math.max(50, Math.min(enemyY, GameState.height - 120));
            GameState.enemies.push(createEnemy(type, GameState.lastX + gap + 50, enemyY, width, GameState.lastX + gap));
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
    if (GameState.player.y > GameState.height + 150) {
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

    // Handle ice projectiles from player
    GameState.enemyProjectiles.forEach((ep, epi) => {
        if (ep.isIce) {
            ep.x += ep.dx * dt;
            ep.y += ep.dy * dt;
            ep.life -= dt;

            GameState.enemies.forEach((en, ei) => {
                if (en.alive && ep.x < en.x + en.w && ep.x + ep.w > en.x &&
                    ep.y < en.y + en.h && ep.y + ep.h > en.y) {
                    en.hp--;
                    if (en.hp <= 0) {
                        en.alive = false;
                        GameState.score += CONFIG.SCORE.BULLET_KILL;
                    }
                    GameState.enemyProjectiles.splice(epi, 1);
                }
            });

            if (ep.life <= 0) {
                GameState.enemyProjectiles.splice(epi, 1);
            }
        }
    });

    GameState.bullets = GameState.bullets.filter(b => b.life > 0);
}

function updateEnemyProjectiles(dt) {
    GameState.enemyProjectiles.forEach((ep, epi) => {
        ep.x += ep.dx * dt;
        ep.y += ep.dy * dt;

        if (GameState.player.x < ep.x + ep.w && GameState.player.x + GameState.player.w > ep.x &&
            GameState.player.y < ep.y + ep.h && GameState.player.y + GameState.player.h > ep.y) {
            GameState.enemyProjectiles.splice(epi, 1);

            if (GameState.player.name === 'Ice' && GameState.player.shield > 0) {
                GameState.player.shield = 0;
                GameState.player.invincibleTime = 2;
                GameState.player.dy = -400;
            } else if (GameState.player.invincibleTime <= 0) {
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
                // Ice shield protection
                if (GameState.player.name === 'Ice' && GameState.player.shield > 0) {
                    GameState.player.shield = 0;
                    GameState.player.invincibleTime = 2;
                    GameState.player.dy = -400; // Bounce back
                } else if (GameState.player.invincibleTime <= 0) {
                    endGame();
                }
            }
        }

        // Enemy movement
        if (en.type === ENEMY_TYPES.FLYER) {
            en.hoverAngle += dt * 2.5;
            en.y = en.baseY + Math.sin(en.hoverAngle) * 15;
            en.x += en.speed * dt;

            if (en.x < en.minX) {
                en.x = en.minX;
                en.speed = Math.abs(en.speed);
            } else if (en.x > en.maxX) {
                en.x = en.maxX;
                en.speed = -Math.abs(en.speed);
            }
        } else {
            // Ground enemy stays on platform y and stays within platform bounds
            en.y = en.baseY;

            if (en.type === ENEMY_TYPES.RUNNER) {
                const distToPlayer = Math.abs(en.x - GameState.player.x);
                if (distToPlayer < 220) {
                    en.speed = en.speed > 0 ? 420 : -420;
                } else {
                    en.speed = en.speed > 0 ? 260 : -260;
                }
            }

            en.x += en.speed * dt;

            if (en.x < en.minX) {
                en.x = en.minX;
                en.speed = Math.abs(en.speed);
            } else if (en.x > en.maxX) {
                en.x = en.maxX;
                en.speed = -Math.abs(en.speed);
            }
        }

        // Ensure non-flyer stays on platform in case it deviated
        if (en.type !== ENEMY_TYPES.FLYER) {
            en.y = en.baseY;
        }

        // Flyer bomb drop
        if (en.type === ENEMY_TYPES.FLYER) {
            en.dropTimer += dt;
            if (en.dropTimer > 1.4) {
                en.dropTimer = 0;
                GameState.enemyProjectiles.push({
                    x: en.x,
                    y: en.y + en.h,
                    dx: 0,
                    dy: 220,
                    w: 10,
                    h: 10,
                    life: 4,
                    isBomb: true
                });
            }
        }

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
    GameState.cameraX += (GameState.player.x - GameState.cameraX - GameState.width * 0.35) * 0.1;
}

function endGame() {
    GameState.gameActive = false;
    saveHiScore();
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('finalScore').innerText = 'SCORE: ' + Math.floor(GameState.score);
}

function returnToMainMenu() {
    GameState.gameActive = false;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('startMenu').style.display = 'flex';

    if (!GameState.testMode) {
        GameState.hiScore = parseInt(localStorage.getItem('marioHiScore')) || 0;
    } else {
        GameState.hiScore = 999999;
    }

    document.getElementById('hiScoreDisp').innerText = GameState.hiScore;
    renderMenus();
    renderHeroPreview();
    renderEnemyInfo();
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
    if (GameState.player.invincibleTime > 0) GameState.player.invincibleTime -= dt;

    // Continuous firing
    if (GameState.player.isFiring && GameState.player.atkCooldown <= 0 && GameState.gameActive) {
        const hero = HEROES.find(h => h.name === GameState.selectedHero);
        if (hero.weapon === 'Pistol' || hero.weapon === 'Assault Rifle' || hero.weapon === 'Ice Powers') {
            GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
            GameState.player.gunFlash = 0.1;
            GameState.player.atkCooldown = (hero.weapon === 'Assault Rifle' || hero.weapon === 'Ice Powers') ? CONFIG.WEAPON.ATTACK_COOLDOWN * 0.5 : CONFIG.WEAPON.ATTACK_COOLDOWN;
            GameState.audio.playBullet();
        }
    }
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
    GameState.ctx.clearRect(0, 0, GameState.width, GameState.height);
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

        let baseColor = '#222';
        if (en.type === ENEMY_TYPES.TANK) baseColor = '#d92b2b';
        else if (en.type === ENEMY_TYPES.FLYER) baseColor = '#8a2be2';
        else if (en.type === ENEMY_TYPES.RUNNER) baseColor = '#ff9800';
        else if (en.type === ENEMY_TYPES.FIRE) baseColor = '#ff4444';

        if (GameState.isRGB) baseColor = `hsl(${(GameState.rgbHue + 180) % 360}, 100%, 50%)`;

        GameState.ctx.fillStyle = baseColor;
        GameState.ctx.fillRect(en.x, en.y, en.w, en.h);

        // Tank: Armor plating
        if (en.type === ENEMY_TYPES.TANK) {
            GameState.ctx.strokeStyle = '#ffaaaa';
            GameState.ctx.lineWidth = 2;
            GameState.ctx.strokeRect(en.x - 2, en.y - 2, en.w + 4, en.h + 4);
            // Armor details
            GameState.ctx.fillStyle = '#b22222';
            GameState.ctx.fillRect(en.x + 2, en.y + 2, en.w - 4, 4);
            GameState.ctx.fillRect(en.x + 2, en.y + en.h - 6, en.w - 4, 4);
        }

        // Flyer: Wings and propeller
        if (en.type === ENEMY_TYPES.FLYER) {
            GameState.ctx.beginPath();
            GameState.ctx.strokeStyle = '#f5f';
            GameState.ctx.lineWidth = 2;
            GameState.ctx.moveTo(en.x - 5, en.y + en.h - 4);
            GameState.ctx.lineTo(en.x + en.w + 5, en.y + en.h - 4);
            GameState.ctx.stroke();
            // Wings
            GameState.ctx.fillStyle = '#daa0ff';
            GameState.ctx.fillRect(en.x - 8, en.y + 5, 6, en.h - 10);
            GameState.ctx.fillRect(en.x + en.w + 2, en.y + 5, 6, en.h - 10);
        }

        // Runner: Speed lines
        if (en.type === ENEMY_TYPES.RUNNER) {
            GameState.ctx.strokeStyle = '#ffb366';
            GameState.ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                GameState.ctx.beginPath();
                GameState.ctx.moveTo(en.x - 5 - i * 3, en.y + 5 + i * 3);
                GameState.ctx.lineTo(en.x - 10 - i * 3, en.y + 5 + i * 3);
                GameState.ctx.stroke();
            }
        }

        // Fire enemy: Flames
        if (en.type === ENEMY_TYPES.FIRE) {
            GameState.ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            GameState.ctx.beginPath();
            GameState.ctx.arc(en.x + en.w / 2, en.y + en.h / 2, 25, 0, Math.PI * 2);
            GameState.ctx.fill();
            // Flame particles
            GameState.ctx.fillStyle = '#ffaa00';
            for (let i = 0; i < 3; i++) {
                GameState.ctx.beginPath();
                GameState.ctx.arc(en.x + en.w / 2 + (Math.random() - 0.5) * 20, en.y - 5 + i * 5, 3, 0, Math.PI * 2);
                GameState.ctx.fill();
            }
        }

        // Normal: Basic design
        if (en.type === ENEMY_TYPES.NORMAL) {
            // Simple eyes
            GameState.ctx.fillStyle = '#fff';
            const eyeX = en.speed > 0 ? en.x + en.w - 8 : en.x + 5;
            const eyeY = en.y + 8;
            GameState.ctx.fillRect(eyeX, eyeY, 8, 8);
            GameState.ctx.fillStyle = '#000';
            GameState.ctx.fillRect(eyeX + 2, eyeY + 2, 4, 4);
        }

        // Shared eyes for others
        if (en.type !== ENEMY_TYPES.NORMAL) {
            GameState.ctx.fillStyle = '#fff';
            const eyeX = en.speed > 0 ? en.x + en.w - 8 : en.x + 5;
            const eyeY = en.y + 8;
            GameState.ctx.fillRect(eyeX, eyeY, 8, 8);
            GameState.ctx.fillStyle = '#000';
            GameState.ctx.fillRect(eyeX + 2, eyeY + 2, 4, 4);
        }
    });
}

function drawEnemyProjectiles() {
    GameState.enemyProjectiles.forEach(ep => {
        if (ep.isIce) {
            // Draw ice projectile
            GameState.ctx.fillStyle = '#a5f3fc';
            GameState.ctx.beginPath();
            GameState.ctx.arc(ep.x, ep.y, ep.w / 2, 0, Math.PI * 2);
            GameState.ctx.fill();
            GameState.ctx.strokeStyle = '#00d4ff';
            GameState.ctx.lineWidth = 2;
            GameState.ctx.stroke();
        } else {
            GameState.ctx.fillStyle = '#ff6b6b';
            GameState.ctx.beginPath();
            GameState.ctx.arc(ep.x, ep.y, ep.w / 2, 0, Math.PI * 2);
            GameState.ctx.fill();

            GameState.ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
            GameState.ctx.lineWidth = 2;
            GameState.ctx.stroke();
        }
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
        } else if (GameState.player.name === 'Gold') {
            GameState.ctx.shadowBlur = 10;
            GameState.ctx.shadowColor = '#ffd700';
        } else if (GameState.player.name === 'Ice') {
            GameState.ctx.shadowBlur = 12;
            GameState.ctx.shadowColor = '#a5f3fc';
        }

        // Body
        GameState.ctx.fillStyle = GameState.player.overall;
        GameState.ctx.fillRect(-GameState.player.w / 2, -GameState.player.h + 15, GameState.player.w, GameState.player.h - 15);

        // Face
        GameState.ctx.fillStyle = '#ffdbac';
        GameState.ctx.fillRect(-GameState.player.w / 2 + 2, -GameState.player.h + 10, GameState.player.w - 4, GameState.player.h - 25);

        // Hair/Headwear
        if (GameState.player.name === 'Ninja') {
            GameState.ctx.fillStyle = '#000';
            GameState.ctx.fillRect(-GameState.player.w / 2, -GameState.player.h + 20, GameState.player.w, 12);
            // Ninja mask
            GameState.ctx.fillRect(-GameState.player.w / 2 + 5, -GameState.player.h + 15, GameState.player.w - 10, 8);
        } else {
            GameState.ctx.fillStyle = GameState.player.color;
            GameState.ctx.fillRect(-GameState.player.w / 2, -GameState.player.h + 20, GameState.player.w, 12);
        }

        // Hat (for all heroes)
        let hatColor = '#f00'; // Default red
        if (GameState.player.name === 'Ninja') hatColor = '#000';
        else if (GameState.player.name === 'Gold') hatColor = '#ffd700';
        else if (GameState.player.name === 'Diamond') hatColor = '#00d4ff';
        else if (GameState.player.name === 'Ice') hatColor = '#a5f3fc';
        
        GameState.ctx.fillStyle = hatColor;
        GameState.ctx.fillRect(-GameState.player.w / 2 - 2, -GameState.player.h + 5, GameState.player.w + 4, 10);

        // Ice shield
        if (GameState.player.name === 'Ice' && GameState.player.shield > 0) {
            GameState.ctx.strokeStyle = '#a5f3fc';
            GameState.ctx.lineWidth = 3;
            GameState.ctx.strokeRect(-GameState.player.w / 2 - 5, -GameState.player.h - 5, GameState.player.w + 10, GameState.player.h + 10);
        }
    }

    drawWeapon();

    GameState.ctx.fillStyle = '#000';
    GameState.ctx.fillRect(GameState.player.dir === 1 ? 5 : -11, -GameState.player.h + 15, 6, 6);

    GameState.ctx.restore();
}

function drawWeapon() {
    if (GameState.player.weapon === 'Katana') {
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
    } else if (GameState.player.weapon === 'Pistol') {
        // Pistol barrel and body - realistic design

        // Main barrel
        GameState.ctx.fillStyle = '#292929';
        GameState.ctx.fillRect(GameState.player.dir * 14, -30, 24, 10);

        // Barrel inner sleeve
        GameState.ctx.fillStyle = '#404040';
        GameState.ctx.fillRect(GameState.player.dir * 16, -28, 20, 6);

        // Muzzle ring
        GameState.ctx.fillStyle = '#999999';
        GameState.ctx.fillRect(GameState.player.dir * 38, -29, 6, 8);

        // Slide/top rail
        GameState.ctx.fillStyle = '#686868';
        GameState.ctx.fillRect(GameState.player.dir * 14, -32, 22, 4);

        // Slide grooves
        GameState.ctx.strokeStyle = '#2b2b2b';
        GameState.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            GameState.ctx.beginPath();
            GameState.ctx.moveTo(GameState.player.dir * (16 + i * 6), -30);
            GameState.ctx.lineTo(GameState.player.dir * (16 + i * 6), -26);
            GameState.ctx.stroke();
        }

        // Front sight
        GameState.ctx.fillStyle = '#00ff00';
        GameState.ctx.fillRect(GameState.player.dir * 25, -33, 2, 3);

        // Rear sight
        GameState.ctx.fillStyle = '#cccccc';
        GameState.ctx.fillRect(GameState.player.dir * 17, -33, 5, 3);

        // Frame body
        GameState.ctx.fillStyle = '#2a2a2a';
        GameState.ctx.fillRect(GameState.player.dir * 10, -20, 16, 14);

        // Grip
        GameState.ctx.fillStyle = '#1e1e1e';
        GameState.ctx.fillRect(GameState.player.dir * 8, -12, 12, 20);

        // Grip shading
        GameState.ctx.fillStyle = '#111';
        GameState.ctx.fillRect(GameState.player.dir * 8, -12, 12, 4);

        // Grip texturing
        GameState.ctx.strokeStyle = '#444444';
        GameState.ctx.lineWidth = 0.8;
        for (let i = 0; i < 4; i++) {
            GameState.ctx.beginPath();
            GameState.ctx.moveTo(GameState.player.dir * 9, -8 + i * 4);
            GameState.ctx.lineTo(GameState.player.dir * 19, -7 + i * 4);
            GameState.ctx.stroke();
        }

        // Trigger guard
        GameState.ctx.strokeStyle = '#595959';
        GameState.ctx.lineWidth = 1.5;
        GameState.ctx.beginPath();
        GameState.ctx.moveTo(GameState.player.dir * 20, -15);
        GameState.ctx.quadraticCurveTo(GameState.player.dir * 22, -10, GameState.player.dir * 19, -6);
        GameState.ctx.stroke();

        // Trigger
        GameState.ctx.fillStyle = '#b4b4b4';
        GameState.ctx.fillRect(GameState.player.dir * 18, -10, 2, 4);

        // Muzzle flash effect
        if (GameState.player.gunFlash > 0) {
            const flashSize = (1 - GameState.player.gunFlash / 0.1) * 22;
            GameState.ctx.fillStyle = `rgba(255, 220, 90, ${Math.min(1, GameState.player.gunFlash * 8)})`;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * 43, -25, flashSize, Math.PI * 0.2, Math.PI * 1.8);
            GameState.ctx.fill();

            GameState.ctx.fillStyle = `rgba(255, 255, 200, ${Math.min(1, GameState.player.gunFlash * 12)})`;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * 42, -24, flashSize * 0.5, Math.PI * 0.2, Math.PI * 1.8);
            GameState.ctx.fill();

            GameState.ctx.fillStyle = `rgba(150, 150, 150, ${Math.max(0, GameState.player.gunFlash * 4 - 0.2)})`;
            for (let i = 0; i < 2; i++) {
                GameState.ctx.beginPath();
                GameState.ctx.arc(GameState.player.dir * (42 + i * 2), -25 + i * 2, 2 + i, 0, Math.PI * 2);
                GameState.ctx.fill();
            }
        }

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
    } else if (GameState.player.weapon === 'Assault Rifle') {
        // Assault Rifle - bigger and longer like M416

        // Main barrel (longer)
        GameState.ctx.fillStyle = '#292929';
        GameState.ctx.fillRect(GameState.player.dir * 14, -30, 45, 12);

        // Barrel inner sleeve
        GameState.ctx.fillStyle = '#404040';
        GameState.ctx.fillRect(GameState.player.dir * 16, -28, 40, 8);

        // Muzzle brake
        GameState.ctx.fillStyle = '#666666';
        GameState.ctx.fillRect(GameState.player.dir * 59, -31, 8, 14);

        // Upper receiver / rail
        GameState.ctx.fillStyle = '#686868';
        GameState.ctx.fillRect(GameState.player.dir * 14, -35, 40, 5);

        // Front sight
        GameState.ctx.fillStyle = '#00ff00';
        GameState.ctx.fillRect(GameState.player.dir * 45, -37, 3, 4);

        // Rear sight
        GameState.ctx.fillStyle = '#cccccc';
        GameState.ctx.fillRect(GameState.player.dir * 20, -37, 6, 4);

        // Lower receiver / body
        GameState.ctx.fillStyle = '#2a2a2a';
        GameState.ctx.fillRect(GameState.player.dir * 10, -20, 25, 16);

        // Grip (bigger)
        GameState.ctx.fillStyle = '#1e1e1e';
        GameState.ctx.fillRect(GameState.player.dir * 8, -12, 15, 25);

        // Grip shading
        GameState.ctx.fillStyle = '#111';
        GameState.ctx.fillRect(GameState.player.dir * 8, -12, 15, 5);

        // Grip texturing
        GameState.ctx.strokeStyle = '#444444';
        GameState.ctx.lineWidth = 0.8;
        for (let i = 0; i < 5; i++) {
            GameState.ctx.beginPath();
            GameState.ctx.moveTo(GameState.player.dir * 9, -7 + i * 4);
            GameState.ctx.lineTo(GameState.player.dir * 22, -6 + i * 4);
            GameState.ctx.stroke();
        }

        // Trigger guard
        GameState.ctx.strokeStyle = '#595959';
        GameState.ctx.lineWidth = 1.5;
        GameState.ctx.beginPath();
        GameState.ctx.moveTo(GameState.player.dir * 25, -15);
        GameState.ctx.quadraticCurveTo(GameState.player.dir * 27, -10, GameState.player.dir * 24, -6);
        GameState.ctx.stroke();

        // Trigger
        GameState.ctx.fillStyle = '#b4b4b4';
        GameState.ctx.fillRect(GameState.player.dir * 23, -10, 2, 4);

        // Stock (rear part)
        GameState.ctx.fillStyle = '#333333';
        GameState.ctx.fillRect(GameState.player.dir * -5, -25, 15, 10);

        // Magazine
        GameState.ctx.fillStyle = '#222222';
        GameState.ctx.fillRect(GameState.player.dir * 12, 5, 8, 15);

        // Muzzle flash effect (bigger for rifle)
        if (GameState.player.gunFlash > 0) {
            const flashSize = (1 - GameState.player.gunFlash / 0.1) * 30;
            GameState.ctx.fillStyle = `rgba(255, 220, 90, ${Math.min(1, GameState.player.gunFlash * 8)})`;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * 70, -25, flashSize, Math.PI * 0.2, Math.PI * 1.8);
            GameState.ctx.fill();

            GameState.ctx.fillStyle = `rgba(255, 255, 200, ${Math.min(1, GameState.player.gunFlash * 12)})`;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * 69, -24, flashSize * 0.7, Math.PI * 0.2, Math.PI * 1.8);
            GameState.ctx.fill();

            GameState.ctx.fillStyle = `rgba(150, 150, 150, ${Math.max(0, GameState.player.gunFlash * 4 - 0.2)})`;
            for (let i = 0; i < 4; i++) {
                GameState.ctx.beginPath();
                GameState.ctx.arc(GameState.player.dir * (69 + i * 3), -25 + (Math.random() - 0.5) * 6, 3 + i, 0, Math.PI * 2);
                GameState.ctx.fill();
            }
        }

        // Additional details
        GameState.ctx.strokeStyle = '#1a1a1a';
        GameState.ctx.lineWidth = 0.5;
        for (let i = 0; i < 6; i++) {
            GameState.ctx.beginPath();
            GameState.ctx.moveTo(GameState.player.dir * 10, -18 + i * 2);
            GameState.ctx.lineTo(GameState.player.dir * 15, -17 + i * 2);
            GameState.ctx.stroke();
        }
    }
}

function updateOrientationState() {
    const isPortrait = window.matchMedia('(orientation: portrait) and (max-width: 768px)').matches;
    const notice = document.getElementById('rotateNotice');
    const uiArea = document.querySelectorAll('#gameContainer, #startMenu, #menu, .controls, #ui');

    if (isPortrait) {
        if (notice) notice.style.display = 'flex';
        uiArea.forEach(el => {
            el.style.filter = 'blur(4px)';
            el.style.pointerEvents = 'none';
        });
        if (GameState.gameActive) {
            GameState.gameActive = false;
            if (document.getElementById('menu')) document.getElementById('menu').style.display = 'flex';
            document.getElementById('finalScore').innerText = 'Rotate device to play';
        }
    } else {
        if (notice) notice.style.display = 'none';
        uiArea.forEach(el => {
            el.style.filter = 'none';
            el.style.pointerEvents = 'auto';
        });
        document.getElementById('menu').style.display = 'none';
    }
}

window.addEventListener('resize', updateOrientationState);
window.addEventListener('orientationchange', updateOrientationState);

/* ============================================
   INITIALIZATION
   ============================================ */
window.addEventListener('DOMContentLoaded', () => {
    GameState.canvas = document.getElementById('game');
    GameState.ctx = GameState.canvas.getContext('2d');
    
    loadHiScore();
    renderMenus();
    renderHeroPreview();
    renderEnemyInfo();
    document.getElementById('changeHeroBtn').onclick = openHeroSelection;
    document.getElementById('closeHeroSelectionBtn').onclick = closeHeroSelection;
    document.getElementById('toggleEnemyInfoBtn').onclick = toggleEnemyInfo;
    setupInputBindings();
});
