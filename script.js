const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteNamesFR = { 'C': 'DO', 'D': 'RÉ', 'E': 'MI', 'F': 'FA', 'G': 'SOL', 'A': 'LA', 'B': 'SI' };
let audioContext, analyser, microphone, dataArray = new Float32Array(2048);
let notesOnScreen = [], isPaused = false, currentMode = 'step', totalNotesInLevel = 0, notesValidated = 0;

let profiles = JSON.parse(localStorage.getItem('pk_profiles')) || [];
let currentProfile = localStorage.getItem('pk_current') || "Apprenti";

const DATA = {
    cours: [
        { titre: "1. Main Droite : DO à SOL", diff: 'easy', notes: [{note:'C4', d:800},{note:'D4', d:800},{note:'E4', d:800},{note:'F4', d:800},{note:'G4', d:1200}] },
        { titre: "2. Main Gauche : DO à SOL", diff: 'easy', notes: [{note:'C3', d:800},{note:'B2', d:800},{note:'A2', d:800},{note:'G2', d:800},{note:'F2', d:1200}] },
        { titre: "3. La Gamme Majeure (MG)", diff: 'medium', notes: [{note:'C3', d:500},{note:'D3', d:500},{note:'E3', d:500},{note:'F3', d:500},{note:'G3', d:500},{note:'A3', d:500},{note:'B3', d:500},{note:'C4', d:1000}] },
        { titre: "4. Accords de Base", diff: 'hard', notes: [{note:'C3', d:0},{note:'E3', d:0},{note:'G3', d:1500}, {note:'F2', d:0},{note:'A2', d:0},{note:'C3', d:1500}] }
    ],
    apprentissage: [
        { titre: "Muscles : 4e/5e doigt", diff: 'hard', notes: [{note:'A2', d:400},{note:'G2', d:400},{note:'A2', d:400},{note:'G2', d:400},{note:'F2', d:800}] },
        { titre: "Vitesse : DO-SOL", diff: 'hard', notes: [{note:'C4', d:200},{note:'D4', d:200},{note:'E4', d:200},{note:'F4', d:200},{note:'G4', d:800}] }
    ],
    morceaux: [
        { titre: "Au Clair de la Lune", diff: 'easy', notes: [{note:'C4', d:600},{note:'C4', d:600},{note:'C4', d:600},{note:'D4', d:600},{note:'E4', d:1000},{note:'D4', d:1000},{note:'C4', d:1000}] },
        { titre: "Nothing Else Matters", diff: 'medium', notes: [{note:'E2', d:500},{note:'G3', d:500},{note:'B3', d:500},{note:'E4', d:1000}] }
    ]
};

window.onload = () => {
    initPiano();
    updateProfileDisplay();
    switchTab('cours');
};

function initPiano() {
    const p = document.getElementById('piano');
    [2, 3, 4, 5, 6].forEach(oct => {
        noteStrings.forEach(n => {
            const isBlack = n.includes('#');
            const key = document.createElement('div');
            key.className = `key ${isBlack ? 'black' : ''}`;
            key.dataset.note = n + oct;
            if(!isBlack) key.textContent = noteNamesFR[n] || n;
            key.onclick = () => handleKeyPress(n + oct);
            key.ontouchstart = (e) => { e.preventDefault(); handleKeyPress(n + oct); };
            p.appendChild(key);
        });
    });
}

function updateProfileDisplay() {
    const list = document.getElementById('profiles-list');
    list.innerHTML = '';
    profiles.forEach(name => {
        const item = document.createElement('div');
        item.className = 'profile-item';
        item.innerHTML = `<span>👤 ${name}</span> ${name === currentProfile ? '✅' : ''}`;
        item.onclick = () => { currentProfile = name; localStorage.setItem('pk_current', name); updateProfileDisplay(); closeProfileModal(); };
        list.appendChild(item);
    });
    document.getElementById('display-username').textContent = currentProfile;
}

function openProfileModal() { document.getElementById('profile-modal').style.display = 'flex'; updateProfileDisplay(); }
function closeProfileModal() { document.getElementById('profile-modal').style.display = 'none'; }
function createNewProfile() {
    const val = document.getElementById('input-username').value.trim();
    if(val && !profiles.includes(val)) {
        profiles.push(val); localStorage.setItem('pk_profiles', JSON.stringify(profiles));
        currentProfile = val; localStorage.setItem('pk_current', val);
        document.getElementById('input-username').value = ''; updateProfileDisplay(); closeProfileModal();
    }
}

