const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteNamesFR = { 'C': 'DO', 'D': 'RÉ', 'E': 'MI', 'F': 'FA', 'G': 'SOL', 'A': 'LA', 'B': 'SI' };
const noteColors = { 'C': '#FF0000', 'D': '#FF7F00', 'E': '#FFFF00', 'F': '#00FF00', 'G': '#0000FF', 'A': '#4B0082', 'B': '#8B00FF' };
const availableEmojis = ["🎹", "🎵", "🎶", "🎼", "🎤", "🎸", "🎺", "🎻", "🥁", "🎬", "🎭", "🎪", "🎨", "🎰", "🎲", "🎳", "🎯", "🎮", "🎰", "🎪"];
let gameLoopTimeout;
let currentSpeed = 4;

// --- VARIABLES EMOJI ET RÔLE ---
let selectedRole = 'enfant';
let selectedEmoji = '🎹';
let audioContext, notesOnScreen = [], isPaused = false, currentMode = 'step', totalNotesInLevel = 0, notesValidated = 0;
let profiles = JSON.parse(localStorage.getItem('pk_profiles')) || [{name: "Apprenti", color: "#00f2ff", avatar: "🎹", role: "enfant", completed: []}];
let currentProfileName = localStorage.getItem('pk_current') || "Apprenti";
let currentLevelTitle = "", isMicActive = false;
let audioAnalyser, microphoneStream, pitchBuffer = new Float32Array(2048);
let colorMode = 'debutant';
setupMIDI();

window.onload = () => { 
    initPiano(); 
    updateProfileDisplay(); 
    switchTab('cours'); 
    
    const micBtn = document.getElementById('mic-toggle');
    if(micBtn) micBtn.onclick = toggleMic;
    
    setupMIDI();
};

