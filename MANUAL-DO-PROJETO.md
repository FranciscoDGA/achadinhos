# 📘 Manual Completo do Projeto — Achado Reviews

> **Documento de Referência e Histórico de Decisões**  
> **Projeto:** Vitrine de Afiliados do Mercado Livre — *Achado Reviews*  
> **Repositório GitHub:** `https://github.com/FranciscoDGA/achadinhos`  
> **Hospedagem Recomendada:** Vercel (integrada automaticamente ao GitHub) ou HostGator (`achadinhos-hostgator.zip`)

---

## 1. Visão e Filosofia do Projeto (Compra Consciente)

O **Achado Reviews** foi projetado para **não ser mais um site de prateleiras forçado** que tenta empurrar produtos "goela abaixo" dos visitantes.

### Por que adotamos a filosofia de Compra Consciente?
No Programa de Afiliados do Mercado Livre, **toda vez que um comprador devolve um produto por erro ou arrependimento, a comissão do afiliado é cancelada**.  
Por isso, o site foi desenhado para **orientar o comprador a escolher certo**, reduzindo devoluções e aumentando a confiança na nossa curadoria:

1. **Faixa "3 Passos para uma Compra Consciente":** Orienta o visitante a checar voltagem (`110V/220V`), medidas, fotos reais nas avaliações e o frete antes de finalizar a compra.
2. **Alertas Anti-Devolução por Categoria e nos Cards:**
   - **Eletrodomésticos / Ferramentas:** Lembra de conferir a voltagem (`110V` ou `220V`) e itens da maleta.
   - **Calçados, Roupas e Bolsas:** Lembra de conferir a tabela de medidas em centímetros (`cm`).
   - **Acessórios para Veículos:** Lembra de confirmar o ano e modelo do veículo no seletor do Mercado Livre.
   - **Eletrônicos, Informática, Celulares e Games:** Lembra de checar conexões, memória (`GB/RAM`) e região da conta.
3. **Combinação Dupla de Conversão nos Cards:**
   - **Botão Amarelo Principal (`Ver no Mercado Livre`):** Curto, forte e direto para não perder a conversão de quem já decidiu comprar.
   - **Link Auxiliar Abaixo do Botão (`Conferir avaliações e ficha técnica →`):** Atrai o visitante indeciso ou cauteloso para ler os comentários reais no Mercado Livre — já ativando o seu link de afiliado!
