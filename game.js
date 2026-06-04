const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const zoneEl = document.querySelector("#zone");
const scoreEl = document.querySelector("#score");
const batteryEl = document.querySelector("#battery");
const heartsEl = document.querySelector("#hearts");
const overlay = document.querySelector("#overlay");
const messageEl = document.querySelector("#message");
const startBtn = document.querySelector("#startBtn");
const resetBtn = document.querySelector("#resetBtn");
const musicBtn = document.querySelector("#musicBtn");
const soundBtn = document.querySelector("#soundBtn");
const showcaseVideoEl = document.querySelector("#showcaseVideo");
const showcaseFrame = document.querySelector("#showcaseFrame");

const W = canvas.width;
const H = canvas.height;
const WORLD_W = 9600;
const FLOOR_Y = 640;
const GRAVITY = 0.82;
const FRICTION = 0.86;
const MAX_SPEED = 10.4;
const JUMP = -19.2;
const PLAYER_SMALL = { w: 34, h: 54 };
const PLAYER_BIG = { w: 46, h: 72 };
const SHOWCASE_TIKTOK_EMBED = "https://www.tiktok.com/embed/v2/7549905634041466114";

const mapArt = new Image();
mapArt.src = "./assets/map-douarnenez-isometric.png";

const ayaSpecialArt = new Image();
ayaSpecialArt.src = "./assets/aya-special-bg.png";

const ayaQueenArt = new Image();
ayaQueenArt.src = "./assets/aya-queen-sky.png";

const ayaMoulinFinalArt = new Image();
ayaMoulinFinalArt.src = "./assets/aya-moulin-final.png";

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let musicTimer = null;
let musicStep = 0;
let musicGain = null;
let currentMusicTrack = 0;
let soundMuted = false;

const musicTracks = [
  {
    id: "map",
    name: "Carte",
    beatMs: 132,
    root: 43,
    leadRoot: 67,
    scale: [0, 3, 5, 7, 10, 12, 15, 17],
    leadPattern: [0, 2, 4, 5, 4, 2, 7, 5, 4, 5, 7, 9, 7, 5, 4, 2],
    bassPattern: [0, 0, 5, 5, 3, 3, 4, 4],
    leadSteps: [0, 3, 6, 8, 11, 14],
    leadWave: "square",
    bassWave: "square",
  },
  {
    id: "mario1",
    name: "College run",
    beatMs: 126,
    root: 40,
    leadRoot: 67,
    scale: [0, 2, 4, 5, 7, 9, 12, 14],
    leadPattern: [0, 2, 4, 7, 5, 4, 2, 0, 3, 5, 7, 9, 7, 5, 4, 2],
    bassPattern: [0, 0, 7, 7, 5, 5, 7, 7],
    leadSteps: [0, 2, 4, 6, 8, 10, 12, 14],
    leadWave: "square",
    bassWave: "square",
  },
  {
    name: "Skin care",
    id: "skincare",
    beatMs: 118,
    root: 45,
    leadRoot: 72,
    scale: [0, 2, 4, 7, 9, 12, 14, 16],
    leadPattern: [0, 1, 3, 5, 7, 5, 3, 1, 2, 4, 6, 7, 6, 4, 2, 1],
    bassPattern: [0, 4, 7, 4, 2, 5, 9, 5],
    leadSteps: [0, 2, 4, 6, 9, 12, 14],
    leadWave: "triangle",
    bassWave: "square",
  },
  {
    id: "mario2",
    name: "Famille run",
    beatMs: 112,
    root: 38,
    leadRoot: 69,
    scale: [0, 3, 5, 7, 10, 12, 15, 17],
    leadPattern: [0, 4, 2, 5, 3, 6, 4, 7, 5, 7, 4, 6, 3, 5, 2, 4],
    bassPattern: [0, 0, 5, 5, 7, 7, 3, 3],
    leadSteps: [0, 3, 5, 7, 8, 11, 13, 15],
    leadWave: "square",
    bassWave: "sawtooth",
  },
  {
    id: "daron",
    name: "Daron jokes",
    beatMs: 136,
    root: 36,
    leadRoot: 64,
    scale: [0, 2, 3, 5, 7, 9, 10, 12],
    leadPattern: [0, 1, 2, 1, 4, 3, 2, 0, 5, 4, 3, 2, 7, 6, 5, 4],
    bassPattern: [0, 0, 3, 3, 5, 5, 2, 2],
    leadSteps: [0, 4, 6, 8, 10, 12, 14],
    leadWave: "triangle",
    bassWave: "square",
  },
  {
    id: "mario3",
    name: "Moulin run",
    beatMs: 98,
    root: 35,
    leadRoot: 70,
    scale: [0, 1, 5, 7, 8, 10, 12, 13],
    leadPattern: [0, 5, 2, 6, 1, 7, 3, 5, 2, 6, 0, 7, 3, 5, 1, 6],
    bassPattern: [0, 0, 7, 7, 5, 5, 1, 1],
    leadSteps: [0, 1, 4, 6, 8, 10, 13, 15],
    leadWave: "sawtooth",
    bassWave: "square",
  },
  {
    id: "parental",
    name: "Tel 6 7",
    beatMs: 104,
    root: 38,
    leadRoot: 70,
    scale: [0, 1, 5, 6, 7, 10, 12, 13],
    leadPattern: [0, 5, 2, 6, 1, 7, 3, 5, 2, 6, 0, 7, 3, 5, 1, 6],
    bassPattern: [0, 0, 6, 6, 5, 5, 1, 1],
    leadSteps: [0, 1, 4, 6, 8, 10, 13, 15],
    leadWave: "sawtooth",
    bassWave: "square",
  },
  {
    id: "fighter",
    name: "Street epic",
    beatMs: 82,
    root: 34,
    leadRoot: 73,
    scale: [0, 1, 3, 5, 7, 8, 10, 12],
    leadPattern: [0, 3, 5, 7, 6, 5, 3, 1, 7, 5, 8, 7, 10, 8, 7, 5],
    bassPattern: [0, 0, 7, 0, 8, 8, 7, 5],
    leadSteps: [0, 2, 3, 5, 6, 8, 10, 11, 13, 15],
    leadWave: "sawtooth",
    bassWave: "sawtooth",
  },
  {
    name: "AYA",
    id: "aya",
    beatMs: 126,
    root: 41,
    leadRoot: 69,
    scale: [0, 2, 3, 7, 9, 10, 14, 15],
    leadPattern: [0, 3, 5, 7, 5, 3, 2, 0, 5, 7, 9, 10, 9, 7, 5, 3],
    bassPattern: [0, 0, 7, 7, 3, 3, 10, 10],
    leadSteps: [0, 3, 5, 7, 8, 11, 13, 15],
    leadWave: "square",
    bassWave: "triangle",
  },
];

const input = {
  left: false,
  leftPressed: false,
  right: false,
  rightPressed: false,
  down: false,
  downPressed: false,
  jump: false,
  jumpPressed: false,
  vannePressed: false,
};

const skincareProducts = [
  { id: "cleanser", name: "Nettoyant", short: "NET", color: "#9ce6ff" },
  { id: "serum", name: "Serum", short: "SER", color: "#ffd35a" },
  { id: "cream", name: "Creme", short: "CRM", color: "#ffd8ef" },
  { id: "spf", name: "SPF", short: "SPF", color: "#f8efd0" },
  { id: "tint", name: "Teint", short: "TNT", color: "#f1b37c" },
  { id: "blush", name: "Blush", short: "BLS", color: "#ff7eb6" },
  { id: "mascara", name: "Mascara", short: "MSC", color: "#20272f" },
  { id: "gloss", name: "Gloss", short: "GLS", color: "#ff9ec5" },
  { id: "straightener", name: "Lisseur", short: "LIS", color: "#86f7ff" },
];

const skincareHints = {
  cleanser: "D'abord on nettoie: meme le miroir dit 'commence propre'.",
  serum: "Le serum veut passer avant la creme, sinon il boude.",
  cream: "La creme ferme le sandwich, pas avant la garniture.",
  spf: "SPF en presque dernier: meme devant Le Moulin, on respecte l'ordre.",
  tint: "Le teint arrive apres la peau protegee: base propre, drama evite.",
  blush: "Le blush apres le teint: joues de showcase, pas avant.",
  mascara: "Mascara apres blush: les cils arrivent quand le visage est pret.",
  gloss: "Le gloss, c'est le boss final, pas le tuto.",
  straightener: "Le lisseur passe a la fin: cheveux propres, visage fini, plaques chaudes.",
};

const skincareTargets = {
  cleanser: { x: 640, y: 246, radius: 68, label: "visage entier" },
  serum: { x: 614, y: 264, radius: 50, label: "joues" },
  cream: { x: 664, y: 274, radius: 54, label: "creme" },
  spf: { x: 642, y: 204, radius: 54, label: "front SPF" },
  tint: { x: 640, y: 248, radius: 62, label: "teint" },
  blush: { x: 602, y: 270, radius: 38, label: "joue blush" },
  mascara: { x: 660, y: 232, radius: 36, label: "cils" },
  gloss: { x: 640, y: 292, radius: 34, label: "gloss" },
  straightener: { x: 548, y: 224, radius: 88, label: "longue meche" },
};

const momResponseOptions = [
  { id: "soft", label: "Excuse calme", hint: "pour Maman", color: "#ffd8ef" },
  { id: "adultBar", label: "Bar adultes", hint: "pour les copines", color: "#c8ff4e" },
  { id: "noPhone", label: "Pas de selfie", hint: "selfie / danse", color: "#86f7ff" },
];

const europeCapitals = [
  ["Albanie", "Tirana"],
  ["Allemagne", "Berlin"],
  ["Andorre", "Andorre-la-Vieille"],
  ["Armenie", "Erevan"],
  ["Autriche", "Vienne"],
  ["Azerbaidjan", "Bakou"],
  ["Belgique", "Bruxelles"],
  ["Bielorussie", "Minsk"],
  ["Bosnie-Herzegovine", "Sarajevo"],
  ["Bulgarie", "Sofia"],
  ["Chypre", "Nicosie"],
  ["Croatie", "Zagreb"],
  ["Danemark", "Copenhague"],
  ["Espagne", "Madrid"],
  ["Estonie", "Tallinn"],
  ["Finlande", "Helsinki"],
  ["France", "Paris"],
  ["Georgie", "Tbilissi"],
  ["Grece", "Athenes"],
  ["Hongrie", "Budapest"],
  ["Irlande", "Dublin"],
  ["Islande", "Reykjavik"],
  ["Italie", "Rome"],
  ["Kazakhstan", "Astana"],
  ["Kosovo", "Pristina"],
  ["Lettonie", "Riga"],
  ["Liechtenstein", "Vaduz"],
  ["Lituanie", "Vilnius"],
  ["Luxembourg", "Luxembourg"],
  ["Macedoine du Nord", "Skopje"],
  ["Malte", "La Valette"],
  ["Moldavie", "Chisinau"],
  ["Monaco", "Monaco"],
  ["Montenegro", "Podgorica"],
  ["Norvege", "Oslo"],
  ["Pays-Bas", "Amsterdam"],
  ["Pologne", "Varsovie"],
  ["Portugal", "Lisbonne"],
  ["Roumanie", "Bucarest"],
  ["Royaume-Uni", "Londres"],
  ["Russie", "Moscou"],
  ["Saint-Marin", "Saint-Marin"],
  ["Serbie", "Belgrade"],
  ["Slovaquie", "Bratislava"],
  ["Slovenie", "Ljubljana"],
  ["Suede", "Stockholm"],
  ["Suisse", "Berne"],
  ["Tchequie", "Prague"],
  ["Turquie", "Ankara"],
  ["Ukraine", "Kyiv"],
  ["Vatican", "Vatican"],
];

const parentalApps = [
  { id: "actu", name: "Actu", icon: "▶", color: "#ff5f6d" },
  { id: "whatsapp", name: "WhatsApp", icon: "WA", color: "#49c56b" },
  { id: "codes", name: "Codes", icon: "10x", color: "#86f7ff" },
  { id: "silent", name: "Mode discret", icon: "zzz", color: "#ffd35a" },
];

const ayaSpecialStats = [
  { name: "CHARISME", icon: "♥", color: "#ff4d56" },
  { name: "FLOW", icon: "♪", color: "#4b86ff" },
  { name: "STYLE", icon: "★", color: "#ffcf4e" },
  { name: "SUCCES", icon: "◆", color: "#a84dff" },
];

const ayaColumnMelody = [
  { lane: 1, midi: 69 },
  { lane: 2, midi: 72 },
  { lane: 1, midi: 74 },
  { lane: 3, midi: 76 },
  { lane: 2, midi: 74 },
  { lane: 0, midi: 72 },
  { lane: 1, midi: 69 },
  { lane: 2, midi: 67 },
  { lane: 3, midi: 72 },
  { lane: 2, midi: 74 },
  { lane: 1, midi: 76 },
  { lane: 0, midi: 74 },
  { lane: 1, midi: 72 },
  { lane: 2, midi: 69 },
  { lane: 3, midi: 67 },
  { lane: 1, midi: 69 },
];

const podcastReward = {
  title: "Sip & Gossip #29",
  guest: "avec Juju Fitcats",
  host: "Maghla",
};

const mapNodes = [
  { id: "platform1", kind: "platform", title: "Mario 1", subtitle: "College", x: 170, y: 306, level: 1 },
  { id: "platform2", kind: "platform", title: "Mario 2", subtitle: "Famille", x: 612, y: 588, level: 2 },
  { id: "sass", kind: "minigame", title: "Blagues", subtitle: "Daron", x: 426, y: 386, level: 3 },
  { id: "skincare", kind: "minigame", title: "Make-up", subtitle: "Avant Moulin", x: 1142, y: 596, level: 4 },
  { id: "platform3", kind: "platform", title: "Mario 3", subtitle: "Moulin", x: 1126, y: 270, level: 5 },
  { id: "momParty", kind: "minigame", title: "Maman", subtitle: "S'incruste", x: 526, y: 214, level: 6 },
  { id: "parental", kind: "minigame", title: "Controle", subtitle: "Telephone", x: 736, y: 356, level: 7 },
  { id: "fighter", kind: "minigame", title: "Street Johanne", subtitle: "Taxi Papa", x: 878, y: 462, level: 8 },
  { id: "finale", kind: "finale", title: "Special AYA", subtitle: "Rythme", x: 982, y: 500, level: 9 },
  { id: "showcase", kind: "video", title: "Showcase", subtitle: "AYA au Moulin", x: 1174, y: 330, level: 10 },
];

const platformRuns = {
  platform1: {
    id: "platform1",
    startX: 96,
    spawnX: 150,
    goalX: 3020,
    nextLevel: 2,
    nodeIndex: 0,
    goalText: "SORTIE",
    hearts: 4,
    enemySpeed: 0.9,
    quest: "Side quest: minutes + batterie pour filmer AYA ce soir.",
  },
  platform2: {
    id: "platform2",
    startX: 3120,
    spawnX: 3220,
    goalX: 6360,
    goalText: "DAMES",
    hearts: 3,
    enemySpeed: 1.12,
    nextLevel: 3,
    nodeIndex: 1,
    quest: "Objectif: sortir avec les amis aux Dames. Bonus: remplir la trousse skin care.",
  },
  platform3: {
    id: "platform3",
    startX: 6420,
    spawnX: 6500,
    goalX: 9440,
    nextLevel: 6,
    nodeIndex: 4,
    goalText: "AYA LIVE",
    hearts: 2,
    enemySpeed: 1.34,
    quest: "Side quest: assez de minutes et batterie pour filmer le showcase.",
  },
};

const platformChapters = {
  platform1: [
    { id: "1-1", title: "Cour du college", start: 96, sky: "#9fd4e2", mid: "#d7eebf", ground: "#3a8a66", accent: "#ffcf4e", tint: "rgba(255, 207, 78, 0.08)" },
    { id: "1-2", title: "Salles et casiers", start: 1450, sky: "#8bb8df", mid: "#d7d7ef", ground: "#59719a", accent: "#86f7ff", tint: "rgba(134, 247, 255, 0.1)" },
  ],
  platform2: [
    { id: "2-1", title: "Alertes Pronote", start: 3120, sky: "#f0b98f", mid: "#f4d4b7", ground: "#80594b", accent: "#ff9f68", tint: "rgba(255, 159, 104, 0.1)" },
    { id: "2-2", title: "Parents radar", start: 3900, sky: "#c99bd6", mid: "#e4c0dc", ground: "#7b4f88", accent: "#ff5fb7", tint: "rgba(255, 95, 183, 0.12)" },
    { id: "2-3", title: "Duduche et Coca", start: 4700, sky: "#a8d7b2", mid: "#e7d7a2", ground: "#6c7340", accent: "#c8ff4e", tint: "rgba(200, 255, 78, 0.12)" },
    { id: "2-4", title: "Plage des Dames", start: 5600, sky: "#7fc9e6", mid: "#d6efc7", ground: "#d7bd82", accent: "#86f7ff", tint: "rgba(134, 247, 255, 0.12)" },
  ],
  platform3: [
    { id: "3-1", title: "Sortie de Douarnenez", start: 6420, sky: "#526e99", mid: "#8fc8dc", ground: "#315875", accent: "#86f7ff", tint: "rgba(134, 247, 255, 0.1)" },
    { id: "3-2", title: "Mission Club Mate", start: 7050, sky: "#33265f", mid: "#7652a8", ground: "#291a45", accent: "#c8ff4e", tint: "rgba(200, 255, 78, 0.14)" },
    { id: "3-3", title: "Videur du Moulin", start: 7950, sky: "#5c204c", mid: "#c0528a", ground: "#3f1838", accent: "#ff5fb7", tint: "rgba(255, 95, 183, 0.15)" },
    { id: "3-4", title: "Showcase AYA", start: 8800, sky: "#101b3f", mid: "#29495a", ground: "#111922", accent: "#ffcf4e", tint: "rgba(255, 207, 78, 0.14)" },
  ],
};

const sassRounds = [
  {
    parent: "Je connais une blague sur les magasins, mais elle n'a pas supermarche.",
    options: [
      { text: "Elle etait presque drole.", points: -3, feedback: "Trop gentille: -3 min. Papa prend confiance." },
      { text: "Elle a surtout pas super ri.", points: 2, feedback: "Bonne esquive." },
      { text: "Ta blague est en liquidation judiciaire.", points: 4, feedback: "Daron touche en plein ego." },
    ],
  },
  {
    parent: "Tu sais pourquoi les plongeurs plongent en arriere ?",
    options: [
      { text: "Pourquoi ?", points: -2, feedback: "Erreur: tu as relance Papa." },
      { text: "Parce que devant c'est trop mainstream ?", points: 3, feedback: "Contre-blague valide." },
      { text: "Parce que sinon ils tombent dans ton niveau d'humour.", points: 4, feedback: "KO technique." },
    ],
  },
  {
    parent: "Je vais faire une imitation de l'accent du sud.",
    options: [
      { text: "Vas-y.", points: -2, feedback: "Tu l'as autorise. Grave erreur." },
      { text: "Encore une saison ?", points: 3, feedback: "Ca pique." },
      { text: "Ton accent a besoin de sous-titres.", points: 4, feedback: "Maximum ado." },
    ],
  },
  {
    parent: "Je suis fatigue, j'ai fait trop de jeux de mots.",
    options: [
      { text: "Repose-toi.", points: -3, feedback: "Trop sympa: -3 min." },
      { text: "Enfin une bonne nouvelle.", points: 3, feedback: "Daron destabilise." },
      { text: "Le silence, ton meilleur sketch.", points: 4, feedback: "Micro drop domestique." },
    ],
  },
  {
    parent: "Derniere blague, promis.",
    options: [
      { text: "Promis ?", points: -4, feedback: "Tu y crois encore: -4 min." },
      { text: "Cette phrase est deja une blague.", points: 3, feedback: "Bonne insolence." },
      { text: "On sauvegarde avant le boss final ?", points: 4, feedback: "Parfaitement irrespectueux." },
    ],
  },
];

const zones = [
  { name: "College", start: 0, sky: "#9fd4e2" },
  { name: "Famille", start: 3000, sky: "#93cfe2" },
  { name: "Plage des Dames", start: 5600, sky: "#8fc8dc" },
  { name: "Videur", start: 6400, sky: "#7db2cf" },
  { name: "Le Moulin", start: 8200, sky: "#7b9fc7" },
];

const level = {
  platforms: [
    { x: -200, y: FLOOR_Y, w: 1200, h: 100, kind: "ground" },
    { x: 1100, y: FLOOR_Y, w: 760, h: 100, kind: "ground" },
    { x: 1960, y: FLOOR_Y, w: 1080, h: 100, kind: "ground" },
    { x: 3060, y: FLOOR_Y, w: 760, h: 100, kind: "ground" },
    { x: 3940, y: FLOOR_Y, w: 620, h: 100, kind: "ground" },
    { x: 4720, y: FLOOR_Y, w: 860, h: 100, kind: "ground" },
    { x: 5720, y: FLOOR_Y, w: 700, h: 100, kind: "ground" },
    { x: 6420, y: FLOOR_Y, w: 740, h: 100, kind: "ground" },
    { x: 7320, y: FLOOR_Y, w: 650, h: 100, kind: "ground" },
    { x: 8100, y: FLOOR_Y, w: 1380, h: 100, kind: "ground" },
    { x: 390, y: 382, w: 56, h: 56, kind: "question" },
    { x: 454, y: 382, w: 56, h: 56, kind: "brick" },
    { x: 518, y: 382, w: 56, h: 56, kind: "question" },
    { x: 1160, y: 360, w: 56, h: 56, kind: "brick" },
    { x: 1224, y: 360, w: 56, h: 56, kind: "question" },
    { x: 1530, y: 330, w: 56, h: 56, kind: "brick" },
    { x: 1594, y: 330, w: 56, h: 56, kind: "brick" },
    { x: 2260, y: 386, w: 56, h: 56, kind: "question" },
    { x: 2324, y: 386, w: 56, h: 56, kind: "brick" },
    { x: 2860, y: 360, w: 56, h: 56, kind: "brick" },
    { x: 2924, y: 360, w: 56, h: 56, kind: "question" },
    { x: 3440, y: 358, w: 56, h: 56, kind: "brick" },
    { x: 3504, y: 358, w: 56, h: 56, kind: "question" },
    { x: 3568, y: 358, w: 56, h: 56, kind: "brick" },
    { x: 4930, y: 356, w: 56, h: 56, kind: "question" },
    { x: 4994, y: 356, w: 56, h: 56, kind: "brick" },
    { x: 6140, y: 348, w: 56, h: 56, kind: "brick" },
    { x: 6204, y: 348, w: 56, h: 56, kind: "question" },
    { x: 7050, y: 338, w: 56, h: 56, kind: "brick" },
    { x: 7114, y: 338, w: 56, h: 56, kind: "question" },
    { x: 8480, y: 334, w: 56, h: 56, kind: "question" },
    { x: 8544, y: 334, w: 56, h: 56, kind: "brick" },
    { x: 9280, y: 336, w: 56, h: 56, kind: "brick" },
    { x: 9344, y: 336, w: 56, h: 56, kind: "question" },
    { x: 910, y: FLOOR_Y - 88, w: 74, h: 88, kind: "pipe" },
    { x: 2810, y: FLOOR_Y - 104, w: 82, h: 104, kind: "pipe" },
    { x: 4560, y: FLOOR_Y - 92, w: 76, h: 92, kind: "pipe" },
    { x: 6220, y: FLOOR_Y - 116, w: 86, h: 116, kind: "pipe" },
    { x: 7960, y: FLOOR_Y - 124, w: 90, h: 124, kind: "pipe", magic: "capitalQuiz" },
    { x: 320, y: 530, w: 210, h: 28, kind: "stone" },
    { x: 660, y: 455, w: 190, h: 28, kind: "stone" },
    { x: 1040, y: 535, w: 230, h: 28, kind: "locker" },
    { x: 1420, y: 470, w: 240, h: 28, kind: "desk" },
    { x: 1830, y: 410, w: 170, h: 28, kind: "desk" },
    { x: 2180, y: 548, w: 240, h: 28, kind: "locker" },
    { x: 2540, y: 476, w: 250, h: 28, kind: "desk" },
    { x: 2840, y: 438, w: 220, h: 28, kind: "desk" },
    { x: 3180, y: 548, w: 270, h: 28, kind: "grass" },
    { x: 3580, y: 474, w: 210, h: 28, kind: "grass" },
    { x: 3980, y: 420, w: 200, h: 28, kind: "grass" },
    { x: 4400, y: 536, w: 230, h: 28, kind: "grass" },
    { x: 4820, y: 458, w: 250, h: 28, kind: "dock" },
    { x: 5240, y: 548, w: 280, h: 28, kind: "dock" },
    { x: 5680, y: 416, w: 220, h: 28, kind: "dock" },
    { x: 6040, y: 506, w: 230, h: 28, kind: "dock" },
    { x: 6280, y: 428, w: 150, h: 28, kind: "dock" },
    { x: 6500, y: 548, w: 280, h: 28, kind: "dock" },
    { x: 6900, y: 480, w: 210, h: 28, kind: "dock" },
    { x: 7300, y: 405, w: 185, h: 28, kind: "dock" },
    { x: 7700, y: 538, w: 265, h: 28, kind: "market" },
    { x: 8120, y: 472, w: 260, h: 28, kind: "market" },
    { x: 8540, y: 404, w: 220, h: 28, kind: "market" },
    { x: 8920, y: 520, w: 240, h: 28, kind: "market" },
    { x: 9200, y: 456, w: 220, h: 28, kind: "market" },
    { x: 9360, y: 360, w: 135, h: 28, kind: "market" },
  ],
  coins: [],
  memeTokens: [
    { x: 670, y: 392, w: 64, h: 42, text: "6 7", value: 7, taken: false },
    { x: 1680, y: 390, w: 84, h: 42, text: "RIZZ", value: 5, taken: false },
    { x: 2500, y: 414, w: 96, h: 42, text: "+TEL", value: 6, taken: false },
    { x: 2960, y: 294, w: 72, h: 42, text: "6 7", value: 7, taken: false },
    { x: 4200, y: 354, w: 88, h: 42, text: "NPC?", value: 4, taken: false },
    { x: 5360, y: 478, w: 72, h: 42, text: "6 7", value: 7, taken: false },
    { x: 6320, y: 360, w: 96, h: 42, text: "DAMES", value: 6, taken: false },
    { x: 7150, y: 410, w: 86, h: 42, text: "MATE", value: 6, taken: false },
    { x: 8640, y: 336, w: 112, h: 42, text: "AYA LIVE", value: 9, taken: false },
    { x: 9368, y: 296, w: 100, h: 42, text: "VIP AYA", value: 10, taken: false },
  ],
  careStops: [
    { x: 5840, y: FLOOR_Y - 92, w: 82, h: 62, kind: "straightener", used: false },
  ],
  clubMates: [
    { x: 5220, y: 392, w: 34, h: 78, taken: false },
    { x: 5480, y: 476, w: 34, h: 78, taken: false },
    { x: 5848, y: 344, w: 34, h: 78, taken: false },
    { x: 6280, y: 348, w: 34, h: 78, taken: false },
    { x: 6660, y: 470, w: 34, h: 78, taken: false },
    { x: 7060, y: 402, w: 34, h: 78, taken: false },
    { x: 7440, y: 326, w: 34, h: 78, taken: false },
    { x: 8170, y: 392, w: 34, h: 78, taken: false },
    { x: 8900, y: 440, w: 34, h: 78, taken: false },
    { x: 9240, y: 378, w: 34, h: 78, taken: false },
  ],
  batteries: [
    { x: 760, y: 392, w: 42, h: 28, value: 15, taken: false },
    { x: 1560, y: 270, w: 42, h: 28, value: 15, taken: false },
    { x: 2380, y: 500, w: 42, h: 28, value: 15, taken: false },
    { x: 2900, y: 392, w: 42, h: 28, value: 15, taken: false },
    { x: 3660, y: 420, w: 42, h: 28, value: 15, taken: false },
    { x: 5020, y: 404, w: 42, h: 28, value: 15, taken: false },
    { x: 5760, y: 360, w: 42, h: 28, value: 15, taken: false },
    { x: 6200, y: 458, w: 42, h: 28, value: 15, taken: false },
    { x: 6760, y: 500, w: 42, h: 28, value: 15, taken: false },
    { x: 7640, y: 484, w: 42, h: 28, value: 15, taken: false },
    { x: 8500, y: 350, w: 42, h: 28, value: 15, taken: false },
    { x: 9020, y: 464, w: 42, h: 28, value: 15, taken: false },
    { x: 9380, y: 310, w: 42, h: 28, value: 15, taken: false },
  ],
  skincarePickups: [
    { id: "cleanser", x: 3360, y: FLOOR_Y - 98, w: 42, h: 62, taken: false },
    { id: "serum", x: 3708, y: 406, w: 42, h: 62, taken: false },
    { id: "cream", x: 4070, y: FLOOR_Y - 98, w: 42, h: 62, taken: false },
    { id: "spf", x: 4490, y: 474, w: 42, h: 62, taken: false },
    { id: "tint", x: 4930, y: 395, w: 42, h: 62, taken: false },
    { id: "blush", x: 5360, y: 482, w: 42, h: 62, taken: false },
    { id: "mascara", x: 5760, y: 336, w: 42, h: 62, taken: false },
    { id: "gloss", x: 6120, y: 444, w: 42, h: 62, taken: false },
    { id: "straightener", x: 6288, y: 350, w: 64, h: 52, taken: false },
  ],
  powerups: [],
  enemies: [
    { x: 720, y: FLOOR_Y - 54, w: 52, h: 54, min: 610, max: 870, vx: 1.55, kind: "supervisor" },
    { x: 1030, y: 479, w: 52, h: 54, min: 1040, max: 1210, vx: 1.35, kind: "supervisor" },
    { x: 1510, y: 414, w: 52, h: 56, min: 1420, max: 1610, vx: 1.5, kind: "teacher" },
    { x: 1840, y: 354, w: 52, h: 56, min: 1830, max: 1970, vx: 1.45, kind: "teacher" },
    { x: 2260, y: FLOOR_Y - 58, w: 56, h: 58, min: 2100, max: 2390, vx: 1.9, kind: "cpe" },
    { x: 2580, y: 420, w: 60, h: 60, min: 2540, max: 2760, vx: 1.75, kind: "principal" },
    { x: 2880, y: 378, w: 60, h: 60, min: 2840, max: 3000, vx: 1.9, kind: "principal" },
    { x: 3330, y: FLOOR_Y - 48, w: 44, h: 48, min: 3200, max: 3480, vx: 2.05, kind: "pronote" },
    { x: 3700, y: 426, w: 44, h: 48, min: 3580, max: 3780, vx: 1.85, kind: "pronote" },
    { x: 4040, y: FLOOR_Y - 56, w: 54, h: 56, min: 3920, max: 4200, vx: 2.0, kind: "parent" },
    { x: 4440, y: FLOOR_Y - 56, w: 54, h: 56, min: 4300, max: 4620, vx: 2.15, kind: "parent" },
    { x: 4980, y: 416, w: 58, h: 42, min: 4870, max: 5060, vx: 0.45, kind: "duduche" },
    { x: 5380, y: FLOOR_Y - 42, w: 58, h: 42, min: 5260, max: 5540, vx: 1.75, kind: "coca" },
    { x: 5740, y: 366, w: 44, h: 48, min: 5685, max: 5900, vx: 2.1, kind: "pronote" },
    { x: 6140, y: 450, w: 54, h: 56, min: 6040, max: 6240, vx: 2.2, kind: "parent" },
    { x: 6640, y: FLOOR_Y - 48, w: 44, h: 48, min: 6480, max: 6800, vx: 2.4, kind: "phoneDrone" },
    { x: 7040, y: 422, w: 62, h: 58, min: 6900, max: 7120, vx: 1.55, kind: "bouncer" },
    { x: 7420, y: 347, w: 62, h: 58, min: 7310, max: 7480, vx: 1.7, kind: "bouncer" },
    { x: 8240, y: FLOOR_Y - 58, w: 62, h: 58, min: 8060, max: 8420, vx: 1.75, kind: "bouncer" },
    { x: 9020, y: FLOOR_Y - 58, w: 62, h: 58, min: 8840, max: 9160, vx: 1.95, kind: "bouncer" },
    { x: 9260, y: FLOOR_Y - 58, w: 62, h: 58, min: 9140, max: 9420, vx: 2.15, kind: "bouncer" },
  ],
  hazards: [
    { x: 1268, y: FLOOR_Y - 44, w: 150, h: 44, kind: "puddle" },
    { x: 2020, y: FLOOR_Y - 46, w: 112, h: 46, kind: "notes" },
    { x: 2660, y: FLOOR_Y - 48, w: 100, h: 48, kind: "brainrot" },
    { x: 3660, y: FLOOR_Y - 46, w: 112, h: 46, kind: "chores" },
    { x: 4300, y: FLOOR_Y - 48, w: 100, h: 48, kind: "brainrot" },
    { x: 5100, y: FLOOR_Y - 46, w: 138, h: 46, kind: "chores" },
    { x: 5920, y: FLOOR_Y - 44, w: 110, h: 44, kind: "puddle" },
    { x: 6300, y: FLOOR_Y - 46, w: 86, h: 46, kind: "chores" },
    { x: 6820, y: FLOOR_Y - 48, w: 118, h: 48, kind: "brainrot" },
    { x: 7600, y: FLOOR_Y - 46, w: 120, h: 46, kind: "notes" },
    { x: 8420, y: FLOOR_Y - 46, w: 136, h: 46, kind: "guestlist" },
    { x: 8840, y: FLOOR_Y - 44, w: 110, h: 44, kind: "puddle" },
    { x: 9300, y: FLOOR_Y - 46, w: 112, h: 46, kind: "guestlist" },
  ],
  goal: { x: 9180, y: FLOOR_Y - 136, w: 142, h: 136 },
};