const DATA = {
    cours: [
        { titre: "1. DO - RÉ - MI (Main Droite)", diff: 'easy', notes: [{note:'C4',f:1,d:400},{note:'D4',f:2,d:400},{note:'E4',f:3,d:400},{note:'D4',f:2,d:400},{note:'C4',f:1,d:400}] },
        { titre: "2. La Main Droite complète (DO-SOL)", diff: 'easy', notes: [{note:'C4',f:1,d:400},{note:'D4',f:2,d:400},{note:'E4',f:3,d:400},{note:'F4',f:4,d:400},{note:'G4',f:5,d:400}] },
        { titre: "3. La Main Gauche (DO3-SOL3)", diff: 'easy', notes: [{note:'C3',m:'G',f:1,d:400},{note:'D3',m:'G',f:2,d:400},{note:'E3',m:'G',f:3,d:400},{note:'F3',m:'G',f:4,d:400},{note:'G3',m:'G',f:5,d:400}] },
        { titre: "4. Extension : Le LA (6 notes)", diff: 'easy', notes: [{note:'C4',f:1,d:400},{note:'E4',f:3,d:400},{note:'G4',f:5,d:400},{note:'A4',f:5,d:400},{note:'G4',f:4,d:400}] },
        { titre: "5. Saut d'Octave (DO3 à DO4)", diff: 'medium', notes: [{note:'C3',m:'G',f:1,d:400},{note:'C4',m:'D',f:1,d:400},{note:'C3',m:'G',f:1,d:400},{note:'C4',m:'D',f:1,d:400}] },
        { titre: "6. Accords de base (DO Majeur)", diff: 'medium', notes: [{note:'C4',f:1,d:600},{note:'E4',f:3,d:600},{note:'G4',f:5,d:600}] },
        { titre: "7. Passage du Pouce (Gamme de DO)", diff: 'medium', notes: [{note:'C4',f:1,d:400},{note:'D4',f:2,d:400},{note:'E4',f:3,d:400},{note:'F4',f:1,d:400},{note:'G4',f:2,d:400},{note:'A4',f:3,d:400},{note:'B4',f:4,d:400},{note:'C5',f:5,d:400}] },
        { titre: "8. Les Touches Noires (FA#)", diff: 'hard', notes: [{note:'D4',f:1,d:400},{note:'F#4',f:3,d:400},{note:'A4',f:5,d:400}] },
        { titre: "9. Arpège Simple", diff: 'hard', notes: [{note:'C4',f:1,d:400},{note:'E4',f:2,d:400},{note:'G4',f:3,d:400},{note:'C5',f:5,d:400}] },
        { titre: "10. Coordination des mains", diff: 'hard', notes: [{note:'C3',m:'G',f:1,d:400},{note:'C4',m:'D',f:1,d:400},{note:'E3',m:'G',f:3,d:400},{note:'E4',m:'D',f:3,d:400}] }
    ],
    exercices: [
        { titre: "1. Vélocité Hanon n°1", diff: 'medium', notes: [{note:'C4',f:1,d:300},{note:'E4',f:2,d:300},{note:'F4',f:3,d:300},{note:'G4',f:4,d:300},{note:'A4',f:5,d:300}] },
        { titre: "2. Le Crabe (Indépendance)", diff: 'medium', notes: [{note:'C4',f:1,d:300},{note:'D4',f:2,d:300},{note:'C4',f:1,d:300},{note:'E4',f:3,d:300}] },
        { titre: "3. Force du Petit Doigt", diff: 'medium', notes: [{note:'G4',f:5,d:300},{note:'F4',f:4,d:300},{note:'G4',f:5,d:300},{note:'E4',f:3,d:300}] },
        { titre: "4. Triolets rapides", diff: 'medium', notes: [{note:'C4',f:1,d:200},{note:'D4',f:2,d:200},{note:'E4',f:3,d:200},{note:'C4',f:1,d:200},{note:'D4',f:2,d:200},{note:'E4',f:3,d:200}] },
        { titre: "5. Écart de Quarte", diff: 'medium', notes: [{note:'C4',f:1,d:400},{note:'F4',f:4,d:400},{note:'C4',f:1,d:400},{note:'F4',f:4,d:400}] },
        { titre: "6. Octaves Alternées", diff: 'hard', notes: [{note:'C3',f:1,d:400},{note:'C4',f:5,d:400},{note:'D3',f:1,d:400},{note:'D4',f:5,d:400}] },
        { titre: "7. Gamme Chromatique", diff: 'hard', notes: [{note:'C4',f:1,d:250},{note:'C#4',f:3,d:250},{note:'D4',f:1,d:250},{note:'D#4',f:3,d:250}] },
        { titre: "8. Accords de 4 notes", diff: 'hard', notes: [{note:'C4',f:1,d:600},{note:'E4',f:2,d:600},{note:'G4',f:3,d:600},{note:'B4',f:5,d:600}] },
        { titre: "9. Vitesse Pouce-Index", diff: 'hard', notes: [{note:'C4',f:1,d:200},{note:'D4',f:2,d:200},{note:'C4',f:1,d:200},{note:'D4',f:2,d:200}] },
        { titre: "10. Le Grand Final", diff: 'hard', notes: [{note:'C4',f:1,d:500},{note:'G4',f:5,d:500},{note:'C5',f:1,d:500},{note:'G5',f:5,d:500}] }
    ],
    apprentissage: [
        { titre: "Loreen - Tattoo", diff: 'hard', notes: [{note:'A3', f:1, d:600}, {note:'C4', f:2, d:600}, {note:'E4', f:4, d:1200}, {note:'A3', f:1, d:600}, {note:'C4', f:2, d:600}, {note:'E4', f:4, d:1200}, {note:'E4', f:4, d:400}, {note:'E4', f:4, d:400}, {note:'E4', f:4, d:400}, {note:'D4', f:3, d:400}, {note:'C4', f:2, d:800}, {note:'C4', f:2, d:400}, {note:'C4', f:2, d:400}, {note:'C4', f:2, d:400}, {note:'B3', f:1, d:800}, {note:'E4', f:4, d:300}, {note:'F4', f:5, d:300}, {note:'E4', f:4, d:300}, {note:'D4', f:3, d:300}, {note:'C4', f:2, d:1200}, {note:'A4', f:5, d:600}, {note:'G4', f:4, d:600}, {note:'F4', f:3, d:600}, {note:'E4', f:2, d:600}, {note:'A4', f:5, d:600}, {note:'G4', f:4, d:600}, {note:'F4', f:3, d:600}, {note:'E4', f:2, d:600}, {note:'D4', f:1, d:400}, {note:'E4', f:2, d:400}, {note:'F4', f:3, d:400}, {note:'E4', f:2, d:1500}] },
        { titre: "Metallica - Nothing Else Matters (Full)", diff: 'medium', notes: [{note:'E2', f:1, d:400}, {note:'G3', f:2, d:400}, {note:'B3', f:3, d:400}, {note:'E4', f:5, d:1200}, {note:'B3', f:3, d:400}, {note:'G3', f:2, d:400}, {note:'E2', f:1, d:400}, {note:'G3', f:2, d:400}, {note:'B3', f:3, d:400}, {note:'E4', f:5, d:1200}, {note:'E4', f:5, d:600}, {note:'D4', f:4, d:300}, {note:'C4', f:3, d:600}, {note:'A3', f:1, d:900}, {note:'C4', f:3, d:600}, {note:'A3', f:1, d:900}, {note:'E4', f:5, d:600}, {note:'D4', f:4, d:300}, {note:'C4', f:3, d:600}, {note:'G3', f:1, d:900}, {note:'A3', f:2, d:1200}, {note:'A3', f:1, d:400}, {note:'B3', f:2, d:400}, {note:'C4', f:3, d:800}, {note:'B3', f:2, d:400}, {note:'A3', f:1, d:400}, {note:'G3', f:1, d:1200}] },
        { titre: "Pirates des Caraïbes (Version Longue)", diff: 'hard', notes: [{note:'A3', f:1, d:500}, {note:'C4', f:2, d:250}, {note:'D4', f:3, d:500}, {note:'D4', f:3, d:500}, {note:'D4', f:3, d:500}, {note:'E4', f:4, d:250}, {note:'F4', f:5, d:500}, {note:'F4', f:5, d:500}, {note:'F4', f:5, d:500}, {note:'G4', f:4, d:250}, {note:'E4', f:3, d:500}, {note:'E4', f:3, d:500}, {note:'D4', f:2, d:500}, {note:'C4', f:1, d:250}, {note:'D4', f:2, d:750}, {note:'A3', f:1, d:500}, {note:'C4', f:2, d:250}, {note:'D4', f:3, d:500}, {note:'D4', f:3, d:500}, {note:'D4', f:3, d:500}, {note:'F4', f:5, d:250}, {note:'G4', f:1, d:500}, {note:'G4', f:1, d:500}, {note:'G4', f:1, d:500}, {note:'A4', f:2, d:250}, {note:'A#4', f:3, d:500}, {note:'A#4', f:3, d:500}, {note:'A4', f:2, d:500}, {note:'G4', f:1, d:250}, {note:'A4', f:2, d:750}] },
        { titre: "Axel F - Beverly Hills Cop (Long)", diff: 'hard', notes: [{note:'D4', f:1, m:'D', d:400}, {note:'F4', f:3, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, {note:'D4', f:1, m:'D', d:150}, {note:'G4', f:4, m:'D', d:200}, {note:'D4', f:1, m:'D', d:200}, {note:'C4', f:1, m:'D', d:200}, {note:'D4', f:1, m:'D', d:400}, {note:'A4', f:5, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, {note:'D4', f:1, m:'D', d:150}, {note:'A#4', f:5, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'F4', f:2, m:'D', d:200}, {note:'D4', f:1, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'D5', f:5, m:'D', d:200}, {note:'D4', f:1, m:'D', d:150}, {note:'C4', f:1, m:'D', d:150}, {note:'C4', f:1, m:'D', d:150}, {note:'E4', f:2, m:'D', d:150}, {note:'D4', f:1, m:'D', d:600}] }
    ],
    musique: [
        { titre: "Hallelujah (Extended)", diff: 'easy', notes: [{note:'E4', f:1, d:600}, {note:'G4', f:3, d:300}, {note:'G4', f:3, d:600}, {note:'G4', f:3, d:600}, {note:'A4', f:4, d:300}, {note:'A4', f:4, d:600}, {note:'A4', f:4, d:600}, {note:'G4', f:3, d:300}, {note:'G4', f:3, d:600}, {note:'G4', f:3, d:600}, {note:'A4', f:4, d:300}, {note:'A4', f:4, d:600}, {note:'A4', f:4, d:600}, {note:'G4', f:3, d:400}, {note:'A4', f:4, d:400}, {note:'B4', f:5, d:800}, {note:'B4', f:5, d:400}, {note:'B4', f:5, d:400}, {note:'C5', f:5, d:800}, {note:'C5', f:5, d:400}, {note:'C5', f:5, d:400}, {note:'D5', f:5, d:800}, {note:'E4', f:1, d:1200}, {note:'G4', f:3, d:400}, {note:'A4', f:4, d:1600}, {note:'A4', f:4, d:400}, {note:'G4', f:3, d:1600}, {note:'E4', f:1, d:400}, {note:'E4', f:1, d:800}, {note:'F4', f:2, d:400}, {note:'E4', f:1, d:1200}, {note:'D4', f:1, d:400}, {note:'C4', f:1, d:2000}] },
        { titre: "ATC - All Around The World", diff: 'easy', notes: [{note:'C4', d:300}, {note:'D4', d:300}, {note:'E4', d:300}, {note:'C4', d:300}, {note:'G4', d:600}, {note:'F4', d:600}, {note:'E4', d:300}, {note:'D4', d:300}, {note:'E4', d:300}, {note:'C4', d:300}, {note:'D4', d:600}, {note:'C4', d:600}] },
        { titre: "Eiffel 65 - Blue", diff: 'medium', notes: [{note:'G4', d:200}, {note:'A4', d:200}, {note:'B4', d:200}, {note:'D5', d:200}, {note:'E5', d:200}, {note:'G4', d:200}, {note:'A4', d:200}, {note:'B4', d:400}, {note:'E5', d:200}, {note:'D5', d:200}, {note:'B4', d:200}, {note:'A4', d:200}, {note:'G4', d:800}] },
        { titre: "ABBA - Gimme! Gimme! Gimme!", diff: 'medium', notes: [{note:'D4', d:200}, {note:'E4', d:200}, {note:'F4', d:200}, {note:'A4', d:400}, {note:'F4', d:200}, {note:'A4', d:400}, {note:'F4', d:200}, {note:'D4', d:600}, {note:'C4', d:200}, {note:'D4', d:200}, {note:'E4', d:200}, {note:'G4', d:400}, {note:'E4', d:200}, {note:'D4', d:800}] },
        { titre: "a-ha - Take On Me", diff: 'hard', notes: [{note:'B3', d:200}, {note:'B3', d:200}, {note:'E4', d:200}, {note:'A4', d:200}, {note:'A4', d:200}, {note:'G#4', d:200}, {note:'E4', d:200}, {note:'G#4', d:200}, {note:'G#4', d:200}, {note:'G#4', d:200}, {note:'E4', d:200}, {note:'D4', d:200}, {note:'E4', d:200}, {note:'G#4', d:200}, {note:'A4', d:200}, {note:'A4', d:200}, {note:'A4', d:200}, {note:'E4', d:200}, {note:'B4', d:400}, {note:'A4', d:800}] },
        { titre: "O-Zone - Dragostea Din Tei", diff: 'medium', notes: [{note:'B4', d:300}, {note:'A4', d:300}, {note:'G4', d:300}, {note:'A4', d:300}, {note:'B4', d:300}, {note:'B4', d:300}, {note:'B4', d:600}, {note:'A4', d:300}, {note:'G4', d:300}, {note:'A4', d:300}, {note:'A4', d:300}, {note:'A4', d:300}, {note:'A4', d:600}] },
        { titre: "Gigi D'Agostino - L'Amour Toujours", diff: 'hard', notes: [{note:'A4', d:200}, {note:'G4', d:200}, {note:'A4', d:200}, {note:'E4', d:400}, {note:'D4', d:400}, {note:'C4', d:400}, {note:'E4', d:200}, {note:'D4', d:200}, {note:'E4', d:200}, {note:'C4', d:400}, {note:'B3', d:400}, {note:'A3', d:800}] },
        { titre: "Rick Astley - Never Gonna Give You Up", diff: 'medium', notes: [{note:'C4', d:200}, {note:'D4', d:200}, {note:'F4', d:200}, {note:'D4', d:200}, {note:'A4', d:600}, {note:'A4', d:200}, {note:'G4', d:800}, {note:'C4', d:200}, {note:'D4', d:200}, {note:'F4', d:200}, {note:'D4', d:200}, {note:'G4', d:600}, {note:'G4', d:200}, {note:'F4', d:400}, {note:'E4', d:200}, {note:'D4', d:400}, {note:'C4', d:200}, {note:'D4', d:200}, {note:'F4', d:600}, {note:'G4', d:200}, {note:'E4', d:400}, {note:'D4', d:200}, {note:'C4', d:800}] }
    ]
};

function injectColorPicker() {
    const addBox = document.querySelector('.add-profile-box');
    if(addBox && !document.getElementById('color-picker')){
        const picker = document.createElement('input');
        picker.type = 'color'; 
        picker.id = 'color-picker'; 
        picker.value = '#00f2ff';
        picker.style.marginRight = '10px';
        addBox.insertBefore(picker, addBox.firstChild);
    }
}

function setupEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (!picker) return;
    picker.innerHTML = ''; 
    availableEmojis.forEach(emoji => {
        const span = document.createElement('span');
        span.classList.add('emoji-opt');
        span.innerText = emoji;
        if (emoji === selectedEmoji) span.classList.add('selected');
        span.onclick = () => {
            document.querySelectorAll('.emoji-opt').forEach(el => el.classList.remove('selected'));
            span.classList.add('selected');
            selectedEmoji = emoji;
        };
        picker.appendChild(span);
    });
}

function setRole(role) {
    selectedRole = role;
    document.getElementById('role-enfant').classList.remove('active');
    document.getElementById('role-adulte').classList.remove('active');
    if (role === 'enfant') {
        document.getElementById('role-enfant').classList.add('active');
    } else {
        document.getElementById('role-adulte').classList.add('active');
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => alert(`Erreur : ${err.message}`));
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

function initPiano() {
    const p = document.getElementById('piano'); 
    p.innerHTML = ''; 
    let whiteKeyPosition = 0;
    [2,3,4,5,6].forEach(oct => {
        noteStrings.forEach(n => {
            if(oct === 6 && n !== 'C') return;
            const isB = n.includes('#'), k = document.createElement('div');
            k.className = `key ${isB ? 'black' : 'white'}`; 
            k.dataset.note = n+oct;
            if(!isB) {
                k.innerHTML = `<span style="color: ${noteColors[n]}">${noteNamesFR[n]}</span>`;
                k.style.left = `${whiteKeyPosition}px`; 
                whiteKeyPosition += 55;
            } else { 
                k.style.left = `${whiteKeyPosition - 55 + 27.5 - 15}px`; 
            }
            k.onmousedown = () => handleKeyPress(n+oct); 
            p.appendChild(k);
        });
    });
    p.style.width = `${whiteKeyPosition + 40}px`;
}

function switchTab(tabType) {
    const g = document.getElementById('content-grid'); 
    g.innerHTML = '';
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabType}'`)) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    const currentP = profiles.find(p => p.name === currentProfileName) || profiles[0];
    const completed = currentP.completed || [];
    const isEnfant = currentP.role === 'enfant';

    const items = DATA[tabType] || [];
    items.forEach((item, index) => {
        const isLocked = isEnfant && index > 0 && !completed.includes(items[index-1].titre);
        
        const c = document.createElement('div'); 
        c.className = `card ${isLocked ? 'locked' : ''}`;
        c.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:10px;">
                <b class="diff-${item.diff}">${item.diff.toUpperCase()}</b>
                <span>${completed.includes(item.titre) ? '✅' : ''}</span>
            </div>
            <div style="margin-top:5px; font-weight:bold;">${isLocked ? '🔒 Verrouillé' : item.titre}</div>
        `;
        
        if(!isLocked) {
            c.onclick = () => { 
                currentLevelTitle = item.titre; 
                const mode = (tabType === 'musique') ? 'auto' : 'step'; 
                startGame(item, mode); 
            };
        }
        g.appendChild(c);
    });
}

function handleKeyPress(note, isManual = false) {
    // Animation de la touche
    const k = document.querySelector(`.key[data-note="${note}"]`);
    if(k) { 
        if (colorMode === 'expert') {
            k.style.background = "linear-gradient(to bottom, #ff8c00, #ff0000)";
            k.style.boxShadow = "0 0 30px #ff4500, 0 0 10px #ff0000";
            k.style.border = "2px solid #ffd700";
        } else if (colorMode === 'intermediaire') {
            k.style.background = "linear-gradient(to bottom, #ffffff 0%, #00d9ff 50%, #0080ff 100%)";
            k.style.boxShadow = "0 0 15px #ffffff, 0 0 30px #00ffff, 0 0 45px #0080ff";
            k.style.border = "2px solid #ffffff";
        } else {
            const color = noteColors[note.replace(/[0-9#]/g, '')] || '#00f2ff';
            k.style.backgroundColor = color;
            k.style.boxShadow = `0 0 20px ${color}`;
        }

        setTimeout(() => {
            k.style.background = "";
            k.style.backgroundColor = "";
            k.style.boxShadow = "";
            k.style.border = "";
        }, 200);
    }

    // Jouer le son
    playNoteSound(getFreq(note));

    // Chercher la note correspondante qui tombe
    const t = notesOnScreen.find(n => n.note === note && !n.ok);
    
    // SI NOTE TROUVÉE → Validation et explosion
    if(t) {
        t.ok = true; 
        notesValidated++;
        
        const targetKey = document.querySelector(`.key[data-note="${note}"]`);
        const hitLine = document.getElementById('hit-line');
        const fZone = document.getElementById('fall-zone');
        const noteElement = document.getElementById("n-" + t.id);

        if(targetKey && hitLine && fZone && noteElement) {
            const fZoneRect = fZone.getBoundingClientRect();
            const hitLineY = hitLine.getBoundingClientRect().top - fZoneRect.top;
            const relativeLeft = targetKey.getBoundingClientRect().left - fZoneRect.left;
            
            let visualColor = (colorMode === 'expert') ? "#ff4500" : 
                             (colorMode === 'intermediaire') ? "#00d9ff" : 
                             (noteColors[note.replace(/[0-9#]/g, '')] || '#00f2ff');
            
            createExplosion(
                relativeLeft + targetKey.offsetWidth/2, 
                hitLineY, 
                visualColor
            );
            
            noteElement.remove();
            notesOnScreen = notesOnScreen.filter(n => n.id !== t.id);
        }
        
        isPaused = false; 
        
        // Vérification de fin de niveau
        if(notesValidated === totalNotesInLevel) { 
            saveProgress(currentLevelTitle); 
            setTimeout(() => { 
                alert("Bravo ! Niveau terminé !"); 
                quitGame(); 
            }, 500); 
        }
    } 
    // SI PAS DE NOTE → petit effet (manuel uniquement)
    else if(isManual) {
        const targetKey = document.querySelector(`.key[data-note="${note}"]`);
        const fZone = document.getElementById('fall-zone');
        
        if(targetKey && fZone) {
            const keyRect = targetKey.getBoundingClientRect();
            const fZoneRect = fZone.getBoundingClientRect();
            
            createExplosion(
                keyRect.left - fZoneRect.left + keyRect.width/2, 
                keyRect.top - fZoneRect.top + keyRect.height/2, 
                '#888'
            );
        }
    }
}

function createExplosion(x, y, color) {
    const fZone = document.getElementById('fall-zone');
    if (!fZone) return;

    if (getComputedStyle(fZone).position === 'static') {
        fZone.style.position = 'relative';
    }

    const shock = document.createElement('div');
    shock.className = 'shockwave';
    shock.style.left = (x - 75) + 'px';
    shock.style.top = (y - 75) + 'px';
    shock.style.background = `radial-gradient(circle, ${color}44, transparent)`;
    
    fZone.appendChild(shock);

    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'spark-particle';
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.color = color;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 100;
        
        p.style.setProperty('--vx', `${Math.cos(angle) * speed}px`);
        p.style.setProperty('--vy', `${Math.sin(angle) * speed}px`);
        
        fZone.appendChild(p);
    }
    
    setTimeout(() => {
        document.querySelectorAll('.shockwave, .spark-particle').forEach(el => {
            if(el.parentNode) el.remove();
        });
    }, 1000);
}

function setSpeed(v) {
    currentSpeed = v;
    console.log("Nouvelle vitesse :", currentSpeed);
    document.querySelectorAll('.speed-controls button').forEach(b => {
        b.classList.remove('active');
        if (b.textContent.includes('Lent') && v === 2) b.classList.add('active');
        if (b.textContent.includes('Normal') && v === 4) b.classList.add('active');
        if (b.textContent.includes('Rapide') && v === 7) b.classList.add('active');
    });
}

function drop(nData) {
    const fZone = document.getElementById('fall-zone');
    const targetKey = document.querySelector(`.key[data-note="${nData.note}"]`);
    if(!targetKey || !fZone) return;

    const noteDuration = nData.d || 400; 
    const calculatedHeight = Math.max(50, (noteDuration / 10) * (currentSpeed / 4));
    const noteId = Math.random(); 

    const keyRect = targetKey.getBoundingClientRect();
    const fZoneRect = fZone.getBoundingClientRect();
    const relativeLeft = keyRect.left - fZoneRect.left;

    const o = { ...nData, y: -calculatedHeight, ok: false, id: noteId, h: calculatedHeight };
    notesOnScreen.push(o);

    const el = document.createElement('div');
    el.className = 'falling-note';
    el.id = "n-" + noteId;
    el.style.width = (targetKey.offsetWidth - 6) + "px"; 
    el.style.height = o.h + "px";
    el.style.left = (relativeLeft + 3) + "px";

    let visualColor;
    if (colorMode === 'expert') {
        visualColor = "#ff4500";
        el.style.background = "linear-gradient(to bottom, #ff8c00, #ff0000)";
        el.style.boxShadow = "0 0 30px #ff4500";
    } else if (colorMode === 'intermediaire') {
        visualColor = "#00d9ff";
        el.style.background = "linear-gradient(to bottom, #ffffff, #00d9ff)";
        el.style.boxShadow = "0 0 30px #00d9ff";
    } else {
        visualColor = noteColors[o.note.replace(/[0-9#]/g, '')] || '#00f2ff';
        el.style.background = `linear-gradient(to bottom, ${visualColor}, #fff)`;
        el.style.boxShadow = `0 0 20px ${visualColor}`;
    }
    el.style.setProperty('--note-color', visualColor);

    fZone.appendChild(el);

    const hitLine = document.getElementById('hit-line');
    const hitLineY = (hitLine.getBoundingClientRect().top - fZoneRect.top);

    const animate = () => {
        const currentEl = document.getElementById("n-" + noteId);
        if (!currentEl || o.ok) return;

        if(!isPaused) o.y += currentSpeed; 
        currentEl.style.top = o.y + "px";
        
        const bottomOfNote = o.y + o.h;
        
        // MODE AUTO : note jouée automatiquement
        if(currentMode === 'auto' && bottomOfNote >= hitLineY) { 
            o.ok = true;
            handleKeyPress(o.note, false);
            return; 
        }
        
        // MODE STEP : note s'arrête sur la ligne
        if(currentMode === 'step' && bottomOfNote >= hitLineY) { 
            isPaused = true; 
            o.y = hitLineY - o.h; 
            currentEl.style.top = o.y + "px";
        }

        if(o.y < fZone.offsetHeight + 100) {
            requestAnimationFrame(animate);
        } else {
            currentEl.remove();
            notesOnScreen = notesOnScreen.filter(n => n.id !== noteId);
        }
    }; 
    animate();
}

function startGame(data, mode) {
    clearTimeout(gameLoopTimeout);
    const fZone = document.getElementById('fall-zone');
    
    // VIDE LA ZONE mais GARDE la ligne de jeu
    const hitLine = document.getElementById('hit-line');
    fZone.innerHTML = '';
    if (hitLine) {
        fZone.appendChild(hitLine); // Remet la ligne immédiatement
    }
    
    notesOnScreen = []; 
    document.getElementById('main-menu').style.display='none'; 
    document.getElementById('game-container').style.display='flex';
    fZone.style.width = document.getElementById('piano').offsetWidth + "px";
    
    // CRÉER LA LIGNE SI ELLE N'EXISTE PAS
    if (!document.getElementById('hit-line')) {
        const newHitLine = document.createElement('div');
        newHitLine.id = 'hit-line';
        newHitLine.style.cssText = `
            position: absolute !important;
            bottom: 180px !important;
            width: 100% !important;
            height: 4px !important;
            background: linear-gradient(90deg, transparent, #fff, #ff00ff, #fff, transparent) !important;
            box-shadow: 0 0 20px var(--accent), 0 0 40px #ff00ff !important;
            z-index: 99999 !important;
        `;
        fZone.appendChild(newHitLine);
    }
    
    notesValidated = 0; 
    totalNotesInLevel = data.notes.length; 
    isPaused = false; 
    currentMode = mode;
    
    let i = 0;
    const next = () => {
        if (isPaused) {
            gameLoopTimeout = setTimeout(next, 100);
            return;
        }

        if(i < data.notes.length) {
            const noteData = data.notes[i];
            drop(noteData); 
            i++;
            gameLoopTimeout = setTimeout(next, noteData.d || 800);
        }
    };
    next();
}

function quitGame() {
    clearTimeout(gameLoopTimeout);
    document.getElementById('main-menu').style.display = 'block'; 
    document.getElementById('game-container').style.display = 'none'; 
    document.getElementById('fall-zone').innerHTML = '';
    notesOnScreen = []; 
    isPaused = true;

    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
        const tabType = activeTabBtn.getAttribute('onclick').match(/'([^']+)'/)[1];
        switchTab(tabType); 
    }
}

function updateProfileDisplay() {
    const list = document.getElementById('profiles-list'); 
    list.innerHTML = '';
    profiles.forEach((p, index) => {
        const item = document.createElement('div'); 
        item.className = 'profile-item';
        item.style.borderLeft = `4px solid ${p.color}`;
        item.innerHTML = `<span>${p.avatar} ${p.name} ${p.name === currentProfileName ? '✅' : ''}</span>
                          <button onclick="deleteProfile(${index}, event)" class="btn-del">❌</button>`;
        item.onclick = () => selectProfile(p.name); 
        list.appendChild(item);
    });
    const curr = profiles.find(p => p.name === currentProfileName) || profiles[0];
    document.getElementById('display-username').textContent = curr.name;
    document.documentElement.style.setProperty('--accent', curr.color);
}

function createNewProfile() {
    const input = document.getElementById('input-username');
    const name = input.value.trim();
    if (name) {
        profiles.push({ 
            name: name, 
            color: '#00f2ff', 
            avatar: selectedEmoji,
            role: selectedRole, 
            completed: [] 
        });
        localStorage.setItem('pk_profiles', JSON.stringify(profiles));
        updateProfileDisplay();
        input.value = '';
        closeProfileModal();
    }
}

function deleteProfile(i, e) { 
    e.stopPropagation(); 
    if(profiles.length > 1 && confirm("Supprimer ?")) { 
        profiles.splice(i, 1); 
        localStorage.setItem('pk_profiles', JSON.stringify(profiles)); 
        updateProfileDisplay(); 
    } 
}

function selectProfile(n) { 
    currentProfileName = n; 
    localStorage.setItem('pk_current', n); 
    updateProfileDisplay(); 
    closeProfileModal(); 
    switchTab('cours'); 
}

function openProfileModal() { 
    document.getElementById('profile-modal').style.display = 'flex'; 
    setupEmojiPicker(); 
}

function closeProfileModal() { 
    document.getElementById('profile-modal').style.display = 'none'; 
}

function saveProgress(title) {
    const currentP = profiles.find(p => p.name === currentProfileName);
    if(currentP) {
        if(!currentP.completed) currentP.completed = [];
        if(!currentP.completed.includes(title)) {
            currentP.completed.push(title);
            localStorage.setItem('pk_profiles', JSON.stringify(profiles));
        }
    }
}

function getFreq(n) { 
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]; 
    return 440 * Math.pow(2, (notes.indexOf(n.slice(0,-1)) + (parseInt(n.slice(-1)) - 4) * 12 - 9) / 12); 
}

