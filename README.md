# cadavreski

<a href="http://cadavreski.jit.su/" target="_blank">Cadavreski</a> permet de composer un <a href="http://fr.wikipedia.org/wiki/Cadavre_exquis" target='_blank'>cadavre exquis</a> en ligne, simultanément ou non. Le choix de <a href="http://nodejs.org" target="_blank">node.js</a> a été fait pour permettre aux utilisateurs de jouer en même, avec un système tour par tour dynamique. Les joueurs peuvent également, une fois leur vers écrit, inviter leurs amis en leur envoyant un email contenant le lien vers cadavreski. Le fait de pouvoir jouer ensemble, ainsi que le "réseau social" composé par les adresse emails, tentent de recréer l'aspect collectif (et physiquement social) du cadavre exquis original : au lieu de passer de main en main, le poème se passe d'adresse email en adresse email, avec la possibilité d'être rejoint par un inconnu et ainsi d'ajouter une nouvelle branche au réseau; les joueurs découvrent finalement, de façon non simultanée mais commune, le poème fini dans leur boîte mail sous forme d'un fichier .txt joint.

Si vous parcourez le code, vous noterez que les adresses emails sont effacées immédiatement à l'envoi du mail. Vous noterez aussi qu'il est possible de jouer anonymement, bien que celà vous empêche de recevoir le poème une fois fini.

Ce projet a été réalisé à l'<a href="http://uqam.ca" title="UQAM" target='_blank'>UQAM</a> dans le cadre du cours *Arts médiatiques: interactivité, ubiquité et virtualité* donné par Alexandre Castonguay.

## Cloner le projet

Dans un terminal, tapez:

```bash
git clone https://github.com/hugohil/cadavreski.git
```

Puis, installez les modules avec :

```bash
cd cadavreski
npm install
```

Il vous faudra enfin renommer le fichier `auth.example.js` présent dans le répertoire `server/` en `auth.js` et y mettre les informations correspondantes à votre serveur d'emails.

### Licence

<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.fr&#39;"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/3.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Cadavreski</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://hugohil.net" target="_blank"property="cc:attributionName" rel="cc:attributionURL">hugohil</a> is licensed under a <a rel="license" target="_blank" href="http://creativecommons.org/licenses/by-sa/3.0/deed.fr&#39;">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.