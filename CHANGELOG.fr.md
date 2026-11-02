# Changelog

Tous les changements notables de Bagou sont documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et ce projet respecte le [versionnage sémantique](https://semver.org/lang/fr/).

## [Unreleased]

## [1.2.0] - 2026-11-02

### Added

- Après une mise à jour, un bandeau montre les nouveautés, et une page Nouveautés liste toutes les versions.
- Sur la page de dictée, tu peux nettoyer à nouveau le texte à la demande, modifications manuelles comprises, avec le modèle de ton choix, et passer du texte avant nettoyage au texte après nettoyage.
- Les réglages permettent de choisir entre un modèle de nettoyage standard et un modèle plus précis, mais plus cher.
- L'historique regroupe les dictées par jour : aujourd'hui, hier, puis la date.
- La page de dictée indique si le texte est enregistré dans l'historique.
- Ctrl+S enregistre le texte tout de suite.
- Quitter la page de dictée demande confirmation pendant une dictée ou son nettoyage, et tant que le texte n'est pas enregistré ; il en va de même pour démarrer une nouvelle dictée sur un texte non enregistré.
- Une nouvelle dictée peut être démarrée dès qu'il y a du texte, même avant de dicter.
- Une barre de progression montre l'avancement du nettoyage du texte.
- La copie automatique dans le presse-papier peut être désactivée, appareil par appareil.
- Copier le texte avec Ctrl+C affiche désormais la confirmation de copie, et copier seulement une partie du texte le précise.

### Changed

- Le bouton Nouvelle dictée passe dans la barre du haut et le démarrage automatique passe dans les réglages.
- L'indicateur de niveau sonore occupe désormais toute la largeur de la barre de dictée.
- Une courte animation confirme désormais chaque copie dans le presse-papier, automatique ou manuelle.
- Chaque entrée de l'historique a sa propre carte, pour voir clairement où l'une se termine et où l'autre commence.
- Dans l'historique, les lecteurs d'écran indiquent sur quelle dictée agit chaque bouton et annoncent le chargement de nouvelles dictées.

### Fixed

- Les indicateurs de chargement continuent de tourner quand le système demande de réduire les animations.
- Cliquer en dehors du texte ne place plus le curseur dedans.
- L'aperçu du nettoyage dans les réglages n'abandonne plus sur les textes longs.

## [1.1.0] - 2026-10-28

### Fixed

- Le texte nettoyé ne reste plus bloqué derrière un chargement sans fin après une dictée longue ou lente.
- Un démarrage lent du service de transcription ne fait plus échouer la dictée.

### Changed

- Les erreurs s'affichent désormais sous forme de notifications au lieu d'échouer en silence.

## [1.0.1] - 2026-10-27

### Fixed

- La dictée fonctionne de nouveau derrière un reverse proxy comme Cloudflare ou Traefik.

## [1.0.0] - 2026-10-27

Première version publique.

### Added

- Dicte à la voix et vois tes mots apparaître en direct pendant que tu parles, grâce à Mistral.
- Appuie sur Entrée pour terminer : Claude met ton texte au propre en retirant les hésitations et les répétitions, en appliquant tes autocorrections et en ajoutant la ponctuation, sans te reformuler.
- Ton texte nettoyé est copié dans le presse-papier, prêt à être collé n'importe où.
- Dicte plusieurs segments dans un même brouillon, et corrige-le à la main quand tu veux.
- Choisis ta langue de dictée, ajoute un vocabulaire de noms et de jargon à bien orthographier, et donne à Claude tes propres consignes de nettoyage.
- Essaie tes réglages sur un texte d'exemple ou une dictée en direct avant de les enregistrer.
- Retrouve tes brouillons dans l'historique, conservé 60 jours, avec une recherche qui pardonne les fautes de frappe.
- Connecte-toi avec une clé d'accès, sans mot de passe.
- Un quota quotidien de dictée garde l'usage sous contrôle.
- Utilise Bagou en français ou en anglais.
- Vois quelle version tu utilises sous le nom de l'appli, en haut de chaque page.
- Installe-le comme une appli et ouvre-le avec un raccourci clavier global.
- Héberge ta propre copie avec l'image Docker toute prête.
