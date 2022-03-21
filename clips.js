const INDEX = 0;
const LOGIN_CHARS_LIMIT = 20;
const PERIOD_CHARS_LIMIT = 4;

let index = INDEX;
let clips;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const login = escape(urlParams.get('login'));
const period = escape(urlParams.get('period'));

function isSizeOfParametersTooLong(login, period) {
    return (login.length >= LOGIN_CHARS_LIMIT || period.length >= PERIOD_CHARS_LIMIT) ;
}

async function getClips() {
    try {
        const response = await fetch("./clips.php", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: `login=${login}&period=${period}`,
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

function getClip(index) {
    document.getElementById('clip').setAttribute('src', clips[index]);
}

function isEndOfTheList() {
    let length = clips.length;
    return index == length-1;
}

async function runClip() {
    if(isSizeOfParametersTooLong(login, period)) {
        const message = `Limite de caractères dépassée pour au moins un des paramètres.`;
        document.getElementById('noClipFound').innerHTML += 'Limite de caractères dépassée pour au moins un des paramètres.';
        return;
    }
   
    clips = await getClips();
    if(clips === undefined || typeof clips[index] == 'undefined') {
        document.getElementById("noClipFound").innerHTML += 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
    } else {
        document.getElementById('noClipFound').remove();

        clips.forEach(clip => {
            clip.load; // On charge d'avance tous les clips pour éviter les latences entre chaque vidéo
        });

        getClip(index);
        
        document.getElementById('clip').addEventListener('ended', myHandler, false);
        function myHandler(e) {
            if(!e) { e = window.event; }
            if(isEndOfTheList()) {
                index = INDEX;
                getClip(index);
            } else {
                getClip(++index);
            }
        }
    }
}

runClip();