<?php
    
/*
    // Distant
    $config = array(
        'client_id' => 'client_id_distant',
        'client_secret' => 'client_secret_distant',
        'getAccessToken' => 'https://id.twitch.tv/oauth2/token',
        'getBroadcasterIdFromLogin' => 'https://api.twitch.tv/helix/users',
        'getClips' => 'https://api.twitch.tv/helix/clips'
    );
*/

    // Local
    $config = array(
        'client_id' => 'client_id_local',
        'client_secret' => 'client_secret_local',
        'cert' => 'path_to_cacert\cacert.crt',
        'getAccessToken' => 'https://id.twitch.tv/oauth2/token',
        'getBroadcasterIdFromLogin' => 'https://api.twitch.tv/helix/users',
        'getClips' => 'https://api.twitch.tv/helix/clips'
    );
    
?>