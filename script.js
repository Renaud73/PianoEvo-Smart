const noteNamesFR = { 'C': 'DO', 'D': 'RÉ', 'E': 'MI', 'F': 'FA', 'G': 'SOL', 'A': 'LA', 'B': 'SI' };
const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

let audioContext, analyser, microphone, dataArray = new Float32Array(2048);
let isMicrophoneActive = false;
let notesOnScreen = [], isPaused = false, currentMode = 'step', totalNotesInLevel = 0, notesValidated = 0;
let currentTab = 'cours';

const DATA = {
    cours: [
        { titre: "1. Main Droite : DO-SOL", diff: 'easy', notes: [{note:'C4', d:800},{note:'D4', d:800},{note:'E4', d:800},{note:'F4', d:800},{note:'G4', d:800}] },
        { titre: "2. Main Gauche : DO-SOL", diff: 'easy', notes: [{note:'C3', d:800},{note:'B2', d:800},{note:'A2', d:800},{note:'G2', d:800},{note:'F2', d:800}] },
        { titre: "3. La Gamme Complète", diff: 'medium', notes: [{note:'C3', d:500},{note:'D3', d:500},{note:'E3', d:500},{note:'F3', d:500},{note:'G3', d:500},{note:'A3', d:500},{note:'B3', d:500},{note:'C4', d:1000}] },
        { titre: "4. Accords de Base", diff: 'hard', notes: [{note:'C3',isAccord:true, d:0},{note:'E3',isAccord:true, d:0},{note:'G3',isAccord:true, d:1500}] }
    ],
    apprentissage: [
        { titre: "Exercice de Force", diff: 'hard', notes: [{note:'A2', d:400},{note:'G2', d:400},{note:'A2', d:400},{note:'G2', d:400}] },
        { titre: "Sauts d'octaves", diff: 'medium', notes: [{note:'C3', d:700},{note:'C4', d:700},{note:'C3', d:700}] }
    ],
    morceaux: [
        { titre: "Nothing Else Matters", diff: 'medium', notes: [{note:'E2', d:500},{note:'G3', d:500},{note:'B3', d:800},{note:'E4', d:500},{note:'B3', d:500},{note:'G3', d:1200}] },
        { titre: "Au Clair de la Lune", diff: 'easy', notes: [{note:'C4', d:600},{note:'C4', d:600},{note:'C4', d:600},{note:'D4', d:600},{note:'E4', d:1000},{note:'D4', d:1000}] }
    ]
};

// --- SON ---
function playTone(note) {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const name = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    const freq = 440 * Math.pow(2, (noteStrings.indexOf(name) + (octave - 4) * 12) / 12);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    osc.connect(gain); gain.connect(audioContext.destination);
    osc.start(); osc.stop(audioContext.currentTime + 0.8);
}

// --- PIANO ---
const piano = document.getElementById('piano');
[2, 3, 4, 5, 6].forEach(oct => {
    noteStrings.forEach(n => {
        const isBlack = n.includes('#');
        const key = document.createElement('div');
        key.className = `key ${isBlack ? 'black' : ''}`;
        key.dataset.note = n + oct;
        if(!isBlack) key.textContent = noteNamesFR[n] || n;
        key.onmousedown = (e) => { e.preventDefault(); handleKeyPress(n + oct); };
        key.ontouchstart = (e) => { e.preventDefault(); handleKeyPress(n + oct); };
        piano.appendChild(key);
    });
});

function switchTab(tab) {
    currentTab = tab;
    const grid = document.getElementById('content-grid');
    grid.innerHTML = '';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase().includes(tab.slice(0,3))));
    DATA[tab].forEach(item => {
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `<div class="badge badge-${item.diff}">${item.diff}</div><div>${item.titre}</div>`;
        c.onclick = () => startGame(item, (tab === 'morceaux' ? 'flow' : 'step'));
        grid.appendChild(c);
    });
}

// --- JEU ---
function startGame(data, mode) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    notesValidated = 0; totalNotesInLevel = data.notes.length;
    notesOnScreen = []; isPaused = false; currentMode = mode;
    updateProgress();
    
    let i = 0;
    function next() {
        if(i < data.notes.length && document.getElementById('game-container').style.display !== 'none') {
            const n = data.notes[i];
            if(currentTab === 'morceaux') playTone(n.note);
            drop(n);
            i++;
            setTimeout(next, n.d || 1500);
        }
    }
    next();
}

