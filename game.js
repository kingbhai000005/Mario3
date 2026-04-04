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
    { name: 'Machine', color: '#000000', overall: '#333333', req: 20000, weapon: 'M416', power: 'Machine gun fire rate with black armor', icon: '🔫' },
    { name: 'Fire', color: '#ff4500', overall: '#8b0000', req: 25000, weapon: 'Fire Powers', power: 'Shoots fireballs from both sides simultaneously', icon: '🔥' },
    { name: 'Ice', color: '#ffffff', overall: '#a5f3fc', req: 30000, weapon: 'Ice Powers', power: 'Ice shield breaks for 2s invincibility', icon: '❄️' },
    { name: 'Alien', color: '#00ff00', overall: '#006400', req: 35000, weapon: 'Triple Barrel Gun', power: 'Shoots in 3 directions: straight, up slanted, down slanted', icon: '👽' }
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
        const customURL = sessionStorage.getItem('bgMusicURL');
        if (customURL) {
            const audio = document.getElementById('bgAudio');
            if (audio.src !== customURL) {
                audio.src = customURL;
            }
            audio.play().catch(() => {});
        } else {
            this.bg.play().catch(() => {});
        }
    }

    stopBg() {
        document.getElementById('bgAudio').pause();
        document.getElementById('bgAudio').currentTime = 0;
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
    zoom: 1,
    animationFrameId: null,

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
    testMode: false,
    rgbAnimIndex: 0,
    rgbAnimInterval: null,
    slashTrail: [] // For Ninja's katana trail effect
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
    
    // Set health and shield based on hero
    let health = 5; // default
    let shield = 0; // default
    
    if (hero.name === 'Classic') {
        health = 3;
        shield = 0;
    } else if (hero.name === 'Ninja') {
        health = 4;
        shield = 0;
    } else if (hero.name === 'Gold') {
        health = 5;
        shield = 0;
    } else if (hero.name === 'Diamond') {
        health = 5;
        shield = 0;
    } else if (hero.name === 'Ice') {
        health = 5;
        shield = 2; // Ice keeps shield for special ability
    } else if (hero.name === 'Fire') {
        health = 5;
        shield = 2; // Fire keeps shield
    } else if (hero.name === 'Machine') {
        health = 5;
        shield = 2; // Machine keeps shield
    } else if (hero.name === 'Alien') {
        health = 5;
        shield = 2; // Alien keeps shield
    }
    
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
        health: health,
        shield: shield,
        invincibleTime: 0, // For shield invincibility after break
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

function createBullet(fromX, fromY, dirX, angle = 0) {
    const speed = CONFIG.WEAPON.PISTOL_SPEED;
    const dx = dirX * speed * Math.cos(angle);
    const dy = speed * Math.sin(angle);
    return {
        x: fromX + (dirX * 30),
        y: fromY + 22,
        dx: dx,
        dy: dy,
        w: 12,
        h: 6,
        life: 0.6 // increased bullet range for players
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
        life: 3 // reduced fire enemy projectile range
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
        card.className = `enemy-card ${isLocked ? 'locked' : ''} ${GameState.selectedHero === h.name ? 'selected' : ''}`;
        card.style.opacity = isLocked ? '0.6' : '1';
        card.style.cursor = isLocked ? 'not-allowed' : 'pointer';
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; text-align:left;">
                <div style="font-size:32px; line-height:1; flex-shrink:0;">${h.icon}</div>
                <div style="flex:1;">
                    <div style="font-size:14px; font-weight:bold; color:#00ffff; margin-bottom:4px;">${h.name}</div>
                    <div style="font-size:11px; color:#a7eeff; margin-bottom:6px;">${h.power}</div>
                    <div style="font-size:10px; color:#7af3ff;">Weapon: <strong>${h.weapon}</strong></div>
                    <div style="font-size:9px; color:#5fa0cc; margin-top:4px;">${isLocked ? `LOCKED 🔒 (Score Req: ${h.req})` : '✓ UNLOCKED'}</div>
                </div>
            </div>
        `;

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
    const modal = document.getElementById('enemyInfoModal');
    const btn = document.getElementById('toggleEnemyInfoBtn');
    if (!modal || !btn) return;
    
    if (GameState.showEnemyInfo) {
        modal.classList.remove('hidden');
        btn.textContent = 'Hide Enemy Details';
        renderEnemyInfo();
    } else {
        modal.classList.add('hidden');
        btn.textContent = 'Show Enemy Details';
    }
}

function renderEnemyInfo() {
    const container = document.getElementById('enemyInfoBox');
    if (!container) {
        console.error('enemyInfoBox not found');
        return;
    }
    
    // Make sure container is visible
    container.style.display = 'block';
    
    container.innerHTML = '';
    
    // Add title
    const title = document.createElement('h3');
    title.style.margin = '0 0 15px 0';
    title.style.color = '#ffcc00';
    title.innerText = 'ENEMIES IN GAME';
    container.appendChild(title);

    // Create grid container
    const enemiesGrid = document.createElement('div');
    enemiesGrid.style.display = 'grid';
    enemiesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
    enemiesGrid.style.gap = '10px';
    enemiesGrid.style.maxHeight = '250px';
    enemiesGrid.style.overflowY = 'auto';
    enemiesGrid.style.paddingRight = '5px';

    // Check if ENEMIES array exists
    if (!ENEMIES || ENEMIES.length === 0) {
        const errorMsg = document.createElement('div');
        errorMsg.style.color = '#ff4444';
        errorMsg.innerText = 'No enemy data available';
        enemiesGrid.appendChild(errorMsg);
    } else {
        // Create enemy cards
        ENEMIES.forEach((enemy, index) => {
            const card = document.createElement('div');
            card.className = 'enemy-card';
            
            // Create card content
            const colorDiv = document.createElement('div');
            colorDiv.style.background = enemy.color;
            colorDiv.style.width = '30px';
            colorDiv.style.height = '30px';
            colorDiv.style.margin = '0 auto 8px';
            colorDiv.style.borderRadius = '4px';
            
            const nameDiv = document.createElement('div');
            nameDiv.style.fontWeight = 'bold';
            nameDiv.style.fontSize = '12px';
            nameDiv.style.marginBottom = '5px';
            nameDiv.innerText = enemy.name;
            
            const hpDiv = document.createElement('div');
            hpDiv.style.fontSize = '10px';
            hpDiv.style.color = '#aaa';
            hpDiv.style.marginBottom = '3px';
            hpDiv.innerHTML = '❤️ HP: ' + enemy.health;
            
            const speedDiv = document.createElement('div');
            speedDiv.style.fontSize = '10px';
            speedDiv.style.color = '#aaa';
            speedDiv.style.marginBottom = '5px';
            speedDiv.innerHTML = '⚡ ' + enemy.speed;
            
            const specialLabel = document.createElement('div');
            specialLabel.style.fontSize = '9px';
            specialLabel.style.color = '#ffeb3b';
            specialLabel.style.marginBottom = '3px';
            specialLabel.innerHTML = '<strong>Special:</strong>';
            
            const specialDiv = document.createElement('div');
            specialDiv.style.fontSize = '9px';
            specialDiv.style.color = '#fff';
            specialDiv.innerText = enemy.special;
            
            // Append all elements to card
            card.appendChild(colorDiv);
            card.appendChild(nameDiv);
            card.appendChild(hpDiv);
            card.appendChild(speedDiv);
            card.appendChild(specialLabel);
            card.appendChild(specialDiv);
            
            enemiesGrid.appendChild(card);
        });
    }

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
    
    // Toggle RGB styling on main menu
    const startMenu = document.getElementById('startMenu');
    if (GameState.isRGB) {
        startMenu.classList.add('rgb-active');
    } else {
        startMenu.classList.remove('rgb-active');
    }
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

function toggleFullscreen() {
    const elem = document.documentElement;
    const btn = document.getElementById('fullscreenBtn');

    // Function to reposition buttons based on current screen size
    const repositionButtons = () => {
        if (TouchSettings) {
            // Update button positions based on new screen dimensions
            const margin = 20;
            const jumpSize = TouchSettings.jumpBtn.size || 85;
            const attackSize = TouchSettings.attackBtn.size || 85;

            TouchSettings.leftBtn.x = margin;
            TouchSettings.leftBtn.y = window.innerHeight - 120;

            TouchSettings.rightBtn.x = 90;
            TouchSettings.rightBtn.y = window.innerHeight - 120;

            TouchSettings.jumpBtn.x = window.innerWidth - jumpSize - margin;
            TouchSettings.jumpBtn.y = window.innerHeight - jumpSize - attackSize - 2 * margin;

            TouchSettings.attackBtn.x = window.innerWidth - attackSize - margin;
            TouchSettings.attackBtn.y = window.innerHeight - attackSize - margin;

            // Apply the new positions
            applyTouchSettings();
            saveTouchSettings();
        }
    };

    // Listen for fullscreen changes and reposition buttons
    const handleFullscreenChange = () => {
        setTimeout(repositionButtons, 100); // Small delay to ensure dimensions are updated
    };

    // Add event listeners for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    const menuBtn = document.getElementById('fullscreenMenuBtn');

    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        if (btn) btn.innerText = '⛶';
        if (menuBtn) menuBtn.innerText = '⛶';
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        if (btn) btn.innerText = '⛶';
        if (menuBtn) menuBtn.innerText = '⛶';
    }
}

/* ============================================
   TOUCH CONTROL SETTINGS
   ============================================ */
let TouchSettings;
let customizerSettings = null;

function loadTouchSettings() {
    const saved = localStorage.getItem('marioTouchSettings');
    if (saved) {
        TouchSettings = JSON.parse(saved);
        // Ensure all settings exist with defaults
        if (!TouchSettings.leftBtn) TouchSettings.leftBtn = { x: 20, y: window.innerHeight - 120, size: 60 };
        if (!TouchSettings.rightBtn) TouchSettings.rightBtn = { x: 90, y: window.innerHeight - 120, size: 60 };
        if (!TouchSettings.jumpBtn) TouchSettings.jumpBtn = { x: window.innerWidth - 85 - 20, y: window.innerHeight - 85 - 85 - 40, size: 85 };
        if (!TouchSettings.attackBtn) TouchSettings.attackBtn = { x: window.innerWidth - 85 - 20, y: window.innerHeight - 85 - 20, size: 85 };
        if (!TouchSettings.healthStatus) TouchSettings.healthStatus = { x: window.innerWidth - 260, y: 20, width: 260, height: 60 };
        // Clamp positions to current screen size
        const clamp = (val, max) => Math.max(0, Math.min(max, val));
        TouchSettings.leftBtn.x = clamp(TouchSettings.leftBtn.x, window.innerWidth - TouchSettings.leftBtn.size);
        TouchSettings.leftBtn.y = clamp(TouchSettings.leftBtn.y, window.innerHeight - TouchSettings.leftBtn.size);
        TouchSettings.rightBtn.x = clamp(TouchSettings.rightBtn.x, window.innerWidth - TouchSettings.rightBtn.size);
        TouchSettings.rightBtn.y = clamp(TouchSettings.rightBtn.y, window.innerHeight - TouchSettings.rightBtn.size);
        TouchSettings.jumpBtn.x = clamp(TouchSettings.jumpBtn.x, window.innerWidth - TouchSettings.jumpBtn.size);
        TouchSettings.jumpBtn.y = clamp(TouchSettings.jumpBtn.y, window.innerHeight - TouchSettings.jumpBtn.size);
        TouchSettings.attackBtn.x = clamp(TouchSettings.attackBtn.x, window.innerWidth - TouchSettings.attackBtn.size);
        TouchSettings.attackBtn.y = clamp(TouchSettings.attackBtn.y, window.innerHeight - TouchSettings.attackBtn.size);
        if (!TouchSettings.healthStatus.width) TouchSettings.healthStatus.width = 260;
        if (!TouchSettings.healthStatus.height) TouchSettings.healthStatus.height = 60;
        TouchSettings.healthStatus.x = clamp(TouchSettings.healthStatus.x, window.innerWidth - TouchSettings.healthStatus.width);
        TouchSettings.healthStatus.y = clamp(TouchSettings.healthStatus.y, window.innerHeight - TouchSettings.healthStatus.height);
        // Ensure sizes are set with defaults
        TouchSettings.leftBtn.size = TouchSettings.leftBtn.size || 60;
        TouchSettings.rightBtn.size = TouchSettings.rightBtn.size || 60;
        TouchSettings.jumpBtn.size = TouchSettings.jumpBtn.size || 85;
        TouchSettings.attackBtn.size = TouchSettings.attackBtn.size || 85;
    } else {
        // Set defaults based on current window
        const margin = 20;
        const jumpSize = 85;
        const attackSize = 85;
        TouchSettings = {
            jumpSize: 60,
            attackSize: 60,
            leftBtn: { x: margin, y: window.innerHeight - 120, size: 60 },
            rightBtn: { x: 90, y: window.innerHeight - 120, size: 60 },
            jumpBtn: {
                x: window.innerWidth - jumpSize - margin,
                y: window.innerHeight - jumpSize - attackSize - 2 * margin,
                size: jumpSize
            },
            attackBtn: {
                x: window.innerWidth - attackSize - margin,
                y: window.innerHeight - attackSize - margin,
                size: attackSize
            },
            healthStatus: {
                x: window.innerWidth - 260,
                y: 20,
                width: 260,
                height: 60
            }
        };
    }
    applyTouchSettings();

    // Add window resize listener to reposition buttons on screen size changes
    window.addEventListener('resize', () => {
        if (TouchSettings && GameState.gameActive) {
            // Only reposition if game is active to avoid interfering with menus
            setTimeout(() => {
                const margin = 20;
                const jumpSize = TouchSettings.jumpBtn.size || 85;
                const attackSize = TouchSettings.attackBtn.size || 85;

                TouchSettings.leftBtn.x = margin;
                TouchSettings.leftBtn.y = window.innerHeight - 120;

                TouchSettings.rightBtn.x = 90;
                TouchSettings.rightBtn.y = window.innerHeight - 120;

                TouchSettings.jumpBtn.x = window.innerWidth - jumpSize - margin;
                TouchSettings.jumpBtn.y = window.innerHeight - jumpSize - attackSize - 2 * margin;

                TouchSettings.attackBtn.x = window.innerWidth - attackSize - margin;
                TouchSettings.attackBtn.y = window.innerHeight - attackSize - margin;

                applyTouchSettings();
                saveTouchSettings();
            }, 100);
        }
    });
}

function saveTouchSettings() {
    localStorage.setItem('marioTouchSettings', JSON.stringify(TouchSettings));
    applyTouchSettings();
}

function openButtonCustomizer() {
    customizerSettings = JSON.parse(JSON.stringify(TouchSettings));

    const overlay = document.getElementById('buttonCustomizerOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    const areaWidth = window.innerWidth;
    const areaHeight = window.innerHeight;

    const buttons = [
        { id: 'custLeft', key: 'leftBtn', label: '◀' },
        { id: 'custRight', key: 'rightBtn', label: '▶' },
        { id: 'custJump', key: 'jumpBtn', label: 'JUMP' },
        { id: 'custAttack', key: 'attackBtn', label: 'STRIKE' },
        { id: 'custHealth', key: 'healthStatus', label: 'HEALTH' }
    ];

    buttons.forEach(btn => {
        const el = document.getElementById(btn.id);
        if (!el) return;
        const settings = customizerSettings[btn.key];
        if (!settings) return;

        const elWidth = btn.key === 'healthStatus' ? settings.width : settings.size;
        const elHeight = btn.key === 'healthStatus' ? settings.height : settings.size;
        const clampedX = Math.max(0, Math.min(areaWidth - elWidth, settings.x));
        const clampedY = Math.max(0, Math.min(areaHeight - elHeight, settings.y));
        el.style.left = clampedX + 'px';
        el.style.top = clampedY + 'px';
        el.style.width = elWidth + 'px';
        el.style.height = elHeight + 'px';
        if (btn.key === 'healthStatus') {
            el.innerHTML = '❤️❤️❤️❤️❤️ 🛡️🛡️';
        } else {
            el.textContent = btn.label;
        }

        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        el.onpointerdown = e => {
            e.preventDefault();
            dragging = true;
            offsetX = e.clientX - el.getBoundingClientRect().left;
            offsetY = e.clientY - el.getBoundingClientRect().top;
            el.setPointerCapture(e.pointerId);
        };

        el.onpointermove = e => {
            if (!dragging) return;
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            const maxX = areaWidth - el.offsetWidth;
            const maxY = areaHeight - el.offsetHeight;
            const limitedX = Math.max(0, Math.min(maxX, x));
            const limitedY = Math.max(0, Math.min(maxY, y));
            el.style.left = limitedX + 'px';
            el.style.top = limitedY + 'px';
            customizerSettings[btn.key].x = limitedX;
            customizerSettings[btn.key].y = limitedY;
        };

        el.onpointerup = e => {
            dragging = false;
            el.releasePointerCapture(e.pointerId);
        };

        el.onpointercancel = () => {
            dragging = false;
        };
    });

    document.getElementById('saveCustomizerBtn').onclick = () => {
        TouchSettings = JSON.parse(JSON.stringify(customizerSettings));
        saveTouchSettings();
        overlay.classList.add('hidden');
        applyTouchSettings();
    };

    document.getElementById('exitCustomizerBtn').onclick = () => {
        overlay.classList.add('hidden');
    };
}


function applyTouchSettings() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    const attackBtn = document.getElementById('attackBtn');

    const controls = document.querySelector('.controls');
    if (controls) {
        controls.style.left = '0';
        controls.style.bottom = '0';
        controls.style.width = '100vw';
        controls.style.height = '100vh';
        controls.style.display = 'block';
    }

    if (leftBtn) {
        leftBtn.style.position = 'absolute';
        leftBtn.style.left = `${TouchSettings.leftBtn.x}px`;
        leftBtn.style.top = `${TouchSettings.leftBtn.y}px`;
        leftBtn.style.width = `${TouchSettings.leftBtn.size}px`;
        leftBtn.style.height = `${TouchSettings.leftBtn.size}px`;
    }
    if (rightBtn) {
        rightBtn.style.position = 'absolute';
        rightBtn.style.left = `${TouchSettings.rightBtn.x}px`;
        rightBtn.style.top = `${TouchSettings.rightBtn.y}px`;
        rightBtn.style.width = `${TouchSettings.rightBtn.size}px`;
        rightBtn.style.height = `${TouchSettings.rightBtn.size}px`;
    }
    if (jumpBtn) {
        jumpBtn.style.position = 'absolute';
        jumpBtn.style.left = `${TouchSettings.jumpBtn.x}px`;
        jumpBtn.style.top = `${TouchSettings.jumpBtn.y}px`;
        jumpBtn.style.width = `${TouchSettings.jumpBtn.size}px`;
        jumpBtn.style.height = `${TouchSettings.jumpBtn.size}px`;
    }
    if (attackBtn) {
        attackBtn.style.position = 'absolute';
        attackBtn.style.left = `${TouchSettings.attackBtn.x}px`;
        attackBtn.style.top = `${TouchSettings.attackBtn.y}px`;
        attackBtn.style.width = `${TouchSettings.attackBtn.size}px`;
        attackBtn.style.height = `${TouchSettings.attackBtn.size}px`;
    }
    const healthStatus = document.getElementById('healthStatus');
    if (healthStatus) {
        healthStatus.style.position = 'absolute';
        healthStatus.style.left = `${TouchSettings.healthStatus.x}px`;
        healthStatus.style.top = `${TouchSettings.healthStatus.y}px`;
        healthStatus.style.width = `${TouchSettings.healthStatus.width}px`;
        healthStatus.style.height = `${TouchSettings.healthStatus.height}px`;
    }
}

function setupControlDrag() {
    const dragItems = ['leftBtn', 'rightBtn', 'jumpBtn', 'attackBtn', 'healthStatus'];
    dragItems.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        el.style.touchAction = 'none';

        el.addEventListener('pointerdown', e => {
            dragging = true;
            offsetX = e.clientX - el.getBoundingClientRect().left;
            offsetY = e.clientY - el.getBoundingClientRect().top;
            el.setPointerCapture(e.pointerId);
        });

        el.addEventListener('pointermove', e => {
            if (!dragging) return;
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            const limitedX = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, x));
            const limitedY = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, y));
            el.style.left = `${limitedX}px`;
            el.style.top = `${limitedY}px`;

            TouchSettings[id].x = limitedX;
            TouchSettings[id].y = limitedY;
        });

        el.addEventListener('pointerup', e => {
            dragging = false;
            el.releasePointerCapture(e.pointerId);
            saveTouchSettings();
        });
        el.addEventListener('pointercancel', () => {
            dragging = false;
        });
    });
}

function openTouchSettings() {
    const modal = document.getElementById('touchSettingsModal');
    if (modal) {
        modal.classList.remove('hidden');
        const customBtn = document.getElementById('openCustomizerBtn');
        if (customBtn) {
            customBtn.onclick = () => {
                modal.classList.add('hidden');
                openButtonCustomizer();
            };
        }
        const musicBtn = document.getElementById('openMusicBtn');
        if (musicBtn) {
            musicBtn.onclick = () => {
                modal.classList.add('hidden');
                openMusicSettings();
            };
        }

    }
}

function closeMusicSettings() {
    const modal = document.getElementById('musicSettingsModal');
    if (modal) modal.classList.add('hidden');
    // Perhaps save the audio files or something
}

function closeTouchSettings() {
    saveTouchSettings();
    const modal = document.getElementById('touchSettingsModal');
    if (modal) modal.classList.add('hidden');
}

function getRGBAnim(index) {
    let bg, anim;
    switch (index % 10 + 1) {
        case 1:
            bg = 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff0000)';
            anim = 'rgbShift1 3s ease-in-out infinite';
            break;
        case 2:
            bg = 'linear-gradient(90deg, #800080, #ff1493, #00ffff, #800080)';
            anim = 'rgbShift2 3s ease-in-out infinite';
            break;
        case 3:
            bg = 'linear-gradient(135deg, #ff4500, #ffff00, #32cd32, #ff4500)';
            anim = 'rgbShift3 4s ease-in-out infinite';
            break;
        case 4:
            bg = 'linear-gradient(0deg, #dc143c, #ff69b4, #1e90ff, #dc143c)';
            anim = 'rgbShift4 3s ease-in-out infinite';
            break;
        case 5:
            bg = 'linear-gradient(180deg, #ff6347, #ffd700, #adff2f, #ff6347)';
            anim = 'rgbShift5 2s ease-in-out infinite';
            break;
        case 6:
            bg = 'linear-gradient(225deg, #8a2be2, #da70d6, #40e0d0, #8a2be2)';
            anim = 'rgbShift6 5s linear infinite';
            break;
        case 7:
            bg = 'linear-gradient(270deg, #ff7f50, #ffa500, #00fa9a, #ff7f50)';
            anim = 'rgbShift7 3s ease-in-out infinite';
            break;
        case 8:
            bg = 'linear-gradient(315deg, #b22222, #ff00ff, #00bfff, #b22222)';
            anim = 'rgbShift8 4s ease-in-out infinite';
            break;
        case 9:
            bg = 'linear-gradient(45deg, #ff0000 0%, #00ff00 25%, #0000ff 50%, #ff0000 75%, #00ff00 100%)';
            anim = 'rgbShift9 3s ease-in-out infinite';
            break;
        case 10:
            bg = 'repeating-linear-gradient(45deg, #ff0000, #ff0000 10%, #00ff00 10%, #00ff00 20%, #0000ff 20%, #0000ff 30%)';
            anim = 'rgbShift10 3s ease-in-out infinite';
            break;
    }
    return { bg, anim };
}

function changeRGBAnim() {
    GameState.rgbAnimIndex = Math.floor(Math.random() * 10);
    const { bg, anim } = getRGBAnim(GameState.rgbAnimIndex);
    const container = document.getElementById('gameContainer');
    container.style.background = bg;
    container.style.backgroundSize = '400% 400%';
    container.style.animation = anim;
}

function openMusicSettings() {
    const modal = document.getElementById('musicSettingsModal');
    if (modal) {
        modal.classList.remove('hidden');
        const bgInput = document.getElementById('bgMusicInput');
        const clearBtn = document.getElementById('clearMusicBtn');
        
        // Function to update clear button visibility
        const updateClearButton = () => {
            if (bgInput && bgInput.files && bgInput.files.length > 0) {
                clearBtn.style.display = 'inline-block';
            } else {
                clearBtn.style.display = 'none';
            }
        };
        
        if (bgInput) {
            bgInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    const audio = document.getElementById('bgAudio');
                    audio.src = url;
                    audio.play();
                    // Perhaps save for session
                    sessionStorage.setItem('bgMusicURL', url);
                }
                updateClearButton();
            };
            
            // Clear button functionality
            if (clearBtn) {
                clearBtn.onclick = () => {
                    bgInput.value = '';
                    const audio = document.getElementById('bgAudio');
                    audio.src = '';
                    audio.pause();
                    sessionStorage.removeItem('bgMusicURL');
                    updateClearButton();
                };
            }
        }
        
        // Load if saved and update button visibility
        const savedURL = sessionStorage.getItem('bgMusicURL');
        if (savedURL) {
            const audio = document.getElementById('bgAudio');
            audio.src = savedURL;
            audio.play();
        }
        
        // Initial button visibility check
        updateClearButton();
    }
}

function updatePreview() {
    const preview = document.getElementById('controlsPreview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    // Left button
    const leftBtn = document.createElement('div');
    leftBtn.style.cssText = `position:absolute;left:10px;bottom:10px;width:45px;height:45px;background:#333;border:1px solid #555;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;`;
    leftBtn.innerText = '◀';
    preview.appendChild(leftBtn);
    
    // Right button
    const rightBtn = document.createElement('div');
    rightBtn.style.cssText = `position:absolute;right:10px;bottom:10px;width:45px;height:45px;background:#333;border:1px solid #555;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;`;
    rightBtn.innerText = '▶';
    preview.appendChild(rightBtn);
    
    // Jump button
    const jumpBtn = document.createElement('div');
    jumpBtn.style.cssText = `position:absolute;right:${60 + 10}px;bottom:10px;width:${TouchSettings.jumpSize}px;height:${TouchSettings.jumpSize}px;background:#0066cc;border:2px solid #00aaff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#00aaff;font-size:12px;font-weight:bold;`;
    jumpBtn.innerText = 'JUMP';
    preview.appendChild(jumpBtn);
    
    // Attack button
    const attackBtn = document.createElement('div');
    attackBtn.style.cssText = `position:absolute;right:10px;top:10px;width:${TouchSettings.attackSize}px;height:${TouchSettings.attackSize}px;background:#cc0000;border:2px solid #ff0000;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#ff0000;font-size:12px;font-weight:bold;`;
    attackBtn.innerText = 'STRIKE';
    preview.appendChild(attackBtn);
}

/* ============================================
   GAME INITIALIZATION
   ============================================ */
function initGame() {
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('persistentUI').style.display = 'block';
    const healthStatus = document.getElementById('healthStatus');
    if (healthStatus) healthStatus.style.display = 'flex';
    
    if (!GameState.isRGB) {
        const theme = THEMES.find(t => t.name === GameState.selectedTheme);
        document.getElementById('gameContainer').style.background = theme.bg;
    } else {
        GameState.rgbAnimIndex = 0;
        const container = document.getElementById('gameContainer');
        container.style.background = 'linear-gradient(135deg, #330011 0%, #331100 20%, #003300 40%, #003366 60%, #330033 80%, #330011 100%)';
        container.style.backgroundSize = '100% 100%';
        container.style.animation = 'none';
        // Clear any existing interval
        if (GameState.rgbAnimInterval) {
            clearInterval(GameState.rgbAnimInterval);
            GameState.rgbAnimInterval = null;
        }
    }
    
    document.getElementById('curWep').innerText = HEROES.find(h => h.name === GameState.selectedHero).weapon;
    GameState.audio.playBg();
    resetGame();
}

function resetGame() {
    // Cancel any existing animation frame
    if (GameState.animationFrameId) {
        cancelAnimationFrame(GameState.animationFrameId);
        GameState.animationFrameId = null;
    }
    
    // Clear RGB animation interval
    if (GameState.rgbAnimInterval) {
        clearInterval(GameState.rgbAnimInterval);
        GameState.rgbAnimInterval = null;
    }
    GameState.rgbAnimIndex = 0;
    
    const dpr = window.devicePixelRatio || 1;
    GameState.width = window.innerWidth;
    GameState.height = window.innerHeight;

    GameState.canvas.style.width = `${GameState.width}px`;
    GameState.canvas.style.height = `${GameState.height}px`;
    GameState.canvas.width = Math.floor(GameState.width * dpr);
    GameState.canvas.height = Math.floor(GameState.height * dpr);
    GameState.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Scale viewport for easier mobile visibility
    if (GameState.width < 600) {
        GameState.zoom = 0.6;
    } else if (GameState.width < 900) {
        GameState.zoom = 0.75;
    } else {
        GameState.zoom = 1;
    }

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

    // Initialize health UI
    updateHealthUI();

    // Ensure all 5 enemy types appear at least once in each run
    spawnInitialEnemies();

    GameState.animationFrameId = requestAnimationFrame(gameLoop);
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
        if (e.code === 'KeyE') {
            GameState.player.isFiring = !GameState.player.isFiring;
            if (GameState.player.isFiring) handleAttack();
        }
    };
    window.onkeyup = (e) => {
        GameState.keys[e.code] = false;
        // Keep auto mode style: no release to stop firing
    };

    // Touch controls using pointer events for better mobile support
    bindPointerButton('leftBtn', 'ArrowLeft');
    bindPointerButton('rightBtn', 'ArrowRight');
    bindPointerButton('jumpBtn', 'jump');
    bindPointerButton('attackBtn', 'attack');
}

function bindPointerButton(id, action) {
    const el = document.getElementById(id);
    if (!el) return;
    el.onpointerdown = (e) => {
        e.preventDefault();
        if (action === 'ArrowLeft' || action === 'ArrowRight') {
            GameState.keys[action] = true;
        } else if (action === 'jump') {
            handleJump();
        } else if (action === 'attack') {
            GameState.player.isFiring = !GameState.player.isFiring;
            if (GameState.player.isFiring) handleAttack();
        }
    };
    el.onpointerup = (e) => {
        e.preventDefault();
        if (action === 'ArrowLeft' || action === 'ArrowRight') {
            GameState.keys[action] = false;
        }
        // For jump and attack, no release action
    };
    el.onpointercancel = (e) => {
        if (action === 'ArrowLeft' || action === 'ArrowRight') {
            GameState.keys[action] = false;
        }
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
        // Faster cooldown for Ninja for continuous attacks
        GameState.player.atkCooldown = GameState.player.name === 'Ninja' ? CONFIG.WEAPON.ATTACK_COOLDOWN * 0.3 : CONFIG.WEAPON.ATTACK_COOLDOWN * 0.5;
        GameState.audio.playKatana();
        GameState.player.isFiring = true;
    } else if (['Pistol','Assault Rifle','Ice Powers','M416','Fire Powers','Triple Barrel Gun'].includes(hero.weapon)) {
        if (!GameState.player.isFiring) {
            if (hero.weapon === 'M416') {
                // Machine gun: faster rate
                GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
                GameState.player.gunFlash = 0.1;
                GameState.player.atkCooldown = CONFIG.WEAPON.ATTACK_COOLDOWN * 0.2;
            } else if (hero.weapon === 'Fire Powers') {
                // Fire: shoots from both sides
                GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, -1));
                GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, 1));
                GameState.player.gunFlash = 0.1;
                GameState.player.atkCooldown = CONFIG.WEAPON.ATTACK_COOLDOWN * 0.25;
            } else if (hero.weapon === 'Triple Barrel Gun') {
                // Alien: shoots in 3 directions
                GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
                GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir, -0.4));
                GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir, 0.4));
                GameState.player.gunFlash = 0.1;
                GameState.player.atkCooldown = CONFIG.WEAPON.ATTACK_COOLDOWN * 0.15; // faster alien fire
            } else {
                // Pistol, Assault Rifle, Ice Powers
                GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
                GameState.player.gunFlash = 0.1;
                GameState.player.atkCooldown = (hero.weapon === 'Assault Rifle' || hero.weapon === 'Ice Powers') ? CONFIG.WEAPON.ATTACK_COOLDOWN * 0.2 : CONFIG.WEAPON.ATTACK_COOLDOWN;
            }
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
        b.y += (b.dy || 0) * dt;
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

            // Damage system: Shield takes damage first, then health
            if (GameState.player.invincibleTime <= 0) {
                if (GameState.player.shield > 0) {
                    GameState.player.shield--;
                    
                    // Special invincibility times for certain heroes
                    if (GameState.player.name === 'Ice') {
                        GameState.player.invincibleTime = 2; // Ice gets 2s invincibility when shield breaks
                    } else {
                        GameState.player.invincibleTime = 1; // Normal heroes get 1s
                    }
                    
                    GameState.player.dy = -300; // Bounce back
                    updateHealthUI(); // Update the UI
                } else if (GameState.player.health > 0) {
                    GameState.player.health--;
                    GameState.player.invincibleTime = 1; // Brief invincibility after health damage
                    GameState.player.dy = -300; // Bounce back
                    updateHealthUI(); // Update the UI
                    
                    // Game over if health reaches 0
                    if (GameState.player.health <= 0) {
                        endGame();
                    }
                }
            }
        }
    });

    GameState.enemyProjectiles = GameState.enemyProjectiles.filter(ep => ep.life > 0);
    GameState.enemyProjectiles.forEach(ep => (ep.life -= dt));
}

