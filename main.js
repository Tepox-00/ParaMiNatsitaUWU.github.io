const state = {
    scene: 0, 
    msgIndex: 0,
    survivalEndIndex: 0,
    interludeIndex: 0,
    musicIndex: 1,
    keys: { w:false, a:false, s:false, d:false, space:false, shift:false },
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

let typingTimeout = null;

const ASSETS = {
    audio: (i) => `assets/audio/musica/${i}.mp3`,
    imgInicio: (i) => `assets/img/inicio/${i}.png`, 
    imgViaje: (i) => `assets/img/viaje/${i}.png`,
    player: 'assets/img/player/astronauta.png'
};

const audioPlayer = document.getElementById('bg-music');

// --- DATOS DE HISTORIA ---
const introData = [
    { text: "Primero que nada quiero desearte que tengas un buen día hoy, ya que es fin de semana espero puedas descansar aprovechando tu sábado :3, AHORA CII, Queria decirte que FELIZ 14 DE FEBRERO 💜💜💜, FELIZ DIA DEL AMOR Y LA AMISTAD PQ YO A TI TE AMO MUCHITO 💜💜💜💜, ¿Quieres ver el pequeño regalo que te hice :3?", img: 0, type: 'ask' },
    { text: "Me hubiera gustado enviarte otro ramote pero la vrd no tengo mucho dinero ahora, entonces solo puedo darte una paginita :( y tal vez un sushi :3 💜. pero ahora si, quieres avanzar a ver lo que hice? 💜💜💜", img: 1, type: 'ask' },
    { text: "Hace mucho mucho tiempo, en un planeta muy muy lejano, un pequeño astronauta se preparaba para viajar a las estrellas.", img: 2, type: 'story' },
    { text: "El astronauta con código T.P.X. había escuchado de una formación estelar única, una nebulosa justo en los limites de su galaxia.", img: 3, type: 'story' },
    { text: "Emprendió un viaje hacia el horizonte... sin embargo, se quedó sin recursos y aterrizó en un planeta desconocido.", img: 4, type: 'story' }
];

const survivalEndData = [
    { text: "Después de un gran esfuerzo, T.P.X. logró reunir los recursos suficientes para continuar su viaje.", img: 5 },
    { text: "T.P.X. subió a su nave y siguió su camino, debia llegar a aquel lugar que tanto buscaba...", img: 6 },
    { text: "Sin embargo, las cosas estaban por complicarse. T.P.X. se encontraba entrando a un gran cinturón de asteroides.", img: 7 }
];

const interludeData = [
    { text: "Y al final T.P.X. lo logró, atravesó el cinturón de asteroides. Estaba tan cerca que ya podía ver la gran nebulosa.", img: 8 },
    { text: "Frente a él, la nebulosa brillaba con colores imposibles. Era más hermosa de lo que imaginó.", img: 9 },
    { text: "T.P.X. activó el salto al hiperespacio para acercarse lo más posible a ella...", img: 10 }
];

// --- INICIO Y NAVEGACIÓN ---
window.onload = () => {
    loadSceneIntro();
    setupInputs();
    if(state.isMobile) document.getElementById('mobile-controls').classList.remove('hidden');
};

function changeMusic(index) {
    audioPlayer.src = ASSETS.audio(index);
    audioPlayer.volume = 0.5;
    audioPlayer.play().catch(() => console.log("Click para audio"));
}

function typeWriter(element, text, i, speed, callback) {
    if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        typingTimeout = setTimeout(() => typeWriter(element, text, i, speed, callback), speed);
    } else if (callback) callback();
}

const introImg = document.getElementById('intro-img');
const introText = document.getElementById('intro-text');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnNext = document.getElementById('btn-next');
const buttonsContainer = document.getElementById('intro-buttons');

