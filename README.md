# BEST OF CLIPS

Best of clips permet de lire des clips Twitch aléatoirement pour une chaine donnée et sur une période donnée.  
Le projet a été développé pour être intégré dans un wait screen sur Twitch pour la chaine de BastiUi.


## **Lancement**

Se rendre sur l'URL https://bastiui.alwaysdata.net/?login=[...]&period=[...]&view=[...] (cas classique tous comptes confondus)  
Se rendre sur l'URL https://bastiui.alwaysdata.net/bastiui/?period=[...]&max=[...] (cas customisé pour la chaine BastiUi)


### Paramètres

- **login** : le nom de la chaine souhaitée (cas classique)
- **period** : la fourchette de temps souhaitée en nombre de jours &rarr; pour tous les clips jusqu'à une limite de 100 clips au total inscrire "all". Il s'agit du top 100 clips dans ce cas, c'est à dire les 100 clips les plus vus.
- **view** (optionnel) : deux types de vue permettent de visualiser les clips en vue liste de vidéo ou vu par tableau de données &rarr; vue liste = "list", vue données = "data". Si ce paramètre est renseigné, les vidéos ne se lisent pas, il s'agit uniquement d'une vue d'ensemble. Dans le cas d'une vue liste les vidéos sont cliquables.
- **max** (optionnel) : le nombre maximum de clips à récupérer.


Exemples d'URL possibles cas classique :

https://bastiui.alwaysdata.net/?login=bastiui&period=1  
https://bastiui.alwaysdata.net/?login=bastiui&period=7  
https://bastiui.alwaysdata.net/?login=bastiui&period=30  
https://bastiui.alwaysdata.net/?login=bastiui&period=all

https://bastiui.alwaysdata.net/?login=bastiui&period=all&view=list  
https://bastiui.alwaysdata.net/?login=bastiui&period=all&view=data

**NB** : dans le cas d'une requête sans paramètre "view" tous les clips sont mélangés et lus en boucle ensuite. Sinon, ils seront rangés dans l'ordre si le paramètre "view" est renseigné.

Exemples d'URL possibles cas customisé spécialement pour la chaine de BastiUi :

https://bastiui.alwaysdata.net/bastiui/?period=1  
https://bastiui.alwaysdata.net/bastiui/?period=7  
https://bastiui.alwaysdata.net/bastiui/?period=30  
https://bastiui.alwaysdata.net/bastiui/?period=all

https://bastiui.alwaysdata.net/bastiui/?period=all&max=1  
https://bastiui.alwaysdata.net/bastiui/?period=all&max=100  
https://bastiui.alwaysdata.net/bastiui/?period=all&max=all


## **Configurer le navigateur pour autoriser la lecture automatique**

Il se peut que les vidéos ne se lancent pas, votre navigateur n'autorise sûrement pas le son et/ou la vidéo.

Si la lecture des vidéos se lance automatiquement, passer cette étape.

### Mozilla Firefox

- Cliquer sur l'icône cadenas à côté de l'URL.
- Cliquer sur "Connexion sécurisée".
- Cliquer sur "Plus d'informations".
- Aller sur "Permissions" et dans la rubrique "Lire automatiquement des médias" décocher "Permisions par défaut".
- Cocher "Autoriser l'audio et la vidéo".
- Rafraichir la page.

### Google Chrome

- Cliquer sur l'icône cadenas à côté de l'URL.
- Cliquer sur "Paramètres de site".
- Dans la rubrique "Autorisations" puis "Son" sélectionner "Autoriser" dans la liste déroulante.
- Rafraichir la page.

**NB** : il n'y a pas de mention vidéo.

### Microsoft Edge

- Cliquer sur l'icône cadenas à côté de l'URL.
- Cliquer sur "Autorisations de ce site".
- Dans le menu gauche cliquer sur "Cookies et Autorisations de ce site".
- Cliquer sur "Lecture automatique du support".
- Dans la rubrique "Contrôler si le son et la vidéo sont lus automatiquement sur les sites" sélectionner "Autoriser".
- Rafraichir la page.

## **Remerciements**

Je remercie BastiUI de m'avoir fait confiance sur ce projet et de sa disponibilité pour les feedbacks.
Je remercie également Jérémy Lebrun et Isak du serveur Discord de Will Traore pour leurs conseils.