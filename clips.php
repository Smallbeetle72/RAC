<?php

    include 'queries-params.php'; // Récupération des résultats des requêtes (access token et broadcaster id)

    // Remplacement de l'URL de l'image d'un clip pour en faire un lien vers la vidéo
    function replaceThumbnailUrlToVideoUrl($config, $thumbnailUrl) {
        $videoUrl = preg_replace('/-preview-[A-Za-z_0-9]*.jpg/', '.mp4', $thumbnailUrl);
        return $videoUrl;
    }

    // Détermine la période à cibler : si all ou pas de paramètre par défaut on ratisse large à 120 mois (10 ans) sinon on prend le nombre de jours en paramètre de l'URL ($period)
    function getEndedDate($period) {
        if($period == 'all') {
            $endedDate = date("Y-m-d\TH:i:sP", strtotime("-120 months"));
        } else {
            $endedDate = date("Y-m-d\TH:i:sP", strtotime("-" . $period . 'days'));
        }
        
        $endedDateEncoded = urlencode($endedDate);

        return $endedDateEncoded;
    }

    // Récupération de tous les clips en fonction de la période et du nombre max de clips souhaités + broadcaster id
    function getClips($config, $login, $period, $view) {
        $curl_clips = curl_init($config['getClips'] .
                        '?broadcaster_id=' . getBroadcasterIdFromLogin($config, $login) . 
                        '&client-ID=' . $config['client_id'] . 
                        '&started_at=' . getEndedDate($period) . 
                        '&ended_at=' . urlencode(date("Y-m-d\TH:i:sP", time())) .
                        '&first=100');

        initCurlOpt($config, $curl_clips, 'GET');
        curl_setopt($curl_clips, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer ' . getAccessToken($config), 'client-ID: ' . $config['client_id']));

        $getClips = curl_exec($curl_clips);

        $clips = [];

        if($getClips === false) {
            // TODO : gérer cas d'erreur
        } else {
            if(curl_getinfo($curl_clips, CURLINFO_HTTP_CODE) === 200) {
                $getClips = json_decode($getClips, true);
                // Récupération des données et mélange des clips
                foreach($getClips['data'] as $clip) {
                    if(isset($view) && $view == 'list' || $view =='data') {
                        array_push($clips, $clip['title'], $clip['view_count'], $clip['creator_name'], $clip['created_at'], $clip['duration'], $clip['thumbnail_url'], $clip['url']);
                    } else {
                        array_push($clips, replaceThumbnailUrlToVideoUrl($config, $clip['thumbnail_url']));
                        shuffle($clips);
                    }
                }
            } else {
                die("Code : " . curl_getinfo($curl_clips, CURLINFO_HTTP_CODE) . "</br> A problem getting access token occured");
            }
        }
        curl_close($curl_clips);

        if(isset($clips)) {
            return json_encode($clips, JSON_UNESCAPED_SLASHES);
        }
    }

    $login = htmlspecialchars($_POST['login']) ?? '';
    $period = htmlspecialchars($_POST['period']) ?? '';
    $view = htmlspecialchars($_POST['view']) ?? '';

    if(strlen($login) > 20 || strlen($period) > 4 || strlen($view) > 4) {
        die("Limite de caractères dépassée pour au moins un des paramètres.");
    } else {
        echo getClips($config, $login, $period, $view);
    }
    
?>
