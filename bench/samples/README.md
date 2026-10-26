# Échantillons du benchmark

Ce dossier contient tes enregistrements de test pour `just bench`. Ils sont à ta voix : tout le contenu est ignoré par git, sauf ce fichier.

## Format

Pour chaque échantillon, deux fichiers de même nom :

- `nom.<ext>` : l'audio. Tout format lisible par ffmpeg convient (wav, m4a, ogg, webm, mp3, flac...). La conversion en PCM 16 kHz mono est faite par le bench, `ffmpeg` doit donc être installé.
- `nom.txt` : la référence, c'est-à-dire le texte que tu voulais dire, déjà propre et ponctué (le texte final idéal, pas la transcription mot à mot de tes hésitations).

Un audio sans `.txt` est ignoré avec un avertissement.

## Conseils

- 5 à 10 échantillons de 20 à 60 secondes chacun.
- Varie-les : français courant, français mêlé de vocabulaire technique anglais, hésitations et auto-corrections (« non, plutôt... »), débit rapide, bruit de fond.
- Écris la référence comme le texte final voulu : sans les hésitations, avec les auto-corrections appliquées.

## Enregistrer

- Sur téléphone : le dictaphone, puis copie le fichier ici.
- Sous Linux : `arecord -f S16_LE -r 16000 -c 1 bench/samples/nom.wav` (Ctrl+C pour arrêter).

## Lancer

```sh
just bench                     # tous les échantillons, fournisseur par défaut
just bench --limit 2           # les 2 premiers seulement
just bench --provider all      # tous les fournisseurs enregistrés
```

Les échantillons passent en temps réel : la durée totale est à peu près celle de l'audio. Les rapports sont écrits dans `bench/results/` (ignoré par git, ils contiennent les textes).
