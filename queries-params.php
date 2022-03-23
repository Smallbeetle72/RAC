<?php
    include 'config.php';
        
    function initCurlOpt($config, $resource, $customRequest) {
        curl_setopt_array($resource, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CAINFO => $config['cert'], // A garder seulement pour localhost
            CURLOPT_TIMEOUT => 2, // secondes
            CURLOPT_CUSTOMREQUEST => $customRequest
        ]);
    }

    function getAccessToken($config) {
        $curl_token = curl_init($config['getAccessToken'] .
                        '?client_id=' . $config['client_id'] .
                        '&client_secret=' . $config['client_secret'] .
                        '&grant_type=client_credentials');

        initCurlOpt($config, $curl_token, 'POST');
        
        $accessToken = curl_exec($curl_token);

        if($accessToken === false) {
            // TODO : gérer cas d'erreur
        } else {
            if(curl_getinfo($curl_token, CURLINFO_HTTP_CODE) === 200) {
                $accessToken = json_decode($accessToken, true); 
                return $accessToken['access_token'];
            } else {
                die("Code : " . curl_getinfo($curl_token, CURLINFO_HTTP_CODE) . "</br> A problem getting access token occured");
            }
        }

        curl_close($curl_token);
    }

    function getBroadcasterIdFromLogin($config, $login) {
        $curl_broadcasterId = curl_init($config['getBroadcasterIdFromLogin'] .
                        '?login=' . $login);

        initCurlOpt($config, $curl_broadcasterId, 'GET');
        curl_setopt($curl_broadcasterId, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Bearer ' . getAccessToken($config), 'client-ID: ' . $config['client_id']));
        
        $broadcasterId = curl_exec($curl_broadcasterId);

        if($broadcasterId === false) {
            // TODO : gérer cas d'erreur
        } else {
            if(curl_getinfo($curl_broadcasterId, CURLINFO_HTTP_CODE) === 200) {
                $broadcasterId = json_decode($broadcasterId, true);
                return $broadcasterId['data'][0]['id'];
            } else {
                die("Code : " . curl_getinfo($curl_broadcasterId, CURLINFO_HTTP_CODE) . "</br> A problem getting access token occured");
            }
        }

        curl_close($curl_broadcasterId);
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
?>