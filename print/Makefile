PDF=build/promo-printables.pdf
TEX=promo-printables.tex
PREVIEW_PREFIX=build/promo-printables-page
QR_SVG=../public/qr-lab/seedbed.svg
QR_PDF=assets/seedbed-qr.pdf

all: preview

$(PDF): $(TEX) assets/logo-mark.pdf $(QR_PDF) | build
	latexmk -pdf -interaction=nonstopmode -halt-on-error -output-directory=build $(TEX)

$(QR_PDF): $(QR_SVG)
	rsvg-convert -f pdf -o $(QR_PDF) $(QR_SVG)

preview: $(PDF)
	rm -f $(PREVIEW_PREFIX)*.png
	pdftoppm -png -r 180 -forcenum -sep "" $(PDF) $(PREVIEW_PREFIX)

build:
	mkdir -p build

clean:
	latexmk -C -output-directory=build $(TEX)
	rm -f build/*.dvi build/*.ps build/*.xdv $(PREVIEW_PREFIX)*.png

.PHONY: all clean build preview
