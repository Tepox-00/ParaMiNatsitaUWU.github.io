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

// Función para controlar la visibilidad de los botones táctiles
function toggleMobileControls(show) {
    const controls = document.getElementById('mobile-controls');
    if (state.isMobile) {
        if (show) controls.classList.remove('hidden');
        else controls.classList.add('hidden');
    }
}

// Función para ajustar el tamaño del canvas al dispositivo
function resizeCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Textos de la historia
const introData = [
    { text: "Primero que nada quiero desearte que tengas un buen día hoy, ya que es fin de semana espero puedas descansar aprovechando tu sábado :3, AHORA CII, Queria decirte que FELIZ 14 DE FEBRERO 💜💜💜, FELIZ DIA DEL AMOR Y LA AMISTAD PQ YO A TI TE AMO MUCHITO 💜💜💜💜, ¿Quieres ver el pequeño regalo que te hice :3?", img: 0, type: 'ask' },
    { text: "Me hubiera gustado enviarte otro ramote pero la vrd no tengo mucho dinero ahora, entonces solo puedo darte una paginita :( y tal vez un sushi :3 💜. pero ahora si, quieres avanzar a ver lo que hice? 💜💜💜", img: 1, type: 'ask' },
    { text: "Hace mucho mucho tiempo, pero asi mucho mucho... mucho tiempo, en un planeta muy muy [muy x 100] lejano, un pequeño astronauta se preparaba para viajar a las estrellas.", img: 2, type: 'story' },
    { text: "El astronauta con código T.P.X. había escuchado de una formación estelar única, una nebulosa justo en los limites de su galaxia. T.P.X estaba fascinado con esta formación.", img: 3, type: 'story' },
    { text: "Emprendió un viaje hacia el horizonte... sin embargo, se quedó sin recursos justo antes de llegar. No le quedó otra más que aterrizar en un planeta desconocido para obtener recursos.", img: 4, type: 'story' }
];

const survivalEndData = [
    { text: "Despues de un gran esfuerzo, T.P.X. logro reunir los recursos suficientes para continuar su viaje.", img: 5 },
    { text: "T.P.X. subio a su nave, preparo todo y siguio su camino, debia llegar a aquel lugar que tanto buscaba y cada vez faltaba menos...", img: 6 },
    { text: "Sin embargo, las cosas estaban por complicarse mas, cerca de las nebulosas no es raro encontrar cuerpos rocosos, su gravedad es tan grande que atrae mucha materia, que despues se amontona atraida entre si para formar asteroides y finalmente planetas, bueno lamentablemente T.P.X. Se encontraba entrando a un gran cinturon de asteroides", img: 7 }
];

const interludeData = [
    { text: "Y al final T.P.X. lo logro, atravezo el cinturon de asteroides que se formo alrededor de la gran nebulosa, estaba tan cerca que ya podia verla, incluso estando a millones de Km de distancia, la nebulosa es tan masiva y con un brillo tan fuerte que es visible desde esa distancia tan alta", img: 8 },
    { text: "Frente a él, la gran nebulosa brillaba con colores imposibles. Era tan hermosa como la imaginaba, incluso mas de lo que el hubiera imaginado.", img: 9 },
    { text: "T.P.X. activó el salto al hiperespacio para acercarse lo mas posible a ella...", img: 10 }
];

// Inicio
window.onload = () => {
    loadSceneIntro();
    setupInputs();
    toggleMobileControls(false); // Ocultos al inicio
};

function changeMusic(index) {
    audioPlayer.src = ASSETS.audio(index);
    audioPlayer.volume = 0.5;
    audioPlayer.play().catch(e => console.log("click para audio"));
}

function typeWriter(element, text, i, speed, callback) {
    if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        typingTimeout = setTimeout(() => {
            typeWriter(element, text, i, speed, callback);
        }, speed);
    } else {
        if (callback) callback();
    }
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
    const y = Math.random() * 100 - 50;
    btnNo.style.transform = `translate(${x}px, ${y}px)`;
}

