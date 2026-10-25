dev:
	@docker compose -f dev.compose.yml up -d --wait
	@node ace migration:run
	@pnpm run dev

test:
	@docker compose -f dev.compose.yml up -d --wait
	@node ace test
	@pnpm run test:front

lint:
	@pnpm run lint

format:
	@pnpm run format

check:
	@pnpm run check

build:
	@pnpm run build

prod:
	@docker compose up -d --build --wait

down:
	@-docker compose down
	@-docker compose -f dev.compose.yml down
