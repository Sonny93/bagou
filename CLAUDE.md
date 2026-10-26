# vts-pwa — dictée vocale temps réel

PWA mono-utilisateur : un raccourci OS ouvre la fenêtre, l'enregistrement démarre, le texte partiel s'affiche en direct, Entrée termine, Claude Haiku nettoie le texte final, le résultat part dans le presse-papier. Rien de lourd côté client : tout passe par un seul conteneur Adonis.

> Statut : étapes 1 à 5 terminées (scaffolding, auth passkey, port STT + Mistral + relais, capture micro + affichage live, nettoyage Haiku + copie presse-papier). Prochaine : étape 6 (quotas, rate limiting, logs minimaux).

## Conventions

Charger `typescript-conventions`, `adonis-conventions` et `react-conventions` avant toute modification de code. Textes d'UI en français ; code, commentaires, noms de tests et commits en anglais. `pnpm run check` passe avant tout commit.

## Décisions verrouillées

- **Toolchain** : Node 26 et pnpm épinglés dans `mise.toml` (pas de corepack), `packageManager` dans `package.json`. Les `FROM` du `Dockerfile` (image Node, image `ghcr.io/pnpm/pnpm`) restent synchronisés avec `mise.toml`. TypeScript 6 (voir Pièges).
- **Front** : React 19 + Inertia 3 (`@adonisjs/inertia` 5), sans SSR (appli authentifiée, APIs navigateur uniquement). UI `@minimalstuff/ui`, UnoCSS `presetWind4`.
- **Cœur de dictée réutilisable** : capture micro, AudioWorklet, client socket et machine d'état de dictée vivent dans `inertia/dictation/core/` sans aucun import Inertia/Adonis, pour être repris tel quel par une future app Tauri.
- **Audio** : normalisé une seule fois dans le navigateur en PCM s16le, 16 kHz, mono (AudioWorklet), découpé en trames de 100 ms.
- **Temps réel** : `@rlanz/socket` pour le relais navigateur ↔ Adonis. Transmit seulement si un besoin SSE apparaît. Aucune autre lib temps réel. Côté serveur → fournisseur STT : `WebSocket` global de Node (undici, accepte `headers`).
- **STT hexagonal** : port `TranscriptionProvider` / `TranscriptionSession` (événements `partial`, `final`, `error`), un adaptateur par fournisseur dans `app/transcription/providers/<name>/`. Le reste de l'appli ne connaît que le port. L'adaptateur actif est lié au port dans le container (provider Adonis), pas par une variable d'env.
- **Nettoyage** : Claude Haiku via `@anthropic-ai/sdk`, hors du port STT (domaine `text_cleanup`). Port `TextCleaner` lié à l'adaptateur Anthropic dans le container (`providers/text_cleanup_provider.ts`), comme le port STT ; en échec le front garde le texte brut. Consigne : retirer hésitations et répétitions, appliquer les auto-corrections (« non, plutôt… »), ponctuer, ne pas reformuler, préserver le vocabulaire technique.
- **Auth** : passkeys WebAuthn (`@simplewebauthn/*`), plusieurs passkeys par utilisateur, session Adonis 30 jours stockée en Postgres (store `database` ; `memory` uniquement en test). Le WebSocket s'authentifie par le cookie de session. **Contrat d'isolation** : le reste de l'appli ne dépend que du guard session Adonis (`auth.getUserOrFail()`, `middleware.auth()`) et du modèle `User` ; tout ce qui est WebAuthn reste dans `app/passkeys/`. Passer à OIDC (Pocket ID) = remplacer ce domaine par un autre qui finit par `auth.use('web').login(user)`.
- **Base** : Postgres (service dans `compose.yml` et `dev.compose.yml`, port lié à `127.0.0.1`). Store `database` pour `@adonisjs/limiter`.
- **Première passkey** : `node ace passkey:invite` génère un lien d'enregistrement à usage unique (15 min). Sert aussi de secours si toutes les passkeys sont perdues.
- **Fournisseur STT** : le free tier passe en premier, sinon le projet perd son intérêt. Premier et seul adaptateur pour l'instant : Mistral Voxtral Realtime (gratuit récurrent, base64 JSON transmis tel quel). Repli prévu : Deepgram (crédit unique qui n'expire pas).
- **Déploiement** : Dokploy à partir du `Dockerfile` et du `compose.yml`, rien d'autre.
- **Coûts** : quota journalier de minutes configurable côté serveur, compté sur les octets audio reçus (32 000 o = 1 s). Rate limiting sur les routes d'auth, de nettoyage et sur l'ouverture de sessions de dictée.
- **Secrets et vie privée** : clés API uniquement côté serveur, jamais exposées au front ni loguées. Les transcriptions ne sont jamais loguées.

## Écarté

Modèles locaux (Whisper, Kyutai, Parakeet), app Tauri pour l'instant, frameworks d'agents vocaux (Pipecat, LiveKit), IdP externe pour l'instant, Sail (`dev.compose.yml` suffit pour Postgres).

## Pièges connus

- **`@rlanz/socket` ne gère pas les frames binaires** (0.2.4 : tout message entrant passe par `data.toString()` + `JSON.parse`, le client fait `JSON.stringify`). L'audio voyage en base64 dans un événement JSON. Recontrôler à chaque montée de version (le paquet migrera vers `@adonisjs/socket`).
- **Pas de TypeScript 7** : le hook Assembler de `@rlanz/socket` (0.2.4) fait `require('typescript')` puis `ts.createSourceFile`, absent de TS 7. `typescript` est un peer, donc ni `overrides` ni `packageExtensions` pnpm ne le redirigent. Passer à TS 7 quand le paquet le supporte.
- **Contexte sécurisé obligatoire** : micro, WebAuthn et presse-papier refusent `http://<ip>`. Accès dev par `localhost` uniquement (tunnel SSH).
