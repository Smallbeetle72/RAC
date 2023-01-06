// Position de départ pour lire un clip
const INDEX = 0;

// Paramétrage des limites de caractères pour les paramètres
const PERIOD_PARAM_CHARS_LIMIT = 4;
const MAX_PARAM_CHARS_LIMIT = 3;

// Position des informations dans le tableau réceptionné
const POS_TITLE = 0;
const POS_VIEW_COUNT = 1;
const POS_CREATOR = 2;
const POS_DATE_CREATION = 3;
const POS_VIDEO = 5;

// Pour requête et paramètres
const QUERY_STRING = window.location.search;
const URL_PARAMS = new URLSearchParams(QUERY_STRING);
const PERIOD = escape(URL_PARAMS.get('period'));    // Paramètre période obligatoire géré dans le fichier customClips.php
let max = escape(URL_PARAMS.get('max'));            // Paramètre max non obligatoire

// Eléments HTML
const CLIP_FROM_DIV_CLIP_VIDEO = document.getElementById('clip-video');
const RANDOM_LOGO = document.getElementById('random-clip-logo');
const NO_CLIP_FOUND = document.getElementById('no-clip-found');
const CLIP_CONTENT = document.getElementById('clip-content');
const CLIP_TITLE = document.getElementById('h1-clip-title');
const CLIP_DETAILS = document.getElementById('h2-clip-details');
const NOISE_TV_SCREEN = document.getElementById('noise-tv-screen');

// Volume de la vidéo zapping (zap.mp4)
const VOLUME_NOISE_TV_SCREEN = 0.4;

// Initialisations
let index = INDEX;
let clips;
let noiseTVScreenVideo = './videos/zap.mp4';
let logos = [];

// Vérification des limites de caractères des paramètres
function isSizeOfParametersTooLong(period, max) {
    if(period.length > PERIOD_PARAM_CHARS_LIMIT || max.length > MAX_PARAM_CHARS_LIMIT) {
        const message = `Limite de caractères dépassée pour au moins un des paramètres.`;
        NO_CLIP_FOUND.innerHTML += message;
        CLIP_CONTENT.style.display = 'none';
        return;
    }
}

// Détermine le nombre pour le paramètre max (nombre maximum de clips souhaités)
if(max == 'null' || max == 'all') {
    max = 100;
} else {
    max = parseInt(max);
}

// Détermine si on est à la fin de la liste des clips : permet de reboucler
function isEndOfTheList() {
    let length = clips.length;
    return index == length-1;
}

// Affichage aléatoire d'un logo
function displayRandomLogo() {
    if(logos.length == 0) return;

    randomIndex = Math.floor(Math.random() * logos.length);
    
    RANDOM_LOGO.src = './images/' + logos[randomIndex];
}

// Récupération et chargement de tous les logos pour éviter de rappeler la méthode pour la partie aléatoire
async function loadLogos() {
    try {
        const response = await fetch("./logos.php", {
            method: "GET",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
        });
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const allLogos = await response.text();

        parsedJson = JSON.parse(allLogos);
        values = Object.values(parsedJson);

        logos = values;
    } catch (error) {
        // TODO : gérer cas d'erreur
    }
}

// Récupération de tous les clips en fonction des paramètres période et max donnés
async function getClips() {
    try {
        const response = await fetch("./customClips.php", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: `period=${PERIOD}&max=${max}`,
        });
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const allClips = await response.json();

        return allClips;
    } catch (error) {
        // TODO : gérer cas d'erreur
    }
}

// Affichage des données d'un clip et lecture de ce dernier
function displayDataAndPlayClip(clip) {
    // On lit en premier la vidéo zapping (zap.mp4) et on cache la partie clip
    NOISE_TV_SCREEN.play();
    NOISE_TV_SCREEN.onplay = function () {
        CLIP_FROM_DIV_CLIP_VIDEO.style.display = 'none';
        NOISE_TV_SCREEN.style.display = 'block';
    }

    // On affiche les données et on lit le clip quand on arrive à la fin de la vidéo zapping (zap.mp4)
    NOISE_TV_SCREEN.onended = function () {
        displayRandomLogo();

        CLIP_TITLE.innerHTML = clip[POS_TITLE];

        let date = new Date(clip[POS_DATE_CREATION]);    
        CLIP_DETAILS.innerHTML = 'Clipé par : ' + clip[POS_CREATOR] + ' - Le ' + date.toLocaleDateString() + ' - ' + clip[POS_VIEW_COUNT] + ' vues';

        CLIP_FROM_DIV_CLIP_VIDEO.src = clip[POS_VIDEO];
        CLIP_FROM_DIV_CLIP_VIDEO.play();
        CLIP_FROM_DIV_CLIP_VIDEO.style.display = 'block';
    }

    // On cache et on met en pause la video zapping (zap.mp4) quand le clip est en lecture
    CLIP_FROM_DIV_CLIP_VIDEO.onplay = function () {
        NOISE_TV_SCREEN.pause();
        NOISE_TV_SCREEN.style.display = 'none';
    }
}

// Lecture bouclée sur tous les clips
async function runClips() {
    NOISE_TV_SCREEN.style.display = 'none';

    isSizeOfParametersTooLong(PERIOD, max);

    clips = await getClips();

    if(clips === undefined || typeof clips[index] == 'undefined') {
        NO_CLIP_FOUND.innerHTML += 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
        CLIP_CONTENT.style.display = 'none';
    } else {
        NO_CLIP_FOUND.remove();

        NOISE_TV_SCREEN.src = noiseTVScreenVideo;
        NOISE_TV_SCREEN.volume = VOLUME_NOISE_TV_SCREEN;

        displayDataAndPlayClip(clips[index]);

        CLIP_FROM_DIV_CLIP_VIDEO.onended = function () {
            if(isEndOfTheList()) {
                index = INDEX;
                displayDataAndPlayClip(clips[index]);
            } else {
                displayDataAndPlayClip(clips[++index]);
            }
        };
    }
}

// Attente du chargement des logos avant de lancer les clips
async function loadPage() {
    await loadLogos();
    runClips();
}

loadPage();