function updateIntroDialog() {
    const data = introData[state.msgIndex];
    introImg.src = ASSETS.imgInicio(data.img);
    introText.innerHTML = "";
    if (typingTimeout) clearTimeout(typingTimeout);
    btnYes.classList.add('hidden');
    btnNo.classList.add('hidden');
    btnNext.classList.add('hidden');
    btnNo.style.transform = 'translate(0,0)';

    typeWriter(introText, data.text, 0, 30, () => {
        if(data.type === 'ask') {
            btnYes.classList.remove('hidden');
            btnNo.classList.remove('hidden');
        } else {
            btnNext.classList.remove('hidden');
        }
    });
}

function nextDialog() {
    state.msgIndex++;
    if(state.msgIndex < introData.length) {
        updateIntroDialog();
    } else {
        document.getElementById('scene-intro').classList.remove('active');
        document.getElementById('scene-survival').classList.add('active');
        changeMusic(2);
        toggleMobileControls(true); // Mostrar controles en el minijuego
        initSurvivalGame();
    }
}

function startSurvivalEndInterlude() {
    toggleMobileControls(false); // Ocultar controles en transición
    document.getElementById('scene-survival').classList.remove('active');
    document.getElementById('scene-intro').classList.add('active');
    const oldBtn = document.getElementById('btn-next');
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.addEventListener('click', nextSurvivalEndDialog);
    state.survivalEndIndex = 0;
    updateSurvivalEndDialog();
}

function updateSurvivalEndDialog() {
    const data = survivalEndData[state.survivalEndIndex];
    introImg.src = ASSETS.imgInicio(data.img);
    const btnNext = document.getElementById('btn-next');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    introText.innerHTML = "";
    if (typingTimeout) clearTimeout(typingTimeout);
    btnYes.classList.add('hidden');
    btnNo.classList.add('hidden');
    btnNext.classList.add('hidden');
    typeWriter(introText, data.text, 0, 30, () => {
        btnNext.classList.remove('hidden');
    });
}

function nextSurvivalEndDialog() {
    state.survivalEndIndex++;
    if(state.survivalEndIndex < survivalEndData.length) {
        updateSurvivalEndDialog();
    } else {
        document.getElementById('scene-intro').classList.remove('active');
        document.getElementById('scene-space').classList.add('active');
        changeMusic(3);
        toggleMobileControls(true); // Mostrar controles en el minijuego
        initSpaceGame();
    }
}

function startSpaceEndInterlude() {
    toggleMobileControls(false); // Ocultar controles en transición
    document.getElementById('scene-space').classList.remove('active');
    document.getElementById('scene-intro').classList.add('active');
    const oldBtn = document.getElementById('btn-next');
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.addEventListener('click', nextSpaceEndDialog);
    state.interludeIndex = 0;
    updateSpaceEndDialog();
}

function updateSpaceEndDialog() {
    const data = interludeData[state.interludeIndex];
    introImg.src = ASSETS.imgInicio(data.img);
    const btnNext = document.getElementById('btn-next');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    introText.innerHTML = "";
    if (typingTimeout) clearTimeout(typingTimeout);
    btnYes.classList.add('hidden');
    btnNo.classList.add('hidden');
    btnNext.classList.add('hidden');
    typeWriter(introText, data.text, 0, 30, () => {
        btnNext.classList.remove('hidden');
    });
}

function nextSpaceEndDialog() {
    state.interludeIndex++;
    if(state.interludeIndex < interludeData.length) {
        updateSpaceEndDialog();
    } else {
        document.getElementById('scene-intro').classList.remove('active');
        startFinalScene();
    }
}

