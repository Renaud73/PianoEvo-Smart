// --- CONFIGURATION AUDIO ET DÉTECTION MICRO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const noteFrequencies = {
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53
};

let analyser, dataArray, microphone, isMicrophoneActive = false;

async function setupMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Float32Array(analyser.fftSize);
        microphone.connect(analyser);
        isMicrophoneActive = true;
        detectPitch();
    } catch (err) {
        console.warn("Micro non autorisé :", err);
    }
}

function detectPitch() {
    analyser.getFloatTimeDomainData(dataArray);
    let freq = autoCorrelate(dataArray, audioCtx.sampleRate);
    if (freq !== -1) {
        let closestNote = null;
        let minDiff = Infinity;
        for (let note in noteFrequencies) {
            let diff = Math.abs(freq - noteFrequencies[note]);
            if (diff < minDiff && diff < (noteFrequencies[note] * 0.05)) {
                minDiff = diff; closestNote = note;
            }
        }
        if (closestNote) handleKeyPress(closestNote, true);
    }
    requestAnimationFrame(detectPitch);
}

function autoCorrelate(buffer, sampleRate) {
    let SIZE = buffer.length; let rms = 0;
    for (let i=0; i<SIZE; i++) rms += buffer[i]*buffer[i];
    rms = Math.sqrt(rms/SIZE); if (rms < 0.01) return -1;
    let r1=0, r2=SIZE-1, thres=0.2;
    for (let i=0; i<SIZE/2; i++) if (Math.abs(buffer[i])<thres) { r1=i; break; }
    for (let i=1; i<SIZE/2; i++) if (Math.abs(buffer[SIZE-i])<thres) { r2=SIZE-i; break; }
    buffer = buffer.slice(r1,r2); SIZE = buffer.length;
    let c = new Float32Array(SIZE);
    for (let i=0; i<SIZE; i++) for (let j=0; j<SIZE-i; j++) c[i] = c[i] + buffer[j]*buffer[j+i];
    let d=0; while (c[d]>c[d+1]) d++;
    let maxval=-1, maxpos=-1;
    for (let i=d; i<SIZE; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    return sampleRate/maxpos;
}

// --- LOGIQUE GÉNÉRALE ET DONNÉES ---
const piano = document.getElementById('piano');
const noteNamesFR = { 'C': 'DO', 'D': 'RÉ', 'E': 'MI', 'F': 'FA', 'G': 'SOL', 'A': 'LA', 'B': 'SI' };

[2,3,4,5,6].forEach(oct => {
    [{n:'C', b:false}, {n:'C#', b:true}, {n:'D', b:false}, {n:'D#', b:true}, {n:'E', b:false}, {n:'F', b:false}, {n:'F#', b:true}, {n:'G', b:false}, {n:'G#', b:true}, {n:'A', b:false}, {n:'A#', b:true}, {n:'B', b:false}].forEach(p => {
        const id = p.n + oct;
        const k = document.createElement('div');
        k.className = `key ${p.b ? 'black' : ''}`;
        k.dataset.note = id;
        if(!p.b) k.textContent = noteNamesFR[p.n];
        k.onpointerdown = (e) => { e.preventDefault(); handleKeyPress(id); };
        piano.appendChild(k);
    });
});

const data_cours = [
    { titre: "Do Central (MD)", diff: 'easy', notes: [{note:'C4',f:1,h:'right'},{note:'D4',f:2,h:'right'},{note:'E4',f:3,h:'right'}] },
    { titre: "Do Central (MG)", diff: 'easy', notes: [{note:'C4',f:1,h:'left'},{note:'B3',f:2,h:'left'},{note:'A3',f:3,h:'left'}] },
    { titre: "Sauts de notes", diff: 'easy', notes: [{note:'C4',f:1,h:'right'},{note:'E4',f:3,h:'right'},{note:'D4',f:2,h:'right'},{note:'F4',f:4,h:'right'}] },
    { titre: "Gamme de Do", diff: 'medium', notes: [{note:'C4',f:1,h:'right'},{note:'D4',f:2,h:'right'},{note:'E4',f:3,h:'right'},{note:'F4',f:1,h:'right'},{note:'G4',f:2,h:'right'},{note:'A4',f:3,h:'right'},{note:'B4',f:4,h:'right'},{note:'C5',f:5,h:'right'}] }
];

const data_musiques = [
    { titre: "Pirates des Caraïbes", diff: 'hard', notes: [{note:'A3',f:1,h:'right'},{note:'C4',f:2,h:'right'},{note:'D4',f:3,h:'right'},{note:'D4',f:3,h:'right'},{note:'D4',f:3,h:'right'},{note:'E4',f:4,h:'right'},{note:'F4',f:5,h:'right'},{note:'F4',f:5,h:'right'},{note:'F4',f:5,h:'right'},{note:'G4',f:1,h:'right'},{note:'E4',f:3,h:'right'},{note:'E4',f:3,h:'right'},{note:'D4',f:2,h:'right'},{note:'C4',f:1,h:'right'},{note:'C4',f:1,h:'right'},{note:'D4',f:2,h:'right'}]},
    { titre: "Au Clair de la Lune", diff: 'easy', notes: [{note:'C4',f:1,h:'right'},{note:'C4',f:1,h:'right'},{note:'C4',f:1,h:'right'},{note:'D4',f:2,h:'right'},{note:'E4',f:3,h:'right'}]}
];

let notesOnScreen = [], currentScore = 0, isPaused = false, currentMode = 'step';

function switchTab(tab) {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = '';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase() === tab));
    let list = (tab === 'cours') ? data_cours : data_musiques;
    let mode = (tab === 'morceaux') ? 'flow' : 'step';
    list.forEach(item => {
        let c = document.createElement('div'); c.className='card';
        c.innerHTML=`<div class="badge badge-${item.diff}">${item.diff}</div><h3>${item.titre}</h3>`;
        c.onclick = () => { if(!isMicrophoneActive) setupMicrophone(); startGame(item, mode); };
        grid.appendChild(c);
    });
}