function switchTab(t) {
    const g = document.getElementById('content-grid'); g.innerHTML = '';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().includes(t.substring(0,2))));
    DATA[t].forEach(item => {
        let color = item.diff === 'easy' ? 'var(--easy)' : (item.diff === 'medium' ? 'var(--medium)' : 'var(--hard)');
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `<div style="color:${color}; font-size:10px; font-weight:bold; margin-bottom:5px;">${item.diff.toUpperCase()}</div><div>${item.titre}</div>`;
        c.onclick = () => startGame(item, (t === 'morceaux' ? 'flow' : 'step'));
        g.appendChild(c);
    });
}

function toggleFullScreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}

function startGame(data, mode) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    notesValidated = 0; totalNotesInLevel = data.notes.length; notesOnScreen = []; isPaused = false; currentMode = mode;
    updateProgress();
    let i = 0;
    function next() {
        if(i < data.notes.length && document.getElementById('game-container').style.display !== 'none') {
            drop(data.notes[i]); i++;
            setTimeout(next, data.notes[i-1].d || 1500);
        }
    }
    next();
}

function drop(nData) {
    const id = Math.random();
    const o = { ...nData, y: 0, ok: false, id: id, h: 60 };
    notesOnScreen.push(o);
    const k = document.querySelector(`.key[data-note="${o.note}"]`);
    if(!k) return;

    const el = document.createElement('div');
    el.className = 'falling-note'; el.id = "n-" + id; el.style.height = o.h + "px";
    k.appendChild(el);

    const container = document.getElementById('piano-container');
    const scrollTarget = k.offsetLeft - (window.innerWidth / 2) + (k.offsetWidth / 2);
    container.scrollTo({ left: scrollTarget, behavior: 'smooth' });

    function animate() {
        if(document.getElementById('game-container').style.display === 'none') return;
        const limit = window.innerHeight - (window.innerWidth > window.innerHeight ? 90 : 130);
        
        if(currentMode === 'step' && !o.ok && o.y >= limit - o.h) { 
            isPaused = true; el.classList.add('waiting'); o.y = limit - o.h; 
        }
        
        if(!isPaused) o.y += 3;
        el.style.transform = `translateY(${-o.y}px)`;
        
        if(o.y < window.innerHeight) requestAnimationFrame(animate); else el.remove();
    }
    animate();
}

function handleKeyPress(note) {
    const k = document.querySelector(`.key[data-note="${note}"]`);
    if(k) { k.classList.add('active'); setTimeout(() => k.classList.remove('active'), 200); }
    const t = notesOnScreen.find(n => n.note === note && !n.ok);
    if(t) {
        t.ok = true; notesValidated++; updateProgress();
        const el = document.getElementById("n-" + t.id);
        if(el) el.classList.add('hit');
        isPaused = false;
        if(notesValidated === totalNotesInLevel) setTimeout(quitGame, 1000);
    }
}

function updateProgress() { document.getElementById('progress-inner').style.width = (notesValidated/totalNotesInLevel)*100 + "%"; }
function quitGame() { document.getElementById('main-menu').style.display = 'block'; document.getElementById('game-container').style.display = 'none'; }

async function initMicrophone() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(s);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        microphone.connect(analyser);
        document.getElementById('mic-toggle').textContent = "🎤 Micro ON";
        detect();
    } catch (e) { alert("Micro requis."); }
}

function detect() {
    analyser.getFloatTimeDomainData(dataArray);
    let rms = 0; for (let i = 0; i < dataArray.length; i++) rms += dataArray[i] * dataArray[i];
    if (Math.sqrt(rms / dataArray.length) > 0.05) {
        const f = autoCorrelate(dataArray, audioContext.sampleRate);
        if (f !== -1) {
            const n = Math.round(12 * (Math.log(f / 440) / Math.log(2))) + 69;
            handleKeyPress(noteStrings[n % 12] + (Math.floor(n / 12) - 1));
        }
    }
    requestAnimationFrame(detect);
}

function autoCorrelate(b, s) {
    let SIZE = b.length, rms = 0;
    for (let i = 0; i < SIZE; i++) rms += b[i] * b[i];
    if (Math.sqrt(rms / SIZE) < 0.01) return -1;
    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE - i; j++) c[i] = c[i] + b[j] * b[j + i];
    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxv = -1, maxp = -1;
    for (let i = d; i < SIZE; i++) { if (c[i] > maxv) { maxv = c[i]; maxp = i; } }
    return s / maxp;
}
