<?php 
    $directoryLogos = './images';
    $files = scandir($directoryLogos);                                  // Scan du répertoire pour lister tous les fichiers

    $logos = array_diff(scandir($directoryLogos), array('..', '.'));    // Filtre pour supprimer les parents du répertoire . et ..
    
    if(isset($logos)) {
        echo json_encode($logos, JSON_UNESCAPED_SLASHES);               // Récupération de tous les logos
    }
?>