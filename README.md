# Landing page AceleraDev

- `v2/`: nova landing (V2), em HTML, CSS e JS puros
- `site/`: cópia estática do site atual em WordPress (https://aceleradev.com.br), usada como referência
- `tools/mirror.py`: script que gerou o `site/`

## V2

```bash
cd v2 && python3 -m http.server 8000   # http://localhost:8000
```

Qualquer servidor estático serve (`npx serve v2`). Precisa ser HTTP porque o globo carrega `assets/world-110m.json` via `fetch`.

- `index.html`: estrutura e textos de todas as seções
- `css/styles.css`: tokens (cores, fontes) no `:root` e estilos por seção
- `js/main.js`: cards de alunos, mural de prints, DMs com scroll horizontal, contadores e animações de entrada
- `js/globe.js`: globo girando (d3 + topojson via CDN)
- `assets/`: fotos, prints dos alunos (`wall/`), prints de DMs do LinkedIn (`dm/`) e o mapa

Pendências: os pontos do globo são ilustrativos (os dados reais estão em resultados.aceleradev.com.br) e os botões de compra apontam para `#investimento` até ter o link do checkout.

## Site atual (WordPress)

```bash
python3 tools/mirror.py --serve   # http://localhost:8000
```

Precisa ser servido por HTTP (os caminhos são `/wp-content/...`), então abrir o `index.html` direto pelo navegador não funciona.
Qualquer servidor estático na pasta `site/` também serve, por exemplo `npx serve site`.

Páginas: `/`, `/acelera-sem-vsl/`, `/aceleradev/`, `/v1/`.

## Baixar de novo

```bash
python3 tools/mirror.py
```

## O que não funciona offline

Partes que dependem do PHP do WordPress: o envio do formulário do popup (`admin-ajax.php`) e os eventos do PixelYourSite.
Os scripts externos (Google Tag Manager, pixel do Facebook, vídeos do YouTube) continuam apontando para os serviços reais.