4. **Comparador Lado a Lado (Até 3 Produtos):** Permite selecionar até 3 produtos clicando no ícone `📊` do card para comparar lado a lado, destacando automaticamente qual tem o **🏆 Melhor Ranking** e qual tem o **💰 Menor Preço Consultado**.
5. **Atalhos de "Escolha Segura" (1 Clique):** Filtros rápidos no topo da vitrine (*Só os Top #1*, *Pódio 1º ao 3º*, *Dia a Dia até R$ 100*, *Casa & Oficina*, *Tech & Games*).

---

## 2. Seus Códigos Oficiais de Afiliado do Mercado Livre

Extraídos diretamente da sua conta de afiliado (`Francisco`):

- **Seu ID de Afiliado (`matt_word`):** `trgatyva20230819121948`
- **Seu Código de Ferramenta (`matt_tool`):** `21540510`
- **Parâmetro completo aplicado nos 100 produtos:**
  ```text
  ?matt_word=trgatyva20230819121948&matt_tool=21540510
  ```

### 💡 Dúvidas Importantes que Já Esclarecemos:

1. **"Por que aparece uma tarja preta de Afiliados (`GANHOS % / Compartilhar`) no topo do Mercado Livre quando eu clico num produto?"**
   - Essa tarja preta **só aparece para você** porque o seu navegador está logado na sua própria conta `Francisco` do Mercado Livre.
   - **Nenhum cliente ou visitante do site jamais vê essa tarja preta.** Para testar como um visitante comum vê, basta abrir em uma **Guia Anônima (`Ctrl + Shift + N`)**.

2. **Qual a diferença entre o Link Direto com `matt_word` e o Link Curto (`https://meli.la/...`)?**
   - **Link Direto com seus parâmetros (`https://www.mercadolivre.com.br/.../p/MLB...?matt_word=trgatyva20230819121948&matt_tool=21540510`):** Leva o visitante **direto para a página do anúncio do produto**, sem passar por aquela tela intermediária `/social/` de *"Recomendado por..."*.
   - **Link Curto (`https://meli.la/...`):** Gerado no botão azul **Compartilhar** da tarja preta do Mercado Livre. Você pode usar qualquer um dos dois no campo `"affiliateUrl"` do `products.json`!

3. **"Preciso de banco de dados como o Supabase?"**
   - **Não!** O site é 100% estático e gratuito:
     - Os produtos ficam no arquivo `products.json`.
     - Os **Favoritos (`❤️`)** de cada visitante ficam salvos na memória do próprio navegador dele (`localStorage`), sem exigir login nem senha.
     - O pagamento e a entrega acontecem 100% dentro do Mercado Livre.

4. **"E se o visitante não quiser nenhum dos 100 produtos e pesquisar outro item?"**
   - **Lá no Mercado Livre (Janela de 24h):** Quando o visitante clica em qualquer link do seu site e entra no Mercado Livre, o seu código de afiliado fica registrado por **24 horas**. Se ele desistir do item inicial, pesquisar outro produto lá dentro do Mercado Livre e comprar, **você ganha a comissão normalmente** (venda indireta).
   - **Na Barra de Busca do seu próprio site (`Achado Reviews`):** Se o visitante digitar qualquer produto na busca do seu site que não esteja entre os 100 (ex.: *"Cadeira Gamer"* ou *"Geladeira"*), o site exibe automaticamente o botão amarelo **`🔎 Ver ofertas de "[termo]" no Mercado Livre →`** (e também exibe um banner no rodapé quando há resultados parciais), levando o cliente direto para a pesquisa oficial no Mercado Livre **já com o seu código `matt_word=trgatyva20230819121948&matt_tool=21540510` embutido**!

---

## 3. Como Atualizar Produtos ou Adicionar Novos Itens Sempre que Quiser

### 🤖 Atualização Automática Todo Dia às 06:00 (já configurada!)

O site se atualiza **sozinho, todos os dias às 6 da manhã** (horário de Brasília):

1. O **GitHub Actions** (arquivo `.github/workflows/daily-update.yml`) roda o script `scripts/update-products.js`.
2. O script baixa as páginas **Mais Vendidos** e **Black Friday** do Mercado Livre e reconstrói o **Top 10 de cada uma das 11 categorias** (preços, imagens, links com o seu código de afiliado e a data do dia).
3. Se tudo sair certo, ele faz o `git push` e a **Vercel publica automaticamente**. Se o Mercado Livre bloquear a consulta ou mudar a página, o script **aborta sem publicar** — o site mantém os últimos dados bons.
4. Quiser rodar na mão: **GitHub → aba *Actions* → "Atualização diária de produtos" → *Run workflow***.
5. **Rede de segurança:** além do disparo das 06:00, há um segundo cron às **06:35** — se o GitHub atrasar ou perder o primeiro (acontece em horários de pico da Actions), o backup cobre. Os dois rodam o mesmo script com a trava de execução simultânea; se não houver mudanças, nenhum deploy extra é feito.

As formas manuais abaixo continuam válidas para quando você quiser **incluir um produto específico**, corrigir um preço ou mudar algo à mão.

Você tem **3 formas simples** de atualizar preços, trocar produtos ou adicionar novidades no site:

### Opção A — Pedindo aqui para a IA (Mais Prática!)
Sempre que quiser atualizar o ranking semanal/mensal ou adicionar novos produtos:
1. Abra este projeto no assistente e diga:  
   *"Atualize os preços/produtos mais vendidos do Mercado Livre e envie para o GitHub"* (ou cole aqui a lista de links `https://meli.la/...` ou links de produtos que deseja incluir).
2. A IA atualiza o `products.json` com a data do dia e com o seu código `matt_word=trgatyva20230819121948&matt_tool=21540510`, e já faz o `git push` para atualizar a Vercel automaticamente!

---

### Opção B — Direto pelo Site do GitHub (Sem precisar de código, funciona até pelo celular!)
Como a sua **Vercel** está conectada ao seu **GitHub**, qualquer alteração feita lá atualiza o site no ar em **15 segundos**:
1. Acesse `https://github.com/FranciscoDGA/achadinhos`
2. Clique sobre o arquivo **`products.json`**.
3. Clique no ícone de **Lápis (✏️ Edit this file)** no canto superior direito.
4. Altere o preço (`"price"`), a data (`"consultedAt"`), o link (`"affiliateUrl"`) ou adicione um novo bloco de produto.
5. Clique no botão verde **"Commit changes..."** no topo direito e confirme.
6. Pronto! A Vercel detecta a mudança e publica a nova versão do site sozinha.

> **⚠️ Regra de cache (importante):** os arquivos de `/assets/` são servidos com cache de 1 ano (`immutable`, definido no `vercel.json`). Por isso, **sempre que alterar `style.css` ou `app.js`, incremente a versão no HTML**: troque `style.css?v=2.2` (e `app.js?v=2.2`) por `v=2.3`, `v=2.4` etc. Sem esse passo, visitantes fiéis continuam vendo a versão antiga. **Trocar o banner:** substitua os arquivos `assets/banner.webp` e `assets/banner-mobile.webp` (e os `.jpg` equivalentes, usados no preview do WhatsApp) — o site exibe a cada 1 hora, então a mudança aparece sozinha em até 1h.
>
> **⚠️ Acentuação (importante):** os HTMLs do site são **UTF-8**. Ao editar vários arquivos em lote, **não use PowerShell `Get-Content`/`Set-Content`** (o Windows 5.1 lê UTF-8 como ANSI e quebra os acentos — vira `Ã©`). Use um editor de texto (VS Code, Bloco de Notas com UTF-8) ou scripts Node. Se aparecer `Ã©`/`Ã¡` em algum artigo, o texto foi salvo com codificação duplicada — refaça a edição em UTF-8.

---

### Opção C — Editando no Computador (`products.json`)
Abra o arquivo `products.json` no Bloco de Notas ou VS Code. Cada produto tem este formato exato:

```json
{
  "id": 101,
  "name": "Nome Completo do Produto no Mercado Livre",
  "price": 149.90,
  "consultedAt": "02/11/2026",
  "category": "Eletrodomésticos",
  "rank": 11,
  "image": "https://http2.mlstatic.com/D_Q_NP_2X_CODIGO_DA_IMAGEM.webp",
  "affiliateUrl": "https://www.mercadolivre.com.br/link-do-produto/p/MLB123456?matt_word=trgatyva20230819121948&matt_tool=21540510"
}
```

#### ⚠️ Regras importantes ao editar o `products.json`:
- **`price` (Preço):** Use sempre **ponto** para separar os centavos (ex.: `149.90` e nunca `149,90`).
- **`category` (Categoria):** Use exatamente uma das 11 categorias da vitrine (10 oficiais + Black Friday):
  1. `"Games"`
  2. `"Eletrodomésticos"`
  3. `"Ferramentas"`
  4. `"Beleza e Cuidado Pessoal"`
  5. `"Celulares e Telefones"`
  6. `"Informática"`
  7. `"Eletrônicos, Áudio e Vídeo"`
  8. `"Esportes e Fitness"`
  9. `"Calçados, Roupas e Bolsas"`
  10. `"Acessórios para Veículos"`
  11. `"Black Friday"` (seleção especial de ofertas)
- **Como pegar o endereço da foto (`"image"`) de um produto novo no Mercado Livre:**
  Clique com o **botão direito** em cima da foto do produto no Mercado Livre → clique em **"Copiar endereço da imagem"** e cole dentro das aspas do campo `"image"`.

---

## 4. Estrutura de Arquivos e Banners Responsivos

```text
Achadinhos/
├── index.html                  # Estrutura principal, SEO Schema.org, FAQ, VIP WhatsApp e Comparador
├── products.json               # Base com os 110 produtos (10 categorias + Black Friday) e os links de afiliado
├── robots.txt                  # Liberação de rastreamento para Google, Bing e buscadores
├── sitemap.xml                 # Mapa do site com todas as categorias, filtros e artigos do blog
├── MANUAL-DO-PROJETO.md        # Este documento completo com tudo o que construímos e o plano 100k/mês
├── README.md                   # Guia rápido do repositório
├── blog/
│   ├── index.html              # Listagem do blog (10 artigos)
│   ├── melhor-creatina/        # Artigo: Qual a melhor creatina? Growth vs Dark Lab vs Soldiers
│   ├── melhor-celular-ate-1400/# Artigo: Melhor celular até R$ 1.400 (Galaxy A17 vs A07 vs Moto G)
│   ├── melhor-fone-bluetooth/  # Artigo: Melhor fone bluetooth até R$ 200
│   ├── melhor-parafusadeira-sem-fio/ # Artigo: Melhor parafusadeira sem fio até R$ 150
│   └── produtos-pele-sensivel/ # Artigo: Cicaplast vs CeraVe vs Hidrabene
├── scripts/
│   └── update-products.js      # Scraper diário do Mercado Livre (roda no GitHub Actions às 06:00)
├── .github/
│   └── workflows/daily-update.yml  # Automação diária: atualiza products.json e publica
├── achadinhos-hostgator.zip    # Pacote pronto caso queira subir também em hospedagem cPanel/HostGator
└── assets/
    ├── style.css               # Visual amarelo/preto/azul + responsividade Desktop, Tablet e Celular (inclui estilos do blog)
    ├── app.js                  # Lógica de filtros, URL compartilhável, listas WhatsApp, comparador e busca ML
    ├── favicon.svg             # Ícone de carrinho na aba do navegador
    ├── banner.jpg              # Banner Oficial Horizontal para Computador/Tablet (1666 × 580 px)
    └── banner-mobile.jpg       # Banner Oficial Vertical para Celular até 600px (800 × 1221 px)
```

### Como funciona o Banner Responsivo:
- Em computadores e tablets (`acima de 600px`), o site carrega automaticamente `assets/banner.jpg` (formato horizontal panorâmico).
- Em celulares (`até 600px`), o site troca automaticamente para `assets/banner-mobile.jpg` (formato vertical pensado para leitura perfeita na tela do celular).
- O banner inteiro é clicável e rola suavemente a página direto para a `#vitrine` de ofertas.

---

## 5. Os 7 Motores de Tração Orgânica e Viralização Implementados no Site

Para fazer o site **se vender sozinho** e cair no gosto do brasileiro sem anúncios pagos, implementamos 7 motores técnicos:

1. **Motor 1 — SEO Completo para o Google (`Schema.org JSON-LD` + `sitemap.xml` + `robots.txt` + FAQ):**
   - O cabeçalho do site entrega ao Google dados estruturados de `WebSite`, `FAQPage` (Perguntas Frequentes que aparecem direto na página de busca do Google) e `ItemList` dinâmico com os Campeões de Vendas (`1º Lugar`).
2. **Motor 2 — Botão Viral "📲 Enviar Favoritos no WhatsApp" e "📲 Enviar Comparativo no WhatsApp":**
   - Quando o visitante marca produtos com coração (`❤️`) ou adiciona até 3 itens no Comparador Lado a Lado (`⚖️`), ele pode clicar em **Enviar no WhatsApp**.
   - A mensagem já sai formatada com os nomes dos produtos, preços de referência e **todos os seus links de afiliado** (`matt_word=trgatyva20230819121948&matt_tool=21540510`), além do link do seu site no final. Assim, quando a pessoa manda para o marido, esposa ou grupo da família, qualquer um que clicar e comprar gera comissão para você.
3. **Motor 3 — Links Inteligentes por Categoria/Filtro + Botão "🔗 Copiar Link":**
   - O site aceita links diretos que já abrem a vitrine filtrada e rolam até os produtos:
     - `https://achadoreviews.com.br/?filtro=under50` *(Abre direto nos Presentes & Achadinhos até R$ 50)*
     - `https://achadoreviews.com.br/?filtro=under100` *(Abre direto nas Utilidades do Dia a Dia até R$ 100)*
     - `https://achadoreviews.com.br/?filtro=top1` *(Abre direto nos 10 Líderes Absolutos — 1º Lugar de cada categoria)*
     - `https://achadoreviews.com.br/?filtro=home` *(Abre direto em Casa & Oficina)*
     - `https://achadoreviews.com.br/?filtro=tech` *(Abre direto em Tech & Games)*
     - `https://achadoreviews.com.br/?filtro=wellness` *(Abre direto em Saúde, Beleza & Treino)*
     - `https://achadoreviews.com.br/?categoria=Eletrodomésticos` *(Funciona com qualquer uma das 10 categorias)*
     - `https://achadoreviews.com.br/?busca=air+fryer` *(Abre direto pesquisando qualquer termo)*
4. **Motor 4 — Atalhos "O Que o Brasileiro Mais Procura":**
   - Filtros de 1 clique para compras por impulso consciente: **🎁 Presentes & Achadinhos até R$ 50**, **💡 Dia a Dia até R$ 100** e **💪 Saúde, Beleza & Treino**.
5. **Motor 5 — Busca Infinita com Seu Código de Afiliado:**
   - Mesmo que o visitante digite na barra de busca algo que **não está nos 100 produtos** (ex.: *"Bicicleta"*, *"Perfume árabe"*, *"Pneu aro 15"*), o site exibe um botão direto para abrir a pesquisa daquele produto no Mercado Livre já cravado com a sua tag de afiliado. Você nunca perde uma venda.
6. **Motor 6 — Central de Achadinhos no WhatsApp (Envio do Top 10 `1º Lugar`):**
   - Na seção verde especial antes do rodapé, o visitante pode clicar em **"🏆 Enviar Top 10 (1º Lugares) no Meu WhatsApp"** para guardar os 10 campeões de vendas no próprio celular com todos os seus links de afiliado prontos para clicar a qualquer hora.
7. **Motor 7 — Blog de Reviews e Guias de Compra (`/blog/`):**
   - **Listagem:** `https://achadoreviews.com.br/blog/` com os cards dos artigos.
   - **10 artigos** (páginas estáticas independentes, sem JavaScript, em ordem de publicação):
     - `/blog/black-friday-2026/` — Data, preparação e ofertas (Black Friday) — 08/11/2026
     - `/blog/melhor-creatina/` — Growth vs Dark Lab vs Soldiers (Esportes) — 07/11/2026
     - `/blog/presentes-gamer-ate-150/` — Gift cards, controle e acessórios (Games) — 05/11/2026
     - `/blog/melhor-celular-ate-1400/` — Galaxy A17 vs A07 vs Moto G (Celulares) — 03/11/2026
     - `/blog/melhor-tenis-caminhada-ate-100/` — Kappa Park + kit de treino (Calçados) — 01/11/2026
     - `/blog/melhor-fone-bluetooth/` — Anker vs Xiaomi vs JBL (Eletrônicos) — 31/10/2026
     - `/blog/carregador-bateria-12v-6a/` — 2 carregadores inteligentes (Veículos) — 29/10/2026
     - `/blog/melhor-parafusadeira-sem-fio/` — 48V vs impacto vs WAP (Ferramentas) — 27/10/2026
     - `/blog/melhores-eletrodomesticos-ate-120/` — Chaleira, liquidificador e ventilador (Eletrodomésticos) — 25/10/2026
     - `/blog/produtos-pele-sensivel/` — Cicaplast vs CeraVe vs Hidrabene (Beleza) — 24/10/2026
   - Cada artigo tem: `Schema.org` (`Article` + `FAQPage` + `BreadcrumbList`), links internos para a categoria correspondente da vitrine, links de afiliado com `rel="sponsored nofollow"` e data de publicação/atualização.
   - **Como publicar um artigo novo:** crie uma pasta em `blog/<slug-do-artigo>/index.html` seguindo o modelo dos artigos existentes, adicione o card na listagem (`blog/index.html`), a URL no `sitemap.xml` e os links no rodapé/gaveta do site. Depois é só commitar (o deploy é automático na Vercel).
   - **Manutenção:** os preços citados nos artigos têm data ("consultados em DD/MM/AAAA"). Revisar os artigos de 3 em 3 meses para atualizar preços e conferir se os links dos produtos continuam ativos.

---

## 6. Roteiro Prático de Tráfego Orgânico Rumo aos R$ 100k/mês

O site já converte, educa para evitar devoluções e mantém seu código de afiliado em 100% dos cliques. Agora, para atrair milhares de brasileiros todos os dias de graça:

### Passo 1: Cadastrar o Sitemap no Google Search Console (10 minutos — Uma única vez)
1. Acesse [search.google.com/search-console](https://search.google.com/search-console).
2. Adicione a propriedade com a URL do seu site (`https://achadoreviews.com.br/`).
3. No menu lateral esquerdo, clique em **Sitemaps** e digite `sitemap.xml` → clique em **Enviar**.
4. Isso avisa ao Google sobre todas as suas páginas e filtros (`?filtro=under50`, `?categoria=Eletrodomésticos`, etc.) e ativa as perguntas frequentes (FAQ) nos resultados de busca.

### Passo 2: Máquina de Vídeos Curtos Sem Aparecer (TikTok, Reels, YouTube Shorts e Kwai)
O brasileiro consome vídeos de 15 a 30 segundos mostrando utilidades práticas. Em vez de mandar a pessoa comentar "Eu quero", mande para a sua **vitrine de compra consciente**:
- **Formato Campeão 1 — "Os 3 Mais Vendidos de Cozinha no Mercado Livre (e o que olhar antes de comprar)":**
  - Mostre a imagem/vídeo rápido da Air Fryer, Balança Digital e Chaleira Elétrica.
  - Diga: *"Quer comparar os 3 lado a lado e ver a ficha técnica oficial para não errar a voltagem? O link da curadoria de Casa & Cozinha está na bio!"*
  - Use o link direto: `https://achadoreviews.com.br/?filtro=home`
- **Formato Campeão 2 — "5 Achadinhos Úteis até R$ 50 que todo mundo está comprando no Mercado Livre":**
  - Use o link direto: `https://achadoreviews.com.br/?filtro=under50`
- **Formato Campeão 3 — "O 1º Lugar de cada categoria no Mercado Livre este mês":**
  - Use o link direto: `https://achadoreviews.com.br/?filtro=top1`

### Passo 3: Pinterest Brasil (Tráfego Perpétuo no Piloto Automático)
Diferente do Instagram onde um post dura 24 horas, um Pin no **Pinterest** continua mandando cliques para o seu site por **6 a 12 meses**:
1. Crie uma conta gratuita no Pinterest Business (*Achado Reviews*).
2. Crie pastas com os mesmos nomes dos seus filtros: *"Achadinhos até R$ 50"*, *"Cozinha & Eletrodomésticos Mais Vendidos"*, *"Ferramentas Campeãs de Vendas"*.
3. Suba as fotos dos produtos e coloque no campo **Link de destino** a URL filtrada do seu site (ex.: `https://achadoreviews.com.br/?categoria=Eletrodomésticos`). Quando a pessoa clica no Pinterest, ela cai na sua vitrine, vê o selo de confiança, compara e clica para o Mercado Livre com seu cookie de afiliado ativo por 24h!

---

## 7. Padrões de Responsividade Mobile e Trava de Overflow Horizontal (Tela 100% Firme)

Para garantir uma experiência de navegação impecável em qualquer smartphone (iOS e Android), sem que o visitante consiga arrastar a página para os lados com o dedo:

### O Que Foi Identificado e Corrigido:
1. **Quebra dos Controles da Vitrine (`.vitrine-controls`):**
   - Com múltiplos botões (*"Indicar no WhatsApp"*, *"Copiar Link"*, *"Filtrar"* e *"Ordenar por"*), uma linha fixa somava mais de `520px` (estourando telas de 360px a 414px).
   - **Solução implementada:** `flex-wrap: wrap; max-width: 100%;` com botões flexíveis (`flex: 1 1 calc(50% - 4px)` em telas até 600px).
2. **Contenção no Flexbox do Subnav (`.subnav-links`):**
   - No Flexbox, elementos com rolagem horizontal sem `min-width: 0` podem forçar o container pai a se expandir até a largura de todo o texto somado (+700px).
   - **Solução implementada:** `min-width: 0; width: 100%; max-width: 100%; -webkit-overflow-scrolling: touch;`.
3. **Bloqueio Global no `html` e `body`:**
   - Adicionado no CSS: `overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; position: relative;`. Isso trava o canvas do navegador impedindo qualquer deslocamento indesejado para as laterais.
4. **Isolamento de Carrosséis Internos:**
   - As áreas que realmente precisam deslizar com o dedo (ex.: os atalhos de escolha segura `#smartShortcutsBar` e os cards de categorias `.category-cards-scroll`) rolam de forma fluida internamente via toque, mantendo o restante da página estável.
5. **Barra Flutuante de Comparação no Celular (`.compare-floating-bar`):**
   - Configurada em coluna vertical com botões ocupando 100% da largura, evitando sobreposição e vazamento em telas estreitas.

---

## 8. Comandos Rápidos de Git (Caso edite pelo computador)

Sempre que alterar algum arquivo na pasta `c:\Users\User\OneDrive\Desktop\Achadinhos` e quiser enviar para o GitHub/Vercel pelo terminal:

```powershell
git add .
git commit -m "atualiza produtos e ofertas"
git push origin main
```