function playNoteSound(f) { 
    if(!audioContext) audioContext = new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();
    const o = audioContext.createOscillator(), 
          g = audioContext.createGain(); 
    o.frequency.value = f; 
    g.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1); 
    o.connect(g); 
    g.connect(audioContext.destination); 
    o.start(); 
    o.stop(audioContext.currentTime + 1); 
}

async function toggleMic() {
    const btn = document.getElementById('mic-toggle');
    if (!isMicActive) {
        try {
            microphoneStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: true, 
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') await audioContext.resume();

            const source = audioContext.createMediaStreamSource(microphoneStream);
            audioAnalyser = audioContext.createAnalyser(); 
            audioAnalyser.fftSize = 2048; 
            source.connect(audioAnalyser);

            isMicActive = true; 
            btn.textContent = "🎤 Micro ON"; 
            btn.classList.add('mic-active');
            
            const detect = () => {
                if (!isMicActive) return;
                audioAnalyser.getFloatTimeDomainData(pitchBuffer);
                let f = autoCorrelate(pitchBuffer, audioContext.sampleRate);
                
                if (f !== -1 && f > 60 && f < 2000) {
                    let n = getNoteFromFreq(f); 
                    if (n) {
                        console.log("Note détectée :", n);
                        handleKeyPress(n); 
                    }
                }
                requestAnimationFrame(detect);
            }; 
            detect();
        } catch (err) { 
            alert("Impossible d'activer le micro : " + err.message); 
        }
    } else {
        isMicActive = false; 
        btn.textContent = "🎤 Micro OFF"; 
        btn.classList.remove('mic-active');
        if (microphoneStream) microphoneStream.getTracks().forEach(t => t.stop());
    }
}

