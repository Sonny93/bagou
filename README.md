# Bagou

Dictée vocale en temps réel : un raccourci ouvre la fenêtre, le texte s'affiche en direct, Entrée termine, Claude Haiku nettoie le texte et le résultat part dans le presse-papier.

Installation comme application et raccourci clavier : [docs/installation.md](docs/installation.md).

## Commandes

```sh
just dev     # Postgres, migrations, serveur de dev
just test    # tests back et front
just check   # lint, format, types, knip, tests
just build   # build de production
just prod    # conteneur de production via compose.yml
just icons   # régénère les icônes PNG depuis resources/icons/
just down    # arrête les services compose
```
