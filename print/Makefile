PDF=build/promo-printables.pdf
TEX=promo-printables.tex
PREVIEW_PREFIX=build/promo-printables-page

all: preview

$(PDF): $(TEX) assets/logo-mark.pdf | build
	latexmk -pdf -interaction=nonstopmode -halt-on-error -output-directory=build $(TEX)

preview: $(PDF)
	rm -f $(PREVIEW_PREFIX)*.png
	pdftoppm -png -r 180 -forcenum -sep "" $(PDF) $(PREVIEW_PREFIX)

build:
	mkdir -p build

clean:
	latexmk -C -output-directory=build $(TEX)
	rm -f build/*.dvi build/*.ps build/*.xdv $(PREVIEW_PREFIX)*.png

.PHONY: all clean build preview