for (const platform of level.platforms) {
  if (platform.kind === "ground") continue;
  if (["brick", "question", "pipe"].includes(platform.kind)) continue;
  const count = Math.max(2, Math.floor(platform.w / 72));
  for (let i = 0; i < count; i += 1) {
    level.coins.push({
      x: platform.x + 34 + i * (platform.w - 68) / Math.max(1, count - 1),
      y: platform.y - 48,
      r: 13,
      taken: false,
    });
  }
}

for (let x = 170; x < WORLD_W - 520; x += 310) {
  level.coins.push({
    x,
    y: FLOOR_Y - 74 - Math.sin(x * 0.01) * 22,
    r: 13,
    taken: false,
  });
}

level.enemies.forEach((enemy) => {
  enemy.spawnX = enemy.x;
  enemy.baseVx = Math.abs(enemy.vx) || 1.4;
});

let state = "menu";
let score = 0;
let battery = 0;
let lastTime = performance.now();
let cameraX = 0;
let shake = 0;
let floatingTexts = [];
let careTimer = 0;
let careMode = "";
let checkpointX = 96;
let skincareSelected = 0;
let skincareStep = 0;
let skincareFeedback = "";
let skincareFeedbackTimer = 0;
let skincareReturnX = 96;
let skincareMode = "road";
let skincareAim = 0.5;
let skincareAimDir = 1;
let skincareStyle = 0;
let skincareMistakes = 0;
let productHuntX = W / 2;
let productHuntItems = [];
let productHuntCollected = [];
let productHuntSpawnTimer = 0;
let productHuntFeedback = "";
let productHuntFeedbackTimer = 0;
let parentalSelected = 0;
let parentalVideos = 0;
let parentalCodes = 0;
let parentalStealth = 0;
let parentalFeedback = "";
let parentalFeedbackTimer = 0;
let parentalAlertTimer = 0;
let momLane = 1;
let momRespect = 0;
let momCringe = 0;
let momSpawnTimer = 0;
let momGuests = [];
let momFeedback = "";
let momFeedbackTimer = 0;
let unlockedLevel = 1;
let mapSelected = 0;
let sassRound = 0;
let sassSelected = 0;
let sassScore = 0;
let sassFeedback = "";
let sassFeedbackTimer = 0;
let sassAdvanceTimer = 0;
let confetti = [];
let levelVictory = null;
let levelVictoryBits = [];
let activePlatformRun = platformRuns.platform1;
let spawnCueTimer = 0;
let levelOneTutorialTimer = 0;
let ayaLane = 1;
let ayaBeatTimer = 0;
let ayaNotes = [];
let ayaGauge = [0, 0, 0, 0];
let ayaSpecialScore = 0;
let ayaCombo = 0;
let ayaFeedback = "";
let ayaFeedbackTimer = 0;
let ayaClearTimer = 0;
let ayaMelodyStep = 0;
let fighterJohanne = null;
let fighterDad = null;
let fighterProjectiles = [];
let fighterEffects = [];
let fighterTimer = 99;
let fighterAiTimer = 0;
let fighterFeedback = "";
let fighterFeedbackTimer = 0;
let fighterRoundOverTimer = 0;
let fighterCombo = 0;
let fighterDadJokeIndex = 0;
let fighterVanneIndex = 0;
let mangoSpeedTimer = 0;
let godCodeBuffer = "";
let capitalQuizQuestions = [];
let capitalQuizIndex = 0;
let capitalQuizSelected = 0;
let capitalQuizScore = 0;
let capitalQuizFeedback = "";
let capitalQuizFeedbackTimer = 0;
let capitalQuizDone = false;

const player = {
  x: 96,
  y: 420,
  w: PLAYER_SMALL.w,
  h: PLAYER_SMALL.h,
  vx: 0,
  vy: 0,
  hearts: 3,
  onGround: false,
  invuln: 0,
  facing: 1,
  frame: 0,
  big: false,
};

function resetGame() {
  state = "map";
  score = 0;
  battery = 0;
  cameraX = 0;
  shake = 0;
  careTimer = 0;
  careMode = "";
  checkpointX = 96;
  skincareSelected = 0;
  skincareStep = 0;
  skincareFeedback = "";
  skincareFeedbackTimer = 0;
  skincareReturnX = 96;
  skincareMode = "road";
  skincareAim = 0.5;
  skincareAimDir = 1;
  skincareStyle = 0;
  skincareMistakes = 0;
  productHuntX = W / 2;
  productHuntItems = [];
  productHuntCollected = [];
  productHuntSpawnTimer = 0;
  productHuntFeedback = "";
  productHuntFeedbackTimer = 0;
  parentalSelected = 0;
  parentalVideos = 0;
  parentalCodes = 0;
  parentalStealth = 0;
  parentalFeedback = "";
  parentalFeedbackTimer = 0;
  parentalAlertTimer = 0;
  momLane = 0;
  momRespect = 0;
  momCringe = 0;
  momSpawnTimer = 0;
  momGuests = [];
  momFeedback = "";
  momFeedbackTimer = 0;
  unlockedLevel = 1;
  mapSelected = 0;
  sassRound = 0;
  sassSelected = 0;
  sassScore = 0;
  sassFeedback = "";
  sassFeedbackTimer = 0;
  sassAdvanceTimer = 0;
  confetti = [];
  levelVictory = null;
  levelVictoryBits = [];
  activePlatformRun = platformRuns.platform1;
  spawnCueTimer = 0;
  levelOneTutorialTimer = 0;
  ayaLane = 1;
  ayaBeatTimer = 0;
  ayaNotes = [];
  ayaGauge = [0, 0, 0, 0];
  ayaSpecialScore = 0;
  ayaCombo = 0;
  ayaFeedback = "";
  ayaFeedbackTimer = 0;
  ayaClearTimer = 0;
  fighterJohanne = null;
  fighterDad = null;
  fighterProjectiles = [];
  fighterEffects = [];
  fighterTimer = 99;
  fighterAiTimer = 0;
  fighterFeedback = "";
  fighterFeedbackTimer = 0;
  fighterRoundOverTimer = 0;
  fighterCombo = 0;
  fighterDadJokeIndex = 0;
  fighterVanneIndex = 0;
  mangoSpeedTimer = 0;
  capitalQuizQuestions = [];
  capitalQuizIndex = 0;
  capitalQuizSelected = 0;
  capitalQuizScore = 0;
  capitalQuizFeedback = "";
  capitalQuizFeedbackTimer = 0;
  capitalQuizDone = false;
  Object.assign(player, {
    x: 96,
    y: 420,
    w: PLAYER_SMALL.w,
    h: PLAYER_SMALL.h,
    vx: 0,
    vy: 0,
    hearts: 3,
    onGround: false,
    invuln: 0,
    facing: 1,
    frame: 0,
    big: false,
  });
  for (const coin of level.coins) coin.taken = false;
  for (const token of level.memeTokens) token.taken = false;
  for (const stop of level.careStops) stop.used = false;
  for (const bottle of level.clubMates) bottle.taken = false;
  for (const batteryPack of level.batteries) batteryPack.taken = false;
  for (const pickup of level.skincarePickups) pickup.taken = false;
  level.powerups = [];
  for (const platform of level.platforms) platform.used = false;
  floatingTexts = [];
  level.enemies.forEach((enemy, index) => {
    enemy.x = enemy.spawnX;
    enemy.vx = enemy.baseVx;
  });
  overlay.classList.remove("victory");
  overlay.classList.remove("is-visible");
  setShowcaseVideoVisible(false);
  updateHud();
  syncMusicToState();
}

function startPlatformLevel(runId = "platform1") {
  activePlatformRun = platformRuns[runId] || platformRuns.platform1;
  syncSkincarePickupsFromCollection();
  const spawnX = activePlatformRun.spawnX || activePlatformRun.startX;
  state = "playing";
  cameraX = Math.max(0, Math.min(WORLD_W - W, spawnX - W * 0.32));
  shake = 0;
  careTimer = 0;
  careMode = "";
  checkpointX = spawnX;
  spawnCueTimer = 150;
  levelOneTutorialTimer = activePlatformRun.id === "platform1" ? 900 : 0;
  Object.assign(player, {
    x: spawnX,
    y: spawnFloorY(spawnX) - PLAYER_SMALL.h,
    w: PLAYER_SMALL.w,
    h: PLAYER_SMALL.h,
    vx: 0,
    vy: 0,
    hearts: activePlatformRun.hearts,
    onGround: false,
    invuln: 0,
    facing: 1,
    frame: 0,
    big: false,
  });
  mangoSpeedTimer = 0;
  level.powerups = [];
  level.enemies.forEach((enemy) => {
    enemy.x = enemy.spawnX;
    enemy.vx = enemy.baseVx * activePlatformRun.enemySpeed;
  });
  updateHud();
  syncMusicToState();
}

function updateHud() {
  if (batteryEl) batteryEl.textContent = `${battery}%`;
  if (state === "playing") {
    const chapter = currentPlatformChapter();
    zoneEl.textContent = `${chapter.id} ${chapter.title}`;
    scoreEl.textContent = score;
    heartsEl.textContent = player.hearts;
    return;
  }
  if (state === "map") {
    zoneEl.textContent = "Carte";
    scoreEl.textContent = score;
    heartsEl.textContent = player.hearts;
    return;
  }
  if (state === "skincare") {
    zoneEl.textContent = "Make-up";
    scoreEl.textContent = score;
    heartsEl.textContent = player.hearts;
    return;
  }
  if (state === "productHunt") {
    zoneEl.textContent = "Trousse";
    scoreEl.textContent = score;
    heartsEl.textContent = `${productHuntCollected.length}/${skincareProducts.length}`;
    return;
  }
  if (state === "parental") {
    zoneEl.textContent = "Controle parental";
    scoreEl.textContent = score;
    heartsEl.textContent = player.hearts;
    return;
  }
  if (state === "momParty") {
    zoneEl.textContent = "Maman s'incruste";
    scoreEl.textContent = score;
    heartsEl.textContent = Math.max(0, 100 - momCringe);
    return;
  }
  if (state === "capitalQuiz") {
    zoneEl.textContent = "Quiz capitales";
    scoreEl.textContent = score;
    heartsEl.textContent = `${capitalQuizScore}/12`;
    return;
  }
  if (state === "sass") {
    zoneEl.textContent = "Blague de daron";
    scoreEl.textContent = score;
    heartsEl.textContent = player.hearts;
    return;
  }
  if (state === "podcastReward") {
    zoneEl.textContent = "Bonus podcast";
    scoreEl.textContent = score;
    heartsEl.textContent = player.hearts;
    return;
  }
  if (state === "levelVictory") {
    zoneEl.textContent = "Victoire";
    scoreEl.textContent = score;
    heartsEl.textContent = "67";
    return;
  }
  if (state === "ayaSpecial") {
    zoneEl.textContent = "Special AYA";
    scoreEl.textContent = score + ayaSpecialScore;
    heartsEl.textContent = ayaCombo;
    return;
  }
  if (state === "showcaseVideo") {
    zoneEl.textContent = "Showcase AYA";
    scoreEl.textContent = score;
    heartsEl.textContent = "LIVE";
    return;
  }
  if (state === "fighter") {
    zoneEl.textContent = "Taxi Papa";
    scoreEl.textContent = score;
    heartsEl.textContent = fighterCombo;
    return;
  }
  const currentZone = zones.reduce((active, zone) => (
    player.x >= zone.start ? zone : active
  ), zones[0]);
  zoneEl.textContent = currentZone.name;
  scoreEl.textContent = score;
  heartsEl.textContent = player.hearts;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function hitPlayer(power = 1, reason = "") {
  if (player.invuln > 0 || state !== "playing") return;
  if (player.big) {
    player.big = false;
    player.y += PLAYER_BIG.h - PLAYER_SMALL.h;
    player.w = PLAYER_SMALL.w;
    player.h = PLAYER_SMALL.h;
    player.invuln = 120;
    shake = 12;
    addFloat("fenouil perdu", player.x, player.y - 24, "#c8ff4e");
    updateHud();
    return;
  }
  const hitText = reason || ["-2 min", "cringe hit", "brainrot!"][Math.floor(Math.random() * 3)];
  addFloat(hitText, player.x, player.y, "#ff7777");
  player.hearts -= power;
  shake = 16;
  if (player.hearts <= 0) {
    continueFromCheckpoint();
  } else {
    player.invuln = 95;
    player.vx = -player.facing * 9;
    player.vy = -11;
  }
  updateHud();
}

function winGame() {
  state = "won";
  messageEl.textContent = `Quete terminee: AYA est au Moulin. ${score} minutes et ${battery}% de batterie pour filmer.`;
  overlay.classList.add("victory");
  overlay.classList.add("is-visible");
  setShowcaseVideoVisible(false);
  syncMusicToState();
}

function setShowcaseVideoVisible(visible) {
  if (!showcaseVideoEl || !showcaseFrame) return;
  showcaseVideoEl.classList.toggle("is-visible", visible);
  showcaseVideoEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    if (!showcaseFrame.src) showcaseFrame.src = SHOWCASE_TIKTOK_EMBED;
  } else {
    showcaseFrame.src = "";
  }
}

function startShowcaseVideoLevel() {
  state = "showcaseVideo";
  zoneEl.textContent = "Showcase AYA";
  heartsEl.textContent = "LIVE";
  setShowcaseVideoVisible(true);
  updateHud();
  syncMusicToState();
}

function updateShowcaseVideoLevel() {
  if (input.jumpPressed) {
    setShowcaseVideoVisible(false);
    winGame();
  }
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
}

function completeLevelAndReturnToMap(nextLevel, completedNodeIndex) {
  startLevelVictory(nextLevel, completedNodeIndex);
}

function returnToMap(nextLevel, completedNodeIndex) {
  unlockedLevel = Math.max(unlockedLevel, nextLevel);
  mapSelected = Math.min(completedNodeIndex + 1, mapNodes.length - 1);
  state = "map";
  careTimer = 0;
  careMode = "";
  levelVictory = null;
  levelVictoryBits = [];
  setShowcaseVideoVisible(false);
  addFloat("niveau suivant", player.x, player.y - 30, "#86f7ff");
  updateHud();
  syncMusicToState();
}

function startLevelVictory(nextLevel, completedNodeIndex) {
  const node = mapNodes[completedNodeIndex] || mapNodes[mapSelected] || mapNodes[0];
  levelVictory = {
    nextLevel,
    completedNodeIndex,
    title: node.title,
    subtitle: node.subtitle,
    timer: 0,
    fading: false,
    fadeTimer: 0,
  };
  state = "levelVictory";
  levelVictoryBits = makeLevelVictoryBits();
  updateHud();
  syncMusicToState();
}

function currentGoal() {
  return {
    ...level.goal,
    x: activePlatformRun.goalX,
  };
}

function currentPlatformChapter() {
  const chapters = platformChapters[activePlatformRun.id] || platformChapters.platform1;
  return chapters.reduce((active, chapter) => (
    player.x >= chapter.start ? chapter : active
  ), chapters[0]);
}

function inActivePlatformRun(item, pad = 80) {
  const itemW = item.w || item.r * 2 || 0;
  return item.x + itemW >= activePlatformRun.startX - pad && item.x <= activePlatformRun.goalX + pad;
}

function skincareProductForId(id) {
  return skincareProducts.find((product) => product.id === id) || skincareProducts[0];
}

function syncSkincarePickupsFromCollection() {
  for (const pickup of level.skincarePickups) {
    pickup.taken = productHuntCollected.includes(pickup.id);
  }
}

function skincareCollectionComplete() {
  return skincareProducts.every((product) => productHuntCollected.includes(product.id));
}

function missingSkincareProducts() {
  return skincareProducts.filter((product) => !productHuntCollected.includes(product.id));
}

function spawnFloorY(x) {
  const center = x + player.w / 2;
  const floor = level.platforms
    .filter((platform) => platform.y >= 500 && center >= platform.x && center <= platform.x + platform.w)
    .sort((a, b) => a.y - b.y)[0];
  return floor ? floor.y : FLOOR_Y;
}

function levelOnePerfect() {
  const startX = platformRuns.platform1.startX - 40;
  const endX = platformRuns.platform1.goalX + 40;
  const coins = level.coins.filter((coin) => coin.x >= startX && coin.x <= endX);
  const tokens = level.memeTokens.filter((token) => token.x >= startX && token.x <= endX);
  const batteries = level.batteries.filter((batteryPack) => batteryPack.x >= startX && batteryPack.x <= endX);
  return coins.every((coin) => coin.taken) && tokens.every((token) => token.taken) && batteries.every((batteryPack) => batteryPack.taken);
}

function finishPlatformLevel() {
  if (activePlatformRun.id === "platform1" && levelOnePerfect()) {
    startPodcastReward();
    return;
  }
  completeLevelAndReturnToMap(activePlatformRun.nextLevel, activePlatformRun.nodeIndex);
}

function startPodcastReward() {
  state = "podcastReward";
  unlockedLevel = Math.max(unlockedLevel, 2);
  mapSelected = 1;
  zoneEl.textContent = "Bonus podcast";
  confetti = Array.from({ length: 120 }, (_, index) => ({
    x: (index * 73) % W,
    y: -Math.random() * H,
    vx: -1.5 + Math.random() * 3,
    vy: 2 + Math.random() * 4,
    size: 5 + Math.random() * 8,
    color: ["#ffcf4e", "#ff5fb7", "#86f7ff", "#f8efd0", "#49c56b"][index % 5],
    spin: Math.random() * Math.PI,
  }));
  updateHud();
  syncMusicToState();
}

function updatePodcastReward() {
  for (const bit of confetti) {
    bit.x += bit.vx;
    bit.y += bit.vy;
    bit.spin += 0.12;
    if (bit.y > H + 20) {
      bit.y = -20;
      bit.x = Math.random() * W;
    }
  }
  if (input.jumpPressed) returnToMap(2, 0);
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
  syncMusicToState();
}

