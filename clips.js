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
    document.getElementById('imgClip').setAttribute('src', clips[index]);
    document.getElementById('imgClip').setAttribute('alt', clips[index]);
}

async function runClip() {
    if(isSizeOfParametersTooLong(login, period)) {
        const message = `Limite de caractères dépassée pour au moins un des paramètres.`;
        document.getElementById('imgParameterTooLong').setAttribute('src', './images/parameterTooLong.png');
        return;
    }
   
    
    clips = await getClips();
    if(clips === 'undefined' || typeof clips[index] == 'undefined') {
        document.getElementById("imgNoClipFound").setAttribute('src', './images/noclipfound.png');
    } else {
        let length = clips.length;
        getClip(index);
        document.getElementById('clip').addEventListener('ended', myHandler, false);
        function myHandler(e) {
            if(!e) { e = window.event; }
            if(index == length-1) {
                index = INDEX;
                getClip(index);
            } else {
                getClip(++index);
            }   
        }

    }

}

runClip();