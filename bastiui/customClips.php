<?php

    include '../queries-params.php'; // Récupération des résultats des requêtes (access token et broadcaster id)

    // Définition du fuseau horaire pour le fichier de log
    date_default_timezone_set('Europe/Paris');

    // Remplacement de l'URL de l'image d'un clip pour en faire un lien vidéo
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

    // Récupération de l'URL utilisée avec ses paramètres pour le fichier de log
    function getUrl() {
        $scheme = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $script = $_SERVER['SCRIPT_NAME'];
        $query = http_build_query([
            'period' => htmlspecialchars($_POST['period']),
            'max' => htmlspecialchars($_POST['max'])
        ]);
        return "$scheme://$host$script?$query";
    }

    // Récupération de tous les clips en fonction de la période et du nombre max de clips souhaités + broadcaster id
    function getClips($config, $period, $max) {
        $login = $config['login'];
        $startDate = getEndedDate($period);
        $endDate = urlencode(date("Y-m-d\TH:i:sP", time()));
        $url = $config['getClips'] .
            '?broadcaster_id=' . getBroadcasterIdFromLogin($config, $login) .
            '&client-ID=' . $config['client_id'] . 
            '&started_at=' . $startDate . 
            '&ended_at=' . $endDate .
            '&first=' . $max;

        $curl_clips = curl_init($url);

        initCurlOpt($config, $curl_clips, 'GET');
        curl_setopt($curl_clips, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer ' . getAccessToken($config), 'client-ID: ' . $config['client_id']));

        $getClips = curl_exec($curl_clips);

        $clips = [];
        $ignoredUrls = [];

        if($getClips === false) {
            // TODO : gérer cas d'erreur
        } else {
            if(curl_getinfo($curl_clips, CURLINFO_HTTP_CODE) === 200) {
                $getClips = json_decode($getClips, true);
                // Récupération des données et mélange des clips
                foreach($getClips['data'] as $clip) {
                    $videoUrl = replaceThumbnailUrlToVideoUrl($config, $clip['thumbnail_url']);
                    
                    // Ignorer les clips avec URL contenant 'static-cdn'
                    if (strpos($videoUrl, 'static-cdn') !== false) {
                        // Ajouter l'URL ignorée à la liste
                        $ignoredUrls[] = $videoUrl;
                        continue;
                    }

                    // Tableau intermédiaire obligatoire pour stocker les données et pouvoir ensuite les mélanger par clip sans mélanger les données elles-mêmes
                    $clipData = [];
                    array_push($clipData, $clip['title'], $clip['view_count'], $clip['creator_name'], $clip['created_at'], $clip['duration'], $videoUrl, $clip['url']);
                    array_push($clips, $clipData);
                    shuffle($clips);
                }

                // Enregistrement des paramètres et les URLs ignorées dans un fichier de log
                if (!empty($ignoredUrls)) {
                    $logFile = 'ignored_urls.log';
                    $date = date("d/m/Y H:i");
                    $logContent = "$date\nParamètres utilisés :\n$url\nURL : " . getUrl() . "\n\n" . implode(PHP_EOL, $ignoredUrls) . PHP_EOL . PHP_EOL;
                    file_put_contents($logFile, $logContent, FILE_APPEND);
                }
            } else {
                die("Code : " . curl_getinfo($curl_clips, CURLINFO_HTTP_CODE) . "</br> A problem getting access token occurred");
            }
        }
        curl_close($curl_clips);

        if(isset($clips)) {
            return json_encode($clips, JSON_UNESCAPED_SLASHES);
        }
    }

    // Sécurité sur les paramètres
    $period = htmlspecialchars($_POST['period']) ?? '';
    $max = htmlspecialchars($_POST['max']) ?? '';

    // Vérification des limites de caractères pour les paramètres période et max
    if(strlen($period) > 3 || strlen($max) > 3) {
        die("Limite de caractères dépassée pour au moins un des paramètres.");
    } else {
        echo getClips($config, $period, $max);
    }

?>