function makeLevelVictoryBits() {
  return Array.from({ length: 190 }, (_, index) => {
    const type = index % 5 === 0 ? "cat" : index % 2 === 0 ? "sixseven" : "confetti";
    return {
      type,
      x: (index * 83) % W,
      y: -60 - Math.random() * H * 0.6,
      vx: -1.8 + Math.random() * 3.6,
      vy: type === "cat" ? 0.45 + Math.random() * 0.75 : 2.2 + Math.random() * 3.8,
      size: type === "cat" ? 1.45 + Math.random() * 0.8 : 5 + Math.random() * 9,
      color: ["#ffcf4e", "#ff5fb7", "#86f7ff", "#f8efd0", "#49c56b", "#a84dff"][index % 6],
      spin: Math.random() * Math.PI,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

function updateLevelVictory(dt) {
  if (!levelVictory) {
    returnToMap(1, 0);
    return;
  }

  levelVictory.timer += dt;
  for (const bit of levelVictoryBits) {
    bit.x += bit.vx;
    bit.y += bit.vy;
    bit.spin += 0.12;
    bit.phase += 0.035;
    if (bit.y > H + 80 || bit.x < -120 || bit.x > W + 120) {
      bit.x = Math.random() * W;
      bit.y = -80 - Math.random() * 160;
    }
  }

  if (input.jumpPressed && levelVictory.timer > 300) {
    levelVictory.fading = true;
  }

  if (levelVictory.fading) {
    levelVictory.fadeTimer += dt;
  }

  if (levelVictory.fadeTimer > 760) {
    returnToMap(levelVictory.nextLevel, levelVictory.completedNodeIndex);
  }

  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
}

function addFloat(text, x, y, color = "#f2dc85") {
  floatingTexts.push({ text, x, y, vy: -0.7, life: 72, color });
}

function continueFromCheckpoint() {
  addFloat("continue", checkpointX + 20, FLOOR_Y - 110, "#86f7ff");
  Object.assign(player, {
    x: checkpointX,
    y: FLOOR_Y - PLAYER_SMALL.h,
    w: PLAYER_SMALL.w,
    h: PLAYER_SMALL.h,
    vx: 0,
    vy: 0,
    hearts: activePlatformRun.hearts,
    onGround: false,
    invuln: 140,
    facing: 1,
    big: false,
  });
  mangoSpeedTimer = 0;
  level.powerups = [];
  careTimer = 0;
  careMode = "";
  cameraX = Math.max(0, Math.min(WORLD_W - W, player.x - W * 0.32));
}

function updateCheckpoint() {
  const chapters = platformChapters[activePlatformRun.id] || platformChapters.platform1;
  const nextCheckpoint = chapters.reduce((active, chapter) => (
    player.x >= chapter.start + 130 ? Math.max(active, chapter.start + 64) : active
  ), activePlatformRun.startX);
  if (nextCheckpoint > checkpointX) {
    checkpointX = nextCheckpoint;
    addFloat(`checkpoint ${currentPlatformChapter().id}`, player.x, player.y - 12, "#86f7ff");
  }
}

function startSkincareGame(stop, mode = "road") {
  state = "skincare";
  skincareMode = mode;
  skincareSelected = 0;
  skincareStep = 0;
  skincareAim = 0.5;
  skincareAimDir = 1;
  skincareStyle = 0;
  skincareMistakes = 0;
  skincareFeedback = mode === "level2"
    ? "Avant Le Moulin: skin care, maquillage, puis lisseur."
    : "Le miroir attend la routine dans le bon ordre.";
  skincareFeedbackTimer = 120;
  skincareReturnX = stop ? stop.x + stop.w + 28 : level.goal.x - 90;
  zoneEl.textContent = "Make-up";
  player.vx = 0;
  player.vy = 0;
  input.left = false;
  input.right = false;
  input.jump = false;
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
}

function startProductHuntLevel() {
  state = "productHunt";
  productHuntX = W / 2;
  productHuntItems = [];
  productHuntCollected = [];
  productHuntSpawnTimer = 0;
  productHuntFeedback = "Attrape tous les produits avant de passer au miroir.";
  productHuntFeedbackTimer = 180;
  input.left = false;
  input.right = false;
  input.jump = false;
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
  updateHud();
  syncMusicToState();
}

function updateProductHuntLevel(dt) {
  if (input.left) productHuntX -= 7.4;
  if (input.right) productHuntX += 7.4;
  productHuntX = Math.max(120, Math.min(W - 120, productHuntX));

  productHuntSpawnTimer -= dt;
  if (productHuntSpawnTimer <= 0 && productHuntItems.length < 4) {
    spawnProductHuntItem();
    productHuntSpawnTimer = Math.max(310, 720 - productHuntCollected.length * 32);
  }

  const bag = { x: productHuntX - 72, y: 566, w: 144, h: 86 };
  for (const item of productHuntItems) {
    item.y += item.vy * dt;
    item.spin += dt * 0.006;
    item.x += Math.sin(item.spin) * 0.55;

    if (!item.taken && rectsOverlap(bag, { x: item.x - 28, y: item.y - 30, w: 56, h: 60 })) {
      item.taken = true;
      if (!productHuntCollected.includes(item.product.id)) {
        productHuntCollected.push(item.product.id);
        score += 1;
        productHuntFeedback = `${item.product.name} dans la trousse.`;
        productHuntFeedbackTimer = 110;
      }
    }

    if (!item.taken && item.y > H + 40) {
      item.taken = true;
      productHuntFeedback = `${item.product.name} rate: il faut tout choper.`;
      productHuntFeedbackTimer = 100;
    }
  }
  productHuntItems = productHuntItems.filter((item) => !item.taken);

  if (productHuntCollected.length >= skincareProducts.length) {
    productHuntFeedback = "Trousse complete: miroir debloque.";
    startSkincareGame(null, "level2");
    return;
  }

  if (productHuntFeedbackTimer > 0) productHuntFeedbackTimer -= 1;
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
  updateHud();
}

function spawnProductHuntItem() {
  const fallingIds = productHuntItems.map((item) => item.product.id);
  const missing = skincareProducts.filter((product) => (
    !productHuntCollected.includes(product.id) && !fallingIds.includes(product.id)
  ));
  const pool = missing.length > 0 ? missing : skincareProducts.filter((product) => !fallingIds.includes(product.id));
  const product = pool[Math.floor(Math.random() * pool.length)] || skincareProducts[0];
  productHuntItems.push({
    product,
    x: 120 + Math.random() * (W - 240),
    y: -50,
    vy: 0.16 + Math.random() * 0.08 + productHuntCollected.length * 0.006,
    spin: Math.random() * Math.PI * 2,
    taken: false,
  });
}

function updateSkincareGame() {
  const aimSpeed = skincareMode === "level2" ? 0.015 : 0.011;
  skincareAim += skincareAimDir * aimSpeed;
  if (skincareAim >= 1) {
    skincareAim = 1;
    skincareAimDir = -1;
  }
  if (skincareAim <= 0) {
    skincareAim = 0;
    skincareAimDir = 1;
  }

  if (input.leftPressed) {
    skincareSelected = (skincareSelected + skincareProducts.length - 1) % skincareProducts.length;
  }
  if (input.rightPressed) {
    skincareSelected = (skincareSelected + 1) % skincareProducts.length;
  }
  if (input.jumpPressed) {
    applySkincareProduct();
  }

  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;

  if (skincareFeedbackTimer > 0) skincareFeedbackTimer -= 1;
}

function applySkincareProduct() {
  const product = skincareProducts[skincareSelected];
  const expected = skincareProducts[skincareStep];
  const target = skincareTargets[expected.id];
  const aimX = skincareAimX();
  const distance = Math.abs(aimX - target.x);
  const perfect = distance <= target.radius * 0.42;
  const valid = distance <= target.radius;

  if (product.id !== expected.id) {
    skincareFeedback = skincareHints[expected.id];
    skincareFeedbackTimer = 150;
    skincareMistakes += 1;
    shake = 10;
    return;
  }

  if (!valid) {
    skincareMistakes += 1;
    skincareFeedback = `Vise ${target.label}: le miroir refuse le freestyle.`;
    skincareFeedbackTimer = 120;
    shake = 8;
    return;
  }

  skincareStep += 1;
  skincareStyle += perfect ? 2 : 1;
  skincareFeedback = perfect
    ? `${product.name}: parfait sur ${target.label}.`
    : `${product.name}: valide, mais pas trop la confiance.`;
  skincareFeedbackTimer = 105;

  if (skincareStep >= skincareProducts.length) {
    finishSkincareGame();
  }
}

function skincareAimX() {
  return 440 + skincareAim * 400;
}

function finishSkincareGame() {
  const base = skincareMode === "level2" ? 20 : 12;
  score += base + skincareStyle * 3 - Math.min(8, skincareMistakes);
  if (skincareMode === "level2") {
    completeLevelAndReturnToMap(5, 3);
    return;
  }
  state = "playing";
  player.x = Math.min(WORLD_W - player.w - 28, skincareReturnX);
  player.y = FLOOR_Y - player.h;
  player.vx = 0;
  player.vy = 0;
  player.invuln = Math.max(player.invuln, 120);
  addFloat("routine +12 min", player.x, player.y - 24, "#ffd8ef");
  updateHud();
  syncMusicToState();
}

function startSkincareLevel() {
  if (!skincareCollectionComplete()) {
    const missing = missingSkincareProducts().length;
    mapSelected = 1;
    startPlatformLevel("platform2");
    addFloat(`trousse incomplete: ${missing} a choper`, player.x + 120, player.y - 28, "#ffd8ef");
    return;
  }
  startSkincareGame(null, "level2");
}

function startParentalLevel() {
  state = "parental";
  parentalSelected = 0;
  parentalVideos = 0;
  parentalCodes = 0;
  parentalStealth = 0;
  parentalFeedback = "Niveau 6: trouve les indices dans Actu, puis tape le code 10 fois.";
  parentalFeedbackTimer = 180;
  parentalAlertTimer = 0;
  zoneEl.textContent = "Controle parental";
  score += 5;
  updateHud();
  syncMusicToState();
}

function startMomPartyLevel() {
  state = "momParty";
  momLane = 0;
  momRespect = 0;
  momCringe = 0;
  momSpawnTimer = 160;
  momGuests = [];
  momFeedback = "Niveau 6: choisis la bonne excuse avant que Maman et ses copines entrent au Moulin.";
  momFeedbackTimer = 260;
  updateHud();
  syncMusicToState();
}

function updateMomPartyLevel(dt) {
  if (input.leftPressed) momLane = Math.max(0, momLane - 1);
  if (input.rightPressed) momLane = Math.min(momResponseOptions.length - 1, momLane + 1);
  if (input.jumpPressed) redirectMomGuest();

  momSpawnTimer -= dt;
  if (momSpawnTimer <= 0 && momGuests.length < 3) {
    spawnMomGuest();
    momSpawnTimer = Math.max(680, 1180 - momRespect * 4);
  }

  for (const guest of momGuests) {
    guest.x += guest.speed * dt;
    guest.wobble += dt * 0.006;
    if (!guest.missed && guest.x > 906) {
      guest.missed = true;
      momCringe = Math.min(100, momCringe + guest.cringe);
      momFeedback = guest.type === "selfie"
        ? "Story avec maman devant le Moulin: cringe +++"
        : "Quelqu'un passe le sas et dit 'on est jeunes aussi'.";
      momFeedbackTimer = 140;
    }
  }
  momGuests = momGuests.filter((guest) => !guest.missed && guest.x < 1020);

  if (momCringe >= 100) {
    momCringe = 45;
    momRespect = Math.max(0, momRespect - 14);
    momGuests = [];
    momFeedback = "Trop de cringe: Johanne respire et relance le filtrage.";
    momFeedbackTimer = 180;
  }

  if (momRespect >= 100) {
    score += 12;
    completeLevelAndReturnToMap(7, 5);
  }

  if (momFeedbackTimer > 0) momFeedbackTimer -= 1;
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
  updateHud();
}

function spawnMomGuest() {
  const types = [
    { type: "maman", label: "MAMAN", cringe: 18, speed: 0.118, correct: 0 },
    { type: "copine", label: "COPINE", cringe: 14, speed: 0.14, correct: 1 },
    { type: "selfie", label: "SELFIE", cringe: 22, speed: 0.108, correct: 2 },
    { type: "dance", label: "DANSE", cringe: 16, speed: 0.154, correct: 2 },
  ];
  const template = types[Math.floor(Math.random() * types.length)];
  momGuests.push({
    ...template,
    x: -92,
    y: 314 + (Math.random() - 0.5) * 24,
    w: 92,
    h: 98,
    wobble: Math.random() * 6,
    missed: false,
  });
}

function redirectMomGuest() {
  const candidate = momGuests
    .filter((guest) => guest.x > 246 && guest.x < 838)
    .sort((a, b) => b.x - a.x)[0];

  if (!candidate) {
    momCringe = Math.min(100, momCringe + 4);
    momFeedback = "Personne dans le sas: choisis une excuse quand quelqu'un arrive au milieu.";
    momFeedbackTimer = 90;
    return;
  }

  const selected = momResponseOptions[momLane];
  if (momLane !== candidate.correct) {
    momCringe = Math.min(100, momCringe + (candidate.type === "maman" ? 13 : 9));
    momRespect = Math.max(0, momRespect - 4);
    momFeedback = {
      maman: `${selected.label}: Maman repond 'mais je suis cool moi aussi'.`,
      copine: `${selected.label}: la copine comprend de travers et avance.`,
      selfie: `${selected.label}: telephone deja sorti, danger.`,
      dance: `${selected.label}: debut de choregraphie non autorise.`,
    }[candidate.type];
    momFeedbackTimer = 155;
    return;
  }

  candidate.missed = true;
  momRespect = Math.min(100, momRespect + (candidate.type === "maman" ? 20 : 15));
  momCringe = Math.max(0, momCringe - 5);
  score += 2;
  momFeedback = {
    maman: "Excuse valide: 'on se retrouve demain, promis'.",
    copine: "Copine redirigee vers le bar des adultes.",
    selfie: "Selfie esquive: camera sauvee.",
    dance: "Danse de maman contournee de justesse.",
  }[candidate.type];
  momFeedbackTimer = 150;
}

function makeCapitalQuizQuestions() {
  const shuffled = [...europeCapitals].sort(() => Math.random() - 0.5).slice(0, 12);
  return shuffled.map(([country, capital]) => {
    const wrong = europeCapitals
      .filter((entry) => entry[1] !== capital)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((entry) => entry[1]);
    const options = [capital, ...wrong].sort(() => Math.random() - 0.5);
    return { country, capital, options };
  });
}

function startCapitalQuizLevel() {
  state = "capitalQuiz";
  capitalQuizQuestions = makeCapitalQuizQuestions();
  capitalQuizIndex = 0;
  capitalQuizSelected = 0;
  capitalQuizScore = 0;
  capitalQuizDone = false;
  capitalQuizFeedback = "Tuyau magique: 9 bonnes reponses ouvrent le chemin vers AYA.";
  capitalQuizFeedbackTimer = 190;
  updateHud();
  syncMusicToState();
}

function updateCapitalQuizLevel() {
  if (input.leftPressed) capitalQuizSelected = Math.max(0, capitalQuizSelected - 1);
  if (input.rightPressed) capitalQuizSelected = Math.min(3, capitalQuizSelected + 1);

  if (input.jumpPressed) {
    if (capitalQuizDone) {
      if (capitalQuizScore >= 9) {
        unlockedLevel = Math.max(unlockedLevel, 9);
        mapSelected = 8;
        state = "map";
        score += 20;
        addFloat("quiz gagne: direction AYA", player.x, player.y - 30, "#ffcf4e");
      } else {
        startPlatformLevel("platform3");
        player.x = 7840;
        player.y = spawnFloorY(player.x) - player.h;
        cameraX = Math.max(0, player.x - W * 0.45);
        addFloat("quiz rate: retente le tuyau", player.x, player.y - 24, "#ff7777");
      }
      input.leftPressed = false;
      input.rightPressed = false;
      input.jumpPressed = false;
      updateHud();
      syncMusicToState();
      return;
    }

    const question = capitalQuizQuestions[capitalQuizIndex];
    const answer = question.options[capitalQuizSelected];
    if (answer === question.capital) {
      capitalQuizScore += 1;
      capitalQuizFeedback = `Oui: ${question.country} -> ${question.capital}.`;
    } else {
      capitalQuizFeedback = `Non: ${question.country}, c'est ${question.capital}.`;
    }
    capitalQuizFeedbackTimer = 145;
    capitalQuizIndex += 1;
    capitalQuizSelected = 0;
    if (capitalQuizIndex >= capitalQuizQuestions.length) {
      capitalQuizDone = true;
      capitalQuizFeedback = capitalQuizScore >= 9
        ? "Quiz valide: le tuyau ouvre l'avant-dernier niveau. Entree pour y aller."
        : "Pas assez de capitales: Entree pour revenir au tuyau et retenter.";
      capitalQuizFeedbackTimer = 9999;
    }
  }

  if (capitalQuizFeedbackTimer > 0) capitalQuizFeedbackTimer -= 1;
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
  updateHud();
}

function startSassLevel() {
  state = "sass";
  sassRound = 0;
  sassSelected = 0;
  sassScore = 0;
  sassFeedback = "Niveau 4: Papa lance ses blagues, reponds le plus mal possible.";
  sassFeedbackTimer = 260;
  sassAdvanceTimer = 0;
  updateHud();
  syncMusicToState();
}

function updateSassLevel() {
  if (sassAdvanceTimer <= 0) {
    if (input.leftPressed) sassSelected = Math.max(0, sassSelected - 1);
    if (input.rightPressed) sassSelected = Math.min(2, sassSelected + 1);
    if (input.jumpPressed) chooseSassReply();
  } else {
    sassAdvanceTimer -= 1;
    if (sassAdvanceTimer <= 0) {
      sassRound += 1;
      sassSelected = 0;
      if (sassRound >= sassRounds.length) {
        score += sassScore;
        score = Math.max(0, score);
        completeLevelAndReturnToMap(4, 2);
      }
    }
  }
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
  if (sassFeedbackTimer > 0) sassFeedbackTimer -= 1;
}

function chooseSassReply() {
  if (sassAdvanceTimer > 0) return;
  const round = sassRounds[sassRound];
  const reply = round.options[sassSelected];
  sassScore += reply.points;
  sassFeedback = reply.feedback;
  sassFeedbackTimer = 260;
  sassAdvanceTimer = 210;
}

function updateParentalLevel() {
  if (input.leftPressed) {
    parentalSelected = (parentalSelected + parentalApps.length - 1) % parentalApps.length;
  }
  if (input.rightPressed) {
    parentalSelected = (parentalSelected + 1) % parentalApps.length;
  }
  if (input.jumpPressed) {
    useParentalApp();
  }

  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;

  if (parentalFeedbackTimer > 0) parentalFeedbackTimer -= 1;
  if (parentalAlertTimer > 0) parentalAlertTimer -= 1;
  if (parentalStealth > 0) parentalStealth -= 1;
}

function useParentalApp() {
  const app = parentalApps[parentalSelected];

  if (app.id === "actu") {
    if (parentalVideos < 4) {
      parentalVideos += 1;
      score += 2;
      parentalFeedback = [
        "Actu 1: une video cache '6'.",
        "Actu 2: une danse cache '7'.",
        "Actu 3: une story dit 'encore 6'.",
        "Actu 4: dernier indice, evidemment c'est 7.",
      ][parentalVideos - 1];
    } else {
      parentalFeedback = "Tu as deja les 4 indices: 6 7 6 7.";
    }
    parentalFeedbackTimer = 170;
    return;
  }

  if (app.id === "whatsapp") {
    parentalFeedback = parentalVideos >= 4
      ? "WhatsApp: le groupe valide le plan. Code: 6 7 6 7, dix fois sans paniquer."
      : "WhatsApp: 'regarde Actu avant, y'a les indices dedans'.";
    parentalFeedbackTimer = 170;
    return;
  }

  if (app.id === "silent") {
    parentalStealth = 220;
    parentalAlertTimer = 0;
    parentalFeedback = "Mode discret active: maman ne voit rien pendant quelques secondes.";
    parentalFeedbackTimer = 160;
    return;
  }

  if (app.id === "codes") {
    if (parentalVideos < 4) {
      parentalFeedback = "Code refuse: il manque des indices dans Actu.";
      parentalFeedbackTimer = 150;
      parentalAlertTimer = 70;
      return;
    }

    parentalCodes += 1;
    score += 1;
    parentalFeedback = `Code 6 7 6 7 tape ${parentalCodes}/10.`;
    parentalFeedbackTimer = 120;
    if (parentalCodes % 3 === 0 && parentalStealth <= 0) parentalAlertTimer = 100;
    if (parentalCodes >= 10) completeLevelAndReturnToMap(8, 6);
  }
}

function startFighterLevel() {
  state = "fighter";
  fighterJohanne = makeFighter("Johanne", 312, "#ffcf4e", 105);
  fighterDad = makeFighter("Papa", 928, "#2f6f8f", 115);
  fighterJohanne.facing = 1;
  fighterDad.facing = -1;
  fighterProjectiles = [];
  fighterEffects = [];
  fighterTimer = 99;
  fighterAiTimer = 0;
  fighterFeedback = "Gagne le droit que Papa amene les enfants en voiture au Moulin.";
  fighterFeedbackTimer = 170;
  fighterRoundOverTimer = 0;
  fighterCombo = 0;
  fighterDadJokeIndex = 0;
  fighterVanneIndex = 0;
  updateHud();
  syncMusicToState();
}

function makeFighter(name, x, color, health) {
  return {
    name,
    x,
    y: 506,
    w: 58,
    h: 118,
    vx: 0,
    health,
    maxHealth: health,
    color,
    facing: 1,
    attackTimer: 0,
    cooldown: 0,
    attackKind: "",
    hitStun: 0,
    specialTimer: 0,
    frame: 0,
  };
}

function updateFighterLevel(dt) {
  if (!fighterJohanne || !fighterDad) startFighterLevel();

  const seconds = dt / 1000;
  if (fighterRoundOverTimer > 0) {
    fighterRoundOverTimer -= dt;
    updateFighterEffects(dt);
    if (fighterRoundOverTimer <= 0) completeLevelAndReturnToMap(9, 7);
    input.leftPressed = false;
    input.rightPressed = false;
    input.jumpPressed = false;
    input.vannePressed = false;
    updateHud();
    return;
  }

  fighterTimer = Math.max(0, fighterTimer - seconds);
  fighterJohanne.facing = fighterJohanne.x < fighterDad.x ? 1 : -1;
  fighterDad.facing = fighterDad.x < fighterJohanne.x ? 1 : -1;

  const speed = fighterJohanne.hitStun > 0 ? 1.2 : 5.2;
  if (input.left) fighterJohanne.vx = -speed;
  else if (input.right) fighterJohanne.vx = speed;
  else fighterJohanne.vx *= 0.72;

  if (input.jumpPressed) johanneTickleAttack();
  if (input.vannePressed) johanneVanneAttack();
  input.jumpPressed = false;
  input.vannePressed = false;

  updateDadFighterAi(dt);
  updateFighterBody(fighterJohanne, dt);
  updateFighterBody(fighterDad, dt);
  resolveFighterSpacing();
  updateFighterProjectiles(dt);
  updateFighterEffects(dt);

  if (fighterTimer <= 0) {
    if (fighterJohanne.health >= fighterDad.health) finishFighterRound("PAPA CEDE: tout le monde monte en voiture pour le Moulin.");
    else continueFighterRound("PAPA DIT NON: trop de jeux de mots. Continue.");
  }

  if (fighterDad.health <= 0) finishFighterRound("K.O. PAPA CEDE: taxi familial debloque.");
  if (fighterJohanne.health <= 0) {
    continueFighterRound("Continue: Johanne se releve, round bonus.");
  }

  if (fighterFeedbackTimer > 0) fighterFeedbackTimer -= 1;
  input.leftPressed = false;
  input.rightPressed = false;
  input.vannePressed = false;
  updateHud();
}

function updateFighterBody(fighter, dt) {
  fighter.x += fighter.vx;
  fighter.x = Math.max(150, Math.min(1070, fighter.x));
  fighter.vx *= 0.86;
  fighter.frame += dt * 0.008;
  if (fighter.attackTimer > 0) fighter.attackTimer -= dt;
  if (fighter.attackTimer <= 0) fighter.attackKind = "";
  if (fighter.cooldown > 0) fighter.cooldown -= dt;
  if (fighter.hitStun > 0) fighter.hitStun -= dt;
  if (fighter.specialTimer > 0) fighter.specialTimer -= dt;
}

function resolveFighterSpacing() {
  const minDistance = 68;
  const distance = fighterDad.x - fighterJohanne.x;
  if (Math.abs(distance) >= minDistance) return;
  const push = (minDistance - Math.abs(distance)) / 2;
  const dir = distance >= 0 ? 1 : -1;
  fighterJohanne.x -= push * dir;
  fighterDad.x += push * dir;
}

function johanneTickleAttack() {
  if (fighterJohanne.cooldown > 0 || fighterJohanne.hitStun > 0) return;
  fighterJohanne.attackTimer = 190;
  fighterJohanne.attackKind = "tickle";
  fighterJohanne.cooldown = 310;
  const distance = Math.abs((fighterJohanne.x + fighterJohanne.w / 2) - (fighterDad.x + fighterDad.w / 2));
  addFighterEffect("chatouilles", fighterJohanne.x + fighterJohanne.facing * 64, 470, "#ffcf4e");
  if (distance < 128) {
    const damage = 8 + Math.min(8, fighterCombo);
    damageFighter(fighterDad, damage, fighterJohanne.facing * 7);
    fighterCombo += 1;
    fighterFeedback = fighterCombo >= 3 ? `Combo chatouilles x${fighterCombo}` : "Chatouilles touche.";
    fighterFeedbackTimer = 95;
  } else {
    fighterCombo = 0;
    fighterFeedback = "Trop loin: les chatouilles brassent l'air.";
    fighterFeedbackTimer = 75;
  }
}

function johanneVanneAttack() {
  if (fighterJohanne.cooldown > 0 || fighterJohanne.hitStun > 0) return;
  fighterJohanne.attackTimer = 230;
  fighterJohanne.attackKind = "vanne";
  fighterJohanne.cooldown = 430;
  const line = nextFighterVanneLine();
  fighterProjectiles.push({
    owner: "johanne",
    x: fighterJohanne.x + fighterJohanne.facing * 34,
    y: 426,
    w: 260,
    h: 48,
    vx: fighterJohanne.facing * 6.4,
    text: line,
    life: 150,
  });
  addFighterEffect("vanne", fighterJohanne.x + fighterJohanne.facing * 72, 432, "#ffd8ef");
  fighterFeedback = "Johanne balance une vanne.";
  fighterFeedbackTimer = 90;
}

function nextFighterVanneLine() {
  const lines = sassRounds.flatMap((round) => round.options)
    .filter((option) => option.points > 0)
    .map((option) => option.text);
  const line = lines[fighterVanneIndex % lines.length];
  fighterVanneIndex += 1;
  return line;
}

function updateDadFighterAi(dt) {
  if (fighterDad.hitStun > 0) return;
  fighterAiTimer -= dt;
  const distance = Math.abs(fighterDad.x - fighterJohanne.x);
  if (distance > 230) fighterDad.vx += fighterDad.facing * 0.95;
  if (distance < 118) fighterDad.vx -= fighterDad.facing * 0.72;

  if (fighterAiTimer <= 0 && fighterDad.cooldown <= 0) {
    if (distance < 150) dadAccentAttack();
    else dadPunProjectile();
    fighterAiTimer = 620 + Math.random() * 460;
  }
}

function dadPunProjectile() {
  fighterDad.attackTimer = 220;
  fighterDad.cooldown = 580;
  const line = sassRounds[fighterDadJokeIndex % sassRounds.length].parent;
  fighterDadJokeIndex += 1;
  fighterProjectiles.push({
    owner: "dad",
    x: fighterDad.x + fighterDad.facing * 38,
    y: 426,
    w: 300,
    h: 54,
    vx: fighterDad.facing * 5,
    text: line,
    life: 160,
  });
  fighterFeedback = "Papa resiste avec une blague de daron.";
  fighterFeedbackTimer = 80;
}

function dadAccentAttack() {
  fighterDad.attackTimer = 280;
  fighterDad.cooldown = 760;
  fighterDad.specialTimer = 260;
  const distance = Math.abs((fighterJohanne.x + fighterJohanne.w / 2) - (fighterDad.x + fighterDad.w / 2));
  addFighterEffect("accent du sud", fighterDad.x + fighterDad.facing * 70, 438, "#86f7ff");
  if (distance < 158) {
    damageFighter(fighterJohanne, 7, fighterDad.facing * 8);
    fighterCombo = 0;
    fighterFeedback = "Imitation de l'accent du sud: argument anti-taxi.";
    fighterFeedbackTimer = 100;
  }
}

function updateFighterProjectiles(dt) {
  for (const projectile of fighterProjectiles) {
    projectile.x += projectile.vx;
    projectile.life -= 1;
    if (projectile.owner === "dad" && rectsOverlap(projectile, fighterJohanne) && fighterJohanne.hitStun <= 0) {
      damageFighter(fighterJohanne, 6, Math.sign(projectile.vx) * 7);
      projectile.life = 0;
      fighterCombo = 0;
      fighterFeedback = "Blague de daron recue: degats psychologiques.";
      fighterFeedbackTimer = 100;
    }
    if (projectile.owner === "johanne" && rectsOverlap(projectile, fighterDad) && fighterDad.hitStun <= 0) {
      damageFighter(fighterDad, 9, Math.sign(projectile.vx) * 6);
      projectile.life = 0;
      fighterCombo += 1;
      fighterFeedback = fighterCombo >= 3 ? `Combo vannes x${fighterCombo}` : "Vanne touche Papa.";
      fighterFeedbackTimer = 100;
    }
  }
  fighterProjectiles = fighterProjectiles.filter((projectile) => projectile.life > 0 && projectile.x > -140 && projectile.x < W + 140);
}

function damageFighter(fighter, amount, knockback) {
  fighter.health = Math.max(0, fighter.health - amount);
  fighter.hitStun = 210;
  fighter.vx = knockback;
  shake = Math.max(shake, 8);
}

function addFighterEffect(text, x, y, color) {
  fighterEffects.push({ text, x, y, color, life: 42, vy: -0.7 });
}

function updateFighterEffects() {
  fighterEffects = fighterEffects.filter((effect) => {
    effect.y += effect.vy;
    effect.life -= 1;
    return effect.life > 0;
  });
}

function finishFighterRound(text) {
  if (fighterRoundOverTimer > 0) return;
  fighterFeedback = text;
  fighterFeedbackTimer = 180;
  fighterRoundOverTimer = 1250;
  fighterProjectiles = [];
  score += Math.max(12, Math.round(fighterJohanne.health / 4));
}

function continueFighterRound(text) {
  fighterJohanne.x = 312;
  fighterDad.x = 928;
  fighterJohanne.health = Math.max(55, fighterJohanne.maxHealth * 0.55);
  fighterDad.health = Math.max(70, fighterDad.maxHealth * 0.65);
  fighterJohanne.hitStun = 0;
  fighterDad.hitStun = 0;
  fighterJohanne.cooldown = 0;
  fighterJohanne.attackKind = "";
  fighterDad.cooldown = 380;
  fighterDad.attackKind = "";
  fighterTimer = 99;
  fighterCombo = 0;
  fighterProjectiles = [];
  fighterFeedback = text;
  fighterFeedbackTimer = 170;
  input.vannePressed = false;
}

function startAyaSpecialLevel() {
  state = "ayaSpecial";
  ayaLane = 1;
  ayaBeatTimer = 0;
  ayaNotes = [];
  ayaGauge = [1, 1, 1, 1];
  ayaSpecialScore = 0;
  ayaCombo = 0;
  ayaFeedback = "Special AYA: reste dans la bonne colonne, la note joue toute seule.";
  ayaFeedbackTimer = 170;
  ayaClearTimer = 0;
  ayaMelodyStep = 0;
  confetti = [];
  updateHud();
  syncMusicToState();
}

function updateAyaSpecialLevel(dt) {
  if (input.leftPressed) ayaLane = Math.max(0, ayaLane - 1);
  if (input.rightPressed) ayaLane = Math.min(ayaSpecialStats.length - 1, ayaLane + 1);

  ayaBeatTimer += dt;
  const spawnDelay = Math.max(330, 620 - Math.min(180, ayaSpecialScore * 0.9));
  while (ayaBeatTimer >= spawnDelay) {
    ayaBeatTimer -= spawnDelay;
    spawnAyaNote();
  }

  for (const note of ayaNotes) note.y += note.speed * dt;
  autoResolveAyaNotes();

  if (ayaFeedbackTimer > 0) ayaFeedbackTimer -= 1;

  if (ayaGauge.every((value) => value >= 10)) {
    ayaClearTimer += dt;
    if (confetti.length === 0) makeAyaConfetti();
    for (const bit of confetti) {
      bit.x += bit.vx;
      bit.y += bit.vy;
      bit.spin += 0.12;
      if (bit.y > H + 20) bit.y = -20;
    }
    if (ayaClearTimer > 950) {
      score += ayaSpecialScore;
      ayaSpecialScore = 0;
      completeLevelAndReturnToMap(10, 8);
    }
  }

  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
  updateHud();
}

function spawnAyaNote() {
  const phrase = ayaColumnMelody[ayaMelodyStep % ayaColumnMelody.length];
  ayaMelodyStep += 1;
  ayaNotes.push({
    lane: phrase.lane,
    midi: phrase.midi,
    y: 118,
    speed: 0.31 + Math.min(0.16, ayaSpecialScore / 4200),
  });
}

function autoResolveAyaNotes() {
  const targetY = 594;
  for (const note of ayaNotes) {
    const distance = Math.abs(note.y - targetY);
    if (note.lane === ayaLane && distance <= 42) {
      collectAyaNote(note, distance);
    } else if (note.y > targetY + 48) {
      missAyaNote(note);
    }
  }
  ayaNotes = ayaNotes.filter((note) => !note.done);
}

function collectAyaNote(note, distance) {
  note.done = true;
  ayaCombo += 1;
  const gain = distance < 18 ? 2 : 1;
  ayaGauge[note.lane] = Math.min(10, ayaGauge[note.lane] + gain);
  ayaSpecialScore += 180 + ayaCombo * 25 + gain * 50;
  ayaFeedback = gain === 2 ? "Colonne parfaite: la note sonne." : "Bonne colonne: note valide.";
  ayaFeedbackTimer = 95;
  playAyaColumnNote(note.midi, gain);
}

function missAyaNote(note) {
  note.done = true;
  ayaCombo = 0;
  ayaFeedback = "Mauvaise colonne: le flow redescend.";
  ayaFeedbackTimer = 80;
}

function playAyaColumnNote(midi, gain) {
  if (!audioCtx || !musicGain || soundMuted) return;
  const now = audioCtx.currentTime;
  playTone(midiToFreq(midi), now, 0.15, "square", 0.42);
  if (gain > 1) playTone(midiToFreq(midi + 12), now + 0.025, 0.1, "triangle", 0.24);
}

function makeAyaConfetti() {
  confetti = Array.from({ length: 150 }, (_, index) => ({
    x: (index * 59) % W,
    y: -Math.random() * H,
    vx: -1.8 + Math.random() * 3.6,
    vy: 2.4 + Math.random() * 4.2,
    size: 4 + Math.random() * 7,
    color: ["#ffcf4e", "#4b86ff", "#a84dff", "#f8efd0", "#ff4d56"][index % 5],
    spin: Math.random() * Math.PI,
  }));
}

function updateMap() {
  if (input.leftPressed) mapSelected = Math.max(0, mapSelected - 1);
  if (input.rightPressed) mapSelected = Math.min(mapNodes.length - 1, mapSelected + 1);
  if (input.jumpPressed) startSelectedMapNode();
  input.leftPressed = false;
  input.rightPressed = false;
  input.jumpPressed = false;
}

function activateGodMode() {
  unlockedLevel = Math.max(...mapNodes.map((node) => node.level));
  mapSelected = 0;
  productHuntCollected = skincareProducts.map((product) => product.id);
  syncSkincarePickupsFromCollection();
  state = "map";
  careTimer = 0;
  careMode = "";
  levelVictory = null;
  levelVictoryBits = [];
  overlay.classList.remove("victory");
  overlay.classList.remove("is-visible");
  setShowcaseVideoVisible(false);
  zoneEl.textContent = "God mode";
  addFloat("code 2012: map ouverte", player.x, player.y - 34, "#ffcf4e");
  updateHud();
  syncMusicToState();
}

function handleGodCodeKey(key) {
  if (!/^[0-9]$/.test(key)) return;
  godCodeBuffer = `${godCodeBuffer}${key}`.slice(-4);
  if (godCodeBuffer === "2012") {
    godCodeBuffer = "";
    activateGodMode();
  }
}

function startSelectedMapNode() {
  const node = mapNodes[mapSelected];
  if (node.level > unlockedLevel) return;
  if (node.kind === "platform") startPlatformLevel(node.id);
  if (node.id === "skincare") startSkincareLevel();
  if (node.id === "sass") startSassLevel();
  if (node.id === "momParty") startMomPartyLevel();
  if (node.id === "parental") startParentalLevel();
  if (node.id === "fighter") startFighterLevel();
  if (node.id === "finale") startAyaSpecialLevel();
  if (node.id === "showcase") startShowcaseVideoLevel();
}

function update(dt) {
  if (state === "map") {
    updateMap();
    return;
  }
  if (state === "podcastReward") {
    updatePodcastReward();
    return;
  }
  if (state === "levelVictory") {
    updateLevelVictory(dt);
    return;
  }
  if (state === "skincare") {
    updateSkincareGame();
    return;
  }
  if (state === "productHunt") {
    updateProductHuntLevel(dt);
    return;
  }
  if (state === "sass") {
    updateSassLevel();
    return;
  }
  if (state === "parental") {
    updateParentalLevel();
    return;
  }
  if (state === "momParty") {
    updateMomPartyLevel(dt);
    return;
  }
  if (state === "capitalQuiz") {
    updateCapitalQuizLevel();
    return;
  }
  if (state === "fighter") {
    updateFighterLevel(dt);
    return;
  }
  if (state === "ayaSpecial") {
    updateAyaSpecialLevel(dt);
    return;
  }
  if (state === "showcaseVideo") {
    updateShowcaseVideoLevel();
    return;
  }
  if (state !== "playing") return;

  if (careTimer > 0) {
    careTimer -= 1;
    player.vx = 0;
    player.vy = 0;
    input.jumpPressed = false;
    player.frame += dt * 0.006;
    if (player.invuln > 0) player.invuln -= 1;
    updateFloatingTexts();
    cameraX += (player.x - cameraX - W * 0.42) * 0.08;
    cameraX = Math.max(0, Math.min(WORLD_W - W, cameraX));
    updateHud();
    return;
  }

  if (mangoSpeedTimer > 0) mangoSpeedTimer -= 1;
  const speedBoost = mangoSpeedTimer > 0 ? 1.55 : 1;
  const accel = 1.12 * speedBoost;
  if (input.left) {
    player.vx -= accel;
    player.facing = -1;
  }
  if (input.right) {
    player.vx += accel;
    player.facing = 1;
  }
  if (!input.left && !input.right) {
    player.vx *= FRICTION;
  }

  const maxSpeed = MAX_SPEED * speedBoost;
  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

  if (input.jumpPressed && player.onGround) {
    player.vy = JUMP;
    player.onGround = false;
  }
  input.jumpPressed = false;

  player.vy += GRAVITY;
  player.vy = Math.min(player.vy, 22);

  player.x += player.vx;
  for (const platform of level.platforms) {
    if (!rectsOverlap(player, platform)) continue;
    if (player.vx > 0) player.x = platform.x - player.w;
    if (player.vx < 0) player.x = platform.x + platform.w;
    player.vx = 0;
  }

  player.y += player.vy;
  player.onGround = false;
  for (const platform of level.platforms) {
    if (!rectsOverlap(player, platform)) continue;
    if (player.vy > 0) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (player.vy < 0) {
      player.y = platform.y + platform.h;
      player.vy = 0;
      bumpPlatformBlock(platform);
    }
  }

  if (player.y > H + 180) hitPlayer(3);
  player.x = Math.max(activePlatformRun.startX - 24, Math.min(WORLD_W - player.w - 28, player.x));
  updateCheckpoint();

  for (const enemy of level.enemies) {
    if (!inActivePlatformRun(enemy, 160)) continue;
    if (enemy.cuddleTimer > 0) enemy.cuddleTimer -= 1;
    if (enemy.kind === "coca") {
      const chase = player.x + player.w / 2 < enemy.x + enemy.w / 2 ? -0.22 : 0.22;
      if (Math.abs(player.x - enemy.x) < 420) enemy.vx += chase;
      enemy.vx = Math.max(-2.6, Math.min(2.6, enemy.vx));
    }
    if (enemy.kind === "duduche") {
      enemy.vx += Math.sin(performance.now() * 0.001 + enemy.spawnX) * 0.004;
      enemy.vx = Math.max(-0.7, Math.min(0.7, enemy.vx));
    }
    enemy.x += enemy.vx;
    if (enemy.x < enemy.min || enemy.x + enemy.w > enemy.max) enemy.vx *= -1;
    if (rectsOverlap(player, enemy)) {
      if (enemy.kind === "duduche") {
        if (!enemy.cuddleTimer) {
          enemy.cuddleTimer = 90;
          addFloat("Duduche pepere", enemy.x, enemy.y - 10, "#f8efd0");
        }
        continue;
      }
      if (enemy.kind === "coca") {
        if (!enemy.cuddleTimer) {
          enemy.cuddleTimer = 90;
          score += 1;
          player.vx *= 0.2;
          player.invuln = Math.max(player.invuln, 35);
          addFloat("Coca calin +1 min", enemy.x, enemy.y - 10, "#ffcf9d");
          updateHud();
        }
        continue;
      }
      const stomp = player.vy > 4 && player.y + player.h - enemy.y < 24;
      if (stomp) {
        score += 3;
        addFloat("ratio +3", enemy.x, enemy.y, "#f2dc85");
        player.vy = JUMP * 0.62;
        enemy.x = enemy.vx > 0 ? enemy.min : enemy.max - enemy.w;
      } else {
        const schoolNote = enemy.kind === "teacher"
          ? "PROF: mot dans le cahier"
          : enemy.kind === "supervisor"
            ? "SURV: mot dans le cahier"
            : "";
        hitPlayer(1, schoolNote);
      }
    }
  }

  for (const hazard of level.hazards) {
    if (!inActivePlatformRun(hazard, 40)) continue;
    if (rectsOverlap(player, hazard)) hitPlayer();
  }

  updatePowerups();

  for (const coin of level.coins) {
    if (!inActivePlatformRun(coin, 40)) continue;
    if (coin.taken) continue;
    const dx = player.x + player.w / 2 - coin.x;
    const dy = player.y + player.h / 2 - coin.y;
    if (Math.hypot(dx, dy) < coin.r + 28) {
      coin.taken = true;
      score += 1;
      addFloat("+1 min", coin.x, coin.y, "#ffcf4e");
      updateHud();
    }
  }

  for (const token of level.memeTokens) {
    if (!inActivePlatformRun(token, 40)) continue;
    if (token.taken) continue;
    if (rectsOverlap(player, token)) {
      token.taken = true;
      score += token.value;
      addFloat(`${token.text} +${token.value} min`, token.x, token.y, "#86f7ff");
      player.vy = Math.min(player.vy, -7);
      updateHud();
    }
  }

  for (const bottle of level.clubMates) {
    if (!inActivePlatformRun(bottle, 50)) continue;
    if (bottle.taken) continue;
    if (rectsOverlap(player, bottle)) {
      bottle.taken = true;
      score += 8;
      player.vy = Math.min(player.vy, -10);
      addFloat("Club Mate +8 min", bottle.x + bottle.w / 2, bottle.y, "#c8ff4e");
      updateHud();
    }
  }

  for (const batteryPack of level.batteries) {
    if (!inActivePlatformRun(batteryPack, 50)) continue;
    if (batteryPack.taken) continue;
    if (rectsOverlap(player, batteryPack)) {
      batteryPack.taken = true;
      battery = Math.min(100, battery + batteryPack.value);
      player.vy = Math.min(player.vy, -6);
      addFloat(`batterie +${batteryPack.value}%`, batteryPack.x + batteryPack.w / 2, batteryPack.y, "#9fe87a");
      updateHud();
    }
  }

  for (const pickup of level.skincarePickups) {
    if (!inActivePlatformRun(pickup, 50)) continue;
    if (pickup.taken) continue;
    if (rectsOverlap(player, pickup)) {
      const product = skincareProductForId(pickup.id);
      pickup.taken = true;
      if (!productHuntCollected.includes(product.id)) productHuntCollected.push(product.id);
      score += 2;
      player.vy = Math.min(player.vy, -6);
      addFloat(`${product.name} dans la trousse`, pickup.x + pickup.w / 2, pickup.y, "#ffd8ef");
      updateHud();
    }
  }

  for (const stop of level.careStops) {
    if (!inActivePlatformRun(stop, 40)) continue;
    if (stop.used || !player.onGround) continue;
    if (rectsOverlap(player, stop)) {
      stop.used = true;
      careTimer = 74;
      careMode = stop.kind;
      player.vx = 0;
      player.invuln = Math.max(player.invuln, 96);
      score += 7;
      addFloat("lissage +7 min", stop.x + stop.w / 2, stop.y - 4, "#ffd8ef");
      updateHud();
    }
  }

  if (input.downPressed) tryEnterMagicPipe();

  if (playerReachedGoal()) finishPlatformLevel();

  if (player.invuln > 0) player.invuln -= 1;
  if (spawnCueTimer > 0) spawnCueTimer -= 1;
  input.downPressed = false;
  if (levelOneTutorialTimer > 0) {
    levelOneTutorialTimer -= 1;
    if (activePlatformRun.id !== "platform1" || player.x > activePlatformRun.spawnX + 520) {
      levelOneTutorialTimer = 0;
    }
  }
  if (shake > 0) shake *= 0.84;
  updateFloatingTexts();
  player.frame += dt * (Math.abs(player.vx) > 0.5 ? 0.012 : 0.004);
  cameraX += (player.x - cameraX - W * 0.42) * 0.12;
  cameraX = Math.max(0, Math.min(WORLD_W - W, cameraX));
  updateHud();
}

function currentMagicPipe() {
  return level.platforms.find((platform) => (
    platform.kind === "pipe"
    && platform.magic === "capitalQuiz"
    && inActivePlatformRun(platform, 80)
  ));
}

function playerCanEnterMagicPipe(pipe) {
  if (!pipe || !player.onGround) return false;
  const center = player.x + player.w / 2;
  const feet = player.y + player.h;
  return center >= pipe.x - 12 && center <= pipe.x + pipe.w + 12 && Math.abs(feet - pipe.y) < 12;
}

function tryEnterMagicPipe() {
  const pipe = currentMagicPipe();
  if (!playerCanEnterMagicPipe(pipe)) return;
  player.vx = 0;
  player.vy = 0;
  addFloat("tuyau magique!", pipe.x + pipe.w / 2, pipe.y - 20, "#c98cff");
  startCapitalQuizLevel();
}

function bumpPlatformBlock(platform) {
  if (platform.kind === "question" && !platform.used) {
    platform.used = true;
    spawnPowerupFromBlock(platform);
    updateHud();
    return;
  }
  if (platform.kind === "brick") {
    addFloat("toc", platform.x + platform.w / 2, platform.y - 4, "#f8efd0");
  }
}

function playerReachedGoal() {
  const goal = currentGoal();
  return rectsOverlap(player, goal) || player.x + player.w >= goal.x - 42;
}

function questionBlockPowerType(platform) {
  const questionBlocks = level.platforms.filter((p) => p.kind === "question");
  const index = Math.max(0, questionBlocks.indexOf(platform));
  return index % 2 === 0 ? "mango" : "fennel";
}

function spawnPowerupFromBlock(platform) {
  const type = questionBlockPowerType(platform);
  level.powerups.push({
    type,
    x: platform.x + platform.w / 2 - 18,
    y: platform.y + 4,
    w: type === "mango" ? 36 : 34,
    h: type === "mango" ? 32 : 40,
    vx: 0,
    vy: 0,
    emerge: 26,
    taken: false,
  });
  addFloat(type === "mango" ? "mangue turbo!" : "fenouil geant!", platform.x + platform.w / 2, platform.y - 10, type === "mango" ? "#ffcf4e" : "#c8ff4e");
}

function updatePowerups() {
  for (const powerup of level.powerups) {
    if (powerup.taken || !inActivePlatformRun(powerup, 160)) continue;

    if (powerup.emerge > 0) {
      powerup.y -= 1.9;
      powerup.emerge -= 1;
    } else {
      if (powerup.vx === 0) powerup.vx = powerup.type === "mango" ? 1.8 : 1.25;

      powerup.x += powerup.vx;
      for (const platform of level.platforms) {
        if (!rectsOverlap(powerup, platform)) continue;
        if (powerup.vx > 0) powerup.x = platform.x - powerup.w;
        if (powerup.vx < 0) powerup.x = platform.x + platform.w;
        powerup.vx *= -1;
      }

      powerup.vy += GRAVITY * 0.54;
      powerup.vy = Math.min(powerup.vy, 12);
      powerup.y += powerup.vy;
      for (const platform of level.platforms) {
        if (!rectsOverlap(powerup, platform)) continue;
        if (powerup.vy > 0) {
          powerup.y = platform.y - powerup.h;
          powerup.vy = 0;
        } else if (powerup.vy < 0) {
          powerup.y = platform.y + platform.h;
          powerup.vy = 0.5;
        }
      }
    }

    if (rectsOverlap(player, powerup)) collectPowerup(powerup);
  }

  level.powerups = level.powerups.filter((powerup) => !powerup.taken && powerup.y < H + 180);
}

function collectPowerup(powerup) {
  powerup.taken = true;
  if (powerup.type === "mango") {
    mangoSpeedTimer = 620;
    score += 4;
    player.vx += player.facing * 8;
    addFloat("mangue: SUPER SPEED", powerup.x, powerup.y, "#ffcf4e");
  } else {
    if (!player.big) {
      player.y -= PLAYER_BIG.h - player.h;
      player.w = PLAYER_BIG.w;
      player.h = PLAYER_BIG.h;
      player.big = true;
    }
    score += 6;
    player.invuln = Math.max(player.invuln, 80);
    addFloat("fenouil: grande!", powerup.x, powerup.y, "#c8ff4e");
  }
  updateHud();
}

function draw() {
  if (state === "map") {
    drawWorldMap();
    return;
  }
  if (state === "podcastReward") {
    drawPodcastReward();
    return;
  }
  if (state === "levelVictory") {
    drawLevelVictory();
    return;
  }
  if (state === "skincare") {
    drawSkincareGame();
    return;
  }
  if (state === "productHunt") {
    drawProductHuntLevel();
    return;
  }
  if (state === "sass") {
    drawSassLevel();
    return;
  }
  if (state === "parental") {
    drawParentalLevel();
    return;
  }
  if (state === "momParty") {
    drawMomPartyLevel();
    return;
  }
  if (state === "capitalQuiz") {
    drawCapitalQuizLevel();
    return;
  }
  if (state === "fighter") {
    drawFighterLevel();
    return;
  }
  if (state === "ayaSpecial") {
    drawAyaSpecialLevel();
    return;
  }
  if (state === "showcaseVideo") {
    drawShowcaseVideoBackdrop();
    return;
  }
  if (state === "won") {
    drawAyaInSky();
    return;
  }

  const currentZone = zones.reduce((active, zone) => (
    player.x >= zone.start ? zone : active
  ), zones[0]);
  const chapter = state === "playing" ? currentPlatformChapter() : null;

  ctx.clearRect(0, 0, W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, chapter ? chapter.sky : currentZone.sky);
  sky.addColorStop(0.58, chapter ? chapter.mid : "#d7eebf");
  sky.addColorStop(1, chapter ? chapter.ground : "#3a8a66");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const sx = Math.round(cameraX + (Math.random() - 0.5) * shake);
  ctx.save();
  ctx.translate(-sx, 0);

  drawBackdrop(sx);
  drawSceneryHaze(sx);
  drawChapterTint(sx);
  drawPlatforms();
  drawHazards();
  drawCareStops();
  drawCoins();
  drawPowerups();
  drawMemeTokens();
  drawClubMates();
  drawBatteries();
  drawSkincarePickups();
  drawEnemies();
  drawGoal();
  drawPlayer();
  drawSpawnCue();
  drawCareEffect();
  drawMagicPipePrompt();
  drawFloatingTexts();

  ctx.restore();
  drawVignette();
  if (state === "playing") drawPlatformQuest();
  if (state === "playing") drawSkincareCollectionHud();
  if (state === "playing") drawLevelOneTutorial();
}

function drawShowcaseVideoBackdrop() {
  ctx.clearRect(0, 0, W, H);
  if (ayaMoulinFinalArt.complete && ayaMoulinFinalArt.naturalWidth > 0) {
    drawCoverImage(ayaMoulinFinalArt);
    ctx.fillStyle = "rgba(4, 2, 8, 0.36)";
    ctx.fillRect(0, 0, W, H);
    const neon = ctx.createLinearGradient(0, 0, W, H);
    neon.addColorStop(0, "rgba(255, 95, 103, 0.25)");
    neon.addColorStop(0.42, "rgba(255, 207, 78, 0.06)");
    neon.addColorStop(1, "rgba(134, 247, 255, 0.18)");
    ctx.fillStyle = neon;
    ctx.fillRect(0, 0, W, H);
  } else {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#040819");
    bg.addColorStop(0.45, "#101447");
    bg.addColorStop(1, "#120817");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    drawMoulinDisco(920);
    drawPixelAyaSprite(102, 118, 3);
    drawPixelAyaTitle(88, 78, 3);
  }

  drawFinalMoulinNeonSparkles();

  ctx.fillStyle = "rgba(5, 6, 9, 0.76)";
  ctx.fillRect(398, 92, 484, 88);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 5;
  ctx.strokeRect(406, 100, 468, 72);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 34px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("SHOWCASE AU MOULIN", W / 2, 142);
  ctx.fillStyle = "#ff5fb7";
  ctx.font = "900 15px system-ui";
  ctx.fillText("la video TikTok charge au centre", W / 2, 164);
  ctx.textAlign = "left";

  ctx.fillStyle = "#0b0c12";
  ctx.fillRect(0, H - 92, W, 92);
  ctx.fillStyle = "#20272f";
  for (let x = 0; x < W; x += 80) {
    ctx.fillRect(x, H - 92, 42, 18 + ((x / 80) % 3) * 10);
  }
  drawVignette();
}

function drawFinalMoulinNeonSparkles() {
  ctx.fillStyle = "#ffcf4e";
  for (let i = 0; i < 70; i += 1) {
    const x = (i * 89 + Math.sin(performance.now() * 0.001 + i) * 8) % W;
    const y = 28 + ((i * 47) % 340);
    ctx.fillRect(x, y, i % 5 === 0 ? 6 : 3, i % 5 === 0 ? 6 : 3);
  }

  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.fillStyle = "#ff4d56";
  ctx.beginPath();
  ctx.moveTo(150, H);
  ctx.lineTo(430, 82);
  ctx.lineTo(560, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#86f7ff";
  ctx.beginPath();
  ctx.moveTo(W - 100, H);
  ctx.lineTo(W - 330, 120);
  ctx.lineTo(W - 520, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function updateFloatingTexts() {
  floatingTexts = floatingTexts.filter((text) => {
    text.y += text.vy;
    text.life -= 1;
    return text.life > 0;
  });
}

function drawBackdrop(sx) {
  ctx.fillStyle = "#e9f2e0";
  for (let x = -300; x < WORLD_W + 400; x += 520) {
    const px = x + sx * 0.18;
    drawCloud(px, 92 + (x % 3) * 28, 1);
  }

  ctx.save();
  ctx.globalAlpha = 0.56;
  ctx.fillStyle = "#2d8fb2";
  ctx.fillRect(-220, FLOOR_Y - 118, WORLD_W + 500, 170);
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  for (let x = -200; x < WORLD_W + 300; x += 150) {
    ctx.fillRect(x + Math.sin(performance.now() * 0.0015 + x) * 14, FLOOR_Y - 82, 80, 4);
    ctx.fillRect(x + 48, FLOOR_Y - 34, 54, 3);
  }

  for (let x = -80; x < WORLD_W + 500; x += 620) {
    drawFishingBoat(x + sx * 0.08, FLOOR_Y - 74 + Math.sin(performance.now() * 0.001 + x) * 3, x % 2 === 0 ? "#d94f45" : "#f2d67a");
  }

  for (let x = 360; x < WORLD_W + 400; x += 760) {
    drawSailboat(x + sx * 0.06, FLOOR_Y - 138 + Math.sin(performance.now() * 0.0012 + x) * 4);
  }

  drawSchool(120);
  drawTown(3000, "PARENTS", "#e8b986");
  drawCoast(4300);
  drawSign(4700, FLOOR_Y - 250, "DUDUCHE + COCA");
  drawHarbor(6400);
  drawSign(6500, FLOOR_Y - 235, "SORTIE DZ");
  drawMarket(7700);
  drawMoulinDisco(8300);
  drawSign(610, FLOOR_Y - 245, "6 7");
  drawSign(1855, FLOOR_Y - 315, "FILMER AYA");
  drawSign(2760, FLOOR_Y - 300, "MIN + BAT");
  drawSign(5200, FLOOR_Y - 270, "CORVEES");
  drawSign(7200, FLOOR_Y - 300, "CLUB MATE");
  drawSign(8020, FLOOR_Y - 300, "VIDEUR");
  drawSign(8720, FLOOR_Y - 270, "AYA SHOW");

  ctx.fillStyle = "#1f8fb5";
  ctx.fillRect(-220, FLOOR_Y + 52, WORLD_W + 500, 120);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let x = -200; x < WORLD_W + 200; x += 120) {
    ctx.fillRect(x + Math.sin(performance.now() * 0.002 + x) * 12, FLOOR_Y + 84, 66, 4);
  }
  ctx.restore();
}

function drawSceneryHaze(sx) {
  const haze = ctx.createLinearGradient(0, 90, 0, FLOOR_Y);
  haze.addColorStop(0, "rgba(232, 245, 238, 0.22)");
  haze.addColorStop(0.52, "rgba(232, 245, 238, 0.36)");
  haze.addColorStop(1, "rgba(232, 245, 238, 0.18)");
  ctx.fillStyle = haze;
  ctx.fillRect(sx, 0, W, FLOOR_Y + 70);
}

function drawChapterTint(sx) {
  if (state !== "playing") return;
  const chapter = currentPlatformChapter();
  ctx.fillStyle = chapter.tint;
  ctx.fillRect(sx, 0, W, FLOOR_Y + 80);
}

function drawCloud(x, y, scale) {
  ctx.beginPath();
  ctx.arc(x, y, 24 * scale, 0, Math.PI * 2);
  ctx.arc(x + 28 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x + 64 * scale, y, 25 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawCoverImage(image) {
  const scale = Math.max(W / image.naturalWidth, H / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (W - width) / 2;
  const y = (H - height) / 2;
  ctx.drawImage(image, x, y, width, height);
}

function drawWorldMap() {
  ctx.clearRect(0, 0, W, H);

  if (mapArt.complete && mapArt.naturalWidth > 0) {
    drawCoverImage(mapArt);
    drawGeneratedMapOverlay();
    drawIsometricMapRoute();
    drawGeneratedMapSiteLabels();

    drawAyaTourBusOnMap();
    mapNodes.forEach((node, index) => drawMapNode(node, index));
    drawSelectedMapPanel();
    drawMapTitlePanel();
    return;
  }

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#7fc9e6");
  bg.addColorStop(0.45, "#b9dfc7");
  bg.addColorStop(1, "#26799a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawIsometricSea();
  drawIsometricCityGrid();
  drawIsometricMapRoute();
  drawMapDistrictLandmarks();

  drawMapLandmarkForNode(mapNodes[0], "college");
  drawMapLandmarkForNode(mapNodes[1], "parents");
  drawMapLandmarkForNode(mapNodes[2], "bubble");
  drawMapLandmarkForNode(mapNodes[3], "mirror");
  drawMapLandmarkForNode(mapNodes[4], "moulin");
  drawMapLandmarkForNode(mapNodes[5], "mom");
  drawMapLandmarkForNode(mapNodes[6], "phone");
  drawMapLandmarkForNode(mapNodes[7], "versus");
  drawMapLandmarkForNode(mapNodes[8], "sky");
  drawMapLandmarkForNode(mapNodes[9], "video");
  drawAyaTourBusOnMap();

  mapNodes.forEach((node, index) => drawMapNode(node, index));
  drawSelectedMapPanel();
  drawMapTitlePanel();
}

function drawMapTitlePanel() {
  ctx.fillStyle = "rgba(6,10,16,0.7)";
  ctx.fillRect(52, 38, 516, 104);
  ctx.strokeStyle = "rgba(255, 239, 198, 0.78)";
  ctx.lineWidth = 4;
  ctx.strokeRect(58, 44, 504, 92);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 38px system-ui";
  ctx.fillText("MimieBros", 96, 92);
  ctx.fillStyle = "#ffd8ef";
  ctx.font = "italic 800 18px system-ui";
  ctx.fillText("The Aya Quest", 316, 92);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "800 16px system-ui";
  ctx.fillText("Carte de Douarnenez: les univers se revelent au fur et a mesure", 96, 122);
}

function drawGeneratedMapOverlay() {
  const shade = ctx.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(4, 8, 14, 0.08)");
  shade.addColorStop(0.48, "rgba(4, 8, 14, 0.02)");
  shade.addColorStop(1, "rgba(4, 8, 14, 0.18)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(4, 8, 14, 0.18)";
  ctx.fillRect(0, 0, W, 150);
  ctx.fillStyle = "rgba(4, 8, 14, 0.16)";
  ctx.fillRect(0, 604, W, 116);
}

function drawGeneratedMapSiteLabels() {
  drawIsoLabel(162, 256, "College", "#f8efd0");
  drawIsoLabel(298, 504, "Port-Rhu", "#86f7ff");
  drawIsoLabel(612, 646, "Plage des Dames", "#f8efd0");
  drawIsoLabel(736, 282, "Reseau tel", "#86f7ff");
  drawIsoLabel(1128, 172, "Le Moulin", "#ff5fb7");
  drawIsoLabel(1012, 454, "Tourbus AYA", "#ffcf4e");
}

function drawIsometricSea() {
  const sea = ctx.createLinearGradient(0, 288, 0, H);
  sea.addColorStop(0, "#2c9ec3");
  sea.addColorStop(1, "#156b9a");
  ctx.fillStyle = sea;
  ctx.beginPath();
  ctx.moveTo(0, 468);
  ctx.lineTo(212, 424);
  ctx.lineTo(426, 526);
  ctx.lineTo(652, 600);
  ctx.lineTo(762, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(248,239,208,0.34)";
  for (let x = -70; x < 820; x += 116) {
    const y = 536 + Math.sin(x * 0.05) * 18 + (x > 420 ? 48 : 0);
    ctx.fillRect(x, y, 82, 4);
    ctx.fillRect(x + 38, y + 34, 58, 3);
  }

  drawMapBoat(88, 548, "#d94c3f", 1.08);
  drawMapBoat(256, 624, "#f2d67a", 0.86);
  drawMapBoat(462, 574, "#ff9ec5", 0.72);
  drawMapSailboat(604, 626, 0.8);
  drawMapSailboat(172, 650, 0.62);

  ctx.fillStyle = "#d8c08a";
  ctx.beginPath();
  ctx.moveTo(252, 466);
  ctx.lineTo(532, 594);
  ctx.lineTo(488, 616);
  ctx.lineTo(210, 488);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#9b7d52";
  ctx.beginPath();
  ctx.moveTo(292, 480);
  ctx.lineTo(542, 592);
  ctx.lineTo(532, 600);
  ctx.lineTo(282, 488);
  ctx.closePath();
  ctx.fill();
}

function drawIsometricCityGrid() {
  const land = ctx.createLinearGradient(150, 110, 1180, 588);
  land.addColorStop(0, "#a9d783");
  land.addColorStop(0.45, "#7fbd85");
  land.addColorStop(0.72, "#d5c081");
  land.addColorStop(1, "#6aa9b5");

  ctx.fillStyle = "rgba(5, 6, 9, 0.22)";
  ctx.beginPath();
  ctx.moveTo(90, 268);
  ctx.lineTo(572, 64);
  ctx.lineTo(1288, 382);
  ctx.lineTo(762, 654);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = land;
  ctx.beginPath();
  ctx.moveTo(78, 244);
  ctx.lineTo(570, 42);
  ctx.lineTo(1270, 354);
  ctx.lineTo(736, 626);
  ctx.closePath();
  ctx.fill();

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const x = 150 + col * 92 + row * 42;
      const y = 192 + row * 42 - col * 7;
      if (x < 100 || x > 1210 || y < 120 || y > 590) continue;
      const harbor = row > 5 && col < 4;
      const beach = row > 6 && col > 2 && col < 7;
      const town = row > 1 && row < 6 && col > 3 && col < 9;
      const park = (row + col) % 5 === 0;
      const color = harbor ? "#58aac2"
        : beach ? "#d8c08a"
          : town ? "#b8b18e"
            : park ? "#98cf75"
              : (row + col) % 2 ? "#7fbd85" : "#8acb79";
      drawIsoTile(x, y, color, 50, 25);
      if (town && (row + col) % 2 === 0) drawIsoBuilding(x, y - 16, (row + col) % 3);
    }
  }

  drawIsoRoad([[128, 244], [304, 326], [470, 286], [640, 390], [792, 314], [972, 408], [1166, 356]], "#f8efd0", 18);
  drawIsoRoad([[280, 514], [430, 438], [642, 500], [820, 422], [1000, 514], [1184, 404]], "#f8efd0", 14);
  drawIsoRoad([[562, 86], [646, 180], [760, 246], [794, 342], [900, 448]], "rgba(255,207,78,0.68)", 9);
}

function drawMapDistrictLandmarks() {
  drawIsoLabel(148, 504, "Port-Rhu", "#86f7ff");
  drawIsoLabel(316, 584, "Plage des Dames", "#f8efd0");
  drawIsoLabel(470, 238, "Centre-ville", "#f8efd0");
  drawIsoLabel(812, 220, "Route du Moulin", "#ffd8ef");
  drawIsoLabel(1078, 566, "Parking parents", "#ffcf4e");

  drawMapSmallLighthouse(226, 444);
  drawMapTinySchool(164, 248);
  drawMapHarborCranes(342, 514);
  drawMapBeachUmbrellas(392, 574);
  drawMapMiniMoulin(806, 232);
  drawMapPhoneTower(1046, 246);
  drawMapCats(932, 560);
}

function drawIsometricMapRoute() {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(18, 26, 31, 0.45)";
  ctx.lineWidth = 18;
  drawMapRouteLine();
  ctx.strokeStyle = "rgba(248,239,208,0.9)";
  ctx.lineWidth = 10;
  drawMapRouteLine();
  ctx.strokeStyle = "rgba(255,207,78,0.74)";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 14]);
  drawMapRouteLine();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawMapRouteLine() {
  ctx.beginPath();
  mapNodes.forEach((node, index) => {
    if (index === 0) ctx.moveTo(node.x, node.y);
    else ctx.lineTo(node.x, node.y);
  });
  ctx.stroke();
}

function drawIsoTile(x, y, color, halfW = 64, halfH = 32) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - halfH);
  ctx.lineTo(x + halfW, y);
  ctx.lineTo(x, y + halfH);
  ctx.lineTo(x - halfW, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.moveTo(x - halfW, y);
  ctx.lineTo(x, y + halfH);
  ctx.lineTo(x + halfW, y);
  ctx.lineTo(x, y + halfH + 12);
  ctx.closePath();
  ctx.fill();
}

function drawIsoRoad(points, color, width) {
  ctx.save();
  ctx.strokeStyle = "rgba(5, 6, 9, 0.24)";
  ctx.lineWidth = width + 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point[0], point[1]);
    else ctx.lineTo(point[0], point[1]);
  });
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point[0], point[1]);
    else ctx.lineTo(point[0], point[1]);
  });
  ctx.stroke();
  ctx.restore();
}

function drawIsoBuilding(x, y, variant) {
  const w = 26 + variant * 8;
  const h = 30 + variant * 10;
  const color = ["#f2d1a2", "#d7a78d", "#dfe8ea"][variant % 3];
  ctx.fillStyle = "rgba(5,6,9,0.18)";
  ctx.fillRect(x - w / 2 + 6, y + 12, w + 8, 8);
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.fillStyle = "#c66b55";
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 4, y - h);
  ctx.lineTo(x, y - h - 16);
  ctx.lineTo(x + w / 2 + 4, y - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#466a7c";
  for (let i = 0; i < Math.max(1, variant + 1); i += 1) {
    ctx.fillRect(x - w / 2 + 6 + i * 13, y - h + 12, 7, 9);
  }
}

function drawIsoLabel(x, y, text, color) {
  ctx.fillStyle = "rgba(6,10,16,0.68)";
  const width = Math.max(82, text.length * 8 + 24);
  ctx.fillRect(x - width / 2, y - 18, width, 30);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - width / 2 + 3, y - 15, width - 6, 24);
  ctx.fillStyle = color;
  ctx.font = "900 12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y + 2);
  ctx.textAlign = "left";
}

function drawMapBoat(x, y, color, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(5, 6, 9, 0.24)";
  ctx.fillRect(-18, 23, 112, 5);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(0, 0, 58, 16);
  ctx.fillStyle = color;
  ctx.fillRect(42, -12, 30, 14);
  ctx.fillStyle = "#3a4d58";
  ctx.beginPath();
  ctx.moveTo(-12, 16);
  ctx.lineTo(92, 16);
  ctx.lineTo(74, 32);
  ctx.lineTo(8, 32);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMapSailboat(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(5, 6, 9, 0.24)";
  ctx.fillRect(-24, 30, 90, 5);
  ctx.fillStyle = "#3a4d58";
  ctx.fillRect(-22, 18, 78, 14);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(12, -42, 5, 62);
  ctx.beginPath();
  ctx.moveTo(18, -38);
  ctx.lineTo(18, 14);
  ctx.lineTo(62, 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffcf4e";
  ctx.beginPath();
  ctx.moveTo(8, -28);
  ctx.lineTo(8, 12);
  ctx.lineTo(-28, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMapSmallLighthouse(x, y) {
  ctx.fillStyle = "rgba(5,6,9,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 22, 36, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(x - 15, y - 62, 30, 70);
  ctx.fillStyle = "#d94c3f";
  ctx.fillRect(x - 19, y - 44, 38, 10);
  ctx.fillRect(x - 19, y - 18, 38, 10);
  ctx.fillStyle = "#101820";
  ctx.fillRect(x - 22, y - 76, 44, 14);
  ctx.fillStyle = "rgba(255,207,78,0.65)";
  ctx.beginPath();
  ctx.moveTo(x + 20, y - 70);
  ctx.lineTo(x + 86, y - 92);
  ctx.lineTo(x + 86, y - 52);
  ctx.closePath();
  ctx.fill();
}

function drawMapTinySchool(x, y) {
  drawIsoTile(x, y + 20, "#b8b18e", 42, 22);
  ctx.fillStyle = "#d6c08a";
  ctx.fillRect(x - 34, y - 56, 68, 66);
  ctx.fillStyle = "#8a4f3c";
  ctx.beginPath();
  ctx.moveTo(x - 42, y - 56);
  ctx.lineTo(x, y - 88);
  ctx.lineTo(x + 42, y - 56);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#20313a";
  ctx.fillRect(x - 8, y - 18, 16, 28);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("COLLEGE", x, y - 96);
  ctx.textAlign = "left";
}

function drawMapHarborCranes(x, y) {
  for (let i = 0; i < 2; i += 1) {
    const px = x + i * 46;
    ctx.fillStyle = "#20313a";
    ctx.fillRect(px - 5, y - 58, 10, 58);
    ctx.fillRect(px - 28, y - 62, 56, 8);
    ctx.fillStyle = "#ffcf4e";
    ctx.fillRect(px + 22, y - 54, 8, 30);
  }
  drawMapBoat(x - 40, y + 26, "#86f7ff", 0.58);
  drawMapBoat(x + 38, y + 44, "#d94c3f", 0.48);
}

function drawMapBeachUmbrellas(x, y) {
  for (let i = 0; i < 3; i += 1) {
    const px = x + i * 36;
    ctx.fillStyle = ["#ff5fb7", "#86f7ff", "#ffcf4e"][i];
    ctx.beginPath();
    ctx.moveTo(px - 18, y);
    ctx.quadraticCurveTo(px, y - 28, px + 18, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6f4f3c";
    ctx.fillRect(px - 2, y, 4, 34);
  }
}

function drawMapMiniMoulin(x, y) {
  ctx.fillStyle = "rgba(5,6,9,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + 34, 50, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#20272f";
  ctx.fillRect(x - 30, y - 62, 60, 82);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(x - 6, y - 106, 12, 78);
  ctx.fillRect(x - 52, y - 72, 104, 12);
  ctx.fillStyle = "#ff4d56";
  ctx.fillRect(x - 44, y - 116, 88, 12);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("LE MOULIN", x, y - 124);
  ctx.textAlign = "left";
}

function drawMapPhoneTower(x, y) {
  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y - 80);
  ctx.lineTo(x - 24, y + 6);
  ctx.moveTo(x, y - 80);
  ctx.lineTo(x + 24, y + 6);
  ctx.moveTo(x - 14, y - 34);
  ctx.lineTo(x + 14, y - 34);
  ctx.stroke();
  ctx.strokeStyle = "#86f7ff";
  ctx.lineWidth = 3;
  for (let r = 16; r <= 42; r += 13) {
    ctx.beginPath();
    ctx.arc(x, y - 82, r, -0.9, 0.9);
    ctx.stroke();
  }
}

function drawMapCats(x, y) {
  ctx.fillStyle = "#101820";
  ctx.beginPath();
  ctx.arc(x - 22, y - 10, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8d5a32";
  ctx.beginPath();
  ctx.arc(x + 24, y - 8, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8efd0";
  ctx.beginPath();
  ctx.arc(x + 15, y - 14, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d94c3f";
  ctx.beginPath();
  ctx.arc(x + 32, y - 19, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawIsoPlatform(x, y, color, selected, unlocked) {
  ctx.fillStyle = "rgba(5, 6, 9, 0.34)";
  ctx.beginPath();
  ctx.ellipse(x, y + 24, selected ? 54 : 44, selected ? 17 : 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = unlocked ? color : "#52616c";
  ctx.beginPath();
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x + 48, y);
  ctx.lineTo(x, y + 24);
  ctx.lineTo(x - 48, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = unlocked ? "rgba(5,6,9,0.2)" : "rgba(5,6,9,0.38)";
  ctx.beginPath();
  ctx.moveTo(x - 48, y);
  ctx.lineTo(x, y + 24);
  ctx.lineTo(x + 48, y);
  ctx.lineTo(x, y + 40);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = selected ? "#ffcf4e" : unlocked ? "rgba(248,239,208,0.72)" : "rgba(248,239,208,0.34)";
  ctx.lineWidth = selected ? 5 : 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x + 48, y);
  ctx.lineTo(x, y + 24);
  ctx.lineTo(x - 48, y);
  ctx.closePath();
  ctx.stroke();
}

function drawMapNode(node, index) {
  const selected = index === mapSelected;
  const unlocked = node.level <= unlockedLevel;
  const visibleNumber = unlocked ? String(node.level) : "?";
  const palette = node.kind === "platform" ? "#6fcf86"
    : node.kind === "finale" ? "#ffcf4e"
      : node.kind === "video" ? "#86f7ff"
        : "#ff9ec5";

  drawIsoPlatform(node.x, node.y + 22, palette, selected, unlocked);

  if (selected) {
    const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.08;
    ctx.strokeStyle = "rgba(255, 207, 78, 0.78)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(node.x, node.y + 19, 68 * pulse, 38 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(node.x, node.y);
  ctx.fillStyle = selected ? "#ffcf4e" : unlocked ? "#f8efd0" : "#313d4a";
  ctx.beginPath();
  ctx.arc(0, 0, selected ? 25 : 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = unlocked ? "#101820" : "#f8efd0";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = unlocked ? "#20313a" : "#20272f";
  ctx.font = "900 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(visibleNumber, 0, 6);

  ctx.fillStyle = selected ? "#ffcf4e" : unlocked ? "#f8efd0" : "#8d98a0";
  ctx.font = "900 13px system-ui";
  ctx.fillText(mapNodeShortLabel(node, unlocked), 0, 42);
  ctx.restore();
  ctx.textAlign = "left";
}

function mapNodeShortLabel(node, unlocked) {
  if (!unlocked) return "???";
  if (node.kind === "platform") return "MARIO";
  if (node.id === "finale") return "AYA";
  if (node.id === "showcase") return "LIVE";
  return "MINI";
}

function drawSelectedMapPanel() {
  const node = mapNodes[mapSelected];
  const unlocked = node.level <= unlockedLevel;
  const sublevelCount = platformChapters[node.id]?.length || 0;
  const title = unlocked ? node.title : "???";
  const subtitle = unlocked
    ? sublevelCount > 0 ? `${node.subtitle} - ${sublevelCount} sous-niveaux` : node.subtitle
    : "Univers encore cache";
  const kindText = unlocked
    ? node.kind === "platform" ? "niveau Mario"
      : node.kind === "finale" ? "niveau AYA"
        : node.kind === "video" ? "showcase"
          : "mini-jeu"
    : "a decouvrir";

  ctx.fillStyle = "rgba(6,10,16,0.78)";
  ctx.fillRect(56, 606, 612, 78);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 4;
  ctx.strokeRect(64, 614, 596, 62);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 18px system-ui";
  ctx.fillText(`Niveau ${unlocked ? node.level : "?"} - ${kindText}`, 92, 642);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 25px system-ui";
  ctx.fillText(title, 92, 668);
  ctx.fillStyle = "#b9c2bd";
  ctx.font = "800 14px system-ui";
  ctx.fillText(subtitle, 330, 668);
}

function drawMapLandmarkForNode(node, kind) {
  if (node.level <= unlockedLevel) {
    drawMapLandmark(node.x, node.y - 36, kind);
    return;
  }
  drawMysteryLandmark(node.x, node.y - 36);
}

function drawAyaTourBusOnMap() {
  const moulinNode = mapNodes.find((node) => node.id === "platform3");
  if (!moulinNode) return;
  const t = performance.now() * 0.004;
  const arrival = Math.max(0, Math.min(1, (unlockedLevel - 3) / 2));
  const x = 856 + arrival * 156 + Math.sin(t) * 4;
  const y = 506 - arrival * 118 + Math.sin(t * 1.7) * 2;

  ctx.save();
  ctx.globalAlpha = unlockedLevel >= 3 ? 1 : 0.48;
  ctx.fillStyle = "rgba(5, 6, 9, 0.28)";
  ctx.beginPath();
  ctx.ellipse(x + 82, y + 72, 108, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#101820";
  ctx.beginPath();
  ctx.roundRect(x, y, 188, 74, 12);
  ctx.fill();
  ctx.fillStyle = "#ffcf4e";
  ctx.fillRect(x + 12, y + 10, 164, 24);
  ctx.fillStyle = "#ff5fb7";
  ctx.fillRect(x + 14, y + 40, 118, 20);
  ctx.fillStyle = "#86f7ff";
  for (let i = 0; i < 4; i += 1) ctx.fillRect(x + 22 + i * 30, y + 15, 20, 14);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("AYA TOUR", x + 112, y + 56);

  ctx.fillStyle = "#20272f";
  ctx.beginPath();
  ctx.arc(x + 40, y + 76, 14, 0, Math.PI * 2);
  ctx.arc(x + 150, y + 76, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8efd0";
  ctx.beginPath();
  ctx.arc(x + 40, y + 76, 6, 0, Math.PI * 2);
  ctx.arc(x + 150, y + 76, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 207, 78, 0.75)";
  ctx.beginPath();
  ctx.moveTo(x + 186, y + 48);
  ctx.lineTo(x + 230, y + 34);
  ctx.lineTo(x + 230, y + 62);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 22px system-ui";
  ctx.fillText("★", x + 192 + Math.sin(t * 2) * 7, y + 14);
  ctx.fillStyle = "rgba(255, 95, 183, 0.82)";
  ctx.font = "900 12px system-ui";
  ctx.fillText("showcase", x + 94, y - 8);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawMysteryLandmark(x, y) {
  ctx.fillStyle = "rgba(32, 49, 58, 0.62)";
  ctx.fillRect(x - 36, y - 74, 72, 74);
  ctx.fillStyle = "#52616c";
  ctx.fillRect(x - 48, y - 92, 96, 20);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 38px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("?", x, y - 32);
  ctx.textAlign = "left";
}

function drawMapLandmark(x, y, kind) {
  if (kind === "college") {
    ctx.fillStyle = "#d6c08a";
    ctx.fillRect(x - 34, y - 70, 68, 70);
    ctx.fillStyle = "#3b4a54";
    ctx.fillRect(x - 10, y - 28, 20, 28);
  }
  if (kind === "mirror") {
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(x - 30, y - 80, 60, 72);
    ctx.fillStyle = "#9ce6ff";
    ctx.fillRect(x - 22, y - 70, 44, 52);
  }
  if (kind === "phone") {
    ctx.fillStyle = "#101820";
    ctx.fillRect(x - 25, y - 86, 50, 82);
    ctx.fillStyle = "#86f7ff";
    ctx.fillRect(x - 18, y - 74, 36, 54);
  }
  if (kind === "mom") {
    ctx.fillStyle = "#ffcf9d";
    ctx.beginPath();
    ctx.arc(x, y - 78, 18, 0, Math.PI * 2);
    ctx.arc(x - 34, y - 62, 13, 0, Math.PI * 2);
    ctx.arc(x + 34, y - 62, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff5fb7";
    ctx.fillRect(x - 20, y - 60, 40, 50);
    ctx.fillStyle = "#86f7ff";
    ctx.fillRect(x - 48, y - 48, 28, 36);
    ctx.fillRect(x + 20, y - 48, 28, 36);
    ctx.fillStyle = "#4d3428";
    ctx.fillRect(x - 18, y - 98, 36, 11);
    ctx.fillStyle = "#f8efd0";
    ctx.font = "900 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("MAMAN?", x, y - 110);
    ctx.textAlign = "left";
  }
  if (kind === "bubble") {
    ctx.fillStyle = "#f8efd0";
    ctx.beginPath();
    ctx.roundRect(x - 48, y - 82, 96, 54, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 28);
    ctx.lineTo(x - 26, y - 8);
    ctx.lineTo(x + 12, y - 28);
    ctx.fill();
    ctx.fillStyle = "#20313a";
    ctx.font = "900 24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("?!", x, y - 47);
    ctx.textAlign = "left";
  }
  if (kind === "versus") {
    ctx.fillStyle = "#20272f";
    ctx.fillRect(x - 58, y - 78, 116, 68);
    ctx.strokeStyle = "#ffcf4e";
    ctx.lineWidth = 5;
    ctx.strokeRect(x - 52, y - 72, 104, 56);
    ctx.fillStyle = "#ff4d56";
    ctx.font = "900 23px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("TAXI", x, y - 35);
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(x - 38, y - 102, 76, 26);
    ctx.fillStyle = "#86f7ff";
    ctx.fillRect(x - 25, y - 96, 18, 12);
    ctx.fillRect(x + 7, y - 96, 18, 12);
    ctx.fillStyle = "#20272f";
    ctx.beginPath();
    ctx.arc(x - 20, y - 76, 8, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 76, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "left";
  }
  if (kind === "parents") {
    ctx.fillStyle = "#e8b986";
    ctx.fillRect(x - 48, y - 80, 38, 80);
    ctx.fillRect(x + 10, y - 80, 38, 80);
    ctx.fillStyle = "#4d3428";
    ctx.fillRect(x - 50, y - 92, 42, 18);
    ctx.fillRect(x + 8, y - 92, 42, 18);
    ctx.fillStyle = "#ffcf4e";
    ctx.font = "900 28px system-ui";
    ctx.fillText("?!", x - 10, y - 96);
  }
  if (kind === "moulin") {
    ctx.fillStyle = "#20272f";
    ctx.fillRect(x - 36, y - 88, 72, 88);
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(x - 6, y - 132, 12, 88);
    ctx.fillRect(x - 52, y - 92, 104, 12);
    ctx.fillStyle = "#dfe8ea";
    ctx.fillRect(x - 74, y - 154, 120, 14);
  }
  if (kind === "sky") {
    ctx.fillStyle = "#ffcf4e";
    ctx.fillRect(x - 34, y - 82, 68, 16);
    ctx.fillRect(x - 8, y - 112, 16, 76);
    ctx.fillStyle = "#ff5fb7";
    ctx.fillRect(x - 54, y - 138, 108, 18);
    ctx.fillStyle = "#f8efd0";
    ctx.font = "900 20px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("AYA", x, y - 150);
    ctx.textAlign = "left";
  }
  if (kind === "video") {
    ctx.fillStyle = "#101820";
    ctx.fillRect(x - 56, y - 86, 112, 70);
    ctx.strokeStyle = "#ffcf4e";
    ctx.lineWidth = 5;
    ctx.strokeRect(x - 50, y - 80, 100, 58);
    ctx.fillStyle = "#ff5fb7";
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 68);
    ctx.lineTo(x - 12, y - 34);
    ctx.lineTo(x + 22, y - 51);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#86f7ff";
    ctx.font = "900 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("LIVE", x, y - 96);
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(x - 42, y - 14, 84, 12);
    ctx.textAlign = "left";
  }
}

function drawFighterLevel() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#101b3f");
  bg.addColorStop(0.48, "#285f83");
  bg.addColorStop(1, "#172126");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawFighterArena();
  drawFighterHud();
  drawFighterInstructions();
  for (const projectile of fighterProjectiles) drawDadProjectile(projectile);
  if (fighterDad) drawFighterDad(fighterDad);
  if (fighterJohanne) drawFighterJohanne(fighterJohanne);
  drawFighterEffects();
  drawFighterMessage();
}

function drawFighterArena() {
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let x = 40; x < W; x += 190) ctx.fillRect(x, 120 + Math.sin(x) * 12, 78, 5);

  ctx.fillStyle = "#102533";
  ctx.fillRect(0, 368, W, 210);
  ctx.fillStyle = "#2d8fb2";
  ctx.fillRect(0, 428, W, 118);
  for (let x = -40; x < W + 80; x += 140) {
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.fillRect(x + Math.sin(performance.now() * 0.001 + x) * 10, 476, 68, 4);
  }

  drawFishingBoat(72, 380, "#f2d67a");
  drawFishingBoat(1015, 396, "#d94f45");
  drawMoulinDisco(880);
  drawDadTaxiCar(518, 432);

  ctx.fillStyle = "#151a20";
  ctx.fillRect(0, 558, W, 162);
  ctx.fillStyle = "#343b48";
  for (let x = 0; x < W; x += 82) {
    ctx.fillRect(x, 558, 64, 20);
    ctx.fillStyle = x % 164 === 0 ? "#475363" : "#343b48";
  }
  ctx.fillStyle = "#222a34";
  for (let y = 582; y < H; y += 34) {
    for (let x = (y % 68) - 40; x < W; x += 92) ctx.fillRect(x, y, 72, 18);
  }

  ctx.fillStyle = "rgba(5, 6, 9, 0.5)";
  ctx.fillRect(90, 504, 1100, 24);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 28px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("STREET JOHANNE - TAXI POUR LE MOULIN", W / 2, 516);
  ctx.textAlign = "left";
}

function drawDadTaxiCar(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(5, 6, 9, 0.28)";
  ctx.beginPath();
  ctx.ellipse(118, 82, 128, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffcf4e";
  ctx.fillRect(10, 36, 216, 54);
  ctx.fillStyle = "#f2dc85";
  ctx.fillRect(52, 12, 116, 42);
  ctx.fillStyle = "#26313d";
  ctx.fillRect(64, 20, 42, 28);
  ctx.fillRect(116, 20, 42, 28);
  ctx.fillStyle = "#86f7ff";
  ctx.fillRect(172, 50, 42, 15);
  ctx.fillStyle = "#ff5fb7";
  ctx.fillRect(22, 50, 34, 16);
  ctx.fillStyle = "#101820";
  ctx.font = "900 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("PAPA TAXI", 118, 75);
  ctx.fillStyle = "#20272f";
  ctx.beginPath();
  ctx.arc(58, 92, 21, 0, Math.PI * 2);
  ctx.arc(178, 92, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8efd0";
  ctx.beginPath();
  ctx.arc(58, 92, 9, 0, Math.PI * 2);
  ctx.arc(178, 92, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 12px system-ui";
  ctx.fillText("MOULIN ->", 118, 30);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawFighterHud() {
  if (!fighterJohanne || !fighterDad) return;
  ctx.fillStyle = "rgba(5, 6, 9, 0.86)";
  ctx.fillRect(44, 38, 482, 86);
  ctx.fillRect(754, 38, 482, 86);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 44, 470, 74);
  ctx.strokeRect(760, 44, 470, 74);

  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 25px system-ui";
  ctx.fillText("JOHANNE", 72, 76);
  ctx.textAlign = "right";
  ctx.fillText("PAPA TAXI", 1208, 76);
  ctx.textAlign = "left";

  drawHealthBar(72, 88, 410, 20, fighterJohanne.health / fighterJohanne.maxHealth, "#ffcf4e");
  drawHealthBar(798, 88, 410, 20, fighterDad.health / fighterDad.maxHealth, "#86f7ff", true);

  ctx.fillStyle = "#050609";
  ctx.fillRect(578, 34, 124, 92);
  ctx.strokeStyle = "#ffcf4e";
  ctx.strokeRect(584, 40, 112, 80);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 42px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(String(Math.ceil(fighterTimer)).padStart(2, "0"), W / 2, 92);
  ctx.font = "900 13px system-ui";
  ctx.fillText("ROUND", W / 2, 112);
  ctx.textAlign = "left";
}

function drawFighterInstructions() {
  ctx.fillStyle = "rgba(5, 6, 9, 0.74)";
  ctx.fillRect(238, 128, 804, 84);
  ctx.strokeStyle = "rgba(255, 207, 78, 0.78)";
  ctx.lineWidth = 3;
  ctx.strokeRect(244, 134, 792, 72);

  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("BUT: convaincre Papa d'amener les enfants au Moulin en voiture", W / 2, 154);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "800 14px system-ui";
  ctx.fillText("< > / Q D: bouger   ESPACE / ENTREE: chatouilles   X: vanne", W / 2, 177);
  ctx.fillStyle = "#86f7ff";
  ctx.fillText("Vide sa barre avant le timer: le taxi familial vers le showcase est debloque", W / 2, 196);
  ctx.textAlign = "left";
}

function drawHealthBar(x, y, w, h, ratio, color, reverse = false) {
  ctx.fillStyle = "#24303a";
  ctx.fillRect(x, y, w, h);
  const fill = Math.max(0, Math.min(1, ratio)) * w;
  ctx.fillStyle = color;
  if (reverse) ctx.fillRect(x + w - fill, y, fill, h);
  else ctx.fillRect(x, y, fill, h);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(x, y, w, 5);
}

function drawFighterJohanne(f) {
  const bob = Math.sin(f.frame * Math.PI * 2) * 3;
  ctx.save();
  ctx.translate(f.x + f.w / 2, f.y + bob);
  ctx.scale(f.facing, 1);
  if (f.hitStun > 0 && Math.floor(f.hitStun / 40) % 2 === 0) ctx.globalAlpha = 0.58;

  ctx.fillStyle = "#7a5132";
  ctx.fillRect(-29, -90, 58, 64);
  ctx.fillStyle = "#ffcf9d";
  ctx.fillRect(-20, -80, 40, 44);
  ctx.fillStyle = "#a9794f";
  ctx.fillRect(-24, -96, 48, 19);
  ctx.fillRect(-30, -74, 12, 58);
  ctx.fillRect(18, -74, 12, 58);
  ctx.fillStyle = "#c09261";
  ctx.fillRect(13, -88, 5, 62);
  ctx.fillStyle = "#20272f";
  ctx.fillRect(-12, -64, 6, 6);
  ctx.fillRect(8, -64, 6, 6);
  ctx.fillStyle = "#b85c5c";
  ctx.fillRect(-8, -48, 16, 3);

  ctx.fillStyle = "#2f5f9f";
  ctx.fillRect(-28, -34, 56, 70);
  ctx.fillStyle = "#4479bf";
  ctx.fillRect(-25, -24, 50, 6);
  ctx.fillRect(-25, -7, 50, 5);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("J", 0, 6);

  ctx.fillStyle = "#ffcf9d";
  const armReach = f.attackTimer > 0 ? 48 : 22;
  ctx.fillRect(22, -28, armReach, 12);
  ctx.fillRect(-34, -28, 14, 44);
  if (f.attackTimer > 0) {
    ctx.fillStyle = "#c8ff4e";
    ctx.font = "900 15px system-ui";
    ctx.fillText(f.attackKind === "vanne" ? "VANNE!" : "TICKLE!", 72, -36);
  }

  ctx.fillStyle = "#20313a";
  ctx.fillRect(-24, 36, 18, 54);
  ctx.fillRect(8, 36, 18, 54);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(-28, 88, 25, 8);
  ctx.fillRect(6, 88, 25, 8);
  ctx.restore();
}

function drawFighterDad(f) {
  const bob = Math.sin(f.frame * Math.PI * 2 + 1.4) * 2;
  ctx.save();
  ctx.translate(f.x + f.w / 2, f.y + bob);
  ctx.scale(f.facing, 1);
  if (f.hitStun > 0 && Math.floor(f.hitStun / 40) % 2 === 0) ctx.globalAlpha = 0.58;

  ctx.fillStyle = "#6d543c";
  ctx.fillRect(-31, -82, 10, 16);
  ctx.fillRect(21, -82, 10, 16);
  ctx.fillRect(-28, -51, 8, 12);
  ctx.fillRect(20, -51, 8, 12);
  ctx.fillStyle = "#d9b177";
  ctx.fillRect(-22, -82, 44, 44);
  ctx.fillStyle = "#101820";
  ctx.fillRect(-27, -101, 54, 15);
  ctx.fillRect(1, -96, 40, 9);
  ctx.fillStyle = "#2f6f8f";
  ctx.font = "900 6px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("CAP", 0, -91);
  ctx.fillStyle = "#6d543c";
  ctx.fillRect(-24, -88, 48, 10);
  ctx.fillStyle = "#101820";
  ctx.lineWidth = 3;
  ctx.strokeRect(-18, -67, 16, 11);
  ctx.strokeRect(4, -67, 16, 11);
  ctx.beginPath();
  ctx.moveTo(-2, -62);
  ctx.lineTo(4, -62);
  ctx.stroke();
  ctx.fillStyle = "#20272f";
  ctx.fillRect(-11, -64, 6, 6);
  ctx.fillRect(8, -64, 6, 6);
  ctx.fillStyle = "#805b43";
  ctx.fillRect(-12, -45, 24, 5);
  ctx.fillStyle = "#7a3333";
  ctx.fillRect(-9, -50, 18, 3);

  ctx.fillStyle = "#2f3339";
  ctx.fillRect(-32, -38, 64, 76);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 12px system-ui";
  ctx.textAlign = "center";
  drawReadableMirroredText("PAPA", 0, 2, f.facing);

  ctx.fillStyle = "#d9b177";
  const armReach = f.attackTimer > 0 ? 50 : 24;
  ctx.fillRect(22, -28, armReach, 13);
  ctx.fillRect(-36, -28, 16, 46);
  if (f.specialTimer > 0) {
    ctx.strokeStyle = "#86f7ff";
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(82 + i * 18, -20, 22 + i * 10, -0.7, 0.7);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#1d2028";
  ctx.fillRect(-26, 38, 20, 54);
  ctx.fillRect(8, 38, 20, 54);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(-30, 90, 28, 8);
  ctx.fillRect(6, 90, 28, 8);
  ctx.restore();
}

function drawReadableMirroredText(text, x, y, facing) {
  if (facing === 1) {
    ctx.fillText(text, x, y);
    return;
  }
  ctx.save();
  ctx.scale(-1, 1);
  ctx.fillText(text, -x, y);
  ctx.restore();
}

function drawDadProjectile(projectile) {
  const isJohanne = projectile.owner === "johanne";
  ctx.fillStyle = "rgba(5, 6, 9, 0.88)";
  ctx.fillRect(projectile.x, projectile.y, projectile.w, projectile.h);
  ctx.strokeStyle = isJohanne ? "#ffd8ef" : "#86f7ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(projectile.x + 2, projectile.y + 2, projectile.w - 4, projectile.h - 4);
  ctx.fillStyle = isJohanne ? "#ffd8ef" : "#f8efd0";
  ctx.font = "900 12px system-ui";
  wrapText(projectile.text, projectile.x + 12, projectile.y + 20, projectile.w - 24, 15);
  ctx.textAlign = "left";
}

function drawFighterEffects() {
  ctx.font = "900 18px system-ui";
  ctx.textAlign = "center";
  for (const effect of fighterEffects) {
    ctx.globalAlpha = Math.max(0, Math.min(1, effect.life / 24));
    ctx.fillStyle = effect.color;
    ctx.fillText(effect.text, effect.x, effect.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

function drawFighterMessage() {
  ctx.fillStyle = "rgba(5, 6, 9, 0.78)";
  ctx.fillRect(256, 636, 768, 54);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 3;
  ctx.strokeRect(262, 642, 756, 42);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 17px system-ui";
  ctx.textAlign = "center";
  const text = fighterFeedbackTimer > 0 || fighterRoundOverTimer > 0
    ? fighterFeedback
    : "Convaincs Papa: chatouilles ou vannes, puis tout le monde en voiture.";
  ctx.fillText(text, W / 2, 670);
  ctx.textAlign = "left";
}

function drawAyaSpecialLevel() {
  ctx.clearRect(0, 0, W, H);
  if (ayaSpecialArt.complete && ayaSpecialArt.naturalWidth > 0) {
    drawCoverImage(ayaSpecialArt);
    ctx.fillStyle = "rgba(2, 6, 24, 0.26)";
    ctx.fillRect(0, 0, W, H);
    const focus = ctx.createRadialGradient(682, 286, 90, 682, 286, 680);
    focus.addColorStop(0, "rgba(255, 207, 78, 0.08)");
    focus.addColorStop(0.52, "rgba(8, 12, 32, 0.22)");
    focus.addColorStop(1, "rgba(2, 4, 12, 0.68)");
    ctx.fillStyle = focus;
    ctx.fillRect(0, 0, W, H);
  } else {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#07123a");
    bg.addColorStop(0.58, "#102b7c");
    bg.addColorStop(1, "#080b18");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    drawAyaSpecialPortrait(438, 112, 6);
  }

  drawAyaSpecialStars();
  drawAyaSpecialSkyline();
  drawAyaSpecialTitle();
  drawAyaSpecialStats();
  drawAyaRhythmLanes();
  drawAyaSpecialDialog();

  if (ayaGauge.every((value) => value >= 10)) {
    for (const bit of confetti) {
      ctx.save();
      ctx.translate(bit.x, bit.y);
      ctx.rotate(bit.spin);
      ctx.fillStyle = bit.color;
      ctx.fillRect(-bit.size / 2, -bit.size / 2, bit.size, bit.size * 0.62);
      ctx.restore();
    }
  }
}

function drawAyaSpecialStars() {
  ctx.fillStyle = "#f8efd0";
  for (let i = 0; i < 38; i += 1) {
    const x = (i * 97 + 42) % W;
    const y = 38 + (i * 61) % 260;
    if (i % 5 === 0) {
      ctx.fillRect(x - 2, y - 10, 4, 20);
      ctx.fillRect(x - 10, y - 2, 20, 4);
    } else {
      ctx.fillRect(x, y, i % 3 === 0 ? 7 : 4, i % 3 === 0 ? 7 : 4);
    }
  }
  ctx.fillStyle = "#f8efd0";
  ctx.beginPath();
  ctx.arc(914, 164, 48, Math.PI * 0.45, Math.PI * 1.55);
  ctx.arc(934, 164, 48, Math.PI * 1.55, Math.PI * 0.45, true);
  ctx.fill();
}

function drawAyaSpecialSkyline() {
  ctx.fillStyle = "#07101f";
  ctx.fillRect(0, 558, W, 162);
  for (let i = 0; i < 15; i += 1) {
    const x = i * 92 + 18;
    const h = 60 + (i % 4) * 34;
    ctx.fillStyle = i % 2 ? "#111a36" : "#0c1530";
    ctx.fillRect(x, 558 - h, 58, h);
    ctx.fillStyle = "#ffcf4e";
    for (let y = 558 - h + 18; y < 548; y += 28) {
      if ((i + y) % 3 !== 0) ctx.fillRect(x + 16, y, 9, 12);
      if ((i + y) % 4 !== 0) ctx.fillRect(x + 36, y, 9, 12);
    }
  }

  const x = 1008;
  const y = 560;
  ctx.fillStyle = "#ffcf4e";
  ctx.fillRect(x + 48, y - 416, 14, 356);
  ctx.fillRect(x + 18, y - 294, 74, 18);
  ctx.fillRect(x - 20, y - 160, 148, 22);
  ctx.fillRect(x - 52, y - 26, 212, 26);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x + 55, y - 404);
  ctx.lineTo(x - 40, y);
  ctx.moveTo(x + 55, y - 404);
  ctx.lineTo(x + 150, y);
  ctx.moveTo(x - 18, y - 164);
  ctx.lineTo(x + 130, y);
  ctx.moveTo(x + 126, y - 164);
  ctx.lineTo(x - 20, y);
  ctx.stroke();
  ctx.fillStyle = "#07101f";
  ctx.fillRect(x + 44, y - 344, 22, 34);
}

function drawAyaSpecialTitle() {
  ctx.fillStyle = "#06070c";
  ctx.fillRect(34, 28, 340, 174);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 5;
  ctx.strokeRect(40, 34, 328, 162);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 78px system-ui";
  ctx.fillText("AYA", 62, 104);
  ctx.font = "900 36px system-ui";
  ctx.fillText("NAKAMURA", 62, 158);

  ctx.fillStyle = "#06070c";
  ctx.fillRect(1058, 30, 176, 158);
  ctx.strokeStyle = "#f8efd0";
  ctx.strokeRect(1064, 36, 164, 146);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 28px system-ui";
  ctx.fillText("SCORE", 1096, 80);
  ctx.fillStyle = "#ffcf4e";
  ctx.fillText(String(ayaSpecialScore).padStart(5, "0"), 1098, 116);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 22px system-ui";
  ctx.fillText("NIVEAU", 1094, 154);
  ctx.fillStyle = "#a84dff";
  ctx.fillText("ICONIQUE", 1094, 180);
}

function drawAyaSpecialStats() {
  ctx.fillStyle = "#050609";
  ctx.fillRect(32, 226, 360, 318);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 5;
  ctx.strokeRect(38, 232, 348, 306);

  ayaSpecialStats.forEach((stat, index) => {
    const y = 278 + index * 64;
    ctx.fillStyle = stat.color;
    ctx.font = "900 34px system-ui";
    ctx.fillText(stat.icon, 64, y + 10);
    ctx.fillStyle = "#f8efd0";
    ctx.font = "900 23px system-ui";
    ctx.fillText(stat.name, 116, y);
    for (let i = 0; i < 10; i += 1) {
      ctx.fillStyle = i < ayaGauge[index] ? stat.color : "#26313c";
      ctx.fillRect(118 + i * 22, y + 18, 17, 22);
    }
  });

  ctx.fillStyle = "#050609";
  ctx.fillRect(34, 574, 346, 88);
  ctx.strokeStyle = "#f8efd0";
  ctx.strokeRect(40, 580, 334, 76);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 19px system-ui";
  ctx.fillText("CHANSON PREF:", 70, 613);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 27px system-ui";
  ctx.fillText("DJADJA", 70, 646);
}

function drawAyaRhythmLanes() {
  const laneX = [514, 620, 726, 832];
  const targetY = 594;
  ctx.fillStyle = "rgba(5,6,9,0.68)";
  ctx.fillRect(470, 112, 430, 542);
  ctx.strokeStyle = "#f8efd0";
  ctx.strokeRect(476, 118, 418, 530);

  laneX.forEach((x, index) => {
    ctx.fillStyle = index === ayaLane ? "rgba(255,207,78,0.28)" : "rgba(255,255,255,0.06)";
    ctx.fillRect(x - 38, 138, 76, 486);
    ctx.strokeStyle = ayaSpecialStats[index].color;
    ctx.lineWidth = index === ayaLane ? 5 : 2;
    ctx.strokeRect(x - 34, targetY - 32, 68, 64);
    ctx.fillStyle = ayaSpecialStats[index].color;
    ctx.font = "900 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(ayaSpecialStats[index].icon, x, 642);
  });

  for (const note of ayaNotes) {
    const stat = ayaSpecialStats[note.lane];
    const x = laneX[note.lane];
    ctx.fillStyle = "#050609";
    ctx.fillRect(x - 26, note.y - 24, 52, 48);
    ctx.strokeStyle = stat.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 22, note.y - 20, 44, 40);
    ctx.fillStyle = stat.color;
    ctx.font = "900 25px system-ui";
    ctx.fillText(stat.icon, x, note.y + 9);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 16px system-ui";
  ctx.fillText("< > colonne   reste dessous: auto-note", 548, 146);
}

function drawAyaSpecialDialog() {
  ctx.fillStyle = "#050609";
  ctx.fillRect(420, 646, 800, 62);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 5;
  ctx.strokeRect(426, 652, 788, 50);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 25px system-ui";
  ctx.fillText("AYA NAKAMURA", 454, 682);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 19px system-ui";
  const text = ayaGauge.every((value) => value >= 10)
    ? "REINE DU GAME. TOUT LE MONDE CHANTE."
    : ayaFeedback || "Remplis toutes les jauges pour debloquer la fin.";
  ctx.fillText(text, 692, 682);
}

function drawAyaSpecialPortrait(x, y, scale) {
  const p = (color, px, py, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * scale, y + py * scale, w * scale, h * scale);
  };

  p("#02030a", 8, 0, 56, 86);
  p("#071b58", 4, 4, 18, 96);
  p("#0b2a84", 12, 0, 18, 98);
  p("#123fa8", 22, 2, 18, 92);
  p("#071b58", 40, 4, 18, 98);
  p("#05050a", 60, 16, 14, 82);

  p("#8d4a17", 34, 16, 34, 54);
  p("#a65c1d", 30, 24, 42, 52);
  p("#bf7427", 34, 34, 34, 38);
  p("#6c340f", 62, 32, 12, 34);
  p("#d08334", 40, 38, 10, 8);

  p("#07070b", 38, 31, 14, 4);
  p("#07070b", 58, 33, 13, 4);
  p("#f8efd0", 43, 36, 6, 4);
  p("#f8efd0", 61, 38, 6, 4);
  p("#07070b", 45, 37, 4, 4);
  p("#07070b", 63, 39, 4, 4);
  p("#5c210f", 54, 44, 10, 8);
  p("#190806", 50, 58, 24, 5);
  p("#d08b54", 53, 60, 17, 3);

  p("#ffcf4e", 30, 48, 4, 24);
  p("#ffcf4e", 72, 46, 4, 28);
  p("#ffcf4e", 28, 72, 8, 8);
  p("#ffcf4e", 70, 74, 8, 8);
  p("#a65c1d", 40, 70, 20, 42);
  p("#bf7427", 20, 96, 55, 32);
  p("#ffcf4e", 36, 92, 38, 4);
  p("#05050a", 18, 114, 72, 16);
}

function drawPodcastReward() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1b2630");
  bg.addColorStop(0.5, "#29495a");
  bg.addColorStop(1, "#0e171c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (const bit of confetti) {
    ctx.save();
    ctx.translate(bit.x, bit.y);
    ctx.rotate(bit.spin);
    ctx.fillStyle = bit.color;
    ctx.fillRect(-bit.size / 2, -bit.size / 2, bit.size, bit.size * 0.62);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(14,20,24,0.82)";
  ctx.fillRect(255, 96, 770, 508);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 6;
  ctx.strokeRect(265, 106, 750, 488);

  ctx.fillStyle = "#ff5fb7";
  ctx.fillRect(338, 176, 210, 210);
  ctx.fillStyle = "#101820";
  ctx.fillRect(380, 218, 126, 126);
  ctx.fillStyle = "#86f7ff";
  ctx.font = "900 76px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("▶", 443, 306);

  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 28px system-ui";
  ctx.fillText("PERFECT NIVEAU 1", 640, 168);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 54px system-ui";
  ctx.fillText("Podcast debloque", 640, 242);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 42px system-ui";
  ctx.fillText(podcastReward.title, 700, 326);
  ctx.fillStyle = "#b9c2bd";
  ctx.font = "900 24px system-ui";
  ctx.fillText(`${podcastReward.guest} - ${podcastReward.host}`, 700, 370);
  ctx.fillStyle = "#86f7ff";
  ctx.font = "800 20px system-ui";
  ctx.fillText("Minutes + batterie: Johanne peut filmer AYA ce soir.", 640, 462);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 18px system-ui";
  ctx.fillText("Espace ou entree: retour carte, niveau 1 termine", 640, 535);
  ctx.textAlign = "left";
}

function drawLevelVictory() {
  const title = levelVictory?.title || "Niveau";
  const subtitle = levelVictory?.subtitle || "termine";
  const fade = levelVictory ? Math.min(1, levelVictory.fadeTimer / 760) : 0;
  const t = performance.now() * 0.002;

  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#8fd9ff");
  bg.addColorStop(0.42, "#ffe49a");
  bg.addColorStop(0.74, "#f6b46b");
  bg.addColorStop(1, "#1f8fb5");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawVictorySun(1040, 132, 76 + Math.sin(t * 4) * 4);

  ctx.fillStyle = "rgba(255,255,255,0.32)";
  for (let x = -40; x < W + 80; x += 140) {
    ctx.fillRect(x + Math.sin(t + x) * 16, 588, 82, 5);
  }

  for (const bit of levelVictoryBits) {
    if (bit.type === "cat") {
      drawFloatingCat(bit);
    } else if (bit.type === "sixseven") {
      drawFloating67(bit);
    } else {
      drawVictoryConfetti(bit);
    }
  }

  ctx.fillStyle = "rgba(5, 6, 9, 0.78)";
  ctx.fillRect(218, 154, 844, 356);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 8;
  ctx.strokeRect(230, 166, 820, 332);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 4;
  ctx.strokeRect(246, 182, 788, 300);

  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 64px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("NIVEAU GAGNE", W / 2, 252);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 34px system-ui";
  ctx.fillText(`${title} - ${subtitle}`, W / 2, 314);
  drawCelebrationIcons(W / 2, 386);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 18px system-ui";
  ctx.fillText(levelVictory?.fading ? "Chargement du niveau suivant..." : "Espace ou entree pour continuer", W / 2, 462);
  ctx.textAlign = "left";

  if (fade > 0) {
    ctx.fillStyle = `rgba(5, 6, 9, ${fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function drawVictorySun(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(performance.now() * 0.001);
  ctx.fillStyle = "rgba(255, 207, 78, 0.26)";
  for (let i = 0; i < 16; i += 1) {
    ctx.rotate(Math.PI / 8);
    ctx.fillRect(r * 0.75, -5, r * 1.15, 10);
  }
  ctx.fillStyle = "#ffcf4e";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8efd0";
  ctx.beginPath();
  ctx.arc(-22, -12, 8, 0, Math.PI * 2);
  ctx.arc(22, -12, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8f5d12";
  ctx.fillRect(-24, 24, 48, 7);
  ctx.restore();
}

function drawCelebrationIcons(cx, y) {
  const t = performance.now() * 0.004;
  ctx.save();
  ctx.textAlign = "center";
  for (let i = 0; i < 7; i += 1) {
    const x = cx - 270 + i * 90;
    const bob = Math.sin(t + i) * 6;
    ctx.fillStyle = i % 2 ? "#86f7ff" : "#ffcf4e";
    ctx.font = "900 28px system-ui";
    ctx.fillText("67", x, y + bob);
  }

  for (let i = 0; i < 3; i += 1) {
    drawMiniCelebrationCat(cx - 180 + i * 180, y + 48 + Math.sin(t * 1.4 + i) * 5, i);
  }

  const colors = ["#ffcf4e", "#ff5fb7", "#86f7ff", "#49c56b", "#a84dff"];
  for (let i = 0; i < 18; i += 1) {
    const x = cx - 330 + i * 39;
    const yy = y - 50 + Math.sin(t + i) * 12;
    ctx.save();
    ctx.translate(x, yy);
    ctx.rotate(t + i);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-5, -3, 10, 6);
    ctx.restore();
  }
  ctx.restore();
  ctx.textAlign = "left";
}

function drawMiniCelebrationCat(x, y, index) {
  const s = 4 + index;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(-5 * s, -3 * s, 10 * s, 7 * s);
  ctx.fillRect(-6 * s, -5 * s, 2 * s, 2 * s);
  ctx.fillRect(4 * s, -5 * s, 2 * s, 2 * s);
  ctx.fillStyle = "#ff9ec5";
  ctx.fillRect(-5 * s, -4 * s, s, s);
  ctx.fillRect(4 * s, -4 * s, s, s);
  ctx.fillStyle = "#101820";
  ctx.fillRect(-2 * s, -s, s, s);
  ctx.fillRect(2 * s, -s, s, s);
  ctx.fillRect(0, s, s, s);
  ctx.fillStyle = ["#ffcf4e", "#86f7ff", "#ff5fb7"][index % 3];
  ctx.fillRect(-3 * s, 5 * s, 6 * s, s);
  ctx.restore();
}

function drawVictoryConfetti(bit) {
  ctx.save();
  ctx.translate(bit.x, bit.y);
  ctx.rotate(bit.spin);
  ctx.fillStyle = bit.color;
  ctx.fillRect(-bit.size / 2, -bit.size / 2, bit.size, bit.size * 0.62);
  ctx.restore();
}

function drawFloating67(bit) {
  ctx.save();
  ctx.translate(bit.x, bit.y + Math.sin(bit.phase) * 8);
  ctx.rotate(Math.sin(bit.phase) * 0.16);
  ctx.fillStyle = "rgba(5, 6, 9, 0.78)";
  ctx.fillRect(-28, -18, 56, 36);
  ctx.strokeStyle = bit.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(-24, -14, 48, 28);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 21px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("67", 0, 8);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawFloatingCat(bit) {
  const s = bit.size * 5;
  const x = bit.x;
  const y = bit.y + Math.sin(bit.phase) * 10;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(-4 * s, -3 * s, 8 * s, 7 * s);
  ctx.fillRect(-5 * s, -5 * s, 2 * s, 2 * s);
  ctx.fillRect(3 * s, -5 * s, 2 * s, 2 * s);
  ctx.fillStyle = "#ff9ec5";
  ctx.fillRect(-4 * s, -4 * s, s, s);
  ctx.fillRect(3 * s, -4 * s, s, s);
  ctx.fillStyle = "#101820";
  ctx.fillRect(-2 * s, -s, s, s);
  ctx.fillRect(2 * s, -s, s, s);
  ctx.fillRect(0, s, s, s);
  ctx.fillStyle = bit.color;
  ctx.fillRect(-3 * s, 5 * s, 6 * s, s);
  ctx.restore();
}

function drawFishingBoat(x, y, color) {
  ctx.fillStyle = "#26323d";
  ctx.beginPath();
  ctx.moveTo(x, y + 24);
  ctx.lineTo(x + 150, y + 24);
  ctx.lineTo(x + 124, y + 48);
  ctx.lineTo(x + 24, y + 48);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(x + 38, y + 2, 54, 24);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(x + 48, y + 8, 12, 10);
  ctx.fillRect(x + 68, y + 8, 12, 10);
  ctx.fillStyle = "#20313a";
  ctx.fillRect(x + 104, y - 30, 6, 54);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 107, y - 24);
  ctx.lineTo(x + 134, y + 18);
  ctx.stroke();
}

function drawSailboat(x, y) {
  ctx.fillStyle = "#20313a";
  ctx.fillRect(x, y + 62, 90, 12);
  ctx.fillStyle = "#f8efd0";
  ctx.beginPath();
  ctx.moveTo(x + 45, y);
  ctx.lineTo(x + 45, y + 62);
  ctx.lineTo(x + 10, y + 62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffcf4e";
  ctx.beginPath();
  ctx.moveTo(x + 50, y + 10);
  ctx.lineTo(x + 50, y + 62);
  ctx.lineTo(x + 86, y + 62);
  ctx.closePath();
  ctx.fill();
}

function drawTown(x, label, color) {
  for (let i = 0; i < 7; i += 1) {
    const bx = x + i * 72;
    const by = FLOOR_Y - 145 - (i % 2) * 24;
    ctx.fillStyle = i % 2 ? "#eaa16b" : color;
    ctx.fillRect(bx, by, 54, FLOOR_Y - by);
    ctx.fillStyle = "#a83335";
    ctx.beginPath();
    ctx.moveTo(bx - 4, by);
    ctx.lineTo(bx + 27, by - 30);
    ctx.lineTo(bx + 58, by);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#36576a";
    ctx.fillRect(bx + 17, by + 38, 18, 22);
  }
  drawSign(x + 70, FLOOR_Y - 230, label);
}

function drawSchool(x) {
  ctx.fillStyle = "#d6c08a";
  ctx.fillRect(x, FLOOR_Y - 220, 420, 220);
  ctx.fillStyle = "#6d8a94";
  for (let i = 0; i < 6; i += 1) ctx.fillRect(x + 42 + i * 60, FLOOR_Y - 172, 32, 42);
  ctx.fillStyle = "#3b4a54";
  ctx.fillRect(x + 176, FLOOR_Y - 90, 66, 90);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "800 18px system-ui";
  ctx.fillText("6 7", x + 56, FLOOR_Y - 118);
  ctx.fillText("NPC", x + 288, FLOOR_Y - 118);
  drawSign(x + 130, FLOOR_Y - 268, "COLLEGE");
}

function drawCoast(x) {
  ctx.fillStyle = "#d9cfa8";
  ctx.fillRect(x - 120, FLOOR_Y - 42, 900, 42);
  ctx.fillStyle = "#7dbd89";
  ctx.fillRect(x - 80, FLOOR_Y - 82, 260, 42);
  ctx.fillRect(x + 390, FLOOR_Y - 72, 220, 32);
  ctx.fillStyle = "#6c4a32";
  for (let i = 0; i < 7; i += 1) {
    ctx.fillRect(x - 60 + i * 120, FLOOR_Y - 120, 10, 86);
    ctx.fillRect(x - 78 + i * 120, FLOOR_Y - 82, 46, 10);
  }
  drawFishingBoat(x + 190, FLOOR_Y - 96, "#e85d5d");
  ctx.fillStyle = "#f6f0d2";
  ctx.fillRect(x + 480, FLOOR_Y - 170, 56, 170);
  ctx.fillStyle = "#d24d45";
  ctx.fillRect(x + 480, FLOOR_Y - 170, 56, 18);
  drawSign(x + 280, FLOOR_Y - 250, "PLOMARC'H");
}

function drawHarbor(x) {
  ctx.fillStyle = "#6c4a32";
  ctx.fillRect(x - 80, FLOOR_Y - 16, 920, 20);
  ctx.fillStyle = "#ede5cf";
  for (let i = 0; i < 5; i += 1) {
    const bx = x + i * 145;
    ctx.fillRect(bx, FLOOR_Y - 82, 94, 42);
    ctx.fillStyle = "#317fb0";
    ctx.beginPath();
    ctx.moveTo(bx + 8, FLOOR_Y - 82);
    ctx.lineTo(bx + 48, FLOOR_Y - 150);
    ctx.lineTo(bx + 88, FLOOR_Y - 82);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ede5cf";
  }
  drawSign(x + 175, FLOOR_Y - 220, "TREBOUL");
}

function drawMarket(x) {
  ctx.fillStyle = "#d9dfd5";
  ctx.fillRect(x, FLOOR_Y - 190, 430, 190);
  ctx.fillStyle = "#295f73";
  ctx.fillRect(x, FLOOR_Y - 225, 430, 48);
  ctx.fillStyle = "#f4c75f";
  ctx.fillRect(x + 45, FLOOR_Y - 88, 88, 88);
  ctx.fillRect(x + 186, FLOOR_Y - 88, 88, 88);
  drawSign(x + 128, FLOOR_Y - 270, "LA CRIEE");
}

function drawMoulinDisco(x) {
  ctx.fillStyle = "#20272f";
  ctx.fillRect(x + 95, FLOOR_Y - 250, 230, 250);
  ctx.fillStyle = "#343b48";
  ctx.fillRect(x + 124, FLOOR_Y - 296, 172, 56);
  ctx.fillStyle = "#ffcf4e";
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(x + 125 + i * 38, FLOOR_Y - 198, 22, 38);
  }
  ctx.fillStyle = "#ff5fb7";
  ctx.fillRect(x + 153, FLOOR_Y - 104, 114, 104);

  const cx = x + 210;
  const cy = FLOOR_Y - 320;
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(cx - 8, cy - 112, 16, 224);
  ctx.fillRect(cx - 112, cy - 8, 224, 16);
  ctx.fillStyle = "#86f7ff";
  ctx.fillRect(cx - 18, cy - 18, 36, 36);

  ctx.fillStyle = "#dfe8ea";
  ctx.fillRect(x + 10, FLOOR_Y - 430, 260, 28);
  ctx.fillStyle = "#2f6f8f";
  ctx.fillRect(x + 74, FLOOR_Y - 456, 82, 26);
  ctx.fillStyle = "#dfe8ea";
  ctx.beginPath();
  ctx.moveTo(x + 270, FLOOR_Y - 430);
  ctx.lineTo(x + 330, FLOOR_Y - 416);
  ctx.lineTo(x + 270, FLOOR_Y - 402);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e23c4a";
  ctx.fillRect(x + 22, FLOOR_Y - 448, 44, 18);

  drawSign(x + 44, FLOOR_Y - 352, "LE MOULIN");
  ctx.fillStyle = "#050609";
  ctx.fillRect(x + 112, FLOOR_Y - 140, 196, 34);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 116, FLOOR_Y - 136, 188, 26);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("AYA SHOWCASE", x + 210, FLOOR_Y - 117);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255, 207, 78, 0.28)";
  ctx.beginPath();
  ctx.moveTo(x + 170, FLOOR_Y - 106);
  ctx.lineTo(x + 112, FLOOR_Y - 8);
  ctx.lineTo(x + 228, FLOOR_Y - 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255, 95, 183, 0.24)";
  ctx.beginPath();
  ctx.moveTo(x + 250, FLOOR_Y - 106);
  ctx.lineTo(x + 196, FLOOR_Y - 8);
  ctx.lineTo(x + 314, FLOOR_Y - 8);
  ctx.closePath();
  ctx.fill();
}

function drawSign(x, y, text) {
  ctx.fillStyle = "#172126";
  ctx.fillRect(x, y, 170, 42);
  ctx.strokeStyle = "#f2dc85";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 3, y + 3, 164, 36);
  ctx.fillStyle = "#f2dc85";
  ctx.font = "800 22px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, x + 85, y + 28);
  ctx.textAlign = "left";
}

function drawPlatforms() {
  const chapter = state === "playing" ? currentPlatformChapter() : platformChapters.platform1[0];
  for (const p of level.platforms) {
    if (p.kind === "brick") {
      drawBrickBlock(p, chapter);
      continue;
    }
    if (p.kind === "question") {
      drawQuestionBlock(p, chapter);
      continue;
    }
    if (p.kind === "pipe") {
      drawPipe(p, chapter);
      continue;
    }
    const palette = {
      ground: [chapter.ground, "#20313a"],
      stone: ["#928c80", "#5c6466"],
      locker: ["#d28b4a", "#946033"],
      desk: ["#b97945", "#6e4930"],
      grass: ["#75b761", "#4f7f4b"],
      dock: ["#8a6548", "#503927"],
      market: ["#d2d6c9", "#8e9a8b"],
    }[p.kind];
    ctx.fillStyle = palette[1];
    ctx.fillRect(p.x, p.y + 10, p.w, p.h);
    ctx.fillStyle = palette[0];
    ctx.fillRect(p.x, p.y, p.w, p.h - 8);
    ctx.fillStyle = chapter.tint;
    ctx.fillRect(p.x, p.y, p.w, p.h - 8);
    if (p.kind === "ground") drawGroundTiles(p, chapter);
    ctx.fillStyle = chapter.accent;
    ctx.globalAlpha = p.kind === "ground" ? 0.18 : 0.32;
    ctx.fillRect(p.x, p.y, p.w, 5);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    for (let x = p.x + 14; x < p.x + p.w - 12; x += 46) {
      ctx.fillRect(x, p.y + 7, 24, 4);
    }
  }
}

function drawGroundTiles(p, chapter) {
  ctx.strokeStyle = "rgba(8, 17, 20, 0.34)";
  ctx.lineWidth = 3;
  for (let x = p.x; x < p.x + p.w; x += 56) {
    ctx.strokeRect(x + 2, p.y + 2, 52, 34);
    ctx.strokeRect(x + 2, p.y + 38, 52, 56);
  }
  ctx.fillStyle = chapter.accent;
  ctx.globalAlpha = 0.1;
  for (let x = p.x + 14; x < p.x + p.w; x += 112) ctx.fillRect(x, p.y + 44, 34, 8);
  ctx.globalAlpha = 1;
}

function drawBrickBlock(p, chapter) {
  ctx.fillStyle = "#8f4f2e";
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#d7894f";
  ctx.fillRect(p.x + 4, p.y + 4, p.w - 8, 10);
  ctx.fillStyle = "#5c2f22";
  ctx.fillRect(p.x, p.y + p.h - 8, p.w, 8);
  ctx.strokeStyle = "#4a281d";
  ctx.lineWidth = 3;
  ctx.strokeRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
  ctx.beginPath();
  ctx.moveTo(p.x + p.w / 2, p.y + 4);
  ctx.lineTo(p.x + p.w / 2, p.y + p.h - 5);
  ctx.moveTo(p.x + 4, p.y + p.h / 2);
  ctx.lineTo(p.x + p.w - 4, p.y + p.h / 2);
  ctx.stroke();
  ctx.fillStyle = chapter.tint;
  ctx.fillRect(p.x + 3, p.y + 3, p.w - 6, p.h - 6);
}

function drawQuestionBlock(p, chapter) {
  const pulse = Math.sin(performance.now() * 0.008 + p.x) * 2;
  ctx.fillStyle = "#5c3a0d";
  ctx.fillRect(p.x, p.y + 6, p.w, p.h);
  ctx.fillStyle = p.used ? "#8d7b64" : "#ffbf3c";
  ctx.fillRect(p.x, p.y + pulse, p.w, p.h - 6);
  ctx.fillStyle = p.used ? "#b5a48a" : "#ffe27a";
  ctx.fillRect(p.x + 6, p.y + 6 + pulse, p.w - 12, 10);
  ctx.strokeStyle = "#6b4312";
  ctx.lineWidth = 4;
  ctx.strokeRect(p.x + 3, p.y + 3 + pulse, p.w - 6, p.h - 12);
  ctx.fillStyle = "#6b4312";
  ctx.font = "900 34px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(p.used ? "!" : "?", p.x + p.w / 2, p.y + 40 + pulse);
  ctx.fillStyle = chapter.accent;
  ctx.globalAlpha = 0.32;
  ctx.fillRect(p.x + 7, p.y + 7 + pulse, p.w - 14, 5);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

function drawPipe(p, chapter) {
  const magic = p.magic === "capitalQuiz";
  ctx.fillStyle = magic ? "#291a45" : "#183d30";
  ctx.fillRect(p.x + 6, p.y + 18, p.w - 12, p.h - 18);
  ctx.fillStyle = magic ? "#7a4fcf" : "#2a9b62";
  ctx.fillRect(p.x + 10, p.y + 24, p.w - 20, p.h - 24);
  ctx.fillStyle = magic ? "#c98cff" : "#36c878";
  ctx.fillRect(p.x - 8, p.y, p.w + 16, 28);
  ctx.fillStyle = magic ? "#4b2f8f" : "#1d6b46";
  ctx.fillRect(p.x - 8, p.y + 22, p.w + 16, 12);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(p.x + 18, p.y + 28, 10, p.h - 34);
  ctx.strokeStyle = magic ? "#f8efd0" : "#0d2b22";
  ctx.lineWidth = 4;
  ctx.strokeRect(p.x - 8, p.y, p.w + 16, 34);
  ctx.strokeRect(p.x + 6, p.y + 18, p.w - 12, p.h - 18);
  ctx.fillStyle = chapter.tint;
  ctx.fillRect(p.x - 6, p.y + 2, p.w + 12, p.h - 2);
  if (magic) {
    const t = performance.now() * 0.004;
    ctx.fillStyle = "#ffcf4e";
    for (let i = 0; i < 5; i += 1) {
      const sx = p.x - 22 + i * 31;
      const sy = p.y - 22 + Math.sin(t + i) * 7;
      ctx.fillRect(sx, sy, 7, 7);
      ctx.fillRect(sx + 2, sy - 4, 3, 15);
      ctx.fillRect(sx - 4, sy + 2, 15, 3);
    }
  }
}

function drawMagicPipePrompt() {
  const pipe = currentMagicPipe();
  if (!playerCanEnterMagicPipe(pipe)) return;
  const x = pipe.x + pipe.w / 2;
  const y = pipe.y - 74 + Math.sin(performance.now() * 0.006) * 4;
  ctx.fillStyle = "rgba(5, 6, 9, 0.84)";
  ctx.fillRect(x - 138, y - 26, 276, 48);
  ctx.strokeStyle = "#c98cff";
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 132, y - 20, 264, 36);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("↓ / S: quiz capitales d'Europe", x, y + 4);
  ctx.textAlign = "left";
}

function drawHazards() {
  for (const h of level.hazards) {
    if (!inActivePlatformRun(h, 40)) continue;
    if (h.kind === "puddle") {
      ctx.fillStyle = "#2e8fd0";
      ctx.beginPath();
      ctx.ellipse(h.x + h.w / 2, h.y + h.h - 8, h.w / 2, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillRect(h.x + 18, h.y + h.h - 14, h.w * 0.36, 3);
    } else if (h.kind === "brainrot") {
      const labels = ["PING", "LIVE", "LOL"];
      for (let i = 0; i < 3; i += 1) {
        ctx.fillStyle = "#26323d";
        ctx.fillRect(h.x + 2 + i * 32, h.y + 2 + (i % 2) * 9, 28, 42);
        ctx.fillStyle = "#82d8ff";
        ctx.fillRect(h.x + 8 + i * 32, h.y + 8 + (i % 2) * 9, 16, 18);
        ctx.fillStyle = "#ffcf4e";
        ctx.font = "800 8px system-ui";
        ctx.fillText(labels[i], h.x + 6 + i * 32, h.y + 35 + (i % 2) * 9);
      }
    } else if (h.kind === "chores") {
      ctx.fillStyle = "#f8efd0";
      for (let i = 0; i < 4; i += 1) {
        ctx.save();
        ctx.translate(h.x + 18 + i * 28, h.y + 22 + (i % 2) * 5);
        ctx.rotate((i - 1.5) * 0.2);
        ctx.fillRect(-12, -18, 24, 34);
        ctx.fillStyle = "#2f6f8f";
        ctx.fillRect(-8, -9, 16, 4);
        ctx.fillRect(-8, 1, 16, 4);
        ctx.restore();
        ctx.fillStyle = "#f8efd0";
      }
    } else if (h.kind === "guestlist") {
      ctx.fillStyle = "#171d24";
      ctx.fillRect(h.x, h.y + 12, h.w, 18);
      ctx.fillStyle = "#ff5fb7";
      ctx.fillRect(h.x + 12, h.y + 2, 18, 42);
      ctx.fillRect(h.x + h.w - 30, h.y + 2, 18, 42);
      ctx.fillStyle = "#f8efd0";
      ctx.font = "900 12px system-ui";
      ctx.fillText("LISTE", h.x + 42, h.y + 29);
    } else {
      ctx.fillStyle = "#fff3c9";
      for (let i = 0; i < 4; i += 1) {
        ctx.save();
        ctx.translate(h.x + 20 + i * 28, h.y + 16 + (i % 2) * 8);
        ctx.rotate((i - 1.5) * 0.24);
        ctx.fillRect(-13, -16, 26, 32);
        ctx.fillStyle = "#cf3f4d";
        ctx.fillRect(-8, -7, 16, 3);
        ctx.restore();
        ctx.fillStyle = "#fff3c9";
      }
    }
  }
}

function drawCareStops() {
  for (const stop of level.careStops) {
    if (!inActivePlatformRun(stop, 40)) continue;
    const faded = stop.used ? 0.45 : 1;
    ctx.globalAlpha = faded;
    ctx.fillStyle = "#563a2b";
    ctx.fillRect(stop.x, stop.y + stop.h - 12, stop.w, 12);
    ctx.fillStyle = "#f7d2aa";
    ctx.fillRect(stop.x + 4, stop.y + stop.h - 20, stop.w - 8, 10);

    if (stop.kind === "skincare") {
      ctx.fillStyle = "#f8efd0";
      ctx.fillRect(stop.x + 10, stop.y + 10, 22, 30);
      ctx.fillStyle = "#ff9ec5";
      ctx.fillRect(stop.x + 13, stop.y + 18, 16, 12);
      ctx.fillStyle = "#9ce6ff";
      ctx.fillRect(stop.x + 40, stop.y + 18, 12, 22);
      ctx.fillStyle = "#f8efd0";
      ctx.beginPath();
      ctx.arc(stop.x + 62, stop.y + 25, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#20313a";
      ctx.font = "900 10px system-ui";
      ctx.fillText("SPF", stop.x + 9, stop.y + 55);
    } else {
      ctx.fillStyle = "#e8e3d6";
      ctx.fillRect(stop.x + 12, stop.y + 9, 34, 38);
      ctx.fillStyle = "#8ed2e3";
      ctx.fillRect(stop.x + 17, stop.y + 14, 24, 25);
      ctx.fillStyle = "#20272f";
      ctx.fillRect(stop.x + 50, stop.y + 18, 22, 6);
      ctx.fillRect(stop.x + 50, stop.y + 32, 22, 6);
      ctx.fillStyle = "#f8efd0";
      ctx.font = "900 9px system-ui";
      ctx.fillText("LISSE", stop.x + 12, stop.y + 55);
    }
    ctx.globalAlpha = 1;
  }
}

function drawCoins() {
  const t = performance.now() * 0.006;
  for (const coin of level.coins) {
    if (!inActivePlatformRun(coin, 40)) continue;
    if (coin.taken) continue;
    const y = coin.y + Math.sin(t + coin.x) * 3;
    const spin = Math.abs(Math.sin(t * 1.5 + coin.x));
    ctx.fillStyle = "#8f5d12";
    ctx.beginPath();
    ctx.ellipse(coin.x, y + 2, 15 * spin + 4, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffcf4e";
    ctx.beginPath();
    ctx.ellipse(coin.x, y - 1, 12 * spin + 4, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f8efd0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(coin.x, y - 1, 7 * spin + 2, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = "900 7px system-ui";
    ctx.textAlign = "center";
    ctx.fillStyle = "#4d320c";
    ctx.fillText("MIN", coin.x, y + 3);
    ctx.textAlign = "left";
  }
}

function drawPowerups() {
  for (const powerup of level.powerups) {
    if (powerup.taken || !inActivePlatformRun(powerup, 160)) continue;
    const bob = Math.sin(performance.now() * 0.009 + powerup.x) * 2;
    const x = powerup.x + powerup.w / 2;
    const y = powerup.y + powerup.h / 2 + bob;

    ctx.save();
    ctx.translate(x, y);
    if (powerup.type === "mango") drawMangoPowerup();
    else drawFennelPowerup();
    ctx.restore();
  }
}

function drawMangoPowerup() {
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff9f2f";
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 20, -0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffcf4e";
  ctx.beginPath();
  ctx.ellipse(-5, -3, 12, 15, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6f45";
  ctx.fillRect(7, 2, 7, 12);
  ctx.fillStyle = "#3e8f54";
  ctx.fillRect(3, -25, 8, 7);
  ctx.fillRect(8, -28, 12, 5);
  ctx.fillStyle = "#20272f";
  ctx.fillRect(-6, -4, 4, 4);
  ctx.fillRect(7, -4, 4, 4);
  ctx.fillStyle = "#8f3c3c";
  ctx.fillRect(-2, 6, 8, 3);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(">>", 0, 31);
  ctx.textAlign = "left";
}

function drawFennelPowerup() {
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 22, 19, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f8efd0";
  ctx.beginPath();
  ctx.ellipse(0, 6, 15, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d8f3ce";
  ctx.beginPath();
  ctx.ellipse(-8, 9, 8, 12, -0.45, 0, Math.PI * 2);
  ctx.ellipse(8, 9, 8, 12, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#77b96f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, -7);
  ctx.lineTo(-18, -28);
  ctx.moveTo(0, -8);
  ctx.lineTo(0, -34);
  ctx.moveTo(8, -7);
  ctx.lineTo(18, -28);
  ctx.stroke();
  ctx.fillStyle = "#9fe87a";
  ctx.fillRect(-25, -34, 14, 5);
  ctx.fillRect(-6, -39, 12, 5);
  ctx.fillRect(12, -34, 14, 5);
  ctx.fillStyle = "#20272f";
  ctx.fillRect(-7, 3, 4, 4);
  ctx.fillRect(5, 3, 4, 4);
  ctx.fillStyle = "#8f3c3c";
  ctx.fillRect(-3, 12, 7, 2);
  ctx.fillStyle = "#c8ff4e";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("+", 0, 34);
  ctx.textAlign = "left";
}

function drawMemeTokens() {
  const t = performance.now() * 0.004;
  for (const token of level.memeTokens) {
    if (!inActivePlatformRun(token, 40)) continue;
    if (token.taken) continue;
    const y = token.y + Math.sin(t + token.x) * 6;
    ctx.fillStyle = "rgba(14, 25, 30, 0.78)";
    ctx.fillRect(token.x, y, token.w, token.h);
    ctx.strokeStyle = "#86f7ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(token.x + 2, y + 2, token.w - 4, token.h - 4);
    ctx.fillStyle = "#f8efd0";
    ctx.font = "900 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(token.text, token.x + token.w / 2, y + 27);
    ctx.textAlign = "left";
  }
}

function drawClubMates() {
  const t = performance.now() * 0.004;
  for (const bottle of level.clubMates) {
    if (!inActivePlatformRun(bottle, 50)) continue;
    if (bottle.taken) continue;
    const sway = Math.sin(t + bottle.x) * 5;
    const x = bottle.x + sway;
    const y = bottle.y + Math.sin(t * 1.5 + bottle.x) * 2;

    ctx.strokeStyle = "#f8efd0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bottle.x + bottle.w / 2, y - 50);
    ctx.lineTo(x + bottle.w / 2, y + 1);
    ctx.stroke();

    ctx.fillStyle = "rgba(10, 14, 18, 0.35)";
    ctx.fillRect(x + 2, y + 64, 30, 7);
    ctx.fillStyle = "#2f6f8f";
    ctx.fillRect(x + 9, y - 7, 16, 8);
    ctx.fillStyle = "#3b2a16";
    ctx.fillRect(x + 10, y, 14, 14);
    ctx.fillStyle = "#b87322";
    ctx.fillRect(x + 5, y + 12, 24, 52);
    ctx.fillStyle = "rgba(248, 239, 208, 0.28)";
    ctx.fillRect(x + 9, y + 15, 5, 46);
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(x + 7, y + 28, 20, 18);
    ctx.fillStyle = "#20313a";
    ctx.font = "900 7px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("CLUB", x + 17, y + 36);
    ctx.fillText("MATE", x + 17, y + 44);
    ctx.strokeStyle = "#c8ff4e";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y + 12, 24, 52);
    ctx.textAlign = "left";
  }
}

function drawBatteries() {
  const t = performance.now() * 0.005;
  for (const batteryPack of level.batteries) {
    if (!inActivePlatformRun(batteryPack, 50)) continue;
    if (batteryPack.taken) continue;
    const x = batteryPack.x;
    const y = batteryPack.y + Math.sin(t + batteryPack.x) * 4;

    ctx.fillStyle = "rgba(10, 14, 18, 0.32)";
    ctx.fillRect(x + 3, y + 28, 38, 7);
    ctx.fillStyle = "#101820";
    ctx.fillRect(x, y, batteryPack.w, batteryPack.h);
    ctx.fillRect(x + batteryPack.w, y + 8, 6, 12);
    ctx.strokeStyle = "#f8efd0";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, y + 2, batteryPack.w - 4, batteryPack.h - 4);
    ctx.fillStyle = "#9fe87a";
    ctx.fillRect(x + 7, y + 7, batteryPack.w - 14, batteryPack.h - 14);
    ctx.fillStyle = "#20313a";
    ctx.font = "900 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("BAT", x + batteryPack.w / 2, y + 19);
    ctx.fillStyle = "#ffcf4e";
    ctx.fillRect(x + 14, y - 10, 4, 8);
    ctx.fillRect(x + 23, y - 10, 4, 8);
    ctx.textAlign = "left";
  }
}

function drawSkincarePickups() {
  const t = performance.now() * 0.004;
  for (const pickup of level.skincarePickups) {
    if (!inActivePlatformRun(pickup, 50)) continue;
    if (pickup.taken) continue;
    const product = skincareProductForId(pickup.id);
    const x = pickup.x + pickup.w / 2;
    const y = pickup.y + pickup.h / 2 + Math.sin(t + pickup.x * 0.04) * 5;

    ctx.fillStyle = "rgba(10, 14, 18, 0.24)";
    ctx.beginPath();
    ctx.ellipse(x, pickup.y + pickup.h + 10, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 1.4 + pickup.x) * 0.08);
    drawProductPickupIcon(product, 0, 0, product.id === "straightener" ? 0.78 : 0.82);
    ctx.restore();

    ctx.fillStyle = "rgba(5, 6, 9, 0.76)";
    ctx.fillRect(x - 42, pickup.y - 28, 84, 21);
    ctx.fillStyle = product.color === "#20272f" ? "#f8efd0" : product.color;
    ctx.font = "900 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(product.name, x, pickup.y - 13);
    ctx.textAlign = "left";
  }
}

function drawSkincareCollectionHud() {
  if (activePlatformRun.id !== "platform2" && productHuntCollected.length === 0) return;
  const x = W - 246;
  const y = 126;
  const panelW = 212;
  const panelH = 142;
  const complete = skincareCollectionComplete();

  ctx.save();
  ctx.fillStyle = "rgba(5, 6, 9, 0.76)";
  ctx.fillRect(x, y, panelW, panelH);
  ctx.strokeStyle = complete ? "#c8ff4e" : "#ffd8ef";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 5, y + 5, panelW - 10, panelH - 10);
  ctx.fillStyle = complete ? "#c8ff4e" : "#ffd8ef";
  ctx.font = "900 15px system-ui";
  ctx.fillText(`Trousse ${productHuntCollected.length}/${skincareProducts.length}`, x + 18, y + 28);

  skincareProducts.forEach((product, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const iconX = x + 36 + col * 58;
    const iconY = y + 58 + row * 30;
    const collected = productHuntCollected.includes(product.id);
    ctx.globalAlpha = collected ? 1 : 0.34;
    drawProductPickupIcon(product, iconX, iconY, 0.32);
    ctx.globalAlpha = 1;
    if (!collected) {
      ctx.fillStyle = "#f8efd0";
      ctx.font = "900 14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("?", iconX, iconY + 5);
      ctx.textAlign = "left";
    }
  });

  ctx.fillStyle = "#dfe8ea";
  ctx.font = "800 11px system-ui";
  ctx.fillText(complete ? "miroir debloque" : "a choper dans Mario 2", x + 18, y + 126);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

function drawEnemies() {
  for (const enemy of level.enemies) {
    if (!inActivePlatformRun(enemy, 160)) continue;
    if (enemy.kind === "supervisor") drawChaser(enemy, "#4d6f8f", "SURV", "#ffcf9d");
    if (enemy.kind === "teacher") drawChaser(enemy, "#6d4a8f", "PROF", "#fff8dd");
    if (enemy.kind === "cpe") drawChaser(enemy, "#8f4d78", "CPE", "#fff8dd");
    if (enemy.kind === "principal") drawChaser(enemy, "#26313d", "DIR", "#d9b177");
    if (enemy.kind === "pronote") drawPronoteEnemy(enemy);
    if (enemy.kind === "parent") drawChaser(enemy, "#2f6f8f", "PARENT", "#ffcf9d");
    if (enemy.kind === "duduche") drawFamilyCat(enemy, "duduche");
    if (enemy.kind === "coca") drawFamilyCat(enemy, "coca");
    if (enemy.kind === "bouncer") drawChaser(enemy, "#111922", "VIP?", "#d9b177");
    if (enemy.kind === "phoneDrone") drawPhoneDrone(enemy);
  }
}

function drawFamilyCat(e, cat) {
  const t = performance.now() * 0.006 + e.x;
  const nap = cat === "duduche";
  const body = nap ? "#101214" : "#8a5a35";
  const patch = nap ? "#24272a" : "#f4d6ac";
  const patch2 = nap ? "#050609" : "#20272f";
  const patch3 = "#c87832";
  const label = nap ? "DUDUCHE" : "COCA";
  const y = e.y + Math.sin(t) * (nap ? 0.6 : 2.5);

  ctx.fillStyle = "rgba(7, 10, 12, 0.28)";
  ctx.beginPath();
  ctx.ellipse(e.x + e.w / 2, e.y + e.h + 2, e.w / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(e.x + 29, y + 25, 25, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = patch;
  ctx.beginPath();
  ctx.ellipse(e.x + 17, y + 22, 10, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  if (!nap) {
    ctx.fillStyle = patch2;
    ctx.beginPath();
    ctx.ellipse(e.x + 39, y + 28, 10, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = patch3;
    ctx.fillRect(e.x + 24, y + 13, 18, 8);
    ctx.fillRect(e.x + 31, y + 19, 14, 9);
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(e.x + 27, y + 31, 12, 6);
  }

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(e.x + 4, y + 5, 28, 24, 9);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(e.x + 8, y + 8);
  ctx.lineTo(e.x + 13, y - 3);
  ctx.lineTo(e.x + 18, y + 8);
  ctx.moveTo(e.x + 22, y + 8);
  ctx.lineTo(e.x + 28, y - 2);
  ctx.lineTo(e.x + 31, y + 9);
  ctx.fill();

  if (!nap) {
    ctx.fillStyle = "#f4d6ac";
    ctx.fillRect(e.x + 5, y + 13, 10, 12);
    ctx.fillRect(e.x + 13, y + 23, 9, 6);
    ctx.fillStyle = "#20272f";
    ctx.fillRect(e.x + 22, y + 7, 10, 14);
    ctx.fillStyle = "#c87832";
    ctx.fillRect(e.x + 13, y + 4, 9, 9);
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(e.x + 16, y + 18, 6, 7);
  }

  ctx.strokeStyle = nap ? body : "#7a4a2d";
  ctx.lineWidth = 6;
  ctx.beginPath();
  const tailLift = nap ? 6 : Math.sin(t * 2) * 9;
  ctx.moveTo(e.x + 50, y + 18);
  ctx.quadraticCurveTo(e.x + 65, y + 4 + tailLift, e.x + 52, y - 4 + tailLift);
  ctx.stroke();
  if (!nap) {
    ctx.strokeStyle = "#20272f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(e.x + 56, y + 10 + tailLift * 0.45);
    ctx.quadraticCurveTo(e.x + 62, y + 2 + tailLift, e.x + 54, y - 2 + tailLift);
    ctx.stroke();
  }

  ctx.fillStyle = nap ? "#9fe87a" : "#20313a";
  ctx.fillRect(e.x + 11, y + 14, 4, 4);
  ctx.fillRect(e.x + 23, y + 14, 4, 4);
  ctx.fillStyle = nap ? "#d8f3ce" : "#ff8da8";
  ctx.fillRect(e.x + 17, y + 21, nap ? 10 : 8, 2);

  if (!nap) {
    ctx.fillStyle = "#ffcf9d";
    ctx.font = "900 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("calin?", e.x + 30, y - 12);
    ctx.textAlign = "left";
  }

  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 9px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, e.x + e.w / 2, e.y + e.h + 20);
  ctx.textAlign = "left";
}

function drawPlatformQuest() {
  const chapter = currentPlatformChapter();
  ctx.fillStyle = "rgba(14, 20, 24, 0.72)";
  ctx.fillRect(282, 632, 716, 64);
  ctx.strokeStyle = chapter.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(286, 636, 708, 56);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 17px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(`${chapter.id} - ${chapter.title}`, W / 2, 658);
  ctx.fillStyle = "#dfe8ea";
  ctx.font = "800 14px system-ui";
  ctx.fillText(activePlatformRun.quest, W / 2, 681);
  ctx.textAlign = "left";
}

function drawLevelOneTutorial() {
  if (activePlatformRun.id !== "platform1" || levelOneTutorialTimer <= 0) return;
  const alpha = Math.min(1, levelOneTutorialTimer / 45);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(6, 12, 18, 0.9)";
  ctx.fillRect(82, 112, 430, 218);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 4;
  ctx.strokeRect(88, 118, 418, 206);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 21px system-ui";
  ctx.fillText("Niveau 1: evasion du college", 112, 154);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "800 16px system-ui";
  const lines = [
    "< > ou fleches: courir",
    "Espace / entree / bouton haut: sauter",
    "Side quest: minutes + batterie pour filmer AYA",
    "Evite surveillants, profs, CPE et Directeur",
    "Va jusqu'au panneau SORTIE pour quitter le college",
  ];
  lines.forEach((line, index) => {
    const y = 190 + index * 26;
    ctx.fillStyle = index < 2 ? "#86f7ff" : "#f8efd0";
    ctx.fillText(line, 116, y);
  });
  ctx.fillStyle = "rgba(255, 207, 78, 0.95)";
  ctx.beginPath();
  ctx.moveTo(176, 330);
  ctx.lineTo(148, 364);
  ctx.lineTo(220, 330);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawChaser(e, shirt, label, skin) {
  const step = Math.sin(performance.now() * 0.011 + e.x) * 4;
  ctx.fillStyle = "rgba(7, 10, 12, 0.28)";
  ctx.beginPath();
  ctx.ellipse(e.x + e.w / 2, e.y + e.h - 1, e.w / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1b2027";
  ctx.fillRect(e.x + 7, e.y + e.h - 10, 14, 10);
  ctx.fillRect(e.x + e.w - 21, e.y + e.h - 10 + step * 0.2, 14, 10);

  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(e.x + 4, e.y + 8, e.w - 8, e.h - 14, 12);
  ctx.fill();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(e.x + 10, e.y, e.w - 20, 24, 8);
  ctx.fill();
  ctx.fillStyle = "#4d3428";
  ctx.fillRect(e.x + 8, e.y - 4, e.w - 16, 9);
  ctx.fillStyle = "#101820";
  ctx.fillRect(e.x + 15, e.y + 9, 6, 6);
  ctx.fillRect(e.x + e.w - 21, e.y + 9, 6, 6);
  ctx.fillStyle = "#7a3333";
  ctx.fillRect(e.x + e.w / 2 - 6, e.y + 20, 12, 3);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(e.x + 10, e.y + 30, e.w - 20, 5);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 9px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, e.x + e.w / 2, e.y + 44);
  ctx.textAlign = "left";
}

function drawPronoteEnemy(e) {
  const bob = Math.sin(performance.now() * 0.008 + e.x) * 4;
  ctx.save();
  ctx.translate(e.x, e.y + bob);
  ctx.fillStyle = "rgba(7, 10, 12, 0.28)";
  ctx.beginPath();
  ctx.ellipse(e.w / 2, e.h + 2, e.w / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#101820";
  ctx.beginPath();
  ctx.roundRect(5, 0, e.w - 10, e.h, 8);
  ctx.fill();
  ctx.fillStyle = "#ff5f6d";
  ctx.fillRect(10, 8, e.w - 20, 12);
  ctx.fillStyle = "rgba(248, 239, 208, 0.82)";
  ctx.fillRect(13, 11, e.w - 26, 6);
  ctx.fillStyle = "#86f7ff";
  ctx.fillRect(12, 26, e.w - 24, 6);
  ctx.fillRect(12, 36, e.w - 30, 5);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 15px system-ui";
  ctx.fillText("!", e.w / 2, 50);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(-2, 16, 9, 4);
  ctx.fillRect(e.w - 7, 16, 9, 4);
  ctx.textAlign = "left";
  ctx.restore();

  ctx.fillStyle = "rgba(5, 6, 9, 0.82)";
  ctx.fillRect(e.x - 12, e.y - 17, e.w + 24, 17);
  ctx.strokeStyle = "#ff5f6d";
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x - 10, e.y - 15, e.w + 20, 13);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("PRONOTE", e.x + e.w / 2, e.y - 5);
  ctx.textAlign = "left";
}

function drawPhoneDrone(e) {
  const bob = Math.sin(performance.now() * 0.007 + e.x) * 4;
  ctx.save();
  ctx.translate(e.x, e.y + bob);
  ctx.fillStyle = "#101820";
  ctx.fillRect(7, 2, e.w - 14, e.h - 6);
  ctx.fillStyle = "#86f7ff";
  ctx.fillRect(12, 8, e.w - 24, e.h - 20);
  ctx.fillStyle = "#ff5fb7";
  ctx.font = "900 9px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("ALERTE", e.w / 2, 28);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(2, 15, 10, 4);
  ctx.fillRect(e.w - 12, 15, 10, 4);
  ctx.fillRect(2, 31, 10, 4);
  ctx.fillRect(e.w - 12, 31, 10, 4);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawCopy(e) {
  ctx.fillStyle = "#fff8dd";
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = "#e85858";
  ctx.fillRect(e.x + 8, e.y + 14, e.w - 16, 5);
  ctx.fillRect(e.x + 8, e.y + 28, e.w - 16, 5);
  ctx.fillStyle = "#2f3940";
  ctx.fillRect(e.x + 10, e.y + 42, 8, 8);
  ctx.fillRect(e.x + e.w - 18, e.y + 42, 8, 8);
}

function drawBell(e) {
  ctx.fillStyle = "#e9c64f";
  ctx.beginPath();
  ctx.arc(e.x + e.w / 2, e.y + 24, 24, Math.PI, 0);
  ctx.lineTo(e.x + e.w - 4, e.y + 44);
  ctx.lineTo(e.x + 4, e.y + 44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6a491d";
  ctx.fillRect(e.x + 19, e.y + 44, 12, 10);
  ctx.fillRect(e.x + 12, e.y + 20, 7, 7);
  ctx.fillRect(e.x + 31, e.y + 20, 7, 7);
}

function drawBag(e) {
  ctx.fillStyle = "#384b67";
  ctx.fillRect(e.x + 7, e.y + 12, e.w - 14, e.h - 10);
  ctx.fillStyle = "#253144";
  ctx.fillRect(e.x + 16, e.y + 2, e.w - 32, 20);
  ctx.fillStyle = "#ffcf4e";
  ctx.fillRect(e.x + 18, e.y + 28, 14, 10);
  ctx.fillStyle = "#111922";
  ctx.fillRect(e.x + 11, e.y + 44, 8, 8);
  ctx.fillRect(e.x + e.w - 19, e.y + 44, 8, 8);
}

function drawNpc(e) {
  ctx.fillStyle = "#52616c";
  ctx.fillRect(e.x + 8, e.y + 10, e.w - 16, e.h - 10);
  ctx.fillStyle = "#d9b177";
  ctx.fillRect(e.x + 11, e.y, e.w - 22, 22);
  ctx.fillStyle = "#20272f";
  ctx.fillRect(e.x + 15, e.y + 7, 6, 5);
  ctx.fillRect(e.x + e.w - 21, e.y + 7, 6, 5);
  ctx.fillStyle = "#f2dc85";
  ctx.font = "900 11px system-ui";
  ctx.fillText("NPC", e.x + 12, e.y + 42);
}

function drawGoal() {
  const g = currentGoal();
  const chapter = currentPlatformChapter();
  const flagY = g.y + 14 + Math.sin(performance.now() * 0.006) * 3;

  ctx.fillStyle = "rgba(7, 10, 12, 0.28)";
  ctx.fillRect(g.x - 18, FLOOR_Y - 10, 126, 12);
  ctx.fillStyle = chapter.accent;
  ctx.fillRect(g.x, g.y, 18, g.h);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(g.x - 8, FLOOR_Y - 20, 34, 20);
  ctx.fillStyle = "#ff5fb7";
  ctx.fillRect(g.x + 18, flagY, 104, 50);
  ctx.fillStyle = "#101820";
  ctx.fillRect(g.x + 18, flagY + 42, 104, 8);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 17px system-ui";
  ctx.fillText(activePlatformRun.goalText, g.x + 29, flagY + 31);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 12px system-ui";
  ctx.fillText("FIN ->", g.x - 6, g.y - 10);
}

function drawPlayer() {
  const x = player.x;
  const y = player.y;
  const bob = player.onGround ? Math.sin(player.frame * Math.PI * 2) * 2 : 0;
  const bodyScale = player.big ? 1.24 : 1;

  ctx.save();
  if (player.invuln > 0 && Math.floor(player.invuln / 6) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }
  ctx.translate(x + player.w / 2, y + bob);
  ctx.scale(player.facing * bodyScale, bodyScale);

  if (mangoSpeedTimer > 0) {
    ctx.fillStyle = "rgba(255, 207, 78, 0.55)";
    for (let i = 0; i < 3; i += 1) {
      ctx.fillRect(-44 - i * 14, 10 + i * 9, 28, 5);
    }
  }

  ctx.fillStyle = "#7a5132";
  ctx.fillRect(-15, -6, 30, 35);
  ctx.fillStyle = "#a9794f";
  ctx.fillRect(-13, -10, 26, 14);
  ctx.fillRect(-16, 4, 7, 31);
  ctx.fillRect(9, 4, 7, 31);
  ctx.fillStyle = "#c09261";
  ctx.fillRect(7, -6, 4, 39);

  ctx.fillStyle = "#ffcf9d";
  ctx.fillRect(-10, 1, 20, 22);
  ctx.fillStyle = "#7a5132";
  ctx.fillRect(-12, -2, 24, 7);
  ctx.fillRect(-12, 4, 5, 22);
  ctx.fillRect(7, 4, 5, 22);

  ctx.fillStyle = "#242b35";
  ctx.fillRect(-7, 10, 4, 4);
  ctx.fillRect(5, 10, 4, 4);
  ctx.fillStyle = "#b85c5c";
  ctx.fillRect(-3, 18, 7, 2);

  ctx.fillStyle = "#2f5f9f";
  ctx.fillRect(-14, 23, 28, 24);
  ctx.fillStyle = "#4479bf";
  ctx.fillRect(-12, 26, 24, 5);
  ctx.fillRect(-12, 36, 24, 4);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(-5, 32, 10, 3);
  ctx.fillStyle = "#ffcf9d";
  ctx.fillRect(-18, 25, 6, 18);
  ctx.fillRect(12, 25, 6, 18);
  ctx.fillStyle = "#223047";
  ctx.fillRect(-12, 46, 10, 8);
  ctx.fillRect(2, 46, 10, 8);
  ctx.restore();
}

function drawSpawnCue() {
  if (spawnCueTimer <= 0) return;
  const alpha = Math.min(1, spawnCueTimer / 35);
  const x = player.x + player.w / 2;
  const y = player.y - 46 + Math.sin(performance.now() * 0.012) * 5;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(8, 17, 20, 0.86)";
  ctx.fillRect(x - 56, y - 30, 112, 28);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 52, y - 26, 104, 20);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("JOHANNE", x, y - 11);
  ctx.fillStyle = "#ffcf4e";
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x - 11, y - 8);
  ctx.lineTo(x + 11, y - 8);
  ctx.closePath();
  ctx.fill();
  ctx.textAlign = "left";
  ctx.restore();
}

function drawCareEffect() {
  if (careTimer <= 0) return;
  const x = player.x + player.w / 2;
  const y = player.y + 6;
  const pulse = Math.sin(careTimer * 0.28);

  ctx.fillStyle = "rgba(14, 20, 24, 0.76)";
  ctx.fillRect(x - 58, y - 50, 116, 28);
  ctx.fillStyle = careMode === "skincare" ? "#ffd8ef" : "#86f7ff";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(careMode === "skincare" ? "PAUSE SKIN CARE" : "LISSAGE EXPRESS", x, y - 31);

  if (careMode === "skincare") {
    ctx.fillStyle = "#ff9ec5";
    ctx.beginPath();
    ctx.arc(x - 18, y - 8, 4 + pulse, 0, Math.PI * 2);
    ctx.arc(x + 18, y - 11, 3 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(x + 25, y - 20, 8, 16);
  } else {
    ctx.strokeStyle = "#86f7ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 28, y - 5);
    ctx.lineTo(x + 28, y - 9 + pulse * 2);
    ctx.stroke();
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(x + 23, y - 16, 22, 5);
    ctx.fillRect(x + 23, y - 7, 22, 5);
  }

  ctx.textAlign = "left";
}

function drawSkincareGame() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#9fd4e2");
  bg.addColorStop(0.56, "#f3d9c5");
  bg.addColorStop(1, "#77503e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#6c4a32";
  ctx.fillRect(0, 610, W, 110);
  ctx.fillStyle = "#e8d0b7";
  ctx.fillRect(0, 560, W, 70);
  ctx.fillStyle = "#d1b28f";
  for (let x = 0; x < W; x += 80) ctx.fillRect(x, 560, 4, 70);

  drawSkincareMirror();
  drawSkincareShelf();
  drawSkincareProgress();
  drawSkincareBubble();
  drawSkincareControls();
}

function drawProductHuntLevel() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#7fc9e6");
  bg.addColorStop(0.5, "#f4d4e2");
  bg.addColorStop(1, "#7b4f88");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let x = 70; x < W; x += 180) ctx.fillRect(x, 115 + Math.sin(x) * 24, 86, 5);
  ctx.fillStyle = "#d2b089";
  ctx.fillRect(0, 608, W, 112);
  ctx.fillStyle = "#8a6548";
  for (let x = 0; x < W; x += 96) ctx.fillRect(x, 608, 6, 112);

  ctx.fillStyle = "rgba(5, 6, 9, 0.78)";
  ctx.fillRect(58, 42, 1164, 82);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 4;
  ctx.strokeRect(66, 50, 1148, 66);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 28px system-ui";
  ctx.fillText("Avant skin care: remplis la trousse", 92, 86);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 15px system-ui";
  ctx.fillText("< > / Q D: bouger   attrape tout pour debloquer le miroir", 92, 108);

  for (const item of productHuntItems) {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(Math.sin(item.spin) * 0.12);
    drawProductPickupIcon(item.product, 0, 0, 1);
    ctx.restore();
  }

  drawProductHuntBag();
  drawProductChecklist();
  drawProductHuntFeedback();
}

function drawProductHuntBag() {
  const x = productHuntX;
  const y = 592;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + 58, 94, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#101820";
  ctx.beginPath();
  ctx.roundRect(x - 82, y - 24, 164, 86, 16);
  ctx.fill();
  ctx.fillStyle = "#ff5fb7";
  ctx.fillRect(x - 68, y - 8, 136, 54);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y - 8, 38, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("TROUSSE", x, y + 27);
  ctx.textAlign = "left";
}

function drawProductChecklist() {
  ctx.fillStyle = "rgba(5, 6, 9, 0.76)";
  ctx.fillRect(890, 150, 292, 392);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 3;
  ctx.strokeRect(898, 158, 276, 376);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 18px system-ui";
  ctx.fillText(`Produits ${productHuntCollected.length}/${skincareProducts.length}`, 922, 192);

  skincareProducts.forEach((product, index) => {
    const y = 226 + index * 32;
    const done = productHuntCollected.includes(product.id);
    ctx.fillStyle = done ? "#c8ff4e" : "#52616c";
    ctx.fillRect(922, y - 16, 18, 18);
    ctx.fillStyle = done ? "#101820" : "#f8efd0";
    ctx.font = "900 13px system-ui";
    ctx.fillText(done ? "✓" : "?", 926, y - 2);
    drawProductPickupIcon(product, 966, y - 8, 0.38);
    ctx.fillStyle = done ? "#f8efd0" : "#b9c2bd";
    ctx.font = "900 13px system-ui";
    ctx.fillText(product.name, 992, y + 1);
  });
}

function drawProductHuntFeedback() {
  const text = productHuntFeedbackTimer > 0
    ? productHuntFeedback
    : "La trousse doit etre complete avant le miroir.";
  ctx.fillStyle = "rgba(5, 6, 9, 0.78)";
  ctx.fillRect(250, 142, 600, 54);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 3;
  ctx.strokeRect(256, 148, 588, 42);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 17px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, 550, 175);
  ctx.textAlign = "left";
}

function drawProductPickupIcon(product, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (product.id === "straightener") {
    drawStraightenerTool(-34, -16, 0.72, false);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(-18, 28, 36, 7);
    ctx.fillStyle = product.color;
    ctx.fillRect(-20, -28, 40, 58);
    ctx.fillStyle = "#f8efd0";
    ctx.fillRect(-16, -38, 32, 12);
    ctx.fillStyle = "#20313a";
    ctx.fillRect(-14, -12, 28, 20);
    ctx.fillStyle = "#f8efd0";
    ctx.font = "900 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(product.short, 0, 2);
  }
  ctx.restore();
  ctx.textAlign = "left";
}

function drawSkincareMirror() {
  ctx.fillStyle = "#f8efd0";
  ctx.beginPath();
  ctx.roundRect(383, 52, 514, 430, 34);
  ctx.fill();
  ctx.fillStyle = "#9ce6ff";
  ctx.beginPath();
  ctx.roundRect(410, 78, 460, 376, 26);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(442, 105, 92, 310);
  ctx.fillRect(578, 90, 28, 340);

  const straightenerIndex = skincareProducts.findIndex((item) => item.id === "straightener");
  const hairIsStraight = straightenerIndex >= 0 && skincareStep > straightenerIndex;
  const portraitBaseY = 356;
  drawPixelJohanneMirrorPortrait(W / 2, portraitBaseY, hairIsStraight);

  const layerColors = ["#9ce6ff", "#ffd35a", "#ffd8ef", "#f8efd0", "#f1b37c", "#ff7eb6", "#20272f", "#ff9ec5", "#86f7ff"];
  for (let i = 0; i < skincareStep; i += 1) {
    ctx.globalAlpha = 0.16 + i * 0.035;
    ctx.fillStyle = layerColors[i];
    ctx.beginPath();
    ctx.ellipse(W / 2, 246 + i * 2, 50 - i * 2, 62 - i * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawPixelJohanneMirrorFeatures(W / 2, portraitBaseY);

  drawSkincareTargetAndCursor();
}

function drawPixelJohanneMirrorPortrait(cx, footY, hairIsStraight) {
  const px = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(cx + x), Math.round(footY + y), w, h);
  };

  px(-114, -282, 228, 28, "#5a3925");
  px(-132, -254, 264, 48, "#765032");
  px(-146, -206, 64, 216, "#6d472d");
  px(82, -206, 64, 216, "#6d472d");
  px(-126, -178, 42, 198, "#8b623f");
  px(84, -178, 42, 198, "#8b623f");
  px(-92, -276, 184, 54, "#8b623f");
  px(-58, -296, 48, 92, "#9d7048");
  px(-8, -304, 16, 112, "#4c301f");
  px(10, -296, 48, 92, "#9d7048");

  if (hairIsStraight) {
    px(-138, -226, 32, 238, "#7e5638");
    px(-106, -214, 20, 234, "#9c7049");
    px(86, -214, 20, 234, "#9c7049");
    px(106, -226, 32, 238, "#7e5638");
    px(-116, -206, 7, 226, "rgba(248, 239, 208, 0.45)");
    px(110, -206, 7, 226, "rgba(248, 239, 208, 0.45)");
  } else {
    px(-142, -166, 18, 30, "#9d7048");
    px(-130, -102, 20, 38, "#9d7048");
    px(118, -154, 18, 30, "#9d7048");
    px(104, -82, 22, 42, "#9d7048");
  }

  px(-58, -100, 116, 28, "#ffcf9d");
  px(-88, -226, 176, 62, "#f4bc91");
  px(-100, -202, 200, 88, "#ffcf9d");
  px(-88, -114, 176, 48, "#f6bd90");
  px(-66, -66, 132, 34, "#e7a978");
  px(-46, -32, 92, 20, "#dc9669");
  px(-22, -12, 44, 16, "#c98560");

  px(-80, -232, 56, 20, "#8b623f");
  px(24, -232, 56, 20, "#8b623f");
  px(-104, -206, 28, 122, "#765032");
  px(76, -206, 28, 122, "#765032");
  px(-98, -178, 18, 150, "#9d7048");
  px(80, -178, 18, 150, "#9d7048");

  px(-78, 2, 156, 22, "#ffcf9d");
  px(-142, 22, 284, 90, "#141b22");
  px(-122, 38, 244, 78, "#202a33");
  px(-98, 38, 196, 24, "#2f6f8f");
  px(-20, 16, 40, 28, "#f4bc91");
  px(-8, 44, 16, 42, "#f8efd0");

  px(-150, 104, 300, 10, "rgba(0,0,0,0.22)");
}

function drawPixelJohanneMirrorFeatures(cx, py) {
  const px = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(cx + x), Math.round(py + y), w, h);
  };

  px(-54, -180, 34, 7, "#6f482c");
  px(20, -180, 34, 7, "#6f482c");
  px(-48, -166, 16, 10, "#f8efd0");
  px(32, -166, 16, 10, "#f8efd0");
  px(-43, -164, 8, 8, "#8fc0d7");
  px(35, -164, 8, 8, "#8fc0d7");
  px(-40, -161, 4, 4, "#20272f");
  px(38, -161, 4, 4, "#20272f");
  px(-8, -146, 16, 36, "#e0a174");
  px(-2, -114, 16, 6, "#c98560");
  px(-22, -84, 44, 8, "#b85c5c");
  px(-14, -78, 28, 6, "#f8b4a8");
  px(-64, -132, 24, 10, "rgba(255, 126, 182, 0.34)");
  px(40, -132, 24, 10, "rgba(255, 126, 182, 0.34)");
}

function drawSkincareShelf() {
  ctx.fillStyle = "#4d3428";
  ctx.fillRect(134, 514, 1012, 30);
  const startX = 118;
  const gap = 126;

  skincareProducts.forEach((product, index) => {
    const x = startX + index * gap;
    const selected = index === skincareSelected;
    const applied = index < skincareStep;

    ctx.fillStyle = selected ? "#ffcf4e" : "rgba(14, 20, 24, 0.74)";
    ctx.fillRect(x - 15, 422, 106, 98);
    ctx.strokeStyle = selected ? "#f8efd0" : "rgba(255,255,255,0.2)";
    ctx.lineWidth = selected ? 5 : 2;
    ctx.strokeRect(x - 11, 426, 98, 90);

    ctx.globalAlpha = applied ? 0.45 : 1;
    if (product.id === "straightener") {
      drawStraightenerTool(x - 1, 460, 0.68, false);
    } else {
      ctx.fillStyle = product.color;
      ctx.fillRect(x + 15, 452, 38, 58);
      ctx.fillStyle = "#20313a";
      ctx.fillRect(x + 19, 466, 30, 22);
      ctx.fillStyle = "#f8efd0";
      ctx.font = "900 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(product.short, x + 34, 481);
    }
    ctx.fillStyle = selected ? "#20313a" : "#f8efd0";
    ctx.font = "900 13px system-ui";
    ctx.fillText(product.name, x + 38, 444);
    ctx.globalAlpha = 1;
  });
  ctx.textAlign = "left";
}

function drawSkincareTargetAndCursor() {
  if (skincareStep >= skincareProducts.length) return;
  const expected = skincareProducts[skincareStep];
  const target = skincareTargets[expected.id];
  const aimX = skincareAimX();
  const isStraightener = expected.id === "straightener";

  ctx.save();
  ctx.strokeStyle = expected.color;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(255, 207, 78, 0.24)";
  ctx.beginPath();
  ctx.arc(target.x, target.y, target.radius * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(aimX, 112);
  ctx.lineTo(aimX, 420);
  ctx.stroke();

  if (isStraightener) {
    drawStraightenerTool(aimX - 30, target.y - 60, 1.2, true);
  } else {
    ctx.fillStyle = expected.color;
    ctx.fillRect(aimX - 16, target.y - 58, 32, 52);
    ctx.fillStyle = "#20313a";
    ctx.fillRect(aimX - 12, target.y - 42, 24, 17);
    ctx.fillStyle = "#f8efd0";
    ctx.font = "900 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(expected.short, aimX, target.y - 29);
  }

  ctx.fillStyle = "rgba(5, 6, 9, 0.74)";
  ctx.fillRect(target.x - 82, target.y + target.radius + 10, 164, 26);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(`vise: ${target.label}`, target.x, target.y + target.radius + 29);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawStraightenerTool(x, y, scale = 1, open = false) {
  const s = scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, 0, 76 * s, 14 * s);
  ctx.fillRect(0, (open ? 32 : 24) * s, 76 * s, 14 * s);
  ctx.fillStyle = "#86f7ff";
  ctx.fillRect(12 * s, 3 * s, 42 * s, 8 * s);
  ctx.fillRect(12 * s, (open ? 35 : 27) * s, 42 * s, 8 * s);
  ctx.fillStyle = "#ffcf4e";
  ctx.fillRect(62 * s, 1 * s, 8 * s, 46 * s);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(5 * s, 18 * s, 24 * s, 5 * s);
  ctx.restore();
}

function drawSkincareProgress() {
  ctx.fillStyle = "rgba(14, 20, 24, 0.72)";
  ctx.fillRect(84, 74, 260, 112);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 18px system-ui";
  ctx.fillText("Skin care + make-up", 104, 105);
  ctx.fillStyle = "#ffd8ef";
  ctx.font = "900 42px system-ui";
  ctx.fillText(`${skincareStep}/${skincareProducts.length}`, 104, 154);
  ctx.fillStyle = "#b9c2bd";
  ctx.font = "800 13px system-ui";
  ctx.fillText(`style ${skincareStyle}  rates ${skincareMistakes}`, 104, 176);
}

function drawSkincareBubble() {
  const text = skincareFeedbackTimer > 0 ? skincareFeedback : "Le miroir juge en silence.";
  ctx.fillStyle = "rgba(14, 20, 24, 0.82)";
  ctx.fillRect(820, 88, 360, 108);
  ctx.fillStyle = "#86f7ff";
  ctx.font = "900 16px system-ui";
  ctx.fillText("Indice rigolo", 844, 120);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "800 18px system-ui";
  wrapText(text, 844, 150, 305, 24);
}

function drawSkincareControls() {
  ctx.fillStyle = "rgba(14, 20, 24, 0.78)";
  ctx.fillRect(395, 638, 490, 48);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Skin care, make-up, lisseur: valide quand le trait jaune vise la zone.", W / 2, 668);
  ctx.textAlign = "left";
}

function drawSassLevel() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#8fc8dc");
  bg.addColorStop(0.62, "#f4d4b7");
  bg.addColorStop(1, "#6c4a32");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#7a5641";
  ctx.fillRect(0, 560, W, 160);
  ctx.fillStyle = "#d9cfa8";
  ctx.fillRect(110, 430, 1060, 150);
  ctx.fillStyle = "#4d3428";
  ctx.fillRect(160, 382, 230, 80);
  ctx.fillRect(890, 382, 230, 80);

  drawSassDad(260, 372);
  drawDaronMeter(1010, 372);
  drawSassAya();
  drawSassPrompt();
  drawSassOptions();
}

function drawSassDad(x, y) {
  ctx.fillStyle = "#6d543c";
  ctx.fillRect(x - 42, y - 96, 12, 24);
  ctx.fillRect(x + 30, y - 96, 12, 24);
  ctx.fillStyle = "#ffcf9d";
  ctx.fillRect(x - 30, y - 108, 60, 62);
  ctx.fillStyle = "#101820";
  ctx.fillRect(x - 38, y - 132, 76, 18);
  ctx.fillRect(x + 2, y - 124, 48, 10);
  ctx.fillStyle = "#2f6f8f";
  ctx.font = "900 7px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("CAP", x, y - 120);
  ctx.textAlign = "left";
  ctx.fillStyle = "#6d543c";
  ctx.fillRect(x - 34, y - 118, 68, 14);
  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 23, y - 84, 20, 13);
  ctx.strokeRect(x + 6, y - 84, 20, 13);
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 78);
  ctx.lineTo(x + 6, y - 78);
  ctx.stroke();
  ctx.fillStyle = "#805b43";
  ctx.fillRect(x - 14, y - 60, 28, 5);
  ctx.fillStyle = "#2f3339";
  ctx.fillRect(x - 48, y - 46, 96, 112);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("PAPA", x, y + 4);
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 30px system-ui";
  ctx.fillText("?!", x - 18, y - 148);
}

function drawDaronMeter(x, y) {
  ctx.fillStyle = "#172126";
  ctx.fillRect(x - 74, y - 116, 148, 182);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 68, y - 110, 136, 170);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Daron", x, y - 76);
  ctx.fillText("meter", x, y - 54);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < sassRound ? "#ff5fb7" : "#31404a";
    ctx.fillRect(x - 44 + i * 22, y - 24, 16, 70);
  }
  ctx.textAlign = "left";
}

function drawSassAya() {
  const x = W / 2;
  const y = 454;
  ctx.fillStyle = "#6b3d25";
  ctx.fillRect(x - 42, y - 142, 84, 90);
  ctx.fillRect(x - 52, y - 90, 20, 92);
  ctx.fillRect(x + 32, y - 90, 20, 92);
  ctx.fillStyle = "#ffcf9d";
  ctx.fillRect(x - 34, y - 122, 68, 74);
  ctx.fillStyle = "#5f3a24";
  ctx.fillRect(x - 40, y - 136, 80, 28);
  ctx.fillStyle = "#20272f";
  ctx.fillRect(x - 18, y - 94, 7, 7);
  ctx.fillRect(x + 12, y - 94, 7, 7);
  ctx.fillStyle = "#b85c5c";
  ctx.fillRect(x - 12, y - 72, 24, 4);
  ctx.fillStyle = "#2f6f8f";
  ctx.fillRect(x - 44, y - 48, 88, 112);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(x - 10, y - 10, 20, 6);
  ctx.fillRect(x - 3, y - 18, 6, 22);
}

function drawSassPrompt() {
  const round = sassRounds[Math.min(sassRound, sassRounds.length - 1)];
  ctx.fillStyle = "rgba(14,20,24,0.82)";
  ctx.fillRect(300, 62, 680, 126);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 20px system-ui";
  ctx.fillText(`Round ${Math.min(sassRound + 1, sassRounds.length)}/${sassRounds.length}`, 330, 98);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 24px system-ui";
  wrapText(`Papa: "${round.parent}"`, 330, 132, 610, 30);

  ctx.fillStyle = "rgba(14,20,24,0.74)";
  ctx.fillRect(78, 72, 176, 86);
  ctx.fillStyle = "#ffd8ef";
  ctx.font = "900 18px system-ui";
  ctx.fillText("Insolence", 104, 106);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 36px system-ui";
  ctx.fillText(String(sassScore), 104, 145);
}

function drawSassOptions() {
  const round = sassRounds[Math.min(sassRound, sassRounds.length - 1)];
  round.options.forEach((option, index) => {
    const x = 130 + index * 365;
    const selected = index === sassSelected;
    ctx.fillStyle = selected ? "#ffcf4e" : "rgba(14,20,24,0.82)";
    ctx.fillRect(x, 592, 310, 92);
    ctx.strokeStyle = selected ? "#f8efd0" : "rgba(255,255,255,0.18)";
    ctx.lineWidth = selected ? 5 : 2;
    ctx.strokeRect(x + 4, 596, 302, 84);
    ctx.fillStyle = selected ? "#101820" : "#f8efd0";
    ctx.font = "900 17px system-ui";
    wrapText(option.text, x + 22, 626, 260, 22);
  });

  const feedback = sassAdvanceTimer > 0
    ? `${sassFeedback}  Lecture...`
    : sassFeedbackTimer > 0 ? sassFeedback : "Gauche/droite, puis saut pour envoyer la dinguerie.";
  ctx.fillStyle = "rgba(14,20,24,0.76)";
  ctx.fillRect(390, 212, 500, 54);
  ctx.fillStyle = "#86f7ff";
  ctx.font = "900 17px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(feedback, W / 2, 246);
  ctx.textAlign = "left";
}

function drawMomPartyLevel() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#101b3f");
  bg.addColorStop(0.48, "#65316f");
  bg.addColorStop(1, "#101820");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let x = 40; x < W; x += 160) ctx.fillRect(x, 88 + Math.sin(x) * 20, 74, 5);
  ctx.fillStyle = "#1b2635";
  ctx.fillRect(0, 488, W, 120);
  ctx.fillStyle = "#2f3544";
  for (let x = -20; x < W; x += 92) ctx.fillRect(x, 544, 58, 8);
  drawMoulinDisco(888);

  ctx.fillStyle = "rgba(5, 6, 9, 0.34)";
  ctx.fillRect(90, 286, 790, 188);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 4;
  ctx.strokeRect(96, 292, 778, 176);
  ctx.fillStyle = "rgba(255, 207, 78, 0.18)";
  ctx.fillRect(246, 300, 592, 152);
  ctx.strokeStyle = "#ffcf4e";
  ctx.setLineDash([12, 10]);
  ctx.strokeRect(250, 304, 584, 144);
  ctx.setLineDash([]);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("SAS DE NEGOCIATION", 542, 326);
  ctx.fillStyle = "#b9c2bd";
  ctx.font = "800 13px system-ui";
  ctx.fillText("Quand quelqu'un est dans le cadre jaune, choisis la bonne phrase puis valide.", 542, 348);
  ctx.fillStyle = "#ff5f67";
  ctx.font = "900 14px system-ui";
  ctx.fillText("DANCEFLOOR ADO - interdit aux mamans trop potes", 1004, 470);

  for (const guest of momGuests) drawMomGuest(guest);
  drawMomJohanneFilter();
  drawMomResponseCards();
  drawMomPartyHud();
  drawMomPartyMessage();
  ctx.textAlign = "left";
}

function drawMomGuest(guest) {
  const x = guest.x + Math.sin(guest.wobble) * 8;
  const y = guest.y;
  const isMom = guest.type === "maman";
  const isSelfie = guest.type === "selfie";
  const isDance = guest.type === "dance";
  const dress = isMom ? "#ff5fb7" : isSelfie ? "#86f7ff" : isDance ? "#ffcf4e" : "#c8ff4e";

  ctx.save();
  ctx.translate(x, y);
  if (isMom) {
    drawMomPortraitSprite(46, 48, guest.label);
    ctx.restore();
    ctx.textAlign = "left";
    return;
  }

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(46, 86, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffcf9d";
  ctx.beginPath();
  ctx.roundRect(27, 6, 38, 34, 10);
  ctx.fill();
  ctx.fillStyle = isMom ? "#6d3f2f" : "#7a5132";
  ctx.fillRect(24, 2, 44, 10);
  ctx.fillStyle = "#101820";
  ctx.fillRect(35, 19, 5, 5);
  ctx.fillRect(53, 19, 5, 5);
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.roundRect(18, 42, 56, 48, 14);
  ctx.fill();
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(guest.label, 46, 70);
  if (isSelfie) {
    ctx.fillStyle = "#101820";
    ctx.fillRect(64, 24, 20, 28);
    ctx.fillStyle = "#86f7ff";
    ctx.fillRect(68, 30, 12, 12);
  }
  if (isDance) {
    ctx.fillStyle = "#ffcf4e";
    ctx.font = "900 22px system-ui";
    ctx.fillText("♪", 74, 22);
  }
  ctx.restore();
  ctx.textAlign = "left";
}

function drawMomPortraitSprite(cx, cy, label) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 40, 42, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5d6265";
  ctx.fillRect(cx - 39, cy - 48, 78, 72);
  ctx.fillStyle = "#8b9092";
  ctx.fillRect(cx - 47, cy - 34, 22, 70);
  ctx.fillRect(cx + 25, cy - 34, 22, 70);
  ctx.fillStyle = "#c5c9c8";
  ctx.fillRect(cx - 45, cy - 42, 14, 74);
  ctx.fillRect(cx + 31, cy - 42, 14, 74);
  ctx.fillRect(cx - 26, cy - 52, 18, 18);
  ctx.fillRect(cx + 8, cy - 52, 18, 18);
  ctx.fillStyle = "#3d302a";
  ctx.fillRect(cx - 30, cy - 44, 20, 13);
  ctx.fillRect(cx + 10, cy - 44, 18, 13);

  ctx.fillStyle = "#f2b6a2";
  ctx.beginPath();
  ctx.roundRect(cx - 30, cy - 30, 60, 54, 18);
  ctx.fill();
  ctx.fillStyle = "#e58f92";
  ctx.fillRect(cx - 27, cy - 4, 13, 8);
  ctx.fillRect(cx + 14, cy - 4, 13, 8);
  ctx.fillStyle = "#d9848a";
  ctx.fillRect(cx - 5, cy - 10, 10, 17);
  ctx.fillRect(cx - 9, cy + 9, 18, 4);
  ctx.fillStyle = "#7b4d46";
  ctx.fillRect(cx - 12, cy + 19, 24, 5);
  ctx.fillStyle = "#eaa0a5";
  ctx.fillRect(cx - 8, cy + 22, 16, 3);
  ctx.fillStyle = "#3b2a23";
  ctx.fillRect(cx - 22, cy - 16, 16, 5);
  ctx.fillRect(cx + 6, cy - 16, 16, 5);
  ctx.fillStyle = "#f8efd0";
  ctx.fillRect(cx - 18, cy - 8, 8, 7);
  ctx.fillRect(cx + 10, cy - 8, 8, 7);
  ctx.fillStyle = "#5d523a";
  ctx.fillRect(cx - 15, cy - 7, 4, 5);
  ctx.fillRect(cx + 13, cy - 7, 4, 5);
  ctx.fillStyle = "rgba(80,45,42,0.32)";
  ctx.fillRect(cx - 16, cy - 28, 32, 3);
  ctx.fillRect(cx - 18, cy - 23, 36, 2);

  ctx.fillStyle = "#ff5fb7";
  ctx.beginPath();
  ctx.roundRect(cx - 36, cy + 26, 72, 42, 14);
  ctx.fill();
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, cx, cy + 52);
}

function drawMomJohanneFilter() {
  const x = 820;
  const y = 438;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 48, 38, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a5132";
  ctx.fillRect(-19, -10, 38, 44);
  ctx.fillStyle = "#ffcf9d";
  ctx.fillRect(-14, -3, 28, 24);
  ctx.fillStyle = "#2f5f9f";
  ctx.fillRect(-22, 24, 44, 34);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("NOPE", 0, 45);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawMomResponseCards() {
  momResponseOptions.forEach((option, index) => {
    const x = 214 + index * 292;
    const selected = index === momLane;
    ctx.fillStyle = selected ? option.color : "rgba(5, 6, 9, 0.78)";
    ctx.fillRect(x, 558, 248, 76);
    ctx.strokeStyle = selected ? "#f8efd0" : "rgba(248,239,208,0.28)";
    ctx.lineWidth = selected ? 5 : 2;
    ctx.strokeRect(x + 5, 563, 238, 66);
    ctx.fillStyle = selected ? "#101820" : "#f8efd0";
    ctx.font = "900 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(option.label, x + 124, 590);
    ctx.font = "800 13px system-ui";
    ctx.fillText(option.hint, x + 124, 614);
  });
  ctx.textAlign = "left";
}

function drawMomPartyHud() {
  ctx.fillStyle = "rgba(5, 6, 9, 0.82)";
  ctx.fillRect(52, 42, 1176, 80);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 50, 1160, 64);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 26px system-ui";
  ctx.fillText("Maman s'incruste avec ses copines", 88, 86);
  drawMomMeter(575, 70, 245, momRespect / 100, "#c8ff4e", "soiree sauvee");
  drawMomMeter(880, 70, 245, momCringe / 100, "#ff5f67", "cringe");
}

function drawMomMeter(x, y, w, ratio, color, label) {
  ctx.fillStyle = "#20313a";
  ctx.fillRect(x, y, w, 18);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), 18);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, 18);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y + 36);
  ctx.textAlign = "left";
}

function drawMomPartyMessage() {
  const text = momFeedbackTimer > 0
    ? momFeedback
    : "< > / Q D: choisir une phrase   Espace / Entree: l'envoyer dans le sas";
  ctx.fillStyle = "rgba(5, 6, 9, 0.8)";
  ctx.fillRect(228, 642, 824, 48);
  ctx.strokeStyle = "#ffcf4e";
  ctx.lineWidth = 3;
  ctx.strokeRect(234, 648, 812, 36);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, W / 2, 672);
  ctx.textAlign = "left";
}

function drawCapitalQuizLevel() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#09162f");
  bg.addColorStop(0.52, "#173b5f");
  bg.addColorStop(1, "#0f1b24");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(134, 247, 255, 0.1)";
  for (let x = 50; x < W; x += 150) {
    ctx.fillRect(x, 110 + Math.sin(x * 0.03) * 28, 88, 5);
  }
  drawPixelEuropeMap(82, 150);

  ctx.fillStyle = "rgba(5, 6, 9, 0.82)";
  ctx.fillRect(346, 56, 842, 112);
  ctx.strokeStyle = "#c98cff";
  ctx.lineWidth = 4;
  ctx.strokeRect(354, 64, 826, 96);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 28px system-ui";
  ctx.fillText("Tuyau magique: capitales d'Europe", 382, 104);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "800 16px system-ui";
  ctx.fillText("12 questions tirees du pool complet. Objectif: 9 bonnes reponses.", 382, 136);

  ctx.fillStyle = "rgba(248, 239, 208, 0.12)";
  ctx.fillRect(328, 204, 884, 224);
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 3;
  ctx.strokeRect(336, 212, 868, 208);

  if (capitalQuizDone) {
    const won = capitalQuizScore >= 9;
    ctx.fillStyle = won ? "#c8ff4e" : "#ff7777";
    ctx.font = "900 44px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(won ? "PASSEPORT AYA VALIDE" : "PAS ASSEZ DE CAPITALES", 770, 292);
    ctx.fillStyle = "#f8efd0";
    ctx.font = "900 22px system-ui";
    ctx.fillText(`${capitalQuizScore}/12 bonnes reponses`, 770, 336);
    ctx.font = "800 17px system-ui";
    ctx.fillText(won ? "Entree: aller au Special AYA" : "Entree: revenir au tuyau magique", 770, 374);
  } else {
    const question = capitalQuizQuestions[capitalQuizIndex] || capitalQuizQuestions[0];
    ctx.fillStyle = "#86f7ff";
    ctx.font = "900 20px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`Question ${capitalQuizIndex + 1}/12`, 770, 250);
    ctx.fillStyle = "#f8efd0";
    ctx.font = "900 36px system-ui";
    ctx.fillText(`Capitale de ${question.country} ?`, 770, 312);
    ctx.fillStyle = "#b9c2bd";
    ctx.font = "800 15px system-ui";
    ctx.fillText("< > / Q D: choisir   Espace / Entree: valider   1-4: reponse directe", 770, 372);

    question.options.forEach((option, index) => {
      const x = 360 + (index % 2) * 430;
      const y = 464 + Math.floor(index / 2) * 88;
      const selected = index === capitalQuizSelected;
      ctx.fillStyle = selected ? "#ffcf4e" : "rgba(5, 6, 9, 0.76)";
      ctx.fillRect(x, y, 388, 64);
      ctx.strokeStyle = selected ? "#f8efd0" : "rgba(248,239,208,0.34)";
      ctx.lineWidth = selected ? 5 : 2;
      ctx.strokeRect(x + 5, y + 5, 378, 54);
      ctx.fillStyle = selected ? "#101820" : "#f8efd0";
      ctx.font = "900 20px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`${index + 1}. ${option}`, x + 28, y + 40);
    });
  }

  drawCapitalQuizHud();
  drawCapitalQuizFeedback();
  ctx.textAlign = "left";
}

function drawPixelEuropeMap(x, y) {
  const cells = [
    [3, 0, 2, 1], [2, 1, 4, 1], [6, 1, 2, 2], [1, 2, 5, 2],
    [5, 3, 4, 2], [0, 4, 4, 2], [4, 5, 5, 2], [8, 6, 3, 2],
    [3, 7, 4, 2], [6, 8, 3, 3], [1, 9, 3, 2], [10, 9, 2, 2],
    [4, 11, 2, 2], [7, 12, 2, 2],
  ];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(5, 6, 9, 0.42)";
  ctx.fillRect(0, 0, 232, 330);
  ctx.strokeStyle = "rgba(248,239,208,0.26)";
  ctx.strokeRect(6, 6, 220, 318);
  cells.forEach((cell, index) => {
    const [cx, cy, cw, ch] = cell;
    ctx.fillStyle = ["#4fbf9f", "#c8ff4e", "#86f7ff", "#ffcf4e"][index % 4];
    ctx.globalAlpha = 0.78;
    ctx.fillRect(28 + cx * 13, 36 + cy * 18, cw * 13, ch * 18);
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("EUROPE", 116, 302);
  ctx.restore();
  ctx.textAlign = "left";
}

function drawCapitalQuizHud() {
  ctx.fillStyle = "rgba(5, 6, 9, 0.78)";
  ctx.fillRect(72, 510, 220, 112);
  ctx.strokeStyle = "#86f7ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 518, 204, 96);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 16px system-ui";
  ctx.fillText("Score quiz", 104, 550);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 42px system-ui";
  ctx.fillText(`${capitalQuizScore}/12`, 104, 596);
}

function drawCapitalQuizFeedback() {
  const text = capitalQuizFeedbackTimer > 0
    ? capitalQuizFeedback
    : "Le tuyau attend une capitale propre.";
  ctx.fillStyle = "rgba(5, 6, 9, 0.82)";
  ctx.fillRect(344, 646, 856, 46);
  ctx.strokeStyle = "#c98cff";
  ctx.lineWidth = 3;
  ctx.strokeRect(350, 652, 844, 34);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, 772, 675);
  ctx.textAlign = "left";
}

function drawParentalLevel() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#101820");
  bg.addColorStop(0.55, "#243b4a");
  bg.addColorStop(1, "#0e171c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#172126";
  ctx.fillRect(390, 34, 500, 652);
  ctx.fillStyle = "#0b1115";
  ctx.fillRect(416, 72, 448, 570);
  ctx.fillStyle = "#20313a";
  ctx.fillRect(548, 52, 184, 12);

  drawPhoneHeader();
  drawPhoneApps();
  drawParentalStatus();
  drawParentalFeedback();
  drawParentalAlert();
}

function drawPhoneHeader() {
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 24px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Niveau 6 - Controle parental", W / 2, 112);
  ctx.fillStyle = "#86f7ff";
  ctx.font = "800 15px system-ui";
  ctx.fillText("Recupere les indices dans Actu, puis tape le code 10 fois.", W / 2, 140);
  ctx.textAlign = "left";
}

function drawPhoneApps() {
  const startX = 480;
  const startY = 190;
  parentalApps.forEach((app, index) => {
    const x = startX + (index % 2) * 170;
    const y = startY + Math.floor(index / 2) * 150;
    const selected = index === parentalSelected;
    ctx.fillStyle = selected ? "#ffcf4e" : "rgba(255,255,255,0.08)";
    ctx.fillRect(x - 12, y - 12, 124, 124);
    ctx.fillStyle = app.color;
    ctx.fillRect(x + 10, y + 2, 80, 72);
    ctx.fillStyle = "#101820";
    ctx.font = "900 24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(app.icon, x + 50, y + 47);
    ctx.fillStyle = selected ? "#101820" : "#f8efd0";
    ctx.font = "900 14px system-ui";
    ctx.fillText(app.name, x + 50, y + 99);
  });
  ctx.textAlign = "left";
}

function drawParentalStatus() {
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(454, 502, 372, 94);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 18px system-ui";
  ctx.fillText(`Indices Actu: ${parentalVideos}/4`, 482, 535);
  ctx.fillText(`Codes tapes: ${parentalCodes}/10`, 482, 568);
  ctx.fillStyle = parentalStealth > 0 ? "#86f7ff" : "#b9c2bd";
  ctx.fillText(parentalStealth > 0 ? "Mode discret actif" : "Mode discret inactif", 482, 590);
}

function drawParentalFeedback() {
  const text = parentalFeedbackTimer > 0 ? parentalFeedback : "Choisis une app avec gauche/droite, valide avec saut.";
  ctx.fillStyle = "rgba(14, 20, 24, 0.86)";
  ctx.fillRect(84, 168, 260, 190);
  ctx.fillStyle = "#ffcf4e";
  ctx.font = "900 17px system-ui";
  ctx.fillText("Message", 112, 204);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "800 18px system-ui";
  wrapText(text, 112, 242, 205, 25);
}

function drawParentalAlert() {
  if (parentalAlertTimer <= 0) return;
  ctx.fillStyle = "rgba(226, 60, 74, 0.9)";
  ctx.fillRect(925, 190, 250, 128);
  ctx.fillStyle = "#f8efd0";
  ctx.font = "900 20px system-ui";
  ctx.fillText("ALERTE MAMAN", 952, 230);
  ctx.font = "800 16px system-ui";
  wrapText("Elle demande: 'tu fais quoi sur ton telephone ?'", 952, 262, 190, 22);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

function drawAyaInSky() {
  const t = performance.now() * 0.002;
  const cx = W / 2;
  ctx.clearRect(0, 0, W, H);

  if (ayaMoulinFinalArt.complete && ayaMoulinFinalArt.naturalWidth > 0) {
    drawCoverImage(ayaMoulinFinalArt);
    ctx.fillStyle = "rgba(4, 2, 8, 0.24)";
    ctx.fillRect(0, 0, W, H);
    const focus = ctx.createRadialGradient(548, 290, 80, 548, 290, 620);
    focus.addColorStop(0, "rgba(255, 207, 78, 0.08)");
    focus.addColorStop(0.42, "rgba(255, 77, 86, 0.08)");
    focus.addColorStop(1, "rgba(2, 4, 12, 0.7)");
    ctx.fillStyle = focus;
    ctx.fillRect(0, 0, W, H);
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#05091f");
    sky.addColorStop(0.45, "#102b7c");
    sky.addColorStop(1, "#f3a64c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    drawAyaSpecialStars();
    const floatY = 34 + Math.sin(t * 3) * 7;
    if (ayaQueenArt.complete && ayaQueenArt.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = "rgba(255, 207, 78, 0.72)";
      ctx.shadowBlur = 38;
      ctx.drawImage(ayaQueenArt, cx - 335, floatY, 670, 670);
      ctx.restore();
    } else {
      drawPixelAyaTitle(cx - 214, 74, 12);
      drawPixelAyaSprite(cx - 72, 150 + Math.sin(t * 3) * 4, 6);
    }
  }

  drawFinalMoulinNeonSparkles();

  ctx.fillStyle = "#ffcf4e";
  ctx.strokeStyle = "#050609";
  ctx.lineWidth = 6;
  ctx.font = "900 42px monospace";
  ctx.textAlign = "center";
  ctx.strokeText("AYA AU MOULIN", cx, 650);
  ctx.fillText("AYA AU MOULIN", cx, 650);
  ctx.textAlign = "left";
}

function drawPixelAyaTitle(x, y, s) {
  ctx.fillStyle = "#f8efd0";
  const blocks = [
    [0, 1], [1, 0], [2, 0], [3, 1], [0, 2], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3], [0, 4], [3, 4],
    [5, 0], [5, 1], [6, 2], [7, 3], [7, 4], [9, 0], [9, 1], [8, 2], [7, 3],
    [11, 1], [12, 0], [13, 0], [14, 1], [11, 2], [14, 2], [11, 3], [12, 3], [13, 3], [14, 3], [11, 4], [14, 4],
  ];
  for (const [bx, by] of blocks) ctx.fillRect(x + bx * s, y + by * s, s - 1, s - 1);
}

function drawPixelAyaSprite(x, y, s) {
  const rect = (color, px, py, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * s, y + py * s, w * s, h * s);
  };

  rect("#6b3d25", 6, 0, 12, 3);
  rect("#5f341f", 4, 3, 16, 3);
  rect("#5f341f", 3, 6, 4, 12);
  rect("#5f341f", 17, 6, 4, 12);
  rect("#ffcf9d", 7, 5, 10, 10);
  rect("#20272f", 9, 9, 1, 1);
  rect("#20272f", 14, 9, 1, 1);
  rect("#b85c5c", 11, 13, 3, 1);
  rect("#1d2028", 7, 16, 10, 14);
  rect("#ffd8ef", 9, 18, 6, 9);
  rect("#f8efd0", 4, 18, 3, 3);
  rect("#f8efd0", 17, 18, 3, 3);
  rect("#f8efd0", 20, 13, 9, 2);
  rect("#20313a", 27, 12, 4, 4);
  rect("#1d2028", 7, 30, 4, 8);
  rect("#1d2028", 13, 30, 4, 8);
  rect("#f8efd0", 6, 38, 5, 2);
  rect("#f8efd0", 13, 38, 5, 2);
}

function drawFloatingTexts() {
  ctx.font = "900 18px system-ui";
  ctx.textAlign = "center";
  for (const text of floatingTexts) {
    ctx.globalAlpha = Math.max(0, Math.min(1, text.life / 24));
    ctx.fillStyle = "rgba(10, 14, 16, 0.72)";
    ctx.fillRect(text.x - 48, text.y - 26, 96, 28);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y - 7);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

function drawVignette() {
  const gradient = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, W * 0.74);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function loop(time) {
  const dt = Math.min(32, time - lastTime);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function desiredMusicTrackId() {
  if (state === "playing") {
    if (activePlatformRun.id === "platform1") return "mario1";
    if (activePlatformRun.id === "platform2") return "mario2";
    if (activePlatformRun.id === "platform3") return "mario3";
  }
  if (state === "skincare" || state === "productHunt") return "skincare";
  if (state === "sass") return "daron";
  if (state === "momParty") return "fighter";
  if (state === "capitalQuiz") return "parental";
  if (state === "parental") return "parental";
  if (state === "fighter") return "fighter";
  if (state === "levelVictory") return "aya";
  if (state === "ayaSpecial" || state === "showcaseVideo" || state === "won") return "aya";
  return "map";
}

function setMusicTrack(trackId, resetStep = true) {
  const index = musicTracks.findIndex((track) => track.id === trackId);
  if (index < 0 || index === currentMusicTrack) return;
  currentMusicTrack = index;
  if (resetStep) musicStep = 0;
  updateMusicButton();
  restartMusicTimer();
}

function syncMusicToState() {
  setMusicTrack(desiredMusicTrackId(), true);
}

function startMusic() {
  if (!AudioContextClass) return;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = soundMuted ? 0 : 0.045;
    musicGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  if (musicTimer) return;
  musicTimer = window.setInterval(playMusicStep, musicTracks[currentMusicTrack].beatMs);
}

function restartMusicTimer() {
  if (!musicTimer) return;
  window.clearInterval(musicTimer);
  musicTimer = window.setInterval(playMusicStep, musicTracks[currentMusicTrack].beatMs);
}

function updateMusicButton() {
  if (!musicBtn) return;
  musicBtn.textContent = `Musique: ${musicTracks[currentMusicTrack].name}`;
}

function setMusicVolume() {
  if (!musicGain || !audioCtx) return;
  musicGain.gain.setTargetAtTime(soundMuted ? 0 : 0.045, audioCtx.currentTime, 0.015);
}

function updateSoundButton() {
  if (!soundBtn) return;
  soundBtn.textContent = soundMuted ? "Son: Off" : "Son: On";
  soundBtn.classList.toggle("is-muted", soundMuted);
  soundBtn.setAttribute("aria-label", soundMuted ? "Remettre le son" : "Couper le son");
}

function toggleSound() {
  soundMuted = !soundMuted;
  updateSoundButton();
  if (!soundMuted) startMusic();
  setMusicVolume();
}

function nextMusicTrack() {
  currentMusicTrack = (currentMusicTrack + 1) % musicTracks.length;
  musicStep = 0;
  updateMusicButton();
  startMusic();
  restartMusicTimer();
}

function playMusicStep() {
  if (!audioCtx || !musicGain) return;
  const now = audioCtx.currentTime;
  const track = musicTracks[currentMusicTrack];
  const scale = track.scale;
  const leadPattern = track.leadPattern;
  const bassPattern = track.bassPattern;
  const step = musicStep % 16;
  const phrase = Math.floor(musicStep / 16) % 4;

  if (step % 2 === 0) {
    const bassSemi = bassPattern[Math.floor(step / 2)] + (phrase === 2 ? 2 : 0);
    playTone(midiToFreq(track.root + bassSemi), now, 0.12, track.bassWave, 0.45);
    if (track.id === "fighter") {
      playTone(midiToFreq(track.root + bassSemi - 12), now, 0.14, "square", 0.28);
    }
  }

  if (track.leadSteps.includes(step)) {
    const leadSemi = scale[leadPattern[step] % scale.length] + (phrase === 1 ? 5 : 0);
    playTone(midiToFreq(track.leadRoot + leadSemi), now + 0.015, 0.08, track.leadWave, 0.34);
    if (track.id === "fighter" && step % 4 === 3) {
      playTone(midiToFreq(track.leadRoot + leadSemi + 12), now + 0.035, 0.05, "square", 0.22);
    }
  }

  if (state === "skincare" && step % 4 === 1) {
    playTone(midiToFreq(79 + scale[(step + 2) % scale.length]), now, 0.06, "triangle", 0.22);
  }

  if (state === "parental" && step % 4 === 2) {
    playTone(midiToFreq(55 + scale[(step + 4) % scale.length]), now, 0.05, "sawtooth", 0.18);
  }

  if (track.id === "fighter") {
    if (step === 0 || step === 8) playNoise(now, 0.07, 0.95);
    if (step === 3 || step === 7 || step === 11 || step === 15) playNoise(now, 0.026, 0.36);
    if (step === 6 || step === 14) playTone(midiToFreq(track.root + 19), now, 0.045, "sawtooth", 0.2);
  }

  if (step === 0 || step === 8) playNoise(now, 0.035, 0.7);
  if (step === 4 || step === 12) playNoise(now, 0.055, 0.38);
  if (step % 2 === 1) playNoise(now, 0.018, 0.16);

  musicStep += 1;
}

function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function playTone(freq, time, duration, type, volume) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(gain);
  gain.connect(musicGain);
  osc.start(time);
  osc.stop(time + duration + 0.02);
}

function playNoise(time, duration, volume) {
  const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 4800;
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(musicGain);
  source.start(time);
  source.stop(time + duration);
}

function setKey(key, value) {
  if (key === "ArrowLeft" || key === "a" || key === "q") {
    if (value && !input.left) input.leftPressed = true;
    input.left = value;
  }
  if (key === "ArrowRight" || key === "d") {
    if (value && !input.right) input.rightPressed = true;
    input.right = value;
  }
  if (key === "ArrowDown" || key === "s") {
    if (value && !input.down) input.downPressed = true;
    input.down = value;
  }
  if (key === "ArrowUp" || key === "w" || key === "z" || key === " ") {
    if (value && !input.jump) input.jumpPressed = true;
    input.jump = value;
  }
}

window.addEventListener("keydown", (event) => {
  startMusic();
  handleGodCodeKey(event.key);
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "q", "d", "w", "z", "s"].includes(event.key)) {
    event.preventDefault();
    setKey(event.key, true);
  }
  if (state === "capitalQuiz" && /^[1-4]$/.test(event.key)) {
    event.preventDefault();
    capitalQuizSelected = Number(event.key) - 1;
    input.jumpPressed = true;
  }
  if ((event.key === "x" || event.key === "X") && state === "fighter") {
    event.preventDefault();
    input.vannePressed = true;
  }
  if (event.key === "Enter" && (state === "map" || state === "podcastReward" || state === "levelVictory" || state === "skincare" || state === "productHunt" || state === "sass" || state === "momParty" || state === "capitalQuiz" || state === "parental" || state === "fighter" || state === "ayaSpecial" || state === "showcaseVideo")) input.jumpPressed = true;
  if (event.key === "Enter" && state !== "playing" && state !== "map" && state !== "podcastReward" && state !== "levelVictory" && state !== "skincare" && state !== "productHunt" && state !== "sass" && state !== "momParty" && state !== "capitalQuiz" && state !== "parental" && state !== "fighter" && state !== "ayaSpecial" && state !== "showcaseVideo") resetGame();
});

window.addEventListener("keyup", (event) => setKey(event.key, false));

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  const press = (value) => {
    if (control === "left") {
      if (value && !input.left) input.leftPressed = true;
      input.left = value;
    }
    if (control === "right") {
      if (value && !input.right) input.rightPressed = true;
      input.right = value;
    }
    if (control === "jump") {
      if (value && !input.jump) input.jumpPressed = true;
      input.jump = value;
    }
  };
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    startMusic();
    button.setPointerCapture(event.pointerId);
    press(true);
  });
  button.addEventListener("pointerup", () => press(false));
  button.addEventListener("pointercancel", () => press(false));
  button.addEventListener("pointerleave", () => press(false));
});

startBtn.addEventListener("click", () => {
  startMusic();
  resetGame();
});
resetBtn.addEventListener("click", () => {
  startMusic();
  resetGame();
});

if (musicBtn) {
  updateMusicButton();
  musicBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    nextMusicTrack();
    musicBtn.blur();
  });
}

if (soundBtn) {
  updateSoundButton();
  soundBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleSound();
    soundBtn.blur();
  });
}

requestAnimationFrame(loop);