function autoCorrelate(b, s) {
    let rms = 0; 
    for(let i=0; i<b.length; i++) rms += b[i]*b[i]; 
    
    if(Math.sqrt(rms/b.length) < 0.05) return -1;
    
    let r1=0, r2=b.length-1, thres=0.1;
    for(let i=0; i<b.length/2; i++) if(Math.abs(b[i])<thres){r1=i;break;}
    for(let i=1; i<b.length/2; i++) if(Math.abs(b[b.length-i])<thres){r2=b.length-i;break;}
    
    let b2 = b.slice(r1,r2), c = new Float32Array(b2.length);
    for(let i=0; i<b2.length; i++) for(let j=0; j<b2.length-i; j++) c[i] += b2[j]*b2[j+i];
    
    let d=0; while(c[d]>c[d+1]) d++;
    let maxv=-1, maxp=-1; 
    for(let i=d; i<b2.length; i++) if(c[i]>maxv){maxv=c[i];maxp=i;}
    
    return s / maxp;
}

function getNoteFromFreq(f) {
    const n = 12 * (Math.log2(f / 440)) + 69; 
    if(isNaN(n)) return null;
    return noteStrings[Math.round(n)%12] + (Math.floor(Math.round(n)/12)-1);
}

function toggleColorMode() {
    const btn = document.getElementById('color-mode-btn');
    if (colorMode === 'debutant') {
        colorMode = 'intermediaire';
        btn.textContent = "Intermédiaire";
        btn.style.color = "var(--medium)";
    } else if (colorMode === 'intermediaire') {
        colorMode = 'expert';
        btn.textContent = "🔥 EXPERT";
        btn.style.color = "#ff00ff";
        btn.classList.add('expert-glow');
    } else {
        colorMode = 'debutant';
        btn.textContent = "Débutant";
        btn.style.color = "var(--accent)";
        btn.classList.remove('expert-glow');
    }
}

document.addEventListener('keydown', (e) => {
    const keyMap = {
        'a': 'C4', 'z': 'D4', 'e': 'E4', 'r': 'F4', 't': 'G4',
        'y': 'A4', 'u': 'B4', 'q': 'C5', 's': 'C#4', 'd': 'D#4',
        'g': 'F#4', 'h': 'G#4', 'j': 'A#4'
    };
    if (keyMap[e.key.toLowerCase()]) {
        handleKeyPress(keyMap[e.key.toLowerCase()]);
    }
});

function setupMIDI() {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }
}

function onMIDISuccess(midiAccess) {
    console.log("Système MIDI prêt !");
    for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
    }
    midiAccess.onstatechange = (e) => {
        if(e.port.state === 'connected') setupMIDI();
    };
}

function onMIDIFailure() { console.log("Impossible d'accéder au MIDI."); }

function handleMIDIMessage(event) {
    const [command, note, velocity] = event.data;
    if (command === 144 && velocity > 0) {
        const noteName = midiNoteToName(note);
        handleKeyPress(noteName);
    }
}

function midiNoteToName(midiNumber) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(midiNumber / 12) - 1;
    return notes[midiNumber % 12] + octave; 
}
