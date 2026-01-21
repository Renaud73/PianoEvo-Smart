// --- 1. DONNÉES DES COURS ET MUSIQUES ---
const data_cours = [
    { titre: "Do Central (MD)", diff: 'easy', notes: [{note:'C4',f:1,h:'right'},{note:'D4',f:2,h:'right'},{note:'E4',f:3,h:'right'}] },
    { titre: "Do Central (MG)", diff: 'easy', notes: [{note:'C4',f:1,h:'left'},{note:'B3',f:2,h:'left'},{note:'A3',f:3,h:'left'}] },
    { titre: "Gamme de Do", diff: 'medium', notes: [{note:'C4',f:1,h:'right'},{note:'D4',f:2,h:'right'},{note:'E4',f:3,h:'right'},{note:'F4',f:1,h:'right'},{note:'G4',f:2,h:'right'},{note:'A4',f:3,h:'right'},{note:'B4',f:4,h:'right'},{note:'C5',f:5,h:'right'}] }
];

const data_musiques = [
    { titre: "Pirates des Caraïbes", diff: 'hard', notes: [{note:'A3',f:1,h:'right'},{note:'C4',f:2,h:'right'},{note:'D4',f:3,h:'right'},{note:'D4',f:3,h:'right'},{note:'E4',f:4,h:'right'},{note:'F4',f:5,h:'right'},{note:'G4',f:1,h:'right'},{note:'E4',f:3,h:'right'},{note:'D4',f:2,h:'right'},{note:'C4',f:1,h:'right'},{note:'D4',f:2,h:'right'}]},
    { titre: "Au Clair de la Lune", diff: 'easy', notes: [{note:'C4',f:1,h:'right'},{note:'C4',f:1,h:'right'},{note:'C4',f:1,h:'right'},{note:'D4',f:2,h:'right'},{note:'E4',f:3,h:'right'}]}
];

const noteFrequencies = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
};

// --- 2. VARIABLES GLOBALES ---
let audioCtx, analyser, dataArray, isMicrophoneActive = false;
let notesOnScreen = [], currentScore = 0, isPaused = false, currentMode = 'step';

// --- 3. SYSTÈME MICROPHONE ---
async function setupMicrophone() {
    if (isMicrophoneActive) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const microphone = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Float32Array(analyser.fftSize);
        microphone.connect(analyser);
        isMicrophoneActive = true;
        loop();
    } catch (e) { alert("Micro non activé. Jouez au tactile !"); }
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

// --- 4. INTERFACE ET JEU ---
function switchTab(tab) {
    const grid = document.getElementById('content-grid');
    if (!grid) return;
    grid.innerHTML = '';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase() === tab));
    let list = (tab === 'cours') ? data_cours : data_musiques;
    let mode = (tab === 'morceaux') ? 'flow' : 'step';
    list.forEach(item => {
        let c = document.createElement('div'); c.className='card';
        c.innerHTML=`<div class="badge badge-${item.diff}">${item.diff}</div><h3>${item.titre}</h3>`;
        c.onclick = () => { setupMicrophone(); startGame(item, mode); };
        grid.appendChild(c);
    });
}

function startGame(data, mode) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    currentScore = 0; notesOnScreen = []; isPaused = false; currentMode = mode;
    document.getElementById('live-score').textContent = "0000";
    let i = 0;
    const interval = setInterval(() => {
        if (i >= data.notes.length) { 
            clearInterval(interval); 
            setTimeout(() => { confetti(); setTimeout(quitGame, 3000); }, 2000);
            return;
        }
        if (!isPaused || currentMode === 'flow') { drop(data.notes[i]); i++; }
    }, 2000);
}

function drop(nData) {
    const id = Math.random();
    const o = { ...nData, y: -80, ok: false, id: id };
    notesOnScreen.push(o);
    const el = document.createElement('div');
    el.className = `falling-note ${o.h === 'left' ? 'left-hand' : ''}`;
    el.id = "note-" + id;
    el.innerHTML = `${o.f || ''}`;
    const keyEl = document.querySelector(`.key[data-note="${o.note}"]`);
    if(keyEl) el.style.left = keyEl.offsetLeft + "px";
    document.getElementById('fall-zone').appendChild(el);
    function animate() {
        if(currentMode === 'step' && !o.ok && o.y > 300) { isPaused = true; el.classList.add('waiting'); }
        if(!isPaused || currentMode === 'flow') o.y += 3;
        el.style.top = o.y + "px";
        if(o.y < 600) requestAnimationFrame(animate); else el.remove();
    }
    animate();
}

function handleKeyPress(note, fromMicro = false) {
    const keyEl = document.querySelector(`.key[data-note="${note}"]`);
    if(keyEl) { keyEl.classList.add('active'); setTimeout(()=>keyEl.classList.remove('active'), 200); }
    const target = notesOnScreen.find(n => n.note === note && !n.ok);
    if(target) {
        target.ok = true; isPaused = false; currentScore += 100;
        document.getElementById('live-score').textContent = currentScore.toString().padStart(4, '0');
        document.getElementById("note-" + target.id).style.opacity = "0.2";
    }
}

// --- 5. INITIALISATION DU PIANO ---
const piano = document.getElementById('piano');
const pattern = [{n:'C', b:false}, {n:'C#', b:true}, {n:'D', b:false}, {n:'D#', b:true}, {n:'E', b:false}, {n:'F', b:false}, {n:'F#', b:true}, {n:'G', b:false}, {n:'G#', b:true}, {n:'A', b:false}, {n:'A#', b:true}, {n:'B', b:false}];
[2,3,4,5,6].forEach(oct => {
    pattern.forEach(p => {
        const id = p.n + oct;
        const k = document.createElement('div');
        k.className = `key ${p.b ? 'black' : ''}`;
        k.dataset.note = id;
        k.onpointerdown = () => handleKeyPress(id);
        piano.appendChild(k);
    });
});

function quitGame() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('fall-zone').innerHTML = '';
}

window.onload = () => switchTab('cours');
