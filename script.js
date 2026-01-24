const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteNamesFR = { 'C': 'DO', 'D': 'RÉ', 'E': 'MI', 'F': 'FA', 'G': 'SOL', 'A': 'LA', 'B': 'SI' };
const noteColors = { 'C': '#FF0000', 'D': '#FF7F00', 'E': '#FFFF00', 'F': '#00FF00', 'G': '#0000FF', 'A': '#4B0082', 'B': '#8B00FF' };
let gameLoopTimeout; // Variable pour stocker le minuteur du jeu
const DATA = {
    cours: [
        { titre: "1. DO - RÉ - MI (Main Droite)", diff: 'easy', notes: [{note:'C4',f:1},{note:'D4',f:2},{note:'E4',f:3},{note:'D4',f:2},{note:'C4',f:1}] },
        { titre: "2. La Main Droite complète (DO-SOL)", diff: 'easy', notes: [{note:'C4',f:1},{note:'D4',f:2},{note:'E4',f:3},{note:'F4',f:4},{note:'G4',f:5}] },
        { titre: "3. La Main Gauche (DO3-SOL3)", diff: 'easy', notes: [{note:'C3',m:'G',f:1},{note:'D3',m:'G',f:2},{note:'E3',m:'G',f:3},{note:'F3',m:'G',f:4},{note:'G3',m:'G',f:5}] },
        { titre: "4. Extension : Le LA (6 notes)", diff: 'easy', notes: [{note:'C4',f:1},{note:'E4',f:3},{note:'G4',f:5},{note:'A4',f:5},{note:'G4',f:4}] },
        { titre: "5. Saut d'Octave (DO3 à DO4)", diff: 'medium', notes: [{note:'C3',m:'G',f:1},{note:'C4',m:'D',f:1},{note:'C3',m:'G',f:1},{note:'C4',m:'D',f:1}] },
        { titre: "6. Accords de base (DO Majeur)", diff: 'medium', notes: [{note:'C4',f:1},{note:'E4',f:3},{note:'G4',f:5}] },
        { titre: "7. Passfage du Pouce (Gamme de DO)", diff: 'medium', notes: [{note:'C4',f:1},{note:'D4',f:2},{note:'E4',f:3},{note:'F4',f:1},{note:'G4',f:2},{note:'A4',f:3},{note:'B4',f:4},{note:'C5',f:5}] },
        { titre: "8. Les Touches Noires (FA#)", diff: 'hard', notes: [{note:'D4',f:1},{note:'F#4',f:3},{note:'A4',f:5}] },
        { titre: "9. Arpège Simple", diff: 'hard', notes: [{note:'C4',f:1},{note:'E4',f:2},{note:'G4',f:3},{note:'C5',f:5}] },
        { titre: "10. Coordination des mains", diff: 'hard', notes: [{note:'C3',m:'G',f:1},{note:'C4',m:'D',f:1},{note:'E3',m:'G',f:3},{note:'E4',m:'D',f:3}] }
    ],
    exercices: [
        { titre: "1. Vélocité Hanon n°1", diff: 'medium', notes: [{note:'C4',f:1},{note:'E4',f:2},{note:'F4',f:3},{note:'G4',f:4},{note:'A4',f:5}] },
        { titre: "2. Le Crabe (Indépendance)", diff: 'medium', notes: [{note:'C4',f:1},{note:'D4',f:2},{note:'C4',f:1},{note:'E4',f:3}] },
        { titre: "3. Force du Petit Doigt", diff: 'medium', notes: [{note:'G4',f:5},{note:'F4',f:4},{note:'G4',f:5},{note:'E4',f:3}] },
        { titre: "4. Triolets rapides", diff: 'medium', notes: [{note:'C4',f:1},{note:'D4',f:2},{note:'E4',f:3},{note:'C4',f:1},{note:'D4',f:2},{note:'E4',f:3}] },
        { titre: "5. Écart de Quarte", diff: 'medium', notes: [{note:'C4',f:1},{note:'F4',f:4},{note:'C4',f:1},{note:'F4',f:4}] },
        { titre: "6. Octaves Alternées", diff: 'hard', notes: [{note:'C3',f:1},{note:'C4',f:5},{note:'D3',f:1},{note:'D4',f:5}] },
        { titre: "7. Gamme Chromatique", diff: 'hard', notes: [{note:'C4',f:1},{note:'C#4',f:3},{note:'D4',f:1},{note:'D#4',f:3}] },
        { titre: "8. Accords de 4 notes", diff: 'hard', notes: [{note:'C4',f:1},{note:'E4',f:2},{note:'G4',f:3},{note:'B4',f:5}] },
        { titre: "9. Vitesse Pouce-Index", diff: 'hard', notes: [{note:'C4',f:1},{note:'D4',f:2},{note:'C4',f:1},{note:'D4',f:2}] },
        { titre: "10. Le Grand Final", diff: 'hard', notes: [{note:'C4',f:1},{note:'G4',f:5},{note:'C5',f:1},{note:'G5',f:5}] }
    ],
apprentissage: [
        { 
            titre: "Loreen - Tattoo", 
            diff: 'hard', 
            notes: [
                // Intro - Ambiance mystique
                {note:'A3', f:1, d:600}, {note:'C4', f:2, d:600}, {note:'E4', f:4, d:1200},
                {note:'A3', f:1, d:600}, {note:'C4', f:2, d:600}, {note:'E4', f:4, d:1200},
                // Couplet - "I don't care about them all..."
                {note:'E4', f:4, d:400}, {note:'E4', f:4, d:400}, {note:'E4', f:4, d:400}, {note:'D4', f:3, d:400}, {note:'C4', f:2, d:800},
                {note:'C4', f:2, d:400}, {note:'C4', f:2, d:400}, {note:'C4', f:2, d:400}, {note:'B3', f:1, d:800},
                // Pré-refrain
                {note:'E4', f:4, d:300}, {note:'F4', f:5, d:300}, {note:'E4', f:4, d:300}, {note:'D4', f:3, d:300}, {note:'C4', f:2, d:1200},
                // Refrain - "No I don't care about the pain..."
                {note:'A4', f:5, d:600}, {note:'G4', f:4, d:600}, {note:'F4', f:3, d:600}, {note:'E4', f:2, d:600},
                {note:'A4', f:5, d:600}, {note:'G4', f:4, d:600}, {note:'F4', f:3, d:600}, {note:'E4', f:2, d:600},
                {note:'D4', f:1, d:400}, {note:'E4', f:2, d:400}, {note:'F4', f:3, d:400}, {note:'E4', f:2, d:1500}
            ] 
        },
        { 
            titre: "Metallica - Nothing Else Matters (Full)", 
            diff: 'medium', 
            notes: [
                // Arpège Intro
                {note:'E2', f:1, d:400}, {note:'G3', f:2, d:400}, {note:'B3', f:3, d:400}, {note:'E4', f:5, d:1200},
                {note:'B3', f:3, d:400}, {note:'G3', f:2, d:400}, {note:'E2', f:1, d:400}, {note:'G3', f:2, d:400}, 
                {note:'B3', f:3, d:400}, {note:'E4', f:5, d:1200},
                // Mélodie principale
                {note:'E4', f:5, d:600}, {note:'D4', f:4, d:300}, {note:'C4', f:3, d:600}, {note:'A3', f:1, d:900},
                {note:'C4', f:3, d:600}, {note:'A3', f:1, d:900}, {note:'E4', f:5, d:600}, {note:'D4', f:4, d:300}, 
                {note:'C4', f:3, d:600}, {note:'G3', f:1, d:900}, {note:'A3', f:2, d:1200},
                // Suite de la mélodie
                {note:'A3', f:1, d:400}, {note:'B3', f:2, d:400}, {note:'C4', f:3, d:800},
                {note:'B3', f:2, d:400}, {note:'A3', f:1, d:400}, {note:'G3', f:1, d:1200}
            ] 
        },
        { 
    titre: "Pirates des Caraïbes (Version Longue)", 
    diff: 'hard', 
    notes: [
        // --- Thème Principal (Intro) ---
        {note:'A3', f:1, d:500}, {note:'C4', f:2, d:250}, {note:'D4', f:3, d:500}, {note:'D4', f:3, d:500},
        {note:'D4', f:3, d:500}, {note:'E4', f:4, d:250}, {note:'F4', f:5, d:500}, {note:'F4', f:5, d:500},
        {note:'F4', f:5, d:500}, {note:'G4', f:4, d:250}, {note:'E4', f:3, d:500}, {note:'E4', f:3, d:500},
        {note:'D4', f:2, d:500}, {note:'C4', f:1, d:250}, {note:'D4', f:2, d:750},

        // --- Thème B (Variation) ---
        {note:'A3', f:1, d:500}, {note:'C4', f:2, d:250}, {note:'D4', f:3, d:500}, {note:'D4', f:3, d:500},
        {note:'D4', f:3, d:500}, {note:'F4', f:5, d:250}, {note:'G4', f:1, d:500}, {note:'G4', f:1, d:500},
        {note:'G4', f:1, d:500}, {note:'A4', f:2, d:250}, {note:'A#4', f:3, d:500}, {note:'A#4', f:3, d:500},
        {note:'A4', f:2, d:500}, {note:'G4', f:1, d:250}, {note:'A4', f:2, d:750},

           ] 
},
         { 
    titre: "Axel F - Beverly Hills Cop (Long)", 
    diff: 'hard', 
    notes: [
        // --- PREMIÈRE PARTIE ---
        {note:'D4', f:1, m:'D', d:400}, {note:'F4', f:3, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'G4', f:4, m:'D', d:200}, {note:'D4', f:1, m:'D', d:200}, {note:'C4', f:1, m:'D', d:200},
        
        {note:'D4', f:1, m:'D', d:400}, {note:'A4', f:5, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'A#4', f:5, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'F4', f:2, m:'D', d:200},
        
        {note:'D4', f:1, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'D5', f:5, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'C4', f:1, m:'D', d:150}, {note:'C4', f:1, m:'D', d:150}, 
        {note:'E4', f:2, m:'D', d:150}, {note:'D4', f:1, m:'D', d:600},

        // --- DEUXIÈME PARTIE (REPRISE) ---
        {note:'D4', f:1, m:'D', d:400}, {note:'F4', f:3, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'G4', f:4, m:'D', d:200}, {note:'D4', f:1, m:'D', d:200}, {note:'C4', f:1, m:'D', d:200},
        
        // Final avec rebond rapide pour finir en beauté
        {note:'D4', f:1, m:'D', d:400}, {note:'A4', f:5, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'A#4', f:5, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'F4', f:2, m:'D', d:200},
        
        {note:'D4', f:1, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'D5', f:5, m:'D', d:400}, 
        {note:'C5', f:4, m:'D', d:200}, {note:'A4', f:3, m:'D', d:200}, {note:'G4', f:2, m:'D', d:200}, {note:'D4', f:1, m:'D', d:1000}
    ] 
}
    ],
musique: [
        { 
            titre: "Hallelujah (Extended)", 
            diff: 'easy', 
            notes: [
                {note:'E4', f:1, d:600}, {note:'G4', f:3, d:300}, {note:'G4', f:3, d:600}, {note:'G4', f:3, d:600},
                {note:'A4', f:4, d:300}, {note:'A4', f:4, d:600}, {note:'A4', f:4, d:600},
                {note:'G4', f:3, d:300}, {note:'G4', f:3, d:600}, {note:'G4', f:3, d:600},
                {note:'A4', f:4, d:300}, {note:'A4', f:4, d:600}, {note:'A4', f:4, d:600},
                {note:'G4', f:3, d:400}, {note:'A4', f:4, d:400}, {note:'B4', f:5, d:800},
                {note:'B4', f:5, d:400}, {note:'B4', f:5, d:400}, {note:'C5', f:5, d:800},
                {note:'C5', f:5, d:400}, {note:'C5', f:5, d:400}, {note:'D5', f:5, d:800},
                {note:'E4', f:1, d:1200}, {note:'G4', f:3, d:400}, {note:'A4', f:4, d:1600},
                {note:'A4', f:4, d:400}, {note:'G4', f:3, d:1600}, {note:'E4', f:1, d:400}, 
                {note:'E4', f:1, d:800}, {note:'F4', f:2, d:400}, {note:'E4', f:1, d:1200},
                {note:'D4', f:1, d:400}, {note:'C4', f:1, d:2000}
            ] 
        },
        { 
            titre: "Loreen - Tattoo (Grand Final)", 
            diff: 'hard', 
            notes: [
                {note:'A3', f:1, d:600}, {note:'C4', f:2, d:600}, {note:'E4', f:4, d:1200},
                {note:'A3', f:1, d:600}, {note:'C4', f:2, d:600}, {note:'E4', f:4, d:1200},
                {note:'E4', f:4, d:400}, {note:'E4', f:4, d:400}, {note:'E4', f:4, d:400}, {note:'D4', f:3, d:400}, {note:'C4', f:2, d:800},
                {note:'C4', f:2, d:400}, {note:'C4', f:2, d:400}, {note:'C4', f:2, d:400}, {note:'B3', f:1, d:800},
                {note:'E4', f:4, d:300}, {note:'F4', f:5, d:300}, {note:'E4', f:4, d:300}, {note:'D4', f:3, d:300}, {note:'C4', f:2, d:1200},
                {note:'A4', f:5, d:600}, {note:'G4', f:4, d:600}, {note:'F4', f:3, d:600}, {note:'E4', f:2, d:600},
                {note:'A4', f:5, d:600}, {note:'G4', f:4, d:600}, {note:'F4', f:3, d:600}, {note:'E4', f:2, d:600},
                {note:'D4', f:1, d:400}, {note:'E4', f:2, d:400}, {note:'F4', f:3, d:400}, {note:'E4', f:2, d:600},
                {note:'D4', f:1, d:400}, {note:'E4', f:2, d:400}, {note:'C4', f:1, d:1500}
            ] 
        },
       { 
    titre: "Pirates des Caraïbes (Version Longue)", 
    diff: 'hard', 
    notes: [
        // --- Thème Principal (Intro) ---
        {note:'A3', f:1, d:500}, {note:'C4', f:2, d:250}, {note:'D4', f:3, d:500}, {note:'D4', f:3, d:500},
        {note:'D4', f:3, d:500}, {note:'E4', f:4, d:250}, {note:'F4', f:5, d:500}, {note:'F4', f:5, d:500},
        {note:'F4', f:5, d:500}, {note:'G4', f:4, d:250}, {note:'E4', f:3, d:500}, {note:'E4', f:3, d:500},
        {note:'D4', f:2, d:500}, {note:'C4', f:1, d:250}, {note:'D4', f:2, d:750},

        // --- Thème B (Variation) ---
        {note:'A3', f:1, d:500}, {note:'C4', f:2, d:250}, {note:'D4', f:3, d:500}, {note:'D4', f:3, d:500},
        {note:'D4', f:3, d:500}, {note:'F4', f:5, d:250}, {note:'G4', f:1, d:500}, {note:'G4', f:1, d:500},
        {note:'G4', f:1, d:500}, {note:'A4', f:2, d:250}, {note:'A#4', f:3, d:500}, {note:'A#4', f:3, d:500},
        {note:'A4', f:2, d:500}, {note:'G4', f:1, d:250}, {note:'A4', f:2, d:750},

        // --- LE FINAL (Nouveau) ---
        {note:'A4', f:1, d:250}, {note:'A4', f:1, d:250}, {note:'A4', f:1, d:500}, 
        {note:'A#4', f:2, d:250}, {note:'A#4', f:2, d:250}, {note:'A#4', f:2, d:500},
        {note:'C5', f:3, d:250}, {note:'D5', f:4, d:250}, {note:'E5', f:5, d:500},
        {note:'D5', f:4, d:250}, {note:'C5', f:3, d:250}, {note:'D5', f:4, d:1500}
    ] 
},
        { 
            titre: "Metallica - Nothing Else Matters", 
            diff: 'medium', 
            notes: [
                {note:'E2', f:1, d:400}, {note:'G3', f:2, d:400}, {note:'B3', f:3, d:400}, {note:'E4', f:5, d:1200},
                {note:'B3', f:3, d:400}, {note:'G3', f:2, d:400}, {note:'E2', f:1, d:400}, {note:'G3', f:2, d:400}, 
                {note:'B3', f:3, d:400}, {note:'E4', f:5, d:1200}
            ] 
        },
        { titre: "ATC - All Around The World", diff: 'easy', notes: [
            // Theme principal x2 avec variation
            {note:'C4', d:300}, {note:'D4', d:300}, {note:'E4', d:300}, {note:'C4', d:300}, {note:'G4', d:600}, {note:'F4', d:600},
            {note:'E4', d:300}, {note:'D4', d:300}, {note:'E4', d:300}, {note:'C4', d:300}, {note:'D4', d:600}, {note:'C4', d:600},
            {note:'C4', d:300}, {note:'D4', d:300}, {note:'E4', d:300}, {note:'C4', d:300}, {note:'G4', d:600}, {note:'F4', d:600},
            {note:'E4', d:300}, {note:'D4', d:300}, {note:'E4', d:300}, {note:'C4', d:300}, {note:'D4', d:300}, {note:'E4', d:300}, {note:'C4', d:1200}
        ]},
        { titre: "Eiffel 65 - Blue", diff: 'medium', notes: [
            // Le célèbre riff "Da Be Dee" complet
            {note:'G4', d:200}, {note:'A4', d:200}, {note:'B4', d:200}, {note:'D5', d:200}, {note:'E5', d:200}, {note:'G4', d:200}, {note:'A4', d:200}, {note:'B4', d:400},
            {note:'G4', d:200}, {note:'A4', d:200}, {note:'B4', d:200}, {note:'D5', d:200}, {note:'E5', d:200}, {note:'G4', d:200}, {note:'A4', d:200}, {note:'B4', d:400},
            {note:'E5', d:200}, {note:'D5', d:200}, {note:'B4', d:200}, {note:'A4', d:200}, {note:'G4', d:800}
        ]},
        { titre: "ABBA - Gimme! Gimme! Gimme!", diff: 'medium', notes: [
            // Riff de synthé mythique rallongé
            {note:'D4', d:200}, {note:'E4', d:200}, {note:'F4', d:200}, {note:'A4', d:400}, {note:'F4', d:200}, {note:'A4', d:400}, {note:'F4', d:200}, {note:'D4', d:600},
            {note:'D4', d:200}, {note:'E4', d:200}, {note:'F4', d:200}, {note:'A4', d:400}, {note:'F4', d:200}, {note:'A4', d:400}, {note:'F4', d:200}, {note:'D4', d:400},
            {note:'C4', d:200}, {note:'D4', d:200}, {note:'E4', d:200}, {note:'G4', d:400}, {note:'E4', d:200}, {note:'D4', d:800}
        ]},
        { 
    titre: "Axel F - Beverly Hills Cop (Long)", 
    diff: 'hard', 
    notes: [
        // --- PREMIÈRE PARTIE ---
        {note:'D4', f:1, m:'D', d:400}, {note:'F4', f:3, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'G4', f:4, m:'D', d:200}, {note:'D4', f:1, m:'D', d:200}, {note:'C4', f:1, m:'D', d:200},
        
        {note:'D4', f:1, m:'D', d:400}, {note:'A4', f:5, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'A#4', f:5, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'F4', f:2, m:'D', d:200},
        
        {note:'D4', f:1, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'D5', f:5, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'C4', f:1, m:'D', d:150}, {note:'C4', f:1, m:'D', d:150}, 
        {note:'E4', f:2, m:'D', d:150}, {note:'D4', f:1, m:'D', d:600},

        // --- DEUXIÈME PARTIE (REPRISE) ---
        {note:'D4', f:1, m:'D', d:400}, {note:'F4', f:3, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'G4', f:4, m:'D', d:200}, {note:'D4', f:1, m:'D', d:200}, {note:'C4', f:1, m:'D', d:200},
        
        // Final avec rebond rapide pour finir en beauté
        {note:'D4', f:1, m:'D', d:400}, {note:'A4', f:5, m:'D', d:300}, {note:'D4', f:1, m:'D', d:200}, 
        {note:'D4', f:1, m:'D', d:150}, {note:'A#4', f:5, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'F4', f:2, m:'D', d:200},
        
        {note:'D4', f:1, m:'D', d:200}, {note:'A4', f:4, m:'D', d:200}, {note:'D5', f:5, m:'D', d:400}, 
        {note:'C5', f:4, m:'D', d:200}, {note:'A4', f:3, m:'D', d:200}, {note:'G4', f:2, m:'D', d:200}, {note:'D4', f:1, m:'D', d:1000}
    ] 
},
        { titre: "a-ha - Take On Me", diff: 'hard', notes: [
            // Refrain complet (notes hautes)
            {note:'B3', d:200}, {note:'B3', d:200}, {note:'E4', d:200}, {note:'A4', d:200}, {note:'A4', d:200}, {note:'G#4', d:200}, {note:'E4', d:200},
            {note:'G#4', d:200}, {note:'G#4', d:200}, {note:'G#4', d:200}, {note:'E4', d:200}, {note:'D4', d:200}, {note:'E4', d:200}, {note:'G#4', d:200},
            {note:'A4', d:200}, {note:'A4', d:200}, {note:'A4', d:200}, {note:'E4', d:200}, {note:'B4', d:400}, {note:'A4', d:800}
        ]},
        { titre: "O-Zone - Dragostea Din Tei", diff: 'medium', notes: [
            // "Ma-ia-hii, Ma-ia-huu" complet
            {note:'B4', d:300}, {note:'A4', d:300}, {note:'G4', d:300}, {note:'A4', d:300}, {note:'B4', d:300}, {note:'B4', d:300}, {note:'B4', d:600},
            {note:'A4', d:300}, {note:'G4', d:300}, {note:'A4', d:300}, {note:'A4', d:300}, {note:'A4', d:300}, {note:'A4', d:600},
            {note:'G4', d:300}, {note:'F#4', d:300}, {note:'E4', d:300}, {note:'E4', d:300}, {note:'E4', d:300}, {note:'E4', d:600}
        ]},
        { titre: "Gigi D'Agostino - L'Amour Toujours", diff: 'hard', notes: [
            // Le riff épique répété
            {note:'A4', d:200}, {note:'G4', d:200}, {note:'A4', d:200}, {note:'E4', d:400}, {note:'D4', d:400}, {note:'C4', d:400},
            {note:'A4', d:200}, {note:'G4', d:200}, {note:'A4', d:200}, {note:'E4', d:400}, {note:'D4', d:400}, {note:'C4', d:400},
            {note:'E4', d:200}, {note:'D4', d:200}, {note:'E4', d:200}, {note:'C4', d:400}, {note:'B3', d:400}, {note:'A3', d:800}
        ]},
        { titre: "Rick Astley - Never Gonna Give You Up", diff: 'medium', notes: [
            // Le refrain complet (Rick Roll permanent)
            {note:'C4', d:200}, {note:'D4', d:200}, {note:'F4', d:200}, {note:'D4', d:200}, {note:'A4', d:600}, {note:'A4', d:200}, {note:'G4', d:800},
            {note:'C4', d:200}, {note:'D4', d:200}, {note:'F4', d:200}, {note:'D4', d:200}, {note:'G4', d:600}, {note:'G4', d:200}, {note:'F4', d:400}, {note:'E4', d:200}, {note:'D4', d:400},
            {note:'C4', d:200}, {note:'D4', d:200}, {note:'F4', d:200}, {note:'D4', d:200}, {note:'F4', d:600}, {note:'G4', d:200}, {note:'E4', d:400}, {note:'D4', d:200}, {note:'C4', d:800}
        ]}
        
    ]
};

