# Installation et raccourci clavier

Cette page explique comment installer Dictée vocale comme application depuis Chrome, puis comment l'ouvrir avec un raccourci clavier global (Windows ou Linux).

## Installer l'application

L'appli doit être ouverte en HTTPS, ou sur `localhost` (le micro, WebAuthn et le presse-papier refusent `http://<ip>`).

1. Ouvrir l'appli dans Chrome (bureau) et se connecter.
2. Cliquer sur l'icône d'installation dans la barre d'adresse, ou ouvrir le menu puis **Caster, enregistrer et partager** > **Installer la page en tant qu'application**.
3. Confirmer. L'appli s'ouvre dans sa propre fenêtre, sans barre d'adresse.

L'appli est inutile hors ligne (transcription et nettoyage passent par le serveur). Sans réseau, elle affiche seulement une page « Hors ligne ».

## Une seule fenêtre

L'appli est déclarée avec `launch_handler: navigate-existing`. Quand le raccourci est pressé alors que la fenêtre est déjà ouverte, Chrome la réutilise et la recharge au lieu d'en ouvrir une seconde. Une nouvelle dictée démarre donc proprement (démarrage automatique compris) sans empiler de fenêtres.

## Windows

Chrome crée un raccourci dans le menu Démarrer :

```
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Chrome Apps\Dictée vocale.lnk
```

1. Ouvrir ce dossier (coller le chemin dans l'Explorateur).
2. Clic droit sur **Dictée vocale** > **Propriétés**.
3. Dans l'onglet **Raccourci**, cliquer dans **Touche de raccourci** et presser la combinaison voulue, par exemple `Ctrl+Alt+D`.
4. Valider.

Le champ « Touche de raccourci » ne fonctionne que pour un fichier `.lnk` placé dans le menu Démarrer ou sur le bureau. La cible du raccourci est de la forme :

```
chrome_proxy.exe --profile-directory=Default --app-id=<id>
```

## Linux

Chrome écrit un lanceur dans `~/.local/share/applications/chrome-<app-id>-Default.desktop`, dont la ligne `Exec` ressemble à :

```
google-chrome --profile-directory=Default --app-id=<app-id>
```

Retrouver le lanceur et la commande :

```sh
grep -l "Dictée vocale" ~/.local/share/applications/chrome-*.desktop
grep '^Exec=' ~/.local/share/applications/chrome-<app-id>-Default.desktop
```

Lier cette commande `Exec` à un raccourci global :

### GNOME

Interface : **Paramètres** > **Clavier** > **Raccourcis personnalisés** > **+**. Nom : `Dictée vocale`, commande : la ligne `Exec`, raccourci : par exemple `Ctrl+Alt+D`.

En ligne de commande :

```sh
KEY_PATH=/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/dictee/
gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings "['$KEY_PATH']"
SCHEMA="org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:$KEY_PATH"
gsettings set "$SCHEMA" name 'Dictée vocale'
gsettings set "$SCHEMA" command 'google-chrome --profile-directory=Default --app-id=<app-id>'
gsettings set "$SCHEMA" binding '<Ctrl><Alt>d'
```

Cette commande remplace la liste des raccourcis personnalisés existants : si tu en as déjà, ajoute `$KEY_PATH` à la liste actuelle (`gsettings get ... custom-keybindings`).

### KDE

**Configuration du système** > **Raccourcis** > **Ajouter une commande**. Coller la commande `Exec`, puis assigner le raccourci.

Wayland et X11 ne demandent rien de particulier.

## Premier lancement

1. Autoriser le micro quand Chrome le demande (une seule fois).
2. Activer **Démarrer automatiquement** dans l'appli. Ce réglage est propre à l'appareil.
3. Une appli installée peut démarrer l'audio sans clic : le raccourci suffit ensuite pour lancer l'enregistrement.

Si le navigateur bloque quand même l'audio, la page l'indique : cliquer dans la fenêtre, puis presser `N`.

## Utilisation

- `Entrée` : termine la dictée, nettoie le texte et le copie dans le presse-papier.
- `Échap` : annule.
- `N` : démarre une nouvelle dictée.
