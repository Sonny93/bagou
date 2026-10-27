# Changelog

All notable changes to Bagou are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- The cleaned text no longer gets stuck behind an endless loader after a long or slow dictation.
- A slow start of the transcription service no longer makes the dictation fail.

## [1.0.1] - 2026-10-27

### Fixed

- Dictation works again behind a reverse proxy such as Cloudflare or Traefik.

## [1.0.0] - 2026-10-27

First public release.

### Added

- Dictate by voice and watch your words appear live as you speak, powered by Mistral.
- Press Enter to finish: Claude tidies your text by removing hesitations and repetitions, applying your self-corrections and adding punctuation, without rephrasing you.
- Your cleaned text is copied to the clipboard, ready to paste anywhere.
- Dictate several segments into one draft, and fix it by hand whenever you like.
- Choose your dictation language, add a vocabulary of names and jargon to spell right, and give Claude your own cleanup instructions.
- Try your settings on a sample text or a live dictation before saving them.
- Find your drafts again in the history, kept for 60 days, with search that forgives typos.
- Sign in with a passkey, no password needed.
- A daily dictation quota keeps usage under control.
- Use Bagou in English or French.
- See which version you're running under the app name, at the top of every page.
- Install it as an app and open it with a global keyboard shortcut.
- Run your own copy with the ready-made Docker image.

[Unreleased]: https://github.com/Sonny93/bagou/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/Sonny93/bagou/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Sonny93/bagou/releases/tag/v1.0.0
