.DEFAULT_GOAL=main
.PHONY : main publish

main:
	@yarn run build
	@cp src/*.d.ts dist/
publish: main
	@npm publish
