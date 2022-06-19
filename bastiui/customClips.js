const INDEX = 0;
const PERIOD_CHARS_LIMIT = 4;
const MAX_CHARS_LIMIT = 3;

const POS_TITLE = 0;
const POS_VIEW_COUNT = 1;
const POS_CREATOR = 2;
const POS_DATE_CREATION = 3;
const POS_DURATION = 4;
const POS_VIDEO = 5;
const POS_URL = 6;
const NB_INFO_PER_CLIP = 6;
const NB_LOGOS = 4;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const period = escape(urlParams.get('period'));
max = escape(urlParams.get('max'));

const clipFromDivClip = document.getElementById('clip');
const randomLogo = document.getElementById('random-logo');
const noClipFound = document.getElementById('no-clip-found');
const content = document.getElementById('content');
const title = document.getElementById('h1-title');
const details = document.getElementById('h2-details');
const noiseTVScreen = document.getElementById('noise-tv-screen');
const sidebarClip = document.getElementById('sidebar-clip');

let index = INDEX;
let clips;
let audio = new Audio('./sounds/zapping-sound.wav');

function isSizeOfParametersTooLong(period, max) {
    if(period.length > PERIOD_CHARS_LIMIT || max.length > MAX_CHARS_LIMIT) {
        const message = `Limite de caractères dépassée pour au moins un des paramètres.`;
        noClipFound.innerHTML += message;
        content.style.display = 'none';
        return;
    }
}

if(max == 'null' || max == 'all') {
    max = 100;
} else {
    max = parseInt(max) + 1; // l'API ne renvoit que N-1 résultats
}

function isEndOfTheList() {
    let length = clips.length;
    return index == length-1;
}

function displayRandomLogo() {
    let last = -1;
    let value;
    
    do {
        value = Math.floor(Math.random() * NB_LOGOS) + 1;
    } while (value === last);
    last = value;

    randomLogo.src = './images/Logo ' + value + '.png';
}

async function getClips() {
    try {
        const response = await fetch("./customClips.php", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: `period=${period}&max=${max}`,
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

function displayDataAndPlayClip(clip) {
    

    audio.play();
    audio.onplay = function () {
        clipFromDivClip.style.display = 'none';
        noiseTVScreen.style.display = 'block';
    }

    audio.onended = function () {
        displayRandomLogo();

        title.innerHTML = clip[POS_TITLE];

        let date = new Date(clip[POS_DATE_CREATION]);    
        details.innerHTML = 'Clipé par : ' + clip[POS_CREATOR] + ' - Le ' + date.toLocaleDateString() + ' - ' + clip[POS_VIEW_COUNT] + ' vues';

        clipFromDivClip.src = clip[POS_VIDEO];
        clipFromDivClip.play();
        clipFromDivClip.style.display = 'block';
    }

    clipFromDivClip.onplay = function () {
        audio.pause();
        noiseTVScreen.style.display = 'none';
    }
}

async function runClips() {
    noiseTVScreen.style.display = 'none';

    isSizeOfParametersTooLong(period, max);

    clips = await getClips();

    if(clips === undefined || typeof clips[index] == 'undefined') {
        noClipFound.innerHTML += 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
        content.style.display = 'none';
    } else {
        noClipFound.remove();

        displayDataAndPlayClip(clips[index]);

        clipFromDivClip.onended = function () {
            if(isEndOfTheList()) {
                index = INDEX;
                displayDataAndPlayClip(clips[index]);
            } else {
                displayDataAndPlayClip(clips[++index]);
            }
        };
    }
}

runClips();
