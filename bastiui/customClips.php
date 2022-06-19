<?php

    include '../queries-params.php';

    function replaceThumbnailUrlToVideoUrl($config, $thumbnailUrl) {
        $videoUrl = preg_replace('/-preview-[A-Za-z_0-9]*.jpg/', '.mp4', $thumbnailUrl);
        return $videoUrl;
    }

    function getEndedDate($period) {
        if($period == 'all') {
            $endedDate = date("Y-m-d\TH:i:sP", strtotime("-1200 months"));
        } else {
            $endedDate = date("Y-m-d\TH:i:sP", strtotime("-" . $period . 'days'));
        }
        
        $endedDateEncoded = urlencode($endedDate);

        return $endedDateEncoded;
    }

    function getClips($config, $period, $max) {
        $login = 'bastiui';

        $curl_clips = curl_init($config['getClips'] .
                    '?broadcaster_id=' . getBroadcasterIdFromLogin($config, $login) . 
                    '&client-ID=' . $config['client_id'] . 
                    '&started_at=' . getEndedDate($period) . 
                    '&ended_at=' . urlencode(date("Y-m-d\TH:i:sP", time())) .
                    '&first=' . $max);

        initCurlOpt($config, $curl_clips, 'GET');
        curl_setopt($curl_clips, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer ' . getAccessToken($config), 'client-ID: ' . $config['client_id']));

        $getClips = curl_exec($curl_clips);

        $clips = [];

        if($getClips === false) {
            // TODO : gérer cas d'erreur
        } else {
            if(curl_getinfo($curl_clips, CURLINFO_HTTP_CODE) === 200) {
                $getClips = json_decode($getClips, true);
                foreach($getClips['data'] as $clip) {
                    $clipData = [];
                    array_push($clipData , $clip['title'], $clip['view_count'], $clip['creator_name'], $clip['created_at'], $clip['duration'], replaceThumbnailUrlToVideoUrl($config, $clip['thumbnail_url']), $clip['url']);
                    array_push($clips, $clipData);
                    shuffle($clips);
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

    $period = htmlspecialchars($_POST['period']) ?? '';
    $max = htmlspecialchars($_POST['max']) ?? '';

    if(strlen($period) > 4 || strlen($max) > 3) {
        die("Limite de caractères dépassée pour au moins un des paramètres.");
    } else {
        echo getClips($config, $period, $max);
    }
    
?>