function setupInputs() {
    window.addEventListener('keydown', (e) => setKey(e.code, true));
    window.addEventListener('keyup', (e) => setKey(e.code, false));
    const bindTouch = (id, key) => {
        const btn = document.getElementById(id);
        if(!btn) return;
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); state.keys[key] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); state.keys[key] = false; });
    };
    bindTouch('m-up', 'w');
    bindTouch('m-down', 's');
    bindTouch('m-left', 'a');
    bindTouch('m-right', 'd');
    bindTouch('m-action', 'space');
    bindTouch('m-dash', 'shift');
}

function setKey(code, val) {
    if(code === 'KeyW' || code === 'ArrowUp') { state.keys.w = val; if(val) state.keys.s = false; }
    if(code === 'KeyS' || code === 'ArrowDown') { state.keys.s = val; if(val) state.keys.w = false; }
    if(code === 'KeyA' || code === 'ArrowLeft') { state.keys.a = val; if(val) state.keys.d = false; }
    if(code === 'KeyD' || code === 'ArrowRight') { state.keys.d = val; if(val) state.keys.a = false; }
    if(code === 'Space') state.keys.space = val;
    if(code === 'ShiftLeft' || code === 'ShiftRight') state.keys.shift = val;
}

// Minijuego 1
let survLoop;
function initSurvivalGame() {
    resizeCanvas('canvas-survival');
    const canvas = document.getElementById('canvas-survival');
    const ctx = canvas.getContext('2d');
    const playerSprite = new Image();
    playerSprite.src = ASSETS.player;
    const player = { x: canvas.width/2, y: canvas.height/2, w: 32, h: 36, speed: 0.5, hp: 5, dir: {x:0, y:1}, dashCd: 0, facing: 1 };
    const enemies = [];
    const items = [];
    const totalItems = 8;
    for(let i=0; i<totalItems; i++) {
        items.push({ x: Math.random() * (canvas.width - 40) + 20, y: Math.random() * (canvas.height - 40) + 20, collected: false });
    }
    let collectedCount = 0;
    let attackAnim = 0;
    let spawnTimer = 0;

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

        if(state.keys.space && attackAnim === 0) attackAnim = 15;

        if(playerSprite.complete) {
            ctx.save();
            ctx.translate(player.x + player.w/2, player.y + player.h/2);
            ctx.scale(player.facing, 1); 
            ctx.drawImage(playerSprite, -player.w/2, -player.h/2, player.w, player.h);
            ctx.restore();
        } else {
            ctx.fillStyle = 'white';
            ctx.fillRect(player.x, player.y, player.w, player.h);
        }

        if(attackAnim > 0) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.beginPath();
            const cx = player.x + player.w/2;
            const cy = player.y + player.h/2;
            ctx.moveTo(cx, cy);
            const angle = Math.atan2(player.dir.y, player.dir.x);
            ctx.arc(cx, cy, 60, angle - 0.5, angle + 0.5);
            ctx.fill();
            enemies.forEach((en, idx) => {
                const dx = en.x - cx;
                const dy = en.y - cy;
                if(Math.sqrt(dx*dx + dy*dy) < 60) enemies.splice(idx, 1);
            });
            attackAnim--;
        }

        ctx.fillStyle = '#00ff00';
        items.forEach(item => {
            if(!item.collected) {
                ctx.beginPath(); ctx.arc(item.x, item.y, 8, 0, Math.PI*2); ctx.fill();
                const dx = player.x - item.x;
                const dy = player.y - item.y;
                if(Math.sqrt(dx*dx + dy*dy) < 30) {
                    item.collected = true; collectedCount++;
                    document.getElementById('surv-items').innerText = collectedCount;
                }
            }
        });

        ctx.fillStyle = '#ff9e00';
        const shipX = canvas.width/2; const shipY = 50;
        ctx.fillRect(shipX, shipY, 40, 60);
        ctx.fillStyle = 'white'; ctx.fillText("NAVE", shipX, shipY - 10);

        if(collectedCount >= 8) {
            const dx = player.x - shipX; const dy = player.y - shipY;
            if(Math.sqrt(dx*dx + dy*dy) < 50) { endSurvival(true); return; }
        }

        spawnTimer++;
        if(spawnTimer > 100) { 
            enemies.push({ x: Math.random() > 0.5 ? 0 : canvas.width, y: Math.random() * canvas.height, w: 20, h: 20 });
            spawnTimer = 0;
        }

        ctx.fillStyle = '#ff0000';
        enemies.forEach((en, idx) => {
            const dx = player.x - en.x; const dy = player.y - en.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const vel = 0.5 / 3; 
            en.x += (dx/dist) * vel; en.y += (dy/dist) * vel;
            ctx.fillRect(en.x, en.y, en.w, en.h);
            if(dist < 20) {
                player.hp--; document.getElementById('surv-hp').innerText = player.hp;
                enemies.splice(idx, 1);
                if(player.hp <= 0) {
                    player.hp = 5; collectedCount = 0;
                    items.forEach(i => i.collected = false);
                    document.getElementById('surv-items').innerText = 0;
                    document.getElementById('surv-hp').innerText = 5;
                }
            }
        });
        survLoop = requestAnimationFrame(loop);
    }
    loop();
}

