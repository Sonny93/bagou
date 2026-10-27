# Bagou

Self-hosted, real-time voice dictation as a PWA. A global shortcut opens the window, the text appears live as you speak, Enter ends the dictation, Claude Haiku cleans the text up and the result lands in your clipboard.

> **The name**: *bagou* (French, informal, pronounced "ba-goo") is the gift of the gab. *Avoir du bagou* means having a way with words, being a smooth talker. Fitting for a tool that lets you just talk and turns it into clean text.

## Features

- **Live transcription** through Mistral Voxtral Realtime (free tier), streamed from the browser over a WebSocket.
- **Cleanup by Claude Haiku**: removes hesitations and repetitions, applies your self-corrections ("no, I mean…"), adds punctuation, without rephrasing your words.
- **Editable draft**: dictate several segments into one draft, fix it by hand, copy it to the clipboard.
- **Settings per user**: dictation language (English, French), a vocabulary of names and jargon to spell right, free cleanup instructions, and a test block to try them on a sample text or a live dictation before saving.
- **History** of your drafts for 60 days, with full-text and typo-tolerant search.
- **Passkey sign-in** (WebAuthn), daily dictation quota and rate limiting.
- **Interface in English and French.**

Install it as an app and bind a global keyboard shortcut: [docs/installation.md](docs/installation.md) (in French).

## Commands

```sh
just dev     # Postgres, migrations, dev server
just test    # back and front tests
just check   # lint, format, types, knip, tests
just build   # production build
just prod    # production container through compose.yml
just icons   # regenerate the PNG icons from resources/icons/
just down    # stop the compose services
```
