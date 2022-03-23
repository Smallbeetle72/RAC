const INDEX = 0;
const LOGIN_CHARS_LIMIT = 20;
const PERIOD_CHARS_LIMIT = 4;
const VIEW_CHARS_LIMIT = 4;

const POS_TITLE = 0;
const POS_VIEW_COUNT = 1;
const POS_CREATOR = 2;
const POS_DATE_CREATION = 3;
const POS_DURATION = 4;
const POS_IMAGE = 5;
const POS_URL = 6;
const NB_INFO_PER_CLIP = 6;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const login = escape(urlParams.get('login'));
const period = escape(urlParams.get('period'));
const view = escape(urlParams.get('view'));

let index = INDEX;
let clips;

function isSizeOfParametersTooLong(login, period, view) {
    if(login.length > LOGIN_CHARS_LIMIT || period.length > PERIOD_CHARS_LIMIT || view.length > VIEW_CHARS_LIMIT) {
        const message = `Limite de caractères dépassée pour au moins un des paramètres.`;
        document.getElementById('noClipFound').innerHTML += 'Limite de caractères dépassée pour au moins un des paramètres.';
        return;
    }
}

async function getClips() {
    try {
        const response = await fetch("./clips.php", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: `login=${login}&period=${period}&view=${view}`,
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
    document.getElementById('listOfClips').remove();
    isSizeOfParametersTooLong(login, period, view);
   
    clips = await getClips();
    if(clips === undefined || typeof clips[index] == 'undefined') {
        document.getElementById("noClipFound").innerHTML += 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
    } else {
        document.getElementById('noClipFound').remove();
        document.getElementById('dataFromClips').remove();

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

function getListOfClips() {
    for(i=0; i < clips.length; i++) {
        let date = new Date(clips[POS_DATE_CREATION + index + i]);

        document.getElementById('listOfClips').innerHTML +=
            '<div class="clipInformation">' +
                '<section> ' +
                    '<a href="' + clips[POS_URL + index + i] + '">' +
                        '<img class="image" src="' + clips[POS_IMAGE + index + i] + '">' +
                    '</a>' +
                '</section>' +
                '<section class="information">' +
                    '<b>Titre : </b>' + clips[POS_TITLE + index + i] + '</br>' +
                    '<b>Vues : </b>' + clips[POS_VIEW_COUNT + index + i] + '</br>' +
                    '<b>Créé par : </b>' + clips[POS_CREATOR + index + i] + '</br>' +
                    '<b>Le : </b>' + date.toLocaleDateString() +
                '</section>'
            '</div>';

            i = i + NB_INFO_PER_CLIP;
    }
}

async function showListOfClips() {
    isSizeOfParametersTooLong(login, period, view);
   
    clips = await getClips();
    if(clips === undefined || typeof clips[index] == 'undefined') {
        document.getElementById("noClipFound").innerHTML = 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
    } else {
        document.getElementById('clip').remove();
        document.getElementById('dataFromClips').remove();
        document.getElementById('noClipFound').remove();
        getListOfClips();        
    }
}

function getdataFromClips() {
    document.getElementById('data').innerHTML =
        '<tr>' +
            '<th>Titre</th>' +
            '<th>Vues</th>' +
            '<th>Créateur</th>' +
            '<th>Date de création</th>' +
            '<th>Durée</th>' +
        '</tr>';

    for(i=0; i < clips.length; i++) {
        document.getElementById('data').innerHTML +=
                '<tr>' +
                    '<td>' + clips[POS_TITLE + index + i] + '</td>' +
                    '<td>' + clips[POS_VIEW_COUNT + index + i] + '</td>' +
                    '<td>' + clips[POS_CREATOR + index + i] + '</td>' +
                    '<td>' + clips[POS_DATE_CREATION + index + i] + '</td>' +
                    '<td>' + clips[POS_DURATION + index + i] + '</td>'
                '</tr'
                ;

        i = i + NB_INFO_PER_CLIP;
    }
}

async function showDataClips() {
    isSizeOfParametersTooLong(login, period, view);
   
    clips = await getClips();
    if(clips === undefined || typeof clips[index] == 'undefined') {
        document.getElementById("noClipFound").innerHTML = 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
    } else {
        document.getElementById('clip').remove();
        document.getElementById('listOfClips').remove();
        document.getElementById('noClipFound').remove();
        getdataFromClips();        
    }
}

if(view.length > 0 && view =='list') {
    showListOfClips();
} else if(view.length > 0 && view =='data') {
    showDataClips();
} else {
    runClip();
}