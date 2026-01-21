// --- 1. CONFIGURATION DES NOTES (FREQUENCES) ---
const noteFrequencies = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
   // --- CONFIGURATION ---
const noteFrequencies = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
};

let audioCtx, analyser, dataArray, isMicrophoneActive = false;
let notesOnScreen = [], currentScore = 0, isPaused = false, currentMode = 'step', gameTimer;

// --- GESTION DU PLEIN ÉCRAN ---
function toggleFullscreen() {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen || docEl.webkitRequestFullScreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
        document.getElementById('fullscreen-btn').innerText = "✖ Fermer";
    } else {
        cancelFullScreen.call(doc);
        document.getElementById('fullscreen-btn').innerText = "📺 Plein Écran";
    }
}

document.getElementById('fullscreen-btn').onclick = (e) => {
    e.stopPropagation();
    toggleFullscreen();
};

// --- MICROPHONE ---
async function setupMicrophone() {
    if (isMicrophoneActive) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const microphone = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Float32Array(analyser.fftSize);
        microphone.connect(analyser);
        isMicrophoneActive = true;
        document.getElementById('mic-status').innerText = "MICRO: ON";
        document.getElementById('mic-status').style.color = "lime";
        loop();
    } catch (e) { console.log("Micro refusé"); }
}

function loop() {
    analyser.getFloatTimeDomainData(dataArray);
    let freq = getPitch(dataArray, audioCtx.sampleRate);
    if (freq !== -1) {
        for (let note in noteFrequencies) {
            if (Math.abs(freq - noteFrequencies[note]) < (noteFrequencies[note] * 0.03)) {
                handleKeyPress(note, true);
            }
        }
    }
    requestAnimationFrame(loop);
}

function getPitch(buf, sr) {
    let rms = 0; for (let v of buf) rms += v*v;
    if (Math.sqrt(rms/buf.length) < 0.01) return -1;
    let c = new Float32Array(buf.length);
    for (let i=0; i<buf.length; i++) for (let j=0; j<buf.length-i; j++) c[i] += buf[j]*buf[j+i];
    let d=0; while (c[d]>c[d+1]) d++;
    let maxv=-1, maxp=-1;
    for (let i=d; i<buf.length; i++) if (c[i]>maxv) { maxv=c[i]; maxp=i; }
    return sr/maxp;
}

// --- LOGIQUE DU JEU ---
function switchTab(tab) {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = '';
    const items = (tab === 'cours') ? 
        [{t:"Do Central", n:[{note:'C4'},{note:'D4'},{note:'E4'}]}] : 
        [{t:"Pirates", n:[{note:'A3'},{note:'C4'},{note:'D4'}]}];
    
    items.forEach(item => {
        let c = document.createElement('div'); c.className='card';
        c.innerHTML=`<h3>${item.t}</h3>`;
        c.onclick = async () => { await setupMicrophone(); startGame(item, tab==='cours'?'step':'flow'); };
        grid.appendChild(c);
    });
}

function startGame(data, mode) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    currentScore = 0; notesOnScreen = []; isPaused = false; currentMode = mode;
    let i = 0;
    gameTimer = setInterval(() => {
        if (i >= data.n.length) { clearInterval(gameTimer); return; }
        if (!isPaused || currentMode === 'flow') { drop(data.n[i]); i++; }
    }, 2000);
}

function drop(nData) {
    const id = Math.random();
    const o = { ...nData, y: -80, ok: false, id: id };
    notesOnScreen.push(o);
    const el = document.createElement('div');
    el.className = 'falling-note'; el.id = "note-" + id;
    el.style.position = "absolute"; el.style.background = "#3498db";
    el.style.width = "40px"; el.style.height = "40px"; el.style.borderRadius = "50%";
    const keyEl = document.querySelector(`.key[data-note="${o.note}"]`);
    if(keyEl) el.style.left = keyEl.offsetLeft + (keyEl.offsetWidth/2 - 20) + "px";
    document.getElementById('fall-zone').appendChild(el);
    function anim() {
        if(currentMode === 'step' && !o.ok && o.y > 300) isPaused = true;
        if(!isPaused || currentMode === 'flow') o.y += 3;
        el.style.top = o.y + "px";
        if(o.y < 600 && document.getElementById("note-"+id)) requestAnimationFrame(anim); else el.remove();
    }
    anim();
}

function handleKeyPress(note) {
    const keyEl = document.querySelector(`.key[data-note="${note}"]`);
    if(keyEl) { keyEl.classList.add('active'); setTimeout(()=>keyEl.classList.remove('active'), 200); }
    const target = notesOnScreen.find(n => n.note === note && !n.ok);
    if(target) {
        target.ok = true; isPaused = false; currentScore += 100;
        document.getElementById('live-score').textContent = currentScore.toString().padStart(4, '0');
        const v = document.getElementById("note-" + target.id);
        if(v) v.remove();
    }
}

function quitGame() {
    clearInterval(gameTimer);
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('fall-zone').innerHTML = '';
    notesOnScreen = [];
}

// --- INITIALISATION PIANO ---
const piano = document.getElementById('piano');
const notes = [{n:'C',b:0},{n:'C#',b:1},{n:'D',b:0},{n:'D#',b:1},{n:'E',b:0},{n:'F',b:0},{n:'F#',b:1},{n:'G',b:0},{n:'G#',b:1},{n:'A',b:0},{n:'A#',b:1},{n:'B',b:0}];
[3,4,5].forEach(oct => {
    notes.forEach(p => {
        const id = p.n + oct;
        const k = document.createElement('div');
        k.className = `key ${p.b ? 'black' : ''}`;
        k.dataset.note = id;
        k.onpointerdown = (e) => { e.preventDefault(); handleKeyPress(id); };
        piano.appendChild(k);
    });
});

window.onload = () => switchTab('cours');
