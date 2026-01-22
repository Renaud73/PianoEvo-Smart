const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteNamesFR = { 'C': 'DO', 'D': 'RÉ', 'E': 'MI', 'F': 'FA', 'G': 'SOL', 'A': 'LA', 'B': 'SI' };

const DATA = {
    cours: [
        { titre: "1. Main Droite : DO à SOL", diff: 'easy', notes: [{note:'C4', d:800},{note:'D4', d:800},{note:'E4', d:800},{note:'F4', d:800},{note:'G4', d:1200}] },
        { titre: "2. Gamme DO Majeur", diff: 'medium', notes: [{note:'C3', d:500},{note:'D3', d:500},{note:'E3', d:500},{note:'F3', d:500},{note:'G3', d:500},{note:'A3', d:500},{note:'B3', d:500},{note:'C4', d:1000}] }
    ],
    apprentissage: [
        { titre: "Déliateur Arpège", diff: 'hard', notes: [{note:'C3', d:300},{note:'E3', d:300},{note:'G3', d:300},{note:'C4', d:300},{note:'G3', d:300},{note:'E3', d:300},{note:'C3', d:600}] }
    ],
    morceaux: [
        { titre: "Metallica - Nothing Else Matters", diff: 'medium', notes: [{note:'E2', d:600}, {note:'G2', d:600}, {note:'B2', d:600}, {note:'E3', d:1200}, {note:'B2', d:600}, {note:'G2', d:600}] },
        { titre: "Alan Walker - Faded", diff: 'easy', notes: [{note:'D#4', d:500}, {note:'D#4', d:500}, {note:'D#4', d:500}, {note:'A#3', d:500}, {note:'F3', d:500}, {note:'F3', d:500}, {note:'F3', d:500}, {note:'G#3', d:1000}] },
        { titre: "Loreen - Tattoo", diff: 'hard', notes: [{note:'G#4', d:400}, {note:'F#4', d:400}, {note:'G#4', d:400}, {note:'A#4', d:800}, {note:'G#4', d:400}, {note:'F#4', d:400}, {note:'D#4', d:1000}] }
    ]
};

