<?php

    include 'config.php';
    
    function initCurlOpt($config, $resource, $customRequest) {
        curl_setopt_array($resource, [
            CURLOPT_CAINFO => $config['cert'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 2,
            CURLOPT_CUSTOMREQUEST => $customRequest
        ]);
    }

    function getAccessToken($config) {
        $curl_token = curl_init('https://id.twitch.tv/oauth2/token?client_id=' . $config['client_id'] . '&client_secret=' . $config['client_secret'] . '&grant_type=client_credentials');

        initCurlOpt($config, $curl_token, 'POST');
        
        $accessToken = curl_exec($curl_token);
    
        if($accessToken === false) {
            var_dump(curl_error($curl_token));
        } else {
            if(curl_getinfo($curl_token, CURLINFO_HTTP_CODE) === 200) {
                $accessToken = json_decode($accessToken, true); 
                return $accessToken['access_token'];
            } else {
                echo 'error dude'; // TODO
            }
        }
    
        curl_close($curl_token);
    }

    //echo getAccessToken($config);

    function getBroadcasterIdFromLogin($config, $login) {
        $curl_broadcasterId = curl_init('https://api.twitch.tv/helix/users?login=' . $login);

        initCurlOpt($config, $curl_broadcasterId, 'GET');
        curl_setopt($curl_broadcasterId, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer ' . getAccessToken($config), 'client-ID: ' . $config['client_id']));
        
        $broadcasterId = curl_exec($curl_broadcasterId);
    
        if($broadcasterId === false) {
            var_dump(curl_error($curl_broadcasterId));
        } else {
            if(curl_getinfo($curl_broadcasterId, CURLINFO_HTTP_CODE) === 200) {
                $broadcasterId = json_decode($broadcasterId, true);
                return $broadcasterId['data'][0]['id'];
            } else {
                echo 'error dude'; // TODO
            }
        }
    
        curl_close($curl_broadcasterId);
    }

    //echo getBroadcasterIdFromLogin('bastiui');

    function replaceThumbnailUrlToVideoUrl($config, $thumbnailUrl) {
        $videoUrl = preg_replace('/-preview-[A-Za-z_0-9]*.jpg/', '.mp4', $thumbnailUrl);
        return $videoUrl;
    }

    function getEndedDate($period) {
        switch($period) {
            case "all":
                $endedDate = date("Y-m-d\TH:i:sP", strtotime("-1200 months"));
                break;
            case "day":
                $endedDate = date("Y-m-d\TH:i:sP", strtotime("-1 day"));
                break;
            case "week":
                $endedDate = date("Y-m-d\TH:i:sP", strtotime("-1 week"));
                break;
            case "month":
                $endedDate = date("Y-m-d\TH:i:sP", strtotime("-1 month"));
                break;
            case "trim":
                $endedDate = date("Y-m-d\TH:i:sP", strtotime("-3 months"));
                break;
            case "year":
                $endedDate = date("Y-m-d\TH:i:sP", strtotime("-12 months"));
                break;
        }
        
        $endedDateEncoded = urlencode($endedDate);

        return $endedDateEncoded;
    }

    function getClips($config, $login) {
        $cursorPagination = '';

        $curl_clips = curl_init('https://api.twitch.tv/helix/clips?broadcaster_id=' . getBroadcasterIdFromLogin($config, $login) . 
            '&client-ID=' . $config['client_id'] . 
            '&started_at=' . getEndedDate("week") . 
            '&ended_at=' . urlencode(date("Y-m-d\TH:i:sP", time())) );
                    
        initCurlOpt($config, $curl_clips, 'GET');
        curl_setopt($curl_clips, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer ' . getAccessToken($config), 'client-ID: ' . $config['client_id']));

        $clips = curl_exec($curl_clips);

        if($clips === false) {
            var_dump(curl_error($curl_clips));
        } else {
            if(curl_getinfo($curl_clips, CURLINFO_HTTP_CODE) === 200) {

                // TODO : pagination pour récupérer tous les résultats sur period donnée : all/day/week/month
                $clips = json_decode($clips, true);
                $cursorPagination = $clips['pagination']['cursor'];

                foreach($clips['data'] as $clip) {
                    $videoUrls[] = replaceThumbnailUrlToVideoUrl($config, $clip['thumbnail_url']);
                }

                shuffle($videoUrls);

                /*foreach($videoUrls as $videoUrl) {
                    // TODO : vérifier la fin de la vidéo en cours avant de lancer la prochaine
                    
                }*/

                $style = 'position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;';
                echo '<div id="background" style="' . $style . ' background-color: #202020">
                        <video id="clip" autoplay="true" type="video/mp4" src="' . $videoUrls[0] . '" style="'. $style .'">
                            <img src="" alt="' . $videoUrls[0] . '" title="Your browser does not support the video tag">
                        </video>
                    </div>';

                //return $clips;
            } else {
                echo 'error dude'; // TODO
            }
        }
        
        curl_close($curl_clips);
        
    }

    echo getClips($config, "bastiui");

    
?>