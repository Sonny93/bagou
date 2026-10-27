# Bagou

Self-hosted, real-time voice dictation as a PWA. A global shortcut opens the window, the text appears live as you speak, Enter ends the dictation, Claude Haiku cleans the text up and the result lands in your clipboard.

> **The name**: _bagou_ (French, informal, pronounced "ba-goo") is the gift of the gab. _Avoir du bagou_ means having a way with words, being a smooth talker. Fitting for a tool that lets you just talk and turns it into clean text.

## Features

- **Live transcription** through Mistral Voxtral Realtime (free tier), streamed from the browser over a WebSocket.
- **Cleanup by Claude Haiku**: removes hesitations and repetitions, applies your self-corrections ("no, I mean…"), adds punctuation, without rephrasing your words.
- **Editable draft**: dictate several segments into one draft, fix it by hand, copy it to the clipboard.
- **Settings per user**: dictation language (English, French), a vocabulary of names and jargon to spell right, free cleanup instructions, and a test block to try them on a sample text or a live dictation before saving.
- **History** of your drafts for 60 days, with full-text and typo-tolerant search.
- **Passkey sign-in** (WebAuthn), daily dictation quota and rate limiting.
- **Interface in English and French.**

Install it as an app and bind a global keyboard shortcut: [docs/installation.md](docs/installation.md) (in French).

## Getting started

You need Docker with Compose, a Mistral API key (free tier, [console.mistral.ai](https://console.mistral.ai)), an Anthropic API key, and a domain served over HTTPS (microphone, passkeys and clipboard only work on HTTPS or localhost).

Create `compose.yml`:

```yaml
services:
  postgres:
    image: postgres:18
    restart: unless-stopped
    environment:
      POSTGRES_DB: bagou
      POSTGRES_USER: bagou
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U bagou -d bagou']
      interval: 5s
      retries: 10
    volumes:
      - postgres:/var/lib/postgresql

  bagou:
    image: ghcr.io/sonny93/bagou:1
    restart: unless-stopped
    env_file: .env
    environment:
      HOST: 0.0.0.0
      PORT: 3333
      NODE_ENV: production
      LOG_LEVEL: info
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: bagou
      DB_DATABASE: bagou
    ports:
      - '127.0.0.1:3333:3333'
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres:
```

Next to it, a `.env`:

```sh
APP_URL=https://bagou.example.com
# openssl rand -base64 32
APP_KEY=
# openssl rand -hex 16
DB_PASSWORD=
MISTRAL_API_KEY=
ANTHROPIC_API_KEY=
```

`APP_URL` must be the exact public URL: passkeys are bound to its hostname.

Start it with `docker compose up -d` (migrations run on start) and put your HTTPS reverse proxy in front of `127.0.0.1:3333`.

Register the first passkey:

```sh
docker compose exec bagou node bin/console.js passkey:invite
```

It prints a single-use link valid for 15 minutes. Open it, name the passkey, done. Same command if you lose all your passkeys.

The tag `1` follows the latest 1.x release; pin `1.0.0` for a fixed version. To install it as an app, see "Install it as an app" above.

## Development

Needs mise (Node and pnpm), Docker and just. Copy `.env.example` to `.env`, and `.env.test.example` to `.env.test` for the tests (set `APP_KEY` with `node ace generate:key`).

```sh
just dev     # Postgres, migrations, dev server
just test    # back and front tests
just check   # lint, format, types, knip, tests
just build   # production build
just release # bump, tag, publish the GitHub release and the image
just prod    # production container through compose.yml
just icons   # regenerate the PNG icons from resources/icons/
just down    # stop the compose services
```

## Releases

User-visible changes go in the `Unreleased` section of [CHANGELOG.md](CHANGELOG.md), in plain language. `just release` (the first one: `just release 1.0.0`) runs the checks, moves `Unreleased` under the new version, tags, and opens the GitHub release prefilled with those notes. The tag push builds `ghcr.io/sonny93/bagou` (tags `X.Y.Z`, `X.Y`, `X`, `latest`) for amd64 and arm64.
