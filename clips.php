<?php

    function initCurlOpt($resource, $customRequest) {
        curl_setopt_array($resource, [
            CURLOPT_CAINFO => 'C:\wamp64\bin\php\php7.4.26\extras\cacert.crt',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 2,
            CURLOPT_CUSTOMREQUEST => $customRequest
        ]);
    }

    function getAccessToken() {
        include 'config.php';

        $curl_token = curl_init('https://id.twitch.tv/oauth2/token?client_id=' . $config['client_id'] . '&client_secret=' . $config['client_secret'] . '&grant_type=client_credentials');

        initCurlOpt($curl_token, 'POST');
        
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

    //echo getAccessToken();

    function getBroadcasterIdFromLogin($login) {
        include 'config.php';

        $curl_broadcasterId = curl_init('https://api.twitch.tv/helix/users?login=' . $login);

        initCurlOpt($curl_broadcasterId, 'GET');
        curl_setopt($curl_broadcasterId, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer ' . getAccessToken(), 'client-ID: ' . $config['client_id']));
        
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


    function getClips($login) {
        include 'config.php';
        
        $curl_clips = curl_init('https://api.twitch.tv/helix/clips?broadcaster_id=' . getBroadcasterIdFromLogin($login) . '&client-ID=' . $config['client_id']);

        initCurlOpt($curl_clips, 'GET');
        curl_setopt($curl_clips, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer ' . getAccessToken(), 'client-ID: ' . $config['client_id']));

        $clips = curl_exec($curl_clips);

        if($clips === false) {
            var_dump(curl_error($curl_clips));
        } else {
            if(curl_getinfo($curl_clips, CURLINFO_HTTP_CODE) === 200) {
                // Pagination
                //$clips = json_decode($clips, true);
                //$cursorPagination = $clips['pagination']['cursor'];

                return $clips;
            } else {
                echo 'error dude'; // TODO
            }
        }
        
        curl_close($curl_clips);
        
    }

    echo getClips("bastiui");

    
?>