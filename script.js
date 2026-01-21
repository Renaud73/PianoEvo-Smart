// 1. CONFIGURATION
const noteFreqs = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
};

let audioCtx, analyser, dataArray, isMicOn = false;
let notesOnScreen = [], score = 0, isPaused = false, gameMode = 'step', gameTimer;

// 2. BOUTONS (RETOUR & PLEIN ÉCRAN)
document.getElementById('btn-retour').onclick = function(e) {
    e.preventDefault();
    quitGame();
};

document.getElementById('btn-fullscreen').onclick = function(e) {
    e.preventDefault();
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();
        this.innerText = "✖ FERMER";
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        this.innerText = "📺 PLEIN ÉCRAN";
    }
};

// 3. MICROPHONE
async function startMic() {
    if (isMicOn) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Float32Array(analyser.fftSize);
        source.connect(analyser);
        isMicOn = true;
        document.getElementById('mic-label').innerText = "MICRO: ON";
        document.getElementById('mic-label').style.color = "#55efc4";
        micLoop();
    } catch (err) { console.log("Micro refusé"); }
}

function micLoop() {
    analyser.getFloatTimeDomainData(dataArray);
    let freq = autoCorrelate(dataArray, audioCtx.sampleRate);
    if (freq !== -1) {
        for (let note in noteFreqs) {
            if (Math.abs(freq - noteFreqs[note]) < (noteFreqs[note] * 0.03)) handleKey(note);
        }
    }
    requestAnimationFrame(micLoop);
}

function autoCorrelate(buf, sr) {
    let rms = 0; for (let v of buf) rms += v*v;
    if (Math.sqrt(rms/buf.length) < 0.01) return -1;
    let c = new Float32Array(buf.length);
    for (let i=0; i<buf.length; i++) for (let j=0; j<buf.length-i; j++) c[i] += buf[j]*buf[j+i];
    let d=0; while (c[d]>c[d+1]) d++;
    let maxv=-1, maxp=-1;
    for (let i=d; i<buf.length; i++) if (c[i]>maxv) { maxv=c[i]; maxp=i; }
    return sr/maxp;
}

// 4. JEU
function switchTab(tab) {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = '';
    const items = (tab === 'cours') ? 
        [{t:"Cours 1 : Do-Ré-Mi", n:[{note:'C4'},{note:'D4'},{note:'E4'}]}] : 
        [{t:"Pirates des Caraïbes", n:[{note:'A3'},{note:'C4'},{note:'D4'}]}];
    
    items.forEach(item => {
        let card = document.createElement('div'); card.className='card';
        card.innerHTML=`<h3>${item.t}</h3>`;
        card.onclick = async () => { await startMic(); startGame(item, tab==='cours'?'step':'flow'); };
        grid.appendChild(card);
    });
}

function startGame(data, mode) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    score = 0; notesOnScreen = []; isPaused = false; gameMode = mode;
    let i = 0;
    gameTimer = setInterval(() => {
        if (i >= data.n.length) { clearInterval(gameTimer); return; }
        if (!isPaused || gameMode === 'flow') { dropNote(data.n[i]); i++; }
    }, 2000);
}

function dropNote(nData) {
    const id = Math.random();
    const o = { ...nData, y: -50, ok: false, id: id };
    notesOnScreen.push(o);
    const el = document.createElement('div');
    el.id = "note-" + id;
    el.style.cssText = `position:absolute; width:30px; height:30px; background:#0984e3; border-radius:50%; top:-50px;`;
    const key = document.querySelector(`.key[data-note="${o.note}"]`);
    if(key) el.style.left = (key.offsetLeft + key.offsetWidth/2 - 15) + "px";
    document.getElementById('fall-zone').appendChild(el);
    function move() {
        if(gameMode === 'step' && !o.ok && o.y > 250) isPaused = true;
        if(!isPaused || gameMode === 'flow') o.y += 3;
        el.style.top = o.y + "px";
        if(o.y < 500 && document.getElementById("note-"+id)) requestAnimationFrame(move); else el.remove();
    }
    move();
}

function handleKey(note) {
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if(key) { key.classList.add('active'); setTimeout(()=>key.classList.remove('active'), 150); }
    const target = notesOnScreen.find(n => n.note === note && !n.ok);
    if(target) {
        target.ok = true; isPaused = false; score += 100;
        document.getElementById('live-score').textContent = score.toString().padStart(4, '0');
        const v = document.getElementById("note-" + target.id);
        if(v) v.remove();
    }
}

function quitGame() {
    clearInterval(gameTimer);
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('fall-zone').innerHTML = '';
}

// 5. CRÉER LE PIANO
const p = document.getElementById('piano');
const keys = [{n:'C',b:0},{n:'C#',b:1},{n:'D',b:0},{n:'D#',b:1},{n:'E',b:0},{n:'F',b:0},{n:'F#',b:1},{n:'G',b:0},{n:'G#',b:1},{n:'A',b:0},{n:'A#',b:1},{n:'B',b:0}];
[3,4,5].forEach(oct => {
    keys.forEach(k => {
        const div = document.createElement('div');
        div.className = `key ${k.b?'black':''}`;
        div.dataset.note = k.n + oct;
        div.onpointerdown = (e) => { e.preventDefault(); handleKey(k.n + oct); };
        p.appendChild(div);
    });
});

window.onload = () => switchTab('cours');
