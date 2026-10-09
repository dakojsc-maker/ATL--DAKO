"""
Content files for the slide builders.

A content file is JSON:
{
  "template": "M03",                 # catalog code (informational)
  "title": "Phố cổ Hội An",          # deck title (informational, used for file naming)
  "photos": {"cover": "c0f3...", "bridge": "assets/images/src/my.jpg"},   # optional overrides
  "focus": {"cover": [0.5, 0.6]},    # optional crop focus overrides (Heritage)
  "slides": [ {"slide": "cover", ...params}, {"slide": "agenda", ...}, ... ]
}
"slide" names a layout function of the template's layouts module; every other key is passed to it unchanged.
Photo values are either an Open Images id (file assets/images/src/<id>.jpg) or a path relative to slides-template/.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'images', 'src')


def to_json(content, **meta):
    slides = []
    for fn, params in content:
        d = {'slide': fn.__name__}
        d.update(params)
        slides.append(d)
    out = dict(meta)
    out['slides'] = slides
    return out


def save(path, content, **meta):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(to_json(content, **meta), f, ensure_ascii=False, indent=1)
    return path


def load(path, module):
    """-> (meta dict, [(layout_fn, params), ...])"""
    data = json.load(open(path, encoding='utf-8'))
    content = []
    for i, s in enumerate(data.get('slides', [])):
        s = dict(s)
        name = s.pop('slide')
        fn = getattr(module, name, None)
        if fn is None or name.startswith('_'):
            raise SystemExit(f'slide {i + 1}: unknown layout "{name}" in {path}')
        content.append((fn, s))
    return data, content


def photo_path(value):
    """Open Images id -> assets/images/src/<id>.jpg; anything with a slash or extension -> path under slides-template."""
    if '/' in value or os.path.splitext(value)[1]:
        return value if os.path.isabs(value) else os.path.join(ROOT, value)
    return os.path.join(SRC, value + '.jpg')
