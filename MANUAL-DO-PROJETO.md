# 📘 Manual Completo do Projeto — Achadinhos Onlines

> **Documento de Referência e Histórico de Decisões**  
> **Projeto:** Vitrine de Afiliados do Mercado Livre — *Achadinhos Onlines*  
> **Repositório GitHub:** `https://github.com/FranciscoDGA/achadinhos`  
> **Hospedagem Recomendada:** Vercel (integrada automaticamente ao GitHub) ou HostGator (`achadinhos-hostgator.zip`)

---

## 1. Visão e Filosofia do Projeto (Compra Consciente)

O **Achadinhos Onlines** foi projetado para **não ser mais um site de prateleiras forçado** que tenta empurrar produtos "goela abaixo" dos visitantes.

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

---

## 3. Como Atualizar Produtos ou Adicionar Novos Itens Sempre que Quiser

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
- **`category` (Categoria):** Use exatamente uma das 10 categorias oficiais:
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
- **Como pegar o endereço da foto (`"image"`) de um produto novo no Mercado Livre:**
  Clique com o **botão direito** em cima da foto do produto no Mercado Livre → clique em **"Copiar endereço da imagem"** e cole dentro das aspas do campo `"image"`.

---

## 4. Estrutura de Arquivos e Banners Responsivos

```text
Achadinhos/
├── index.html                  # Estrutura principal da vitrine, guia consciente e modal comparador
├── products.json               # Base com os 100 produtos mais vendidos + seus links de afiliado
├── MANUAL-DO-PROJETO.md        # Este documento completo com tudo o que construímos e combinamos
├── README.md                   # Guia rápido do repositório
├── achadinhos-hostgator.zip    # Pacote pronto caso queira subir também em hospedagem cPanel/HostGator
└── assets/
    ├── style.css               # Visual amarelo/preto/azul + responsividade Desktop, Tablet e Celular
    ├── app.js                  # Lógica de filtros, busca, dicas anti-devolução, comparador e favoritos
    ├── favicon.svg             # Ícone de carrinho na aba do navegador
    ├── banner.jpg              # Banner Oficial Horizontal para Computador/Tablet (1666 × 580 px)
    └── banner-mobile.jpg       # Banner Oficial Vertical para Celular até 600px (800 × 1221 px)
```

### Como funciona o Banner Responsivo:
- Em computadores e tablets (`acima de 600px`), o site carrega automaticamente `assets/banner.jpg` (formato horizontal panorâmico).
- Em celulares (`até 600px`), o site troca automaticamente para `assets/banner-mobile.jpg` (formato vertical pensado para leitura perfeita na tela do celular).
- O banner inteiro é clicável e rola suavemente a página direto para a `#vitrine` de ofertas.

---

## 5. Comandos Rápidos de Git (Caso edite pelo computador)

Sempre que alterar algum arquivo na pasta `c:\Users\User\OneDrive\Desktop\Achadinhos` e quiser enviar para o GitHub/Vercel pelo terminal:

```powershell
git add .
git commit -m "atualiza produtos e ofertas"
git push origin main
```
