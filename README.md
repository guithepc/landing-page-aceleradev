# Landing page AceleraDev

Cópia estática do site atual em WordPress (https://aceleradev.com.br), base para a V2.

- `site/`: HTML, CSS, JS, imagens e fontes baixados do site em produção
- `tools/mirror.py`: script que gerou o `site/`

## Rodar local

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
