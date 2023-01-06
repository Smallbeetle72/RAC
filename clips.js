// Position de départ pour lire un clip
const INDEX = 0;

// Paramétrage des limites de caractères pour les paramètres
const LOGIN_PARAM_CHARS_LIMIT = 20;
const PERIOD_PARAM_CHARS_LIMIT = 4;
const VIEW_PARAM_CHARS_LIMIT = 4;

// Position des informations dans le tableau réceptionné
const POS_TITLE = 0;
const POS_VIEW_COUNT = 1;
const POS_CREATOR = 2;
const POS_DATE_CREATION = 3;
const POS_DURATION = 4;
const POS_IMAGE = 5;
const POS_URL = 6;
const NB_DATA_PER_CLIP = 6;

// Pour requête et paramètres
const QUERY_STRING = window.location.search;
const URL_PARAMS = new URLSearchParams(QUERY_STRING);
const LOGIN = escape(URL_PARAMS.get('login'));              // Paramètre login obligatoire
const PERIOD = escape(URL_PARAMS.get('period'));            // Paramètre period obligatoire géré dans le fichier clips.php
const VIEW = escape(URL_PARAMS.get('view'));                // Paramètre view non obligatoire

// Eléments HTML
const CLIP_VIDEO = document.getElementById('clip-video');
const NO_CLIP_FOUND = document.getElementById('no-clip-found');
const CLIP_CONTENT = document.getElementById('clip-content');
const LIST_OF_CLIPS = document.getElementById('list-of-clips');
const DATA_FROM_CLIPS = document.getElementById('data-from-clips');
const DATA_CLIP = document.getElementById('data-clip');

// Initialisations
let index = INDEX;
let clips;

// Vérification des limites de caractères des paramètres
function isSizeOfParametersTooLong(login, period, view) {
    if(login.length > LOGIN_PARAM_CHARS_LIMIT || period.length > PERIOD_PARAM_CHARS_LIMIT || view.length > VIEW_PARAM_CHARS_LIMIT) {
        const message = `Limite de caractères dépassée pour au moins un des paramètres.`;
        NO_CLIP_FOUND.innerHTML += 'Limite de caractères dépassée pour au moins un des paramètres.';
        return;
    }
}

// Détermine si on est à la fin de la liste des clips : permet de reboucler
function isEndOfTheList() {
    let length = clips.length;
    return index == length-1;
}

// Récupération de tous les clips en fonction des paramètres period et view donnés
async function getClips() {
    try {
        const response = await fetch("./clips.php", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: `login=${LOGIN}&period=${PERIOD}&view=${VIEW}`,
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
    CLIP_VIDEO.setAttribute('src', clips[index]);
}

// Lecture bouclée sur tous les clips
async function runClips() {
    LIST_OF_CLIPS.remove();
    isSizeOfParametersTooLong(LOGIN, PERIOD, VIEW);

    clips = await getClips();

    if(clips === undefined || typeof clips[index] == 'undefined') {
        NO_CLIP_FOUND.innerHTML += 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
        CLIP_CONTENT.style.display = 'none';
    } else {
        NO_CLIP_FOUND.remove();
        DATA_FROM_CLIPS.remove();

        getClip(index);
        
        CLIP_VIDEO.addEventListener('ended', myHandler, false);
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

// Récupération des clips pour le format view = list
function getListOfClips() {
    for(i=0; i < clips.length; i++) {
        let date = new Date(clips[POS_DATE_CREATION + index + i]);

        LIST_OF_CLIPS.innerHTML +=
            '<div id="clip-information">' +
                '<section> ' +
                    '<a href="' + clips[POS_URL + index + i] + '">' +
                        '<img id="image" src="' + clips[POS_IMAGE + index + i] + '">' +
                    '</a>' +
                '</section>' +
                '<section id="clip-content-information">' +
                    '<b>Titre : </b>' + clips[POS_TITLE + index + i] + '</br>' +
                    '<b>Vues : </b>' + clips[POS_VIEW_COUNT + index + i] + '</br>' +
                    '<b>Créé par : </b>' + clips[POS_CREATOR + index + i] + '</br>' +
                    '<b>Le : </b>' + date.toLocaleDateString() +
                '</section>'
            '</div>';

            i = i + NB_DATA_PER_CLIP;
    }
}

// Affichage des données en view = list
async function showListOfClips() {
    isSizeOfParametersTooLong(LOGIN, PERIOD, VIEW);
   
    clips = await getClips();
    if(clips === undefined || typeof clips[index] == 'undefined') {
        NO_CLIP_FOUND.innerHTML = 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
    } else {
        CLIP_VIDEO.remove();
        DATA_FROM_CLIPS.remove();
        NO_CLIP_FOUND.remove();
        getListOfClips();        
    }
}

// Récupération des données des clips pour le format view = data
function getdataFromClips() {
    DATA_CLIP.innerHTML =
        '<tr>' +
            '<th>Titre</th>' +
            '<th>Vues</th>' +
            '<th>Créateur</th>' +
            '<th>Date de création</th>' +
            '<th>Durée</th>' +
        '</tr>';

    for(i=0; i < clips.length; i++) {
        DATA_CLIP.innerHTML +=
                '<tr>' +
                    '<td>' + clips[POS_TITLE + index + i] + '</td>' +
                    '<td>' + clips[POS_VIEW_COUNT + index + i] + '</td>' +
                    '<td>' + clips[POS_CREATOR + index + i] + '</td>' +
                    '<td>' + clips[POS_DATE_CREATION + index + i] + '</td>' +
                    '<td>' + clips[POS_DURATION + index + i] + '</td>'
                '</tr'
                ;

        i = i + NB_DATA_PER_CLIP;
    }
}

// Affichage des données en view = data
async function showDataClips() {
    isSizeOfParametersTooLong(LOGIN, PERIOD, VIEW);
   
    clips = await getClips();
    if(clips === undefined || typeof clips[index] == 'undefined') {
        NO_CLIP_FOUND.innerHTML = 'Aucun clip trouvé. </br> Vérifiez l\'orthographe de la chaine souhaitée ou retentez avec une période plus large.';
    } else {
        CLIP_CONTENT.remove();
        LIST_OF_CLIPS.remove();
        NO_CLIP_FOUND.remove();
        getdataFromClips();        
    }
}

// Lancement
if(VIEW.length > 0 && VIEW =='list') {
    showListOfClips();
} else if(VIEW.length > 0 && VIEW =='data') {
    showDataClips();
} else {
    runClips();
}
