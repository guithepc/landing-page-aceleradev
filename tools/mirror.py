#!/usr/bin/env python3
"""Espelha o site aceleradev.com.br (WordPress/Elementor) em HTML estático.

Uso:
    python3 tools/mirror.py            # baixa tudo para ./site
    python3 tools/mirror.py --serve    # sobe servidor local que busca na origem o que faltar

As URLs absolutas do domínio viram caminhos relativos à raiz ("/wp-content/..."),
então o site precisa ser servido por HTTP (não abre via file://).
"""
import os
import re
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ORIGIN = "https://aceleradev.com.br"
HOST = "aceleradev.com.br"
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site")
PAGES = ["/", "/acelera-sem-vsl/", "/aceleradev/", "/v1/"]
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"

# URLs absolutas do domínio, normais ou escapadas em JSON (https:\/\/...)
ABS_RE = re.compile(r"https?:(?:\\?/){2}(?:www\.)?" + re.escape(HOST) + r"((?:\\?/)[^\s\"'<>()\\]*(?:\\/[^\s\"'<>()\\]*)*)")
CSS_URL_RE = re.compile(r"url\(\s*['\"]?([^'\")]+?)['\"]?\s*\)|@import\s+['\"]([^'\"]+)['\"]")
ASSET_PREFIXES = ("/wp-content/", "/wp-includes/")

seen = set()


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def local_path(path):
    path = urllib.parse.unquote(path.split("?")[0].split("#")[0])
    if path.endswith("/"):
        path += "index.html"
    return os.path.join(ROOT, path.lstrip("/"))


def rewrite(text):
    """Troca https://aceleradev.com.br/x por /x (preservando escape JSON)."""
    return ABS_RE.sub(lambda m: m.group(1), text)


def asset_paths_in(text):
    out = set()
    for m in ABS_RE.finditer(text):
        # data-settings do Elementor vem como JSON com &quot; no atributo HTML
        p = m.group(1).replace("\\/", "/").split("&quot;")[0]
        p = p.replace("&#038;", "&").replace("&amp;", "&")
        if p.startswith(ASSET_PREFIXES) and "." in p.split("?")[0].rsplit("/", 1)[-1]:
            out.add(p)
    return out


def css_refs(css, css_path):
    base = ORIGIN + css_path
    out = set()
    for m in CSS_URL_RE.finditer(css):
        ref = (m.group(1) or m.group(2)).strip()
        if ref.startswith(("data:", "#")):
            continue
        u = urllib.parse.urlparse(urllib.parse.urljoin(base, ref))
        if u.netloc in (HOST, "www." + HOST) and u.path.startswith(ASSET_PREFIXES):
            out.add(u.path + (("?" + u.query) if u.query else ""))
    return out


def download(path):
    key = path.split("?")[0]
    if key in seen:
        return set()
    seen.add(key)
    dest = local_path(path)
    try:
        data = fetch(ORIGIN + path)
    except Exception as e:  # noqa: BLE001
        print(f"  ERRO {path}: {e}")
        return set()
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    found = set()
    if key.endswith((".css", ".js")):
        text = data.decode("utf-8", "replace")
        found |= asset_paths_in(text)
        if key.endswith(".css"):
            found |= css_refs(text, key)
        data = rewrite(text).encode("utf-8")
    with open(dest, "wb") as f:
        f.write(data)
    print(f"  ok {path}")
    return found


def mirror():
    queue = set()
    for page in PAGES:
        print(f"página {page}")
        html = fetch(ORIGIN + page).decode("utf-8")
        queue |= asset_paths_in(html)
        dest = local_path(page)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(rewrite(html))
    with ThreadPoolExecutor(8) as pool:
        while queue:
            batch, queue = queue, set()
            for found in pool.map(download, sorted(batch)):
                queue |= found
    print(f"\n{len(seen)} arquivos em {ROOT}")


class FallbackHandler(SimpleHTTPRequestHandler):
    """Serve ./site; se o arquivo não existir, baixa da origem e salva."""

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path.startswith(ASSET_PREFIXES) and not os.path.exists(local_path(path)):
            print(f"[faltando] {self.path}")
            for p in download(self.path):
                download(p)
        super().do_GET()


def serve(port=8000):
    print(f"http://localhost:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), FallbackHandler).serve_forever()


if __name__ == "__main__":
    if "--serve" in sys.argv:
        serve(int(os.environ.get("PORT", 8000)))
    else:
        mirror()