function loadSceneIntro() {
    changeMusic(1);
    updateIntroDialog();
    btnNo.addEventListener('mouseover', moveNoButton);
    btnNo.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); });
    btnYes.addEventListener('click', nextDialog);
    btnNext.addEventListener('click', nextDialog);
}

function moveNoButton() {
    const x = Math.random() * (buttonsContainer.clientWidth - 60) - (buttonsContainer.clientWidth/2 - 30);
    const y = Math.random() * 60 - 30;
    btnNo.style.transform = `translate(${x}px, ${y}px)`;
}

function updateIntroDialog() {
    const data = introData[state.msgIndex];
    introImg.src = ASSETS.imgInicio(data.img);
    introText.innerHTML = "";
    if (typingTimeout) clearTimeout(typingTimeout);
    [btnYes, btnNo, btnNext].forEach(b => b.classList.add('hidden'));
    btnNo.style.transform = 'translate(0,0)';

    typeWriter(introText, data.text, 0, 30, () => {
        if(data.type === 'ask') { btnYes.classList.remove('hidden'); btnNo.classList.remove('hidden'); }
        else { btnNext.classList.remove('hidden'); }
    });
}

function nextDialog() {
    state.msgIndex++;
    if(state.msgIndex < introData.length) updateIntroDialog();
    else {
        document.getElementById('scene-intro').classList.remove('active');
        document.getElementById('scene-survival').classList.add('active');
        changeMusic(2);
        initSurvivalGame();
    }
}

// --- MINIJUEGO 1: SURVIVAL ---
let survLoop;
function initSurvivalGame() {
    const canvas = document.getElementById('canvas-survival');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const player = { x: canvas.width/2, y: canvas.height/2, w: 32, h: 36, speed: 2.5, hp: 5, dir: {x:0, y:1}, dashCd: 0, facing: 1 };
    const enemies = [];
    const items = [];
    let collectedCount = 0;
    let attackAnim = 0;
    let spawnTimer = 0;

    for(let i=0; i<8; i++) items.push({ x: Math.random()*(canvas.width-60)+30, y: Math.random()*(canvas.height-60)+30, collected: false });

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let moveSpeed = player.speed;
        if(state.keys.shift && player.dashCd <= 0) { moveSpeed = 15; player.dashCd = 20; }
        if(player.dashCd > 0) player.dashCd--;

        if(state.keys.w) { player.y -= moveSpeed; player.dir = {x:0, y:-1}; }
        if(state.keys.s) { player.y += moveSpeed; player.dir = {x:0, y:1}; }
        if(state.keys.a) { player.x -= moveSpeed; player.dir = {x:-1, y:0}; player.facing = -1; }
        if(state.keys.d) { player.x += moveSpeed; player.dir = {x:1, y:0}; player.facing = 1; }

        player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

        ctx.fillStyle = 'white';
        ctx.fillRect(player.x, player.y, player.w, player.h);

        // Ataque
        if(state.keys.space && attackAnim === 0) attackAnim = 15;
        if(attackAnim > 0) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(player.x + player.w/2, player.y + player.h/2, 50, 0, Math.PI*2);
            ctx.fill();
            enemies.forEach((en, idx) => {
                if(Math.hypot(en.x - player.x, en.y - player.y) < 60) enemies.splice(idx, 1);
            });
            attackAnim--;
        }

        // Items
        items.forEach(item => {
            if(!item.collected) {
                ctx.fillStyle = 'lime';
                ctx.beginPath(); ctx.arc(item.x, item.y, 8, 0, Math.PI*2); ctx.fill();
                if(Math.hypot(player.x - item.x, player.y - item.y) < 30) {
                    item.collected = true; collectedCount++;
                    document.getElementById('surv-items').innerText = collectedCount;
                }
            }
        });

        // Nave y Victoria
        ctx.fillStyle = '#ff9e00'; ctx.fillRect(canvas.width/2 - 20, 50, 40, 60);
        if(collectedCount >= 8 && Math.hypot(player.x - canvas.width/2, player.y - 80) < 50) {
            cancelAnimationFrame(survLoop);
            endSurvival();
            return;
        }

        // Enemigos
        spawnTimer++;
        if(spawnTimer > 80) {
            enemies.push({ x: Math.random()*canvas.width, y: -20, w: 20, h: 20 });
            spawnTimer = 0;
        }
        ctx.fillStyle = 'red';
        enemies.forEach((en, idx) => {
            let angle = Math.atan2(player.y - en.y, player.x - en.x);
            en.x += Math.cos(angle) * 1.2; en.y += Math.sin(angle) * 1.2;
            ctx.fillRect(en.x, en.y, en.w, en.h);
            if(Math.hypot(player.x - en.x, player.y - en.y) < 20) {
                player.hp--; document.getElementById('surv-hp').innerText = player.hp;
                enemies.splice(idx, 1);
                if(player.hp <= 0) location.reload();
            }
        });

        survLoop = requestAnimationFrame(loop);
    }
    loop();
}