let audioContext, analyser, microphone, micStream, isMicOn = false, dataArray = new Float32Array(2048);
let notesOnScreen = [], isPaused = false, currentMode = 'step', totalNotesInLevel = 0, notesValidated = 0;
let particles = [];
const canvas = document.getElementById('particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const FALL_SPEED = 5;

let profiles = JSON.parse(localStorage.getItem('pk_profiles')) || ["Apprenti"];
let currentProfile = localStorage.getItem('pk_current') || "Apprenti";

window.onload = () => { initPiano(); updateProfileDisplay(); switchTab('cours'); resizeCanvas(); animateParticles(); };
window.onresize = resizeCanvas;

function resizeCanvas() { if(canvas) { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; } }

// --- AUDIO ---
function playNoteSound(freq, vol = 0.3) {
    if(!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const g = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    g.gain.setValueAtTime(vol, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);
    osc.connect(g); g.connect(audioContext.destination);
    osc.start(); osc.stop(audioContext.currentTime + 1);
}

function getFreq(note) {
    const n = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return 440 * Math.pow(2, (n.indexOf(note.slice(0,-1)) + (parseInt(note.slice(-1)) - 4) * 12 - 9) / 12);
}

// --- MICROPHONE ON/OFF ---
async function toggleMicrophone() {
    const btn = document.getElementById('mic-toggle');
    if (!isMicOn) {
        try {
            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphone = audioContext.createMediaStreamSource(micStream);
            analyser = audioContext.createAnalyser(); 
            analyser.fftSize = 2048;
            microphone.connect(analyser);
            isMicOn = true;
            btn.textContent = "🎤 Micro ON";
            btn.style.background = "var(--easy)"; btn.style.color = "#000";
            detect();
        } catch (e) { alert("Micro non accessible."); }
    } else {
        if (micStream) micStream.getTracks().forEach(t => t.stop());
        isMicOn = false;
        btn.textContent = "🎤 Micro OFF";
        btn.style.background = "#333"; btn.style.color = "white";
    }
}

function detect() {
    if (!isMicOn) return;
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

// --- PARTICULES ---
class Particle {
    constructor(x, y) {
        this.x = x; this.y = y; this.size = Math.random()*4+2;
        this.spX = (Math.random()-0.5)*10; this.spY = (Math.random()-0.5)*10-5;
        this.alpha = 1;
    }
    update() { this.x += this.spX; this.y += this.spY; this.alpha -= 0.02; }
    draw() { ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = '#00f2ff'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
}

function animateParticles() {
    if(!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach((p,i) => { p.update(); p.draw(); if(p.alpha<=0) particles.splice(i,1); });
    requestAnimationFrame(animateParticles);
}

// --- JEU ---
function initPiano() {
    const p = document.getElementById('piano');
    [2,3,4,5,6].forEach(oct => {
        noteStrings.forEach(n => {
            const isB = n.includes('#');
            const k = document.createElement('div');
            k.className = `key ${isB?'black':''}`;
            k.dataset.note = n+oct;
            if(!isB) k.textContent = noteNamesFR[n];
            k.onmousedown = () => handleKeyPress(n+oct);
            p.appendChild(k);
        });
    });
}

function switchTab(t) {
    const g = document.getElementById('content-grid'); g.innerHTML = '';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().includes(t.substring(0,2))));
    DATA[t].forEach(item => {
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `<div style="color:var(--${item.diff}); font-size:10px; font-weight:bold;">${item.diff.toUpperCase()}</div><div style="font-size:13px; margin-top:5px;">${item.titre}</div>`;
        c.onclick = () => startGame(item, (t === 'morceaux' ? 'flow' : 'step'));
        g.appendChild(c);
    });
}

function startGame(data, mode) {
    document.getElementById('main-menu').style.display='none';
    document.getElementById('game-container').style.display='flex';
    resizeCanvas();
    notesValidated = 0; totalNotesInLevel = data.notes.length; notesOnScreen = []; isPaused = false; currentMode = mode;
    updateProgress();
    
    let i = 0;
    const next = () => {
        if(i < data.notes.length && document.getElementById('game-container').style.display !== 'none') {
            const n = data.notes[i];
            drop(n);
            if(currentMode === 'flow') {
                const fZoneHeight = document.getElementById('fall-zone').offsetHeight;
                const delay = ((fZoneHeight - 70) / FALL_SPEED) * 16.6;
                setTimeout(() => {
                    if(!isPaused && document.getElementById('game-container').style.display !== 'none') {
                        playNoteSound(getFreq(n.note), 0.15);
                    }
                }, delay);
            }
            i++;
            setTimeout(next, n.d || 1500);
        }
    };
    next();
}

function drop(nData) {
    const id = Math.random();
    const o = { ...nData, y: -120, ok: false, id: id, h: 70 };
    notesOnScreen.push(o);
    const k = document.querySelector(`.key[data-note="${o.note}"]`);
    const fZone = document.getElementById('fall-zone');
    const el = document.createElement('div');
    el.className = 'falling-note'; el.id = "n-"+id; el.style.height = o.h+"px";
    el.style.background = "linear-gradient(to bottom, rgba(0,242,255,0) 0%, var(--accent) 100%)";
    el.style.boxShadow = "0px 8px 15px var(--accent)";
    
    fZone.appendChild(el);

    function animate() {
        if(document.getElementById('game-container').style.display==='none') { el.remove(); return; }
        const kR = k.getBoundingClientRect();
        const zR = fZone.getBoundingClientRect();
        el.style.left = (kR.left - zR.left) + "px";
        el.style.width = kR.width + "px";
        
        if(!isPaused) o.y += FALL_SPEED;
        const hitPoint = zR.height - o.h;

        if(currentMode === 'step' && !o.ok && o.y >= hitPoint) {
            isPaused = true; o.y = hitPoint; el.classList.add('waiting');
            const container = document.getElementById('piano-container');
            container.scrollTo({ left: k.offsetLeft - (container.offsetWidth/2) + (k.offsetWidth/2), behavior: 'smooth' });
        }
        
        el.style.top = o.y + "px";
        if(o.y < zR.height + 100) requestAnimationFrame(animate); 
        else { el.remove(); notesOnScreen = notesOnScreen.filter(n => n.id !== id); }
    }
    animate();
}

function handleKeyPress(note) {
    const k = document.querySelector(`.key[data-note="${note}"]`);
    if(k) {
        k.classList.add('active'); setTimeout(()=>k.classList.remove('active'),150);
        playNoteSound(getFreq(note), 0.4);
        const r = k.getBoundingClientRect();
        const fR = document.getElementById('fall-zone').getBoundingClientRect();
        for(let i=0; i<15; i++) particles.push(new Particle(r.left - fR.left + r.width/2, fR.height));
    }
    const t = notesOnScreen.find(n => n.note === note && !n.ok);
    if(t) {
        t.ok = true; notesValidated++; updateProgress();
        const el = document.getElementById("n-"+t.id);
        if(el) el.remove();
        isPaused = false;
        if(notesValidated === totalNotesInLevel) setTimeout(quitGame, 1000);
    }
}

// --- UTILS ---
function updateProgress() { document.getElementById('progress-inner').style.width = (notesValidated/totalNotesInLevel)*100 + "%"; }
function quitGame() { document.getElementById('main-menu').style.display='block'; document.getElementById('game-container').style.display='none'; document.getElementById('fall-zone').innerHTML = '<canvas id="particle-canvas"></canvas><div id="hit-line"></div>'; resizeCanvas(); }
function toggleFullScreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
function openProfileModal() { document.getElementById('profile-modal').style.display = 'flex'; updateProfileDisplay(); }
function closeProfileModal() { document.getElementById('profile-modal').style.display = 'none'; }
function updateProfileDisplay() {
    const list = document.getElementById('profiles-list'); list.innerHTML = '';
    profiles.forEach(name => {
        const item = document.createElement('div'); item.className = 'profile-item';
        item.innerHTML = `<span>👤 ${name}</span> ${name === currentProfile ? '✅' : ''}`;
        item.onclick = () => { currentProfile = name; localStorage.setItem('pk_current', name); updateProfileDisplay(); closeProfileModal(); };
        list.appendChild(item);
    });
    document.getElementById('display-username').textContent = currentProfile;
}
function createNewProfile() {
    const val = document.getElementById('input-username').value.trim();
    if(val && !profiles.includes(val)) {
        profiles.push(val); localStorage.setItem('pk_profiles', JSON.stringify(profiles));
        currentProfile = val; localStorage.setItem('pk_current', val);
        document.getElementById('input-username').value = ''; updateProfileDisplay(); closeProfileModal();
    }
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
