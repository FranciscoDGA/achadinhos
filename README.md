# Achado Reviews — Vitrine de Afiliados do Mercado Livre

Site vitrine estático, rápido e responsivo (Desktop e Celular) desenvolvido para divulgação consciente de produtos do **Programa de Afiliados do Mercado Livre**, organizado pelas 10 categorias da página oficial de **Mais Vendidos do Mercado Livre**.

> 📘 **Consulte também o [MANUAL-DO-PROJETO.md](MANUAL-DO-PROJETO.md)** na raiz desta pasta para o histórico completo do que criamos, seus códigos de afiliado (`matt_word` e `matt_tool`), funcionalidades de compra consciente e o passo a passo de atualização contínua pela **Vercel + GitHub**.

---

## 📁 Estrutura de Arquivos

```text
├── index.html             # Página principal da vitrine
├── products.json          # Base de dados com os 110 produtos separados do HTML
├── MANUAL-DO-PROJETO.md   # Documentação completa de tudo que criamos e combinamos
├── README.md              # Este guia rápido
├── blog/                  # Blog de reviews (listagem + 5 artigos em páginas estáticas)
├── scripts/
│   └── update-products.js # Atualização automática diária dos produtos (GitHub Actions, 06:00)
├── .github/workflows/
│   └── daily-update.yml   # Rotina diária que roda o script e publica na Vercel
└── assets/
    ├── style.css          # Estilos visuais (tema amarelo/preto/azul + responsivo + blog)
    ├── app.js             # Lógica de busca, filtros, comparador, favoritos e WhatsApp
    ├── favicon.svg        # Ícone da aba do navegador
    ├── banner.jpg         # Arte oficial Desktop (1666 × 580 px)
    └── banner-mobile.jpg  # Arte oficial Mobile (800 × 1221 px)
```

---

## 1. Como subir o site na HostGator (`public_html`)

1. Acesse o **cPanel** da sua hospedagem na **HostGator**.
2. Clique em **Gerenciador de Arquivos** (*File Manager*).
3. Na lateral esquerda, abra a pasta **`public_html`** (ou a pasta do domínio correspondente, caso seja um domínio adicional).
4. Clique no botão **Carregar** (*Upload*) no menu superior e selecione o arquivo **`achadinhos-hostgator.zip`**.
5. Assim que o upload terminar, volte para a pasta `public_html`, clique com o **botão direito** sobre o arquivo `achadinhos-hostgator.zip` e escolha **Extrair** (*Extract*).
6. Certifique-se de que o arquivo `index.html`, o arquivo `products.json` e a pasta `assets/` ficaram diretamente dentro da `public_html`. Pronto! Seu site já está no ar.

---

## 2. Como trocar a imagem do Banner Principal

A área direita do banner principal (`index.html`) já está configurada com o texto da referência à esquerda e um espaço pronto para exibir sua imagem automaticamente assim que você colocá-la na pasta `assets/`.

### Tamanhos ideais recomendados:
- **Desktop (`assets/banner.jpg`):** **1280 × 360 pixels** (proporção horizontal ~16:5, formato `.jpg` ou `.webp`, peso ideal abaixo de 200 KB).
- **Celular (`assets/banner-mobile.jpg`):** **800 × 500 pixels** (proporção mais compacta ~16:10 para leitura perfeita em telas verticais).

### Passo a passo:
1. Salve a sua arte de computador com o nome exato **`banner.jpg`** dentro da pasta **`assets/`**.
2. (Opcional) Salve a sua arte de celular com o nome exato **`banner-mobile.jpg`** dentro da pasta **`assets/`**.
3. O site detecta a imagem automaticamente e substitui o quadro pontilhado de marcação pela sua arte sem precisar alterar nenhuma linha de código!

---

## 3. Como adicionar, remover ou editar um produto no `products.json`

Todos os produtos ficam salvos fora do HTML, no arquivo **`products.json`**. Você pode abri-lo em qualquer editor de texto (Bloco de Notas, VS Code ou o próprio editor do Gerenciador de Arquivos da HostGator).

Cada produto segue este formato simples:

```json
{
  "id": 1,
  "name": "Sony PlayStation Store Gift Card R$ 150 (Digital)",
  "price": 150.00,
  "consultedAt": "02/11/2026",
  "category": "Games",
  "rank": 1,
  "image": "https://http2.mlstatic.com/D_Q_NP_2X_902418-MLA116666090065_082026-AB.webp",
  "affiliateUrl": "https://mercadolivre.com/sec/SEU_CODIGO"
}
```

### Campos de cada produto:
- **`id`**: Número único de identificação do produto (ex.: `101`, `102`...).
- **`name`**: Nome do produto como aparece no anúncio.
- **`price`**: Preço numérico usando ponto para centavos (ex.: `149.90` para R$ 149,90).
- **`consultedAt`**: Data em que o preço foi consultado (ex.: `"02/11/2026"`). O site exibirá automaticamente *"Preço consultado em 02/11"*.
- **`category`**: Nome exato da categoria do Mercado Livre (ex.: `"Games"`, `"Eletrodomésticos"`, `"Ferramentas"`, `"Beleza e Cuidado Pessoal"`, `"Celulares e Telefones"`, `"Informática"`, `"Eletrônicos, Áudio e Vídeo"`, `"Esportes e Fitness"`, `"Calçados, Roupas e Bolsas"`, `"Acessórios para Veículos"`).
- **`rank`**: Posição no ranking de mais vendidos da categoria (`1`, `2`, `3`...).
- **`image`**: Endereço oficial da foto do anúncio no Mercado Livre (`https://http2.mlstatic.com/...`).
- **`affiliateUrl`**: O seu link de afiliado gerado na barra do Mercado Livre (`https://mercadolivre.com/sec/...`).

### Regras rápidas ao editar o JSON:
- **Para editar um produto ou atualizar seu link de afiliado:** Basta trocar o valor dentro das aspas `" "` no campo desejado (`"affiliateUrl"`, `"price"`, `"consultedAt"`, etc.).
- **Para adicionar um novo produto:** Copie um bloco `{ ... }` existente, cole antes do `]` final do arquivo (separando o bloco anterior com uma vírgula `,`) e preencha os dados do novo produto.
- **Para remover um produto:** Apague o bloco `{ ... }` inteiro daquele produto (cuidando para não deixar uma vírgula sobrando no último item da lista).

---

## 📊 Como ativar o Google Analytics (Opcional)

No arquivo `index.html` (linhas 37 a 46), há um bloco comentado preparado para o **Google Analytics 4 (GA4)**. Basta remover os marcadores de comentário `<!--` e `-->` e substituir `G-XXXXXXXXXX` pelo seu ID do Google Analytics.