function endSurvival() {
    const overlay = document.getElementById('message-overlay');
    overlay.classList.remove('hidden');
    document.getElementById('overlay-text').innerText = "¡Recursos listos! T.P.X reparó la nave.";
    document.getElementById('btn-start-level2').onclick = () => {
        overlay.classList.add('hidden');
        startSurvivalEndInterlude();
    };
}

// --- TRANSICIONES INTERMEDIAS ---
function startSurvivalEndInterlude() {
    document.getElementById('scene-survival').classList.remove('active');
    document.getElementById('scene-intro').classList.add('active');
    const btn = document.getElementById('btn-next');
    btn.onclick = () => {
        state.survivalEndIndex++;
        if(state.survivalEndIndex < survivalEndData.length) updateSurvivalEndDialog();
        else {
            document.getElementById('scene-intro').classList.remove('active');
            document.getElementById('scene-space').classList.add('active');
            changeMusic(3); initSpaceGame();
        }
    };
    state.survivalEndIndex = 0;
    updateSurvivalEndDialog();
}

function updateSurvivalEndDialog() {
    const data = survivalEndData[state.survivalEndIndex];
    introImg.src = ASSETS.imgInicio(data.img);
    introText.innerHTML = "";
    btnNext.classList.add('hidden');
    typeWriter(introText, data.text, 0, 30, () => btnNext.classList.remove('hidden'));
}

// --- MINIJUEGO 2: ESPACIO ---
let spaceLoop;
function initSpaceGame() {
    const canvas = document.getElementById('canvas-space');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const player = { x: canvas.width/2, y: canvas.height - 100, w: 30, h: 40, hp: 5 };
    const bullets = [], enemies = [];
    let progress = 0, spawnTimer = 0;

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        progress += 0.1;
        document.getElementById('space-prog').innerText = Math.floor(progress);

        if(state.keys.a) player.x -= 4;
        if(state.keys.d) player.x += 4;
        player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

        if(state.keys.space && bullets.length < 5) {
            bullets.push({ x: player.x + player.w/2, y: player.y, s: 7 });
            state.keys.space = false; // Semi-automático
        }

        ctx.fillStyle = 'cyan'; ctx.fillRect(player.x, player.y, player.w, player.h);

        bullets.forEach((b, i) => {
            b.y -= b.s; ctx.fillStyle = 'yellow'; ctx.fillRect(b.x-2, b.y, 4, 10);
            if(b.y < 0) bullets.splice(i, 1);
        });

        spawnTimer++;
        if(spawnTimer > 25) {
            enemies.push({ x: Math.random()*(canvas.width-30), y: -30, w: 30, h: 30, s: 3 });
            spawnTimer = 0;
        }

        enemies.forEach((en, i) => {
            en.y += en.s; ctx.fillStyle = 'gray'; ctx.beginPath(); ctx.arc(en.x+15, en.y+15, 15, 0, Math.PI*2); ctx.fill();
            bullets.forEach((b, bi) => {
                if(Math.hypot(b.x - (en.x+15), b.y - (en.y+15)) < 20) {
                    enemies.splice(i, 1); bullets.splice(bi, 1);
                }
            });
            if(Math.hypot(player.x+15 - (en.x+15), player.y+20 - (en.y+15)) < 30) {
                player.hp--; document.getElementById('space-hp').innerText = player.hp;
                enemies.splice(i, 1);
                if(player.hp <= 0) location.reload();
            }
        });

        if(progress >= 100) { cancelAnimationFrame(spaceLoop); startSpaceEndInterlude(); return; }
        spaceLoop = requestAnimationFrame(loop);
    }
    loop();
}