function updateEnemies(dt) {
    GameState.enemies.forEach(en => {
        if (!en.alive) return;

        // Katana damage - enhanced for Ninja
        if (GameState.player.slash > 0 && Math.abs(GameState.player.x - en.x) < 95 && Math.abs(GameState.player.y - en.y) < 55) {
            if (GameState.player.name === 'Ninja') {
                // Ninja gets instant kill with extra score bonus
                en.alive = false;
                GameState.score += CONFIG.SCORE.BULLET_KILL * 3; // 3x bonus for Ninja
                GameState.audio.playKatana();
            } else {
                en.alive = false;
                GameState.score += CONFIG.SCORE.BULLET_KILL;
            }
        }

        // Enemy collision with player
        if (GameState.player.x < en.x + en.w && GameState.player.x + GameState.player.w > en.x &&
            GameState.player.y < en.y + en.h && GameState.player.y + GameState.player.h > en.y) {
            if (GameState.player.dy > 10) {
                en.alive = false;
                GameState.player.dy = -600;
                GameState.score += CONFIG.SCORE.STOMP_KILL;
            } else {
                // Damage system: Shield takes damage first, then health
                if (GameState.player.invincibleTime <= 0) {
                    if (GameState.player.shield > 0) {
                        GameState.player.shield--;
                        
                        // Special invincibility times for certain heroes
                        if (GameState.player.name === 'Ice') {
                            GameState.player.invincibleTime = 2; // Ice gets 2s invincibility when shield breaks
                        } else {
                            GameState.player.invincibleTime = 1; // Normal heroes get 1s
                        }
                        
                        GameState.player.dy = -300; // Bounce back
                        updateHealthUI(); // Update the UI
                    } else if (GameState.player.health > 0) {
                        GameState.player.health--;
                        GameState.player.invincibleTime = 1; // Brief invincibility after health damage
                        GameState.player.dy = -300; // Bounce back
                        updateHealthUI(); // Update the UI
                        
                        // Game over if health reaches 0
                        if (GameState.player.health <= 0) {
                            endGame();
                        }
                    }
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

function updateHealthUI() {
    const healthStatus = document.getElementById('healthStatus');
    if (!healthStatus || !GameState.player) return;
    
    let hearts = '';
    let shields = '';
    
    for (let i = 0; i < GameState.player.health; i++) {
        hearts += '❤️';
    }
    
    for (let i = 0; i < GameState.player.shield; i++) {
        shields += '🛡️';
    }
    
    healthStatus.innerHTML = hearts + (shields ? ' ' + shields : '');
}

function updateCamera() {
    const visibleWidth = GameState.width / GameState.zoom;
    const padding = visibleWidth * 0.35;
    GameState.cameraX += (GameState.player.x - GameState.cameraX - padding) * 0.1;

    // enforce left border
    if (GameState.cameraX < 0) GameState.cameraX = 0;
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
    document.getElementById('persistentUI').style.display = 'none';
    const healthStatus = document.getElementById('healthStatus');
    if (healthStatus) healthStatus.style.display = 'none';

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

function restartGame() {
    // Cancel any existing animation frame
    if (GameState.animationFrameId) {
        cancelAnimationFrame(GameState.animationFrameId);
        GameState.animationFrameId = null;
    }
    
    // Reset game state
    GameState.gameActive = false;
    document.getElementById('menu').style.display = 'none';
    
    // Reinitialize the game
    initGame();
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
        if (hero.weapon === 'Katana') {
            GameState.player.slash = CONFIG.WEAPON.KATANA_DURATION;
            GameState.player.slashAngle = 0;
            GameState.player.atkCooldown = GameState.player.name === 'Ninja' ? CONFIG.WEAPON.ATTACK_COOLDOWN * 0.3 : CONFIG.WEAPON.ATTACK_COOLDOWN * 0.5;
            GameState.audio.playKatana();
        } else if (hero.weapon === 'Pistol' || hero.weapon === 'Assault Rifle' || hero.weapon === 'Ice Powers' || hero.weapon === 'M416') {
            GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
            GameState.player.gunFlash = 0.1;
            GameState.player.atkCooldown = (hero.weapon === 'Assault Rifle' || hero.weapon === 'Ice Powers' || hero.weapon === 'M416') ? CONFIG.WEAPON.ATTACK_COOLDOWN * 0.2 : CONFIG.WEAPON.ATTACK_COOLDOWN;
            GameState.audio.playBullet();
        } else if (hero.weapon === 'Fire Powers') {
            GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, -1));
            GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, 1));
            GameState.player.gunFlash = 0.1;
            GameState.player.atkCooldown = CONFIG.WEAPON.ATTACK_COOLDOWN * 0.25;
            GameState.audio.playBullet();
        } else if (hero.weapon === 'Triple Barrel Gun') {
            GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir));
            GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir, -0.4));
            GameState.bullets.push(createBullet(GameState.player.x, GameState.player.y, GameState.player.dir, 0.4));
            GameState.player.gunFlash = 0.1;
            GameState.player.atkCooldown = CONFIG.WEAPON.ATTACK_COOLDOWN * 0.15;
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
    if (GameState.gameActive) {
        GameState.animationFrameId = requestAnimationFrame(gameLoop);
    }
}