function drop(nData) {
    const id = Math.random();
    const o = { ...nData, y: -100, ok: false, id: id, h: 60 };
    notesOnScreen.push(o);
    const el = document.createElement('div');
    el.className = 'falling-note';
    el.id = "note-" + id;
    el.style.height = o.h + "px";
    const keyEl = document.querySelector(`.key[data-note="${o.note}"]`);
    if(keyEl) el.style.left = keyEl.offsetLeft + "px";
    document.getElementById('fall-zone').appendChild(el);

    function step() {
        const stopPos = window.innerHeight - 140 - o.h;
        if(currentMode === 'step' && !o.ok && o.y >= stopPos) { isPaused = true; el.classList.add('waiting'); o.y = stopPos; }
        if(!isPaused || currentMode === 'flow') o.y += 3;
        
        const scrollX = document.getElementById('piano-container').scrollLeft;
        el.style.transform = `translateX(${-scrollX}px)`;
        el.style.top = o.y + "px";

        if(o.y < window.innerHeight && document.getElementById('game-container').style.display !== 'none') requestAnimationFrame(step);
        else el.remove();
    }
    step();
}

function handleKeyPress(note) {
    const keyEl = document.querySelector(`.key[data-note="${note}"]`);
    if(keyEl) { keyEl.classList.add('active'); setTimeout(() => keyEl.classList.remove('active'), 200); }
    const target = notesOnScreen.find(n => n.note === note && !n.ok);
    if(target) {
        target.ok = true; notesValidated++; updateProgress();
        const noteEl = document.getElementById("note-" + target.id);
        if(noteEl) noteEl.classList.add('hit');
        if(!notesOnScreen.some(n => !n.ok && n.y >= (window.innerHeight - 200))) isPaused = false;
        if(notesValidated === totalNotesInLevel) setTimeout(quitGame, 1000);
    }
}

function updateProgress() { document.getElementById('progress-inner').style.width = (notesValidated/totalNotesInLevel)*100 + "%"; }
function quitGame() { document.getElementById('main-menu').style.display = 'flex'; document.getElementById('game-container').style.display = 'none'; document.getElementById('fall-zone').innerHTML = ''; }

// --- MICRO ---
async function initMicrophone() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        microphone.connect(analyser);
        isMicrophoneActive = true;
        document.getElementById('status-text').textContent = "🎤 Micro ON";
        detectPitch();
    } catch (err) { alert("Microphone refusé."); }
}

function detectPitch() {
    if (!isMicrophoneActive) return;
    analyser.getFloatTimeDomainData(dataArray);
    const volume = Math.sqrt(dataArray.reduce((acc, val) => acc + val * val, 0) / dataArray.length);
    if (volume > 0.06) {
        const freq = autoCorrelate(dataArray, audioContext.sampleRate);
        if (freq !== -1) {
            const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
            const index = Math.round(noteNum) + 69;
            const note = noteStrings[index % 12] + (Math.floor(index / 12) - 1);
            document.getElementById('detected-note').textContent = note;
            handleKeyPress(note);
        }
    }
    requestAnimationFrame(detectPitch);
}

function autoCorrelate(buf, sampleRate) {
    let SIZE = buf.length, rms = 0;
    for (let i = 0; i < SIZE; i++) { let val = buf[i]; rms += val * val; }
    if (Math.sqrt(rms / SIZE) < 0.01) return -1;
    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
        for (let j = 0; j < SIZE - i; j++) c[i] = c[i] + buf[j] * buf[j + i];
    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) { if (c[i] > maxval) { maxval = c[i]; maxpos = i; } }
    return sampleRate / maxpos;
}

function openProfileModal() { document.getElementById('profile-modal').style.display = 'flex'; }
function closeProfileModal() { document.getElementById('profile-modal').style.display = 'none'; }
function createNewProfile() {
    const name = document.getElementById('input-username').value;
    if(name) { document.getElementById('display-username').textContent = name; closeProfileModal(); }
}

window.onload = () => switchTab('cours');