function startSpaceEndInterlude() {
    document.getElementById('scene-space').classList.remove('active');
    document.getElementById('scene-intro').classList.add('active');
    const btn = document.getElementById('btn-next');
    btn.onclick = () => {
        state.interludeIndex++;
        if(state.interludeIndex < interludeData.length) updateSpaceEndDialog();
        else {
            document.getElementById('scene-intro').classList.remove('active');
            startFinalScene();
        }
    };
    state.interludeIndex = 0;
    updateSpaceEndDialog();
}

function updateSpaceEndDialog() {
    const data = interludeData[state.interludeIndex];
    introImg.src = ASSETS.imgInicio(data.img);
    introText.innerHTML = "";
    btnNext.classList.add('hidden');
    typeWriter(introText, data.text, 0, 30, () => btnNext.classList.remove('hidden'));
}

// --- ESCENA FINAL: NEBULOSA Y FOTOS ---
function startFinalScene() {
    document.getElementById('scene-final').classList.add('active');
    document.getElementById('mobile-controls').classList.add('hidden');
    changeMusic(4);
    const canvas = document.getElementById('canvas-final');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const photos = [];
    for(let i=0; i<=20; i++) {
        const img = new Image(); img.src = ASSETS.imgViaje(i);
        photos.push({ img, z: Math.random()*4000+500, x: (Math.random()-0.5)*canvas.width*2, y: (Math.random()-0.5)*canvas.height*2 });
    }

    let camZ = 0;
    function loop() {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        camZ += 2;
        photos.forEach(p => {
            let depth = p.z - camZ;
            if(depth < -100) depth += 4000;
            const scale = 500 / (depth || 1);
            const x2d = p.x * scale + canvas.width/2;
            const y2d = p.y * scale + canvas.height/2;
            if(depth > 0) {
                ctx.globalAlpha = Math.min(1, scale);
                let size = 200 * scale;
                try { ctx.drawImage(p.img, x2d - size/2, y2d - size/2, size, size); } catch(e){}
            }
        });
        requestAnimationFrame(loop);
    }
    loop();
    document.getElementById('btn-restart').onclick = () => location.reload();
}

// --- INPUTS ---
function setupInputs() {
    window.addEventListener('keydown', (e) => setKey(e.code, true));
    window.addEventListener('keyup', (e) => setKey(e.code, false));
    const bindTouch = (id, key) => {
        const btn = document.getElementById(id);
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); state.keys[key] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); state.keys[key] = false; });
    };
    bindTouch('m-up', 'w'); bindTouch('m-down', 's'); bindTouch('m-left', 'a');
    bindTouch('m-right', 'd'); bindTouch('m-action', 'space'); bindTouch('m-dash', 'shift');
}

function setKey(code, val) {
    if(code === 'KeyW' || code === 'ArrowUp') state.keys.w = val;
    if(code === 'KeyS' || code === 'ArrowDown') state.keys.s = val;
    if(code === 'KeyA' || code === 'ArrowLeft') state.keys.a = val;
    if(code === 'KeyD' || code === 'ArrowRight') state.keys.d = val;
    if(code === 'Space') state.keys.space = val;
    if(code === 'ShiftLeft') state.keys.shift = val;
}