/* ============================================
   RENDERING
   ============================================ */
function draw() {
    GameState.ctx.clearRect(0, 0, GameState.width, GameState.height);
    GameState.ctx.save();

    // Zoom out for smaller screens while keeping world coordinate logic the same
    GameState.ctx.scale(GameState.zoom, GameState.zoom);
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
            GameState.ctx.fillStyle = '#111';
            GameState.ctx.fillRect(p.x, p.y, p.w, p.h);
            GameState.ctx.fillStyle = `hsl(${GameState.rgbHue}, 100%, 60%)`;
            GameState.ctx.fillRect(p.x, p.y, p.w, 25);
        } else {
            GameState.ctx.fillStyle = GameState.selectedTheme === 'Night' ? '#1e293b' : '#5d4037';
            GameState.ctx.fillRect(p.x, p.y, p.w, p.h);
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
        if (GameState.isRGB) {
            GameState.ctx.fillStyle = `hsl(${GameState.rgbHue + 120}, 100%, 50%)`; // Different hue for enemy
            GameState.ctx.strokeStyle = `hsl(${GameState.rgbHue + 120}, 100%, 70%)`;
        } else if (ep.isIce) {
            // Draw ice projectile
            GameState.ctx.fillStyle = '#a5f3fc';
            GameState.ctx.strokeStyle = '#00d4ff';
        } else {
            GameState.ctx.fillStyle = '#ff6b6b';
            GameState.ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
        }
        GameState.ctx.beginPath();
        GameState.ctx.arc(ep.x, ep.y, ep.w / 2, 0, Math.PI * 2);
        GameState.ctx.fill();
        GameState.ctx.lineWidth = 2;
        GameState.ctx.stroke();
    });
}

