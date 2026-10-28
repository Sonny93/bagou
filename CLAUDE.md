# Bagou

PWA de dictée vocale mono-utilisateur : STT temps réel (Mistral Voxtral) relayé par un seul conteneur Adonis, texte nettoyé par Claude Haiku, résultat dans le presse-papier.

## Vérifier

- `pnpm run check` passe avant tout commit. Les tests back ont besoin du Postgres de `dev.compose.yml` (port 5434, `.env.test`) : `just test` le démarre, sinon `docker compose -f dev.compose.yml up -d --wait`.
- Un seul fichier : `node ace test --files=<chemin>` (back), `pnpm vitest run <chemin>` (front).
- Les suites Japa trouvent les specs par motif de nom (`tests.suites` dans `adonisrc.ts`) : un `.spec.ts` qui ne suit aucun motif ne tourne jamais, sans erreur.

## Conventions

- Charger `typescript-conventions`, `adonis-conventions` et `react-conventions` avant toute modification de code.
- Code, commentaires, noms de tests et commits en anglais. Textes d'UI en anglais, traduits en français avec Lingui : `pnpm i18n:extract`, puis remplir chaque `msgstr` français dans le même changement.
- Tout changement visible par l'utilisateur ajoute une ligne en langage naturel, sans détail technique, dans `## [Unreleased]` de `CHANGELOG.md`, dans le même changement ; refactor, tests, outillage : rien. `CHANGELOG.md` est écrit à la main, une section `Unreleased` vide fait échouer `just release`.

## Décisions

- Node et pnpm épinglés dans `mise.toml`, sans corepack ; les `FROM` du `Dockerfile` restent synchronisés avec.
- Pas de TypeScript 7 tant que `@rlanz/socket` ne le supporte pas : son hook Assembler appelle `ts.createSourceFile`, absent de TS 7, et `typescript` étant un peer, ni `overrides` ni `packageExtensions` ne le redirigent.
- Front sans SSR : appli authentifiée, APIs navigateur uniquement.
- Erreurs du front jamais silencieuses : une erreur affichée à l'écran passe par `logError`, une erreur sans message à l'écran par `reportError` (`toastId` pour un échec qui se répète).
- Le serveur n'envoie que des codes stables, jamais de texte traduit ; le front les traduit avec ses fonctions `describe*`.
- `inertia/dictation/core/` sera repris tel quel par une future app Tauri : ni Inertia, ni Adonis, ni reste du front, seulement les types de `@generated/*` (règle `no-restricted-imports` de `oxlint.config.ts`).
- Temps réel : `@rlanz/socket` seul entre navigateur et Adonis, aucune autre lib (Transmit seulement si un besoin SSE apparaît).
- STT et nettoyage derrière les ports `TranscriptionProvider` et `TextCleaner` : un adaptateur par fournisseur, lié au port dans un provider Adonis, jamais choisi par variable d'env.
- Fournisseur STT : le free tier passe en premier, sinon le projet perd son intérêt. Repli prévu : Deepgram.
- Nettoyage large (tout le brouillon à chaque segment) plutôt qu'économe : le coût est négligeable en mono-utilisateur.
- Auth : le reste de l'appli ne dépend que du guard session Adonis et du modèle `User` ; tout WebAuthn reste dans `app/passkeys/`. Passer à OIDC revient à remplacer ce domaine.
- Quotas, rétention et limites sont des constantes dans `config/`, pas des variables d'env.
- `public/sw.js` ne met rien en cache (appli inutile hors ligne) : il sert seulement `offline.html`.
- Déploiement : Dokploy à partir du `Dockerfile` et du `compose.yml`, rien d'autre. L'image GHCR sert à ceux qui hébergent leur copie.
- Clés API côté serveur uniquement, jamais exposées au front ni loguées. Transcriptions stockées mais jamais loguées : pour une erreur qui peut venir de Postgres, loguer seulement son nom et son code, jamais `{ err }` (son `detail` contient les valeurs de la ligne).

## Pièges

- `@rlanz/socket` 0.2.4 ne gère pas les frames binaires (tout passe par `JSON.parse`) : l'audio voyage en base64 dans un événement JSON. À recontrôler à chaque montée de version.
- Ack socket limité à 5 s côté client, non réglable : un handler acquitte tout de suite, tout résultat lent part en diffusion, attendue par `DictationClient` avec ses propres délais.
- Micro, WebAuthn et presse-papier exigent un contexte sécurisé : en dev, accès par `localhost` uniquement (tunnel SSH), jamais par `http://<ip>`.

## Écarté

- Modèles STT locaux (Whisper, Kyutai, Parakeet) et frameworks d'agents vocaux (Pipecat, LiveKit).
- App Tauri et IdP externe, pour l'instant.
- Sail : `dev.compose.yml` suffit pour Postgres.
- Chiffrement de l'historique : une clé serveur ne protège rien si le serveur tombe, une clé côté client est trop lourde pour le gain.
- Recherche sémantique par embeddings : FTS + trigrammes suffit sur 60 jours.