let audioContext, notesOnScreen = [], isPaused = false, currentMode = 'step', totalNotesInLevel = 0, notesValidated = 0;
let profiles = JSON.parse(localStorage.getItem('pk_profiles')) || [{name: "Apprenti", color: "#00f2ff", avatar: "🎹"}];
let currentProfileName = localStorage.getItem('pk_current') || "Apprenti";
let completedLevels = JSON.parse(localStorage.getItem('pk_completed')) || [];
let currentLevelTitle = "", isMicActive = false;
let audioAnalyser, microphoneStream, pitchBuffer = new Float32Array(2048);

window.onload = () => { 
    initPiano(); updateProfileDisplay(); switchTab('cours'); 
    document.getElementById('mic-toggle').onclick = toggleMic;
    injectColorPicker();
};

function injectColorPicker() {
    const addBox = document.querySelector('.add-profile-box');
    if(addBox && !document.getElementById('color-picker')){
        const picker = document.createElement('input');
        picker.type = 'color'; picker.id = 'color-picker'; picker.value = '#00f2ff';
        picker.style.marginRight = '10px';
        addBox.insertBefore(picker, addBox.firstChild);
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
    const p = document.getElementById('piano'); p.innerHTML = ''; let whiteKeyPosition = 0;
    [2,3,4,5,6].forEach(oct => {
        noteStrings.forEach(n => {
            if(oct === 6 && n !== 'C') return;
            const isB = n.includes('#'), k = document.createElement('div');
            k.className = `key ${isB ? 'black' : 'white'}`; k.dataset.note = n+oct;
            if(!isB) {
                k.innerHTML = `<span style="color: ${noteColors[n]}">${noteNamesFR[n]}</span>`;
                k.style.left = `${whiteKeyPosition}px`; whiteKeyPosition += 55;
            } else { k.style.left = `${whiteKeyPosition - 55 + 27.5 - 15}px`; }
            k.onmousedown = () => handleKeyPress(n+oct); p.appendChild(k);
        });
    });
    p.style.width = `${whiteKeyPosition + 40}px`;
}

function switchTab(tabType) {
    const g = document.getElementById('content-grid'); 
    g.innerHTML = '';
    
    // 1. Gérer l'illumination des boutons (les onglets)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabType}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Charger le contenu depuis DATA sans le logo de validation
    const items = DATA[tabType] || [];
    items.forEach(item => {
        const c = document.createElement('div'); 
        c.className = 'card';
        c.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:10px;">
                <b class="diff-${item.diff}">${item.diff.toUpperCase()}</b>
                </div>
            <div style="margin-top:5px; font-weight:bold;">${item.titre}</div>
        `;
       c.onclick = () => { 
            currentLevelTitle = item.titre; 
            const mode = (tabType === 'musique') ? 'auto' : 'step';
            startGame(item, mode); 
        };
        g.appendChild(c);
    });
}

function handleKeyPress(note) {
    const k = document.querySelector(`.key[data-note="${note}"]`);
    if(k) { 
        k.classList.add('active'); setTimeout(()=>k.classList.remove('active'), 200);
        const t = notesOnScreen.find(n => n.note === note && !n.ok);
        if(t) {
            t.ok = true; notesValidated++;
            const el = document.getElementById("n-"+t.id);
            if(el) {
                const rect = el.getBoundingClientRect(), fZone = document.getElementById('fall-zone'), fRect = fZone.getBoundingClientRect();
                createExplosion(rect.left - fRect.left + (rect.width/2), rect.top - fRect.top + (rect.height/2), noteColors[note.replace(/[0-9#]/g, '')] || '#fff');
                el.remove();
            }
            isPaused = false; playNoteSound(getFreq(note));
            if(notesValidated === totalNotesInLevel) { saveProgress(currentLevelTitle); setTimeout(() => { alert("Bravo !"); quitGame(); }, 500); }
        } else { playNoteSound(getFreq(note)); }
    }
}

function createExplosion(x, y, color) {
    const fZone = document.getElementById('fall-zone');
    const shock = document.createElement('div');
    shock.className = 'shockwave'; shock.style.left = x+'px'; shock.style.top = y+'px';
    shock.style.borderColor = color; shock.style.boxShadow = `0 0 15px ${color}`;
    fZone.appendChild(shock); setTimeout(() => shock.remove(), 400);

    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div'); p.className = 'smoke-particle';
        p.style.backgroundColor = color; p.style.left = x+'px'; p.style.top = y+'px';
        p.style.boxShadow = `0 0 10px ${color}`;
        const angle = (Math.random() * Math.PI) + Math.PI; 
        const force = 30 + Math.random() * 60;
        p.style.setProperty('--vx', `${Math.cos(angle)*force}px`);
        p.style.setProperty('--vy', `${Math.sin(angle)*force - 50}px`);
        fZone.appendChild(p); setTimeout(() => p.remove(), 1200);
    }
}

function drop(nData) {
    const fZone = document.getElementById('fall-zone'), k = document.querySelector(`.key[data-note="${nData.note}"]`);
    if(!k) return;
    const id = Math.random(), o = { ...nData, y: -100, ok: false, id: id, h: 70 };
    notesOnScreen.push(o);
    const el = document.createElement('div'); el.className = 'falling-note'; el.id = "n-"+id;
    el.style.width = k.offsetWidth + "px"; el.style.height = o.h + "px"; el.style.left = k.offsetLeft + "px";
    el.style.background = `linear-gradient(to bottom, ${noteColors[o.note.replace(/[0-9#]/g, '')] || '#00f2ff'}, #fff)`;
    
    if (o.f) { 
        const ind = document.createElement('div'); 
        ind.className = 'finger-indicator ' + (o.m === 'G' ? 'finger-left' : 'finger-right'); 
        ind.textContent = o.f; el.appendChild(ind); 
    }
    fZone.appendChild(el);

    const animate = () => {
        if(!isPaused) o.y += 4;
        const hit = fZone.offsetHeight - o.h;

        // --- LOGIQUE AUTOMATIQUE POUR LE MODE MUSIQUE ---
        if(currentMode === 'auto' && !o.ok && o.y >= hit) {
            handleKeyPress(o.note); // Joue la note automatiquement
            o.ok = true; // Empêche de la rejouer en boucle
        }

        // --- LOGIQUE PAUSE POUR LES AUTRES MODES ---
        if(currentMode === 'step' && !o.ok && o.y >= hit) { 
            isPaused = true; 
            o.y = hit; 
        }

        el.style.top = o.y + "px";
        if(o.y < fZone.offsetHeight + 100 && document.getElementById("n-"+id)) {
            requestAnimationFrame(animate);
        } else { 
            el.remove(); 
        }
    }; animate();
}
function setSpeed(val, btn) {
    gameSpeed = val;
    
    // On retire la classe 'active' de tous les boutons de vitesse
    document.querySelectorAll('.speed-controls button').forEach(b => b.classList.remove('active'));
    
    // On l'ajoute au bouton sur lequel on vient de cliquer
    if(btn) btn.classList.add('active');
    
    console.log("Vitesse réglée à : " + val);
}
function startGame(data, mode) {
    // 1. ARRÊT TOTAL de la boucle précédente
    clearTimeout(gameLoopTimeout);
    
    // 2. NETTOYAGE de la zone de chute et de la liste des notes
    const fZone = document.getElementById('fall-zone');
    fZone.innerHTML = ''; 
    notesOnScreen = []; 

    // 3. INITIALISATION DU NOUVEAU COURS
    document.getElementById('main-menu').style.display='none'; 
    document.getElementById('game-container').style.display='flex';
    fZone.style.width = document.getElementById('piano').offsetWidth + "px";
    
    notesValidated = 0; 
    totalNotesInLevel = data.notes.length; 
    isPaused = false; 
    currentMode = mode;

    let i = 0;
    const next = () => {
        if(i < data.notes.length) {
            const noteData = data.notes[i];
            drop(noteData);
            i++;
            // On stocke le timeout dans gameLoopTimeout
            gameLoopTimeout = setTimeout(next, noteData.d || 800); 
        }
    };
    next();
}
function quitGame() {
    // 1. On stoppe immédiatement le délai de la prochaine note
    clearTimeout(gameLoopTimeout);
    
    // 2. On change l'affichage
    document.getElementById('main-menu').style.display = 'block'; 
    document.getElementById('game-container').style.display = 'none'; 
    
    // 3. On nettoie visuellement et techniquement
    document.getElementById('fall-zone').innerHTML = '';
    notesOnScreen = []; 
    
    // 4. On force la mise en pause pour stopper les boucles d'animation requestAnimationFrame
    isPaused = true;
    
    console.log("Jeu arrêté et sons nettoyés.");
}
function updateProfileDisplay() {
    const list = document.getElementById('profiles-list'); list.innerHTML = '';
    profiles.forEach((p, index) => {
        const item = document.createElement('div'); item.className = 'profile-item';
        item.style.borderLeft = `4px solid ${p.color}`;
        item.innerHTML = `<span>${p.avatar} ${p.name} ${p.name === currentProfileName ? '✅' : ''}</span>
                          <button onclick="deleteProfile(${index}, event)" class="btn-del">🗑️</button>`;
        item.onclick = () => selectProfile(p.name); list.appendChild(item);
    });
    const curr = profiles.find(p => p.name === currentProfileName) || profiles[0];
    document.getElementById('display-username').textContent = curr.name;
    document.documentElement.style.setProperty('--accent', curr.color);
}

function createNewProfile() {
    const input = document.getElementById('input-username'), colorP = document.getElementById('color-picker');
    if(input.value.trim()) {
        profiles.push({ name: input.value.trim(), color: colorP.value, avatar: "🎵" });
        localStorage.setItem('pk_profiles', JSON.stringify(profiles)); updateProfileDisplay(); input.value = '';
    }
}

function deleteProfile(i, e) { e.stopPropagation(); if(profiles.length > 1 && confirm("Supprimer ?")) { profiles.splice(i, 1); localStorage.setItem('pk_profiles', JSON.stringify(profiles)); updateProfileDisplay(); } }
function selectProfile(n) { currentProfileName = n; localStorage.setItem('pk_current', n); updateProfileDisplay(); closeProfileModal(); }
function openProfileModal() { document.getElementById('profile-modal').style.display = 'flex'; }
function closeProfileModal() { document.getElementById('profile-modal').style.display = 'none'; }
function quitGame() { document.getElementById('main-menu').style.display='block'; document.getElementById('game-container').style.display='none'; notesOnScreen = []; }
function saveProgress(t) { if(!completedLevels.includes(t)) { completedLevels.push(t); localStorage.setItem('pk_completed', JSON.stringify(completedLevels)); } }
function getFreq(n) { const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]; return 440 * Math.pow(2, (notes.indexOf(n.slice(0,-1)) + (parseInt(n.slice(-1)) - 4) * 12 - 9) / 12); }
function playNoteSound(f) { 
    if(!audioContext) audioContext = new AudioContext();
    
    // Si l'audio est suspendu (souvent par le navigateur), on le relance
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const o = audioContext.createOscillator(), g = audioContext.createGain(); 
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
            // Ajout des contraintes anti-écho et anti-bruit
            microphoneStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true, // Désactive l'écho des haut-parleurs
                    noiseSuppression: true, // Réduit le bruit de fond
                    autoGainControl: false  // Évite que le volume change tout seul
                } 
            });

            isMicActive = true;
            btn.textContent = "🎤 Micro ON";
            btn.classList.add('mic-active');

            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(microphoneStream);
            audioAnalyser = audioContext.createAnalyser();
            audioAnalyser.fftSize = 2048;
            source.connect(audioAnalyser);

            const detect = () => {
                if (!isMicActive) return;
                audioAnalyser.getFloatTimeDomainData(pitchBuffer);
                let f = autoCorrelate(pitchBuffer, audioContext.sampleRate);
                if (f !== -1) {
                    let n = getNoteFromFreq(f);
                    if (n) handleKeyPress(n);
                }
                requestAnimationFrame(detect);
            };
            detect();
        } catch (err) {
            console.error(err);
            alert("Micro non activé ou non supporté.");
        }
    } else {
        isMicActive = false;
        btn.textContent = "🎤 Micro OFF";
        btn.classList.remove('mic-active');
        if (microphoneStream) {
            microphoneStream.getTracks().forEach(t => t.stop());
        }
    }
}

function autoCorrelate(b, s) {
    let rms = 0; for(let i=0;i<b.length;i++) rms += b[i]*b[i]; if(Math.sqrt(rms/b.length)<0.05) return -1;
    let r1=0, r2=b.length-1, thres=0.2;
    for(let i=0;i<b.length/2;i++) if(Math.abs(b[i])<thres){r1=i;break;}
    for(let i=1;i<b.length/2;i++) if(Math.abs(b[b.length-i])<thres){r2=b.length-i;break;}
    let b2 = b.slice(r1,r2), c = new Float32Array(b2.length);
    for(let i=0;i<b2.length;i++) for(let j=0;j<b2.length-i;j++) c[i] += b2[j]*b2[j+i];
    let d=0; while(c[d]>c[d+1]) d++;
    let maxv=-1, maxp=-1; for(let i=d;i<b2.length;i++) if(c[i]>maxv){maxv=c[i];maxp=i;}
    return s / maxp;
}

function getNoteFromFreq(f) {
    const n = 12 * (Math.log2(f / 440)) + 69; if(isNaN(n)) return null;
    return noteStrings[Math.round(n)%12] + (Math.floor(Math.round(n)/12)-1);
}