function drawBullets() {
    GameState.bullets.forEach(b => {
        if (GameState.isRGB) {
            GameState.ctx.fillStyle = `hsl(${GameState.rgbHue}, 100%, 50%)`;
        } else {
            const isIce = GameState.player.weapon === 'Ice Powers';
            GameState.ctx.fillStyle = isIce ? '#ffffff' : 'yellow';
        }
        GameState.ctx.fillRect(b.x, b.y, b.w, b.h);

        if (GameState.isRGB) {
            GameState.ctx.fillStyle = `hsla(${GameState.rgbHue}, 100%, 50%, 0.5)`;
        } else {
            const isIce = GameState.player.weapon === 'Ice Powers';
            GameState.ctx.fillStyle = isIce ? 'rgba(200, 255, 255, 0.5)' : 'rgba(255, 255, 0, 0.3)';
        }
        GameState.ctx.fillRect(b.x - 10, b.y, 10, b.h);
    });
}

function drawPlayer() {
    GameState.ctx.save();
    GameState.ctx.translate(GameState.player.x + GameState.player.w / 2, GameState.player.y + GameState.player.h);
    GameState.ctx.scale(2 - GameState.player.stretch, GameState.player.stretch);

    // Invincibility visual effect - flashing
    if (GameState.player.invincibleTime > 0) {
        const flashSpeed = 10;
        const flashOpacity = Math.sin(GameState.player.invincibleTime * flashSpeed) * 0.3 + 0.7;
        GameState.ctx.globalAlpha = flashOpacity;
    }

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

        // All hero shields with custom colors
        if ((GameState.player.name === 'Ice' || GameState.player.name === 'Machine' || GameState.player.name === 'Fire' || GameState.player.name === 'Alien') && GameState.player.shield > 0) {
            let shieldColor = '#a5f3fc'; // Ice - cyan
            if (GameState.player.name === 'Machine') shieldColor = '#000000'; // black
            else if (GameState.player.name === 'Fire') shieldColor = '#ff0000'; // red
            else if (GameState.player.name === 'Alien') shieldColor = '#00ff00'; // green
            GameState.ctx.strokeStyle = shieldColor;
            GameState.ctx.lineWidth = 3;
            GameState.ctx.strokeRect(-GameState.player.w / 2 - 5, -GameState.player.h - 5, GameState.player.w + 10, GameState.player.h + 10);
        }
    }

    drawWeapon();

    GameState.ctx.fillStyle = '#000';
    GameState.ctx.fillRect(GameState.player.dir === 1 ? 5 : -11, -GameState.player.h + 15, 6, 6);

    // Reset invincibility alpha
    if (GameState.player.invincibleTime > 0) {
        GameState.ctx.globalAlpha = 1;
    }

    GameState.ctx.restore();
}