function endSurvival(win) {
    cancelAnimationFrame(survLoop);
    const overlay = document.getElementById('message-overlay');
    const text = document.getElementById('overlay-text');
    overlay.classList.remove('hidden');
    text.innerText = "¡Recursos conseguidos! T.P.X reparó la nave...";
    document.getElementById('btn-start-level2').onclick = () => {
        overlay.classList.add('hidden');
        startSurvivalEndInterlude();
    };
}

// Minijuego 2
let spaceLoop;
function initSpaceGame() {
    resizeCanvas('canvas-space');
    const canvas = document.getElementById('canvas-space');
    const ctx = canvas.getContext('2d');
    const player = { x: canvas.width/2, y: canvas.height - 80, w: 30, h: 40, speed: 1.25, hp: 5 };
    const bullets = [];
    const enemies = []; 
    let progress = 0;
    let spawnTimer = 0;

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let aux = state.isMobile ? 0.02 : 0.01;
        progress += aux;
        document.getElementById('space-prog').innerText = Math.floor(progress);

        if(state.keys.a) player.x -= player.speed;
        if(state.keys.d) player.x += player.speed;
        player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

        if(state.keys.space && bullets.length < 1) { 
             if(Math.random() > 0.8) bullets.push({x: player.x + player.w/2, y: player.y, speed: 5}); 
        }

        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.w/2, player.y);
        ctx.lineTo(player.x, player.y + player.h);
        ctx.lineTo(player.x + player.w, player.y + player.h);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        bullets.forEach((b, idx) => {
            b.y -= b.speed; ctx.fillRect(b.x - 2, b.y, 4, 10);
            if(b.y < 0) bullets.splice(idx, 1);
        });

        spawnTimer++;
        if(spawnTimer > 40) {
            enemies.push({ x: Math.random() * (canvas.width - 30), y: -50, w: 30, h: 30, type: 'rock', hp: 1, speed: 0.75 });
            spawnTimer = 0;
        }

        enemies.forEach((en, idx) => {
            en.y += en.speed;
            ctx.fillStyle = '#888888';
            ctx.beginPath(); ctx.arc(en.x + en.w/2, en.y + en.h/2, en.w/2, 0, Math.PI*2); ctx.fill();
            bullets.forEach((b, bIdx) => {
                if(b.x > en.x && b.x < en.x + en.w && b.y > en.y && b.y < en.y + en.h) {
                    en.hp--; bullets.splice(bIdx, 1);
                    if(en.hp <= 0) enemies.splice(idx, 1);
                }
            });
            if(en.x < player.x + player.w && en.x + en.w > player.x && en.y < player.y + player.h && en.y + en.h > player.y) {
                   player.hp--; document.getElementById('space-hp').innerText = player.hp;
                   enemies.splice(idx, 1);
                   if(player.hp <= 0) { progress = 0; player.hp = 5; enemies.length = 0; }
            }
            if(en.y > canvas.height) enemies.splice(idx, 1);
        });

        if(progress >= 100) { cancelAnimationFrame(spaceLoop); startSpaceEndInterlude(); return; }
        spaceLoop = requestAnimationFrame(loop);
    }
    loop();
}