function startGame(data, mode) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    currentScore = 0; notesOnScreen = []; isPaused = false; currentMode = mode;
    document.getElementById('live-score').textContent = "0000";
    let i = 0;
    function next() {
        if(i < data.notes.length) { drop(data.notes[i]); i++; setTimeout(next, currentMode === 'flow' ? 1500 : 2500); }
        else { setTimeout(() => { confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); setTimeout(quitGame, 4000); }, 2000); }
    }
    next();
}

function drop(nData) {
    const id = Math.random();
    const o = { ...nData, y: -80, ok: false, id: id };
    notesOnScreen.push(o);
    const el = document.createElement('div'); 
    el.className = `falling-note ${o.h === 'left' ? 'left-hand' : ''}`; 
    el.id = "note-" + id;
    el.innerHTML = `${o.f || ''}<span>${o.h === 'left' ? 'MG' : 'MD'}</span>`;
    const keyEl = document.querySelector(`.key[data-note="${o.note}"]`);
    if(keyEl) el.style.left = keyEl.offsetLeft + "px";
    document.getElementById('fall-zone').appendChild(el);
    function step() {
        if(currentMode === 'step' && !o.ok && o.y > 300) { isPaused = true; el.classList.add('waiting'); }
        if(!isPaused || currentMode === 'flow') o.y += 2.5;
        el.style.top = o.y + "px";
        if(o.y < 600) requestAnimationFrame(step); else el.remove();
    }
    step();
}

function handleKeyPress(note, fromMicrophone = false) {
    if (!fromMicrophone && noteFrequencies[note]) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(noteFrequencies[note], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 1);
    }
    const keyEl = document.querySelector(`.key[data-note="${note}"]`);
    if(keyEl) { keyEl.classList.add('active'); setTimeout(() => keyEl.classList.remove('active'), 200); }
    const target = notesOnScreen.find(n => n.note === note && !n.ok);
    if(target) {
        target.ok = true; isPaused = false; currentScore += 100;
        document.getElementById('live-score').textContent = currentScore.toString().padStart(4, '0');
        const vNote = document.getElementById("note-" + target.id);
        if(vNote) vNote.style.opacity = "0.2";
    }
}

function quitGame() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('fall-zone').innerHTML = '';
}

window.onload = () => switchTab('cours');
