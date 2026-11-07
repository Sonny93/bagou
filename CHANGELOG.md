# Changelog

All notable changes to Bagou are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-11-07

### Added

- Bagou now notices when you fix a misheard word in the text and offers to remember it.
- Remembered corrections, which you can manage in the settings, help both speech recognition and the cleanup get those words right next time.
- From the history, clean a dictation again from its raw text with the standard or precise model, to compare them side by side.

### Changed

- New dictation (button or N key) now clears the page without starting to record.
- The daily dictation time goes from 1 hour to 4 hours.
- A dictation now stops by itself after 2 minutes without speech, and keeps the text.
- A single dictation can now last up to 30 minutes instead of 10.
- Long dictations now have enough time to be cleaned, and a cleanup that takes too long says so.
- Loading indicators no longer spin for people who ask their device to reduce motion.

## [1.2.0] - 2026-11-02

### Added

- After an update, a banner shows what's new, and a What's new page lists every version.
- On the dictation page, you can clean the text again on demand, hand edits included, with a model of your choice, and switch between the text before and after cleanup.
- The settings let you choose between a standard cleanup model and a more precise, more expensive one.
- The history groups dictations by day: today, yesterday, then the date.
- The dictation page shows whether the text is saved in the history.
- Ctrl+S saves the text right away.
- Leaving the dictation page asks for confirmation during a dictation or its cleanup, and while the text is not saved yet; so does starting a new dictation over unsaved text.
- A new dictation can be started as soon as there is text, even before dictating.
- A progress bar shows how far the text cleanup has gone.
- Automatic copy to the clipboard can be turned off, per device.
- Copying the text with Ctrl+C now shows the copy confirmation, and copying only part of it says so.

### Changed

- The New dictation button moves to the top bar and Auto-start moves to the settings.
- The voice level meter now spans the full width of the dictation bar.
- A short animation now confirms every copy to the clipboard, automatic or manual.
- Each history entry sits in its own card, so it is clear where one ends and the next begins.
- In the history, screen readers tell which dictation each button acts on and announce when more dictations load.

### Fixed

- Loading indicators keep spinning when the system asks to reduce animations.
- Clicking outside the text no longer puts the cursor in it.
- The cleanup preview in the settings no longer gives up on long texts.

## [1.1.0] - 2026-10-28

### Fixed

- The cleaned text no longer gets stuck behind an endless loader after a long or slow dictation.
- A slow start of the transcription service no longer makes the dictation fail.

### Changed

- Errors are now shown as notifications instead of failing silently.

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

[Unreleased]: https://github.com/Sonny93/bagou/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/Sonny93/bagou/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Sonny93/bagou/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Sonny93/bagou/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Sonny93/bagou/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Sonny93/bagou/releases/tag/v1.0.0