// Escena final y fotos
function startFinalScene() {
    toggleMobileControls(false); // Ocultar controles en el final
    const finalScene = document.getElementById('scene-final');
    finalScene.classList.add('active');
    changeMusic(4);
    resizeCanvas('canvas-final');
    const canvas = document.getElementById('canvas-final');
    const ctx = canvas.getContext('2d');
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let targetOffsetX = 0;
    let targetOffsetY = 0;

    function updateInputCoords(x, y) { mouseX = x; mouseY = y; }
    canvas.addEventListener('mousemove', (e) => updateInputCoords(e.clientX, e.clientY));
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateInputCoords(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    canvas.addEventListener('touchstart', (e) => { updateInputCoords(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });

    const photos = [];
    for(let i=0; i<=20; i++) {
        const img = new Image(); img.src = ASSETS.imgViaje(i);
        photos.push({ img: img, z: Math.random() * 4000 + 500, x: (Math.random()-0.5)*canvas.width*1.5, y: (Math.random()-0.5)*canvas.height*1.5 });
    }

    const warpStars = [];
    const numStars = 500;
    for(let i=0; i<numStars; i++) {
        warpStars.push({ x: (Math.random() - 0.5) * canvas.width * 3, y: (Math.random() - 0.5) * canvas.height * 3, z: Math.random() * 2000 + 100 });
    }

    let camZ = 0;
    function loop() {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        const starSpeed = 15; 
        let photoSpeed = state.isMobile ? 2 : 1;
        camZ += photoSpeed; 
        const cx = canvas.width / 2; const cy = canvas.height / 2;
        const sensitivity = 0.05; 
        targetOffsetX += ((cx - mouseX) * sensitivity - targetOffsetX) * 0.1;
        targetOffsetY += ((cy - mouseY) * sensitivity - targetOffsetY) * 0.1;

        ctx.strokeStyle = "rgba(200, 230, 255, 0.8)"; ctx.lineWidth = 2; 
        warpStars.forEach(star => {
            star.z -= starSpeed; 
            if (star.z <= 0) { star.z = 2000; star.x = (Math.random() - 0.5) * canvas.width * 3; star.y = (Math.random() - 0.5) * canvas.height * 3; }
            const fov = 500; const scale = fov / star.z;
            const sx = (star.x + targetOffsetX) * scale + cx;
            const sy = (star.y + targetOffsetY) * scale + cy;
            const tailZ = star.z + 100; const scaleTail = fov / tailZ;
            const ex = (star.x + targetOffsetX) * scaleTail + cx;
            const ey = (star.y + targetOffsetY) * scaleTail + cy;
            if (sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
                ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
            }
        });

        photos.forEach(p => {
            let depth = p.z - camZ; 
            if(depth < -100) { p.z += 4000; depth = p.z - camZ; p.x = (Math.random()-0.5)*canvas.width*1.5; p.y = (Math.random()-0.5)*canvas.height*1.5; }
            const fov = 500; const scale = fov / depth; 
            const x2d = (p.x + targetOffsetX) * scale + cx;
            const y2d = (p.y + targetOffsetY) * scale + cy;
            if(depth > 0 && scale < 5) { 
                let alpha = Math.min(1, scale);
                if(depth > 3000) alpha = (4000 - depth) / 1000;
                ctx.globalAlpha = Math.max(0, alpha); 
                try { const size = 150 * scale; ctx.drawImage(p.img, x2d - size/2, y2d - size/2, size, size); } catch(e) { }
                ctx.globalAlpha = 1;
            }
        });
        requestAnimationFrame(loop);
    }
    loop();
    document.getElementById('btn-restart').onclick = () => location.reload();

}




