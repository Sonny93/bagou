dev:
	@docker compose -f dev.compose.yml up -d --wait
	@node ace migration:run
	@pnpm run dev

test:
	@docker compose -f dev.compose.yml up -d --wait
	@node ace test
	@pnpm run test:front

bench *args:
	@node ace transcription:bench {{args}}

lint:
	@pnpm run lint

format:
	@pnpm run format

check:
	@pnpm run check

build:
	@pnpm run build

release *args:
	@pnpm release {{args}}

prod:
	@docker compose -f compose.yml -f local.compose.yml up -d --build --wait

down:
	@-docker compose down
	@-docker compose -f dev.compose.yml down

icons:
	@cp resources/icons/icon.svg public/icons/icon.svg
	@pnpm dlx sharp-cli@6.1.0 -i resources/icons/icon.svg -o public/icons/icon-192.png resize 192 192
	@pnpm dlx sharp-cli@6.1.0 -i resources/icons/icon.svg -o public/icons/icon-512.png resize 512 512
	@pnpm dlx sharp-cli@6.1.0 -i resources/icons/icon_maskable.svg -o public/icons/icon-maskable-512.png resize 512 512
	@pnpm dlx sharp-cli@6.1.0 -i resources/icons/icon.svg -o public/icons/apple-touch-icon.png resize 180 180
	@pnpm dlx sharp-cli@6.1.0 -i resources/icons/icon.svg -o public/icons/favicon-32.png resize 32 32
