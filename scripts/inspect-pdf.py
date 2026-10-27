import json
import sys
from pypdf import PdfReader

reader = PdfReader(sys.argv[1], strict=True)
if reader.is_encrypted:
    raise ValueError('Encrypted PDFs are not publishable')
meta = reader.metadata or {}
print(json.dumps({
    'pages': len(reader.pages),
    'editionHash': meta.get('/SpeaksEditionHash'),
    'testOnly': meta.get('/SpeaksTestOnly') == 'true',
    'emptyPages': [i+1 for i,p in enumerate(reader.pages) if len((p.extract_text() or '').strip()) < 30],
    'a4': all(abs(float(p.mediabox.width)-595.276)<2 and abs(float(p.mediabox.height)-841.89)<2 for p in reader.pages)
}))
