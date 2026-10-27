"""Create a web preview from the actual released PDF's first page."""
import sys
from pathlib import Path
import fitz

source, target = map(Path, sys.argv[1:3])
target.parent.mkdir(parents=True, exist_ok=True)
with fitz.open(source) as document:
    page = document[0]
    image = page.get_pixmap(matrix=fitz.Matrix(595 / page.rect.width, 595 / page.rect.width), alpha=False).pil_image()
    image.save(target, format='JPEG', quality=90, optimize=True)