function drawWeapon() {
    if (GameState.player.weapon === 'Katana') {
        const weaponOffsetX = GameState.player.dir * 15 - GameState.player.w / 2;
        const weaponOffsetY = -GameState.player.h - 10;
        const arcBaseX = GameState.player.dir * 20 - GameState.player.w / 2;
        const arcBaseY = -GameState.player.h - 15;

        if (GameState.player.slash > 0) {
            const progress = 1 - (GameState.player.slash / CONFIG.WEAPON.KATANA_DURATION);
            
            // Slash arc trail for professional effect
            if (GameState.player.name === 'Ninja') {
                // Multiple arc trails
                for (let i = 0; i < 3; i++) {
                    GameState.ctx.strokeStyle = `rgba(255, 50, 150, ${(GameState.player.slash - i * 0.05) * (2 - i * 0.3)})`;
                    GameState.ctx.lineWidth = 4 - i;
                    GameState.ctx.beginPath();
                    const radius = 45 + i * 8;
                    GameState.ctx.arc(arcBaseX, arcBaseY, radius, 
                        GameState.player.dir === 1 ? -Math.PI/2 + progress * Math.PI : Math.PI/2 - progress * Math.PI,
                        GameState.player.dir === 1 ? Math.PI/2 + progress * Math.PI : 3*Math.PI/2 - progress * Math.PI);
                    GameState.ctx.stroke();
                }
            }
            
            GameState.ctx.save();
            GameState.ctx.translate(weaponOffsetX, weaponOffsetY);
            GameState.ctx.rotate(GameState.player.dir === 1 ? GameState.player.slashAngle : -GameState.player.slashAngle);
            
            // Professional blade with tapered design
            if (GameState.player.name === 'Ninja') {
                // Ninja blade - crimson with gradient effect
                GameState.ctx.fillStyle = '#cc0033';
                GameState.ctx.beginPath();
                GameState.ctx.moveTo(0, -45);
                GameState.ctx.lineTo(8, -40);
                GameState.ctx.lineTo(6, 35);
                GameState.ctx.lineTo(0, 40);
                GameState.ctx.closePath();
                GameState.ctx.fill();
                
                // Bright edge highlight
                GameState.ctx.fillStyle = '#ff6699';
                GameState.ctx.beginPath();
                GameState.ctx.moveTo(2, -42);
                GameState.ctx.lineTo(4, -40);
                GameState.ctx.lineTo(3, 35);
                GameState.ctx.lineTo(1, 37);
                GameState.ctx.closePath();
                GameState.ctx.fill();
                
                // Dark shadow edge
                GameState.ctx.fillStyle = '#660011';
                GameState.ctx.beginPath();
                GameState.ctx.moveTo(6, -40);
                GameState.ctx.lineTo(7, -38);
                GameState.ctx.lineTo(5.5, 37);
                GameState.ctx.lineTo(4.5, 39);
                GameState.ctx.closePath();
                GameState.ctx.fill();
                
                // Intense slash glow
                GameState.ctx.shadowBlur = 20;
                GameState.ctx.shadowColor = `rgba(255, 50, 150, ${GameState.player.slash * 4})`;
                GameState.ctx.strokeStyle = `rgba(255, 100, 200, ${GameState.player.slash * 3})`;
                GameState.ctx.lineWidth = 8;
                GameState.ctx.beginPath();
                GameState.ctx.moveTo(4, -40);
                GameState.ctx.quadraticCurveTo(15, 0, 4, 35);
                GameState.ctx.stroke();
            } else {
                // Regular blade
                GameState.ctx.fillStyle = '#d0d0d0';
                GameState.ctx.beginPath();
                GameState.ctx.moveTo(0, -45);
                GameState.ctx.lineTo(7, -40);
                GameState.ctx.lineTo(5, 35);
                GameState.ctx.lineTo(0, 40);
                GameState.ctx.closePath();
                GameState.ctx.fill();
                
                // Shine
                GameState.ctx.fillStyle = '#ffffff';
                GameState.ctx.beginPath();
                GameState.ctx.moveTo(1, -42);
                GameState.ctx.lineTo(3, -40);
                GameState.ctx.lineTo(2, 35);
                GameState.ctx.lineTo(0, 37);
                GameState.ctx.closePath();
                GameState.ctx.fill();
            }
            
            GameState.ctx.restore();
        } else {
            // Resting position - sheathed
            const weaponOffsetX = GameState.player.dir * 15 - GameState.player.w / 2;
            const weaponOffsetY = -GameState.player.h - 5;
            GameState.ctx.save();
            GameState.ctx.translate(weaponOffsetX, weaponOffsetY);
            
            if (GameState.player.name === 'Ninja') {
                // Sheath - black with gold accent
                GameState.ctx.fillStyle = '#0a0a0a';
                GameState.ctx.fillRect(GameState.player.dir * -2, -35, 8, 45);
                GameState.ctx.strokeStyle = '#ffd700';
                GameState.ctx.lineWidth = 2;
                GameState.ctx.strokeRect(GameState.player.dir * -2, -35, 8, 45);
                
                // Blade peeking
                GameState.ctx.fillStyle = '#cc0033';
                GameState.ctx.fillRect(GameState.player.dir * 2, -37, 4, 50);
                GameState.ctx.fillStyle = '#ff6699';
                GameState.ctx.fillRect(GameState.player.dir * 3, -36, 1.5, 48);
                
                // Handle - premium look
                GameState.ctx.fillStyle = '#1a1a1a';
                GameState.ctx.fillRect(GameState.player.dir * 1, 8, 6, 12);
                GameState.ctx.fillStyle = '#ffd700';
                GameState.ctx.beginPath();
                GameState.ctx.arc(GameState.player.dir * 4, 14, 3.5, 0, Math.PI * 2);
                GameState.ctx.fill();
                GameState.ctx.strokeStyle = '#ffed4e';
                GameState.ctx.lineWidth = 1;
                GameState.ctx.stroke();
            } else {
                // Regular resting
                GameState.ctx.fillStyle = '#b0b0b0';
                GameState.ctx.fillRect(GameState.player.dir * -2, -35, 8, 45);
                GameState.ctx.fillStyle = '#ffffff';
                GameState.ctx.fillRect(GameState.player.dir * 1, -35, 2, 45);
                GameState.ctx.fillStyle = '#707070';
                GameState.ctx.fillRect(GameState.player.dir * 5, -35, 1, 45);
                
                GameState.ctx.fillStyle = '#ffd700';
                GameState.ctx.fillRect(GameState.player.dir * 0, 8, 8, 5);
                GameState.ctx.fillStyle = '#8b4513';
                GameState.ctx.fillRect(GameState.player.dir * 1, 13, 6, 10);
            }
            GameState.ctx.restore();
        }
    } else if (GameState.player.weapon === 'Ice Powers') {
        // Ice gun - frosty blue design
        GameState.ctx.fillStyle = '#a5f3fc';
        GameState.ctx.fillRect(GameState.player.dir * 14, -30, 32, 10);
        GameState.ctx.fillStyle = '#e0f7ff';
        GameState.ctx.fillRect(GameState.player.dir * 16, -28, 28, 6);
        GameState.ctx.fillStyle = '#00d4ff';
        GameState.ctx.fillRect(GameState.player.dir * 45, -29, 6, 8);
        // Muzzle glow
        if (GameState.player.gunFlash > 0) {
            GameState.ctx.fillStyle = `rgba(165, 243, 252, ${GameState.player.gunFlash * 8})`;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * (15 + 18), -24, 8, 0, Math.PI * 2);
            GameState.ctx.fill();
        }
    } else if (GameState.player.weapon === 'Fire Powers') {
        // Fire hero: both hand red flame pistols
        const xBase = GameState.player.dir === 1 ? 8 : -28;
        // left hand barrel
        GameState.ctx.fillStyle = '#ff4500';
        GameState.ctx.fillRect(GameState.player.dir * (xBase - 8), -30, 18, 8);
        GameState.ctx.fillStyle = '#ff0000';
        GameState.ctx.fillRect(GameState.player.dir * (xBase - 8), -32, 18, 4);
        // right hand barrel
        GameState.ctx.fillStyle = '#ff4500';
        GameState.ctx.fillRect(GameState.player.dir * (xBase + 24), -30, 18, 8);
        GameState.ctx.fillStyle = '#ff0000';
        GameState.ctx.fillRect(GameState.player.dir * (xBase + 24), -32, 18, 4);

        // propellant glow
        if (GameState.player.gunFlash > 0) {
            GameState.ctx.fillStyle = `rgba(255, 100, 0, ${GameState.player.gunFlash * 9})`;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * (xBase + 30), -26, 10, 0, Math.PI * 2);
            GameState.ctx.fill();
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

        if (GameState.player.weapon === 'Triple Barrel Gun') {
            // Alien triple-barrel big gun
            // Main body
            GameState.ctx.fillStyle = '#1a1a1a';
            GameState.ctx.fillRect(GameState.player.dir * 10, -32, 50, 14);
            GameState.ctx.fillStyle = '#333';
            GameState.ctx.fillRect(GameState.player.dir * 10, -32, 50, 4);
            // Three barrels - top, middle, bottom
            GameState.ctx.fillStyle = '#222';
            GameState.ctx.fillRect(GameState.player.dir * 14, -38, 40, 5); // top barrel
            GameState.ctx.fillRect(GameState.player.dir * 14, -28, 40, 5); // middle barrel
            GameState.ctx.fillRect(GameState.player.dir * 14, -18, 40, 5); // bottom barrel
            // Barrel tips - glowing alien green
            GameState.ctx.fillStyle = '#00ff00';
            GameState.ctx.fillRect(GameState.player.dir * 54, -37, 4, 4);
            GameState.ctx.fillRect(GameState.player.dir * 54, -27, 4, 4);
            GameState.ctx.fillRect(GameState.player.dir * 54, -17, 4, 4);
            // Stock
            GameState.ctx.fillStyle = '#1a1a1a';
            GameState.ctx.fillRect(GameState.player.dir * -5, -28, 15, 10);
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
    } else if (GameState.player.weapon === 'M416') {
        // M416 Machine Gun visual
        GameState.ctx.fillStyle = '#292929';
        GameState.ctx.fillRect(GameState.player.dir * 10, -32, 55, 12);
        GameState.ctx.fillStyle = '#404040';
        GameState.ctx.fillRect(GameState.player.dir * 12, -30, 50, 8);
        GameState.ctx.fillStyle = '#666666';
        GameState.ctx.fillRect(GameState.player.dir * 57, -31, 10, 14);
        GameState.ctx.fillStyle = '#2a2a2a';
        GameState.ctx.fillRect(GameState.player.dir * 10, -22, 30, 14);
        GameState.ctx.fillStyle = '#1e1e1e';
        GameState.ctx.fillRect(GameState.player.dir * 8, -12, 14, 24);
        GameState.ctx.fillStyle = '#333333';
        GameState.ctx.fillRect(GameState.player.dir * -5, -25, 15, 10);
        GameState.ctx.fillStyle = '#222222';
        GameState.ctx.fillRect(GameState.player.dir * 12, 5, 8, 15);
        // Muzzle flash
        if (GameState.player.gunFlash > 0) {
            const flashSize = (1 - GameState.player.gunFlash / 0.1) * 32;
            GameState.ctx.fillStyle = `rgba(255, 200, 0, ${GameState.player.gunFlash * 8})`;
            GameState.ctx.beginPath();
            GameState.ctx.arc(GameState.player.dir * (16 + 22), -23, flashSize, 0, Math.PI * 2);
            GameState.ctx.fill();
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
        applyTouchSettings(); // Reposition buttons on orientation change
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
    
    // Hide persistent UI initially
    document.getElementById('persistentUI').style.display = 'none';
    
    loadHiScore();
    renderMenus();
    renderHeroPreview();
    renderEnemyInfo();
    document.getElementById('changeHeroBtn').onclick = openHeroSelection;
    document.getElementById('closeHeroSelectionBtn').onclick = closeHeroSelection;
    document.getElementById('toggleEnemyInfoBtn').onclick = toggleEnemyInfo;
    loadTouchSettings();
    setupInputBindings();
    // Removed setupControlDrag from here to prevent dragging during gameplay
});
