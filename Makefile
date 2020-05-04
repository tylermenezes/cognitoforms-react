.DEFAULT_GOAL=main

main:
	@npm run build
publish:
	@yarn run build && npm publish
