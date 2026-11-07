#!/usr/bin/env node
/**
 * Atualiza products.json com os atuais Top 10 do Mercado Livre.
 *
 * Fontes:
 *   - https://www.mercadolivre.com.br/mais-vendidos  (10 categorias)
 *   - https://www.mercadolivre.com.br/black-friday   (categoria Black Friday)
 *
 * Regras:
 *   - Preserva o `id` dos produtos já existentes (quebra de favoritos salvos).
 *   - Mantém a tag de afiliado (matt_word/matt_tool) em todos os links.
 *   - Só grava se TODAS as 11 categorias tiverem 10 produtos válidos;
 *     caso contrário aborta com código != 0 e nada é alterado.
 *
 * Uso:
 *   node scripts/update-products.js            # grava products.json
 *   node scripts/update-products.js --dry-run  # só mostra o resumo
 */
'use strict';

const fs = require('fs');
const path = require('path');

const AFFILIATE_QUERY = 'matt_word=trgatyva20230819121948&matt_tool=21540510';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const URL_MAIS_VENDIDOS = 'https://www.mercadolivre.com.br/mais-vendidos';
const URL_BLACK_FRIDAY = 'https://www.mercadolivre.com.br/black-friday';
const TOP_N = 10;
const FETCH_TRIES = 3;

const REQUIRED_CATEGORIES = [
  'Games',
  'Eletrodomésticos',
  'Ferramentas',
  'Beleza e Cuidado Pessoal',
  'Celulares e Telefones',
  'Informática',
  'Eletrônicos, Áudio e Vídeo',
  'Esportes e Fitness',
  'Calçados, Roupas e Bolsas',
  'Acessórios para Veículos',
  'Black Friday'
];

const DRY_RUN = process.argv.includes('--dry-run');
const PRODUCTS_FILE = path.join(__dirname, '..', 'products.json');

// ---------------------------------------------------------------------------
// FETCH
// ---------------------------------------------------------------------------
async function fetchHtml(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= FETCH_TRIES; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
        headers: {
          'user-agent': USER_AGENT,
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'pt-BR,pt;q=0.9'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      if (!html.includes('poly-card poly-card--grid-card')) {
        throw new Error('HTML sem cards do Mercado Livre (bloqueio ou mudança de marcação)');
      }
      return html;
    } catch (error) {
      lastError = error;
      console.error(`  tentativa ${attempt}/${FETCH_TRIES} falhou em ${url}: ${error.message}`);
      if (attempt < FETCH_TRIES) {
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
      }
    }
  }
  throw new Error(`Falha ao baixar ${url}: ${lastError && lastError.message}`);
}

// ---------------------------------------------------------------------------
// PARSING
// ---------------------------------------------------------------------------
function decodeEntities(text) {
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeEntities(String(html).replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

/** Extrai o ID MLB de uma URL (aceita /p/MLB123, /up/MLBU123 e legado /MLB-123). */
function extractMlbId(url) {
  const s = String(url || '');
  const modern = s.match(/\/(?:p|up)\/(MLB[A-Z0-9]+)/);
  if (modern) return modern[1];
  const legacy = s.match(/\/(MLB[A-Z]?)-(\d+)/);
  if (legacy) return legacy[1] + legacy[2];
  return null;
}

function parsePrice(block) {
  // Padrão principal: bloco do preço atual
  const idx = block.indexOf('poly-price__current');
  if (idx >= 0) {
    const seg = block.slice(idx, idx + 700);
    const frac = seg.match(/__fraction"[^>]*>([\d.]+)</);
    if (frac) {
      const cents = seg.match(/__cents"[^>]*>(\d+)</);
      const inteiro = Number(frac[1].replace(/\./g, '').replace(/,/g, ''));
      const centavos = cents ? Number(cents[1]) / 100 : 0;
      const price = inteiro + centavos;
      if (Number.isFinite(price) && price > 0) return price;
    }
  }
  // Fallback: aria-label "66 reais com 33 centavos" (ignora "Antes: ...")
  const aria = block.match(/aria-label="(\d[\d.]*) reais(?: com (\d+) centavos)?"/);
  if (aria) {
    const inteiro = Number(aria[1].replace(/\./g, '').replace(/,/g, ''));
    const centavos = aria[2] ? Number(aria[2]) / 100 : 0;
    const price = inteiro + centavos;
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
}

function parseCards(html) {
  const starts = [];
  const re = /poly-card poly-card--grid-card/g;
  let m;
  while ((m = re.exec(html)) !== null) starts.push(m.index);

  const cards = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1] : Math.min(html.length, start + 15000);
    const block = html.slice(start, end);

    // Âncora do título
    const tagMatch = block.match(/<a[^>]*class="poly-component__title[^"]*"[^>]*>/);
    if (!tagMatch) continue;
    const hrefMatch = tagMatch[0].match(/href="([^"]+)"/);
    if (!hrefMatch) continue;
    const innerStart = block.indexOf(tagMatch[0]) + tagMatch[0].length;
    const innerEnd = block.indexOf('</a>', innerStart);
    if (innerEnd < 0) continue;
    const name = stripTags(block.slice(innerStart, innerEnd));
    if (!name) continue;

    const rawUrl = decodeEntities(hrefMatch[1]).split('#')[0];
    const mlbId = extractMlbId(rawUrl);
    if (!mlbId) continue;

    const price = parsePrice(block);
    if (price == null) continue;

    let image = null;
    const imgTag = block.match(/<img[^>]*poly-component__picture[^>]*>/);
    const imgSrc = (imgTag ? imgTag[0] : '').match(/src="([^"]+)"/);
    if (imgSrc) image = imgSrc[1];
    if (!image) {
      const anyImg = block.match(/<img[^>]*src="(https:\/\/http2\.mlstatic\.com[^"]+)"/);
      if (anyImg) image = anyImg[1];
    }

    cards.push({
      mlbId,
      name,
      price,
      image,
      url: rawUrl.startsWith('http') ? rawUrl : `https://www.mercadolivre.com.br${rawUrl}`,
      pos: start
    });
  }
  return cards;
}

function parseSections(html) {
  const sections = [];
  const re = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    sections.push({ start: m.index, title: stripTags(m[1]) });
  }
  return sections;
}

function categoryFromTitle(title) {
  const mv = title.match(/^Mais vendidos em (.+)$/i);
  if (mv) return mv[1].trim();
  if (/black\s*friday/i.test(title)) return 'Black Friday';
  return null;
}

function groupByCategory(html) {
  const sections = parseSections(html);
  const cards = parseCards(html);
  const groups = new Map();

  for (const card of cards) {
    // Seção = último h1/h2 anterior ao card
    let title = '';
    for (const section of sections) {
      if (section.start < card.pos) title = section.title;
      else break;
    }
    const category = categoryFromTitle(title);
    if (!category) continue;
    if (!groups.has(category)) groups.set(category, []);
    const list = groups.get(category);
    if (list.some((c) => c.mlbId === card.mlbId)) continue; // deduplica
    list.push(card);
  }
  return groups;
}

/** Divide a página em seções (h1/h2) e devolve os cards de cada uma, em ordem. */
function parseSectionsWithCards(html) {
  const sections = parseSections(html).map((s) => ({ ...s, cards: [] }));
  const cards = parseCards(html);

  for (const card of cards) {
    let index = -1;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].start < card.pos) index = i;
      else break;
    }
    if (index < 0) continue;
    const list = sections[index].cards;
    if (list.some((c) => c.mlbId === card.mlbId)) continue; // deduplica
    list.push(card);
  }
  return sections;
}

// ---------------------------------------------------------------------------
// RECONSTRUÇÃO DO products.json
// ---------------------------------------------------------------------------
function todayBR() {
  const now = new Date();
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = now.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function rebuild(existing, groups) {
  const consultedAt = todayBR();
  const problems = [];

  for (const category of REQUIRED_CATEGORIES) {
    const list = groups.get(category);
    if (!list || list.length < TOP_N) {
      problems.push(
        `categoria "${category}" com apenas ${list ? list.length : 0} produtos válidos (mínimo ${TOP_N})`
      );
    }
  }
  if (problems.length) {
    const error = new Error(`Atualização abortada:\n - ${problems.join('\n - ')}`);
    error.validation = true;
    throw error;
  }

  // Ordem das categorias conforme o arquivo atual (preserva layout)
  const categoryOrder = [];
  for (const product of existing) {
    if (!categoryOrder.includes(product.category)) categoryOrder.push(product.category);
  }
  for (const category of REQUIRED_CATEGORIES) {
    if (!categoryOrder.includes(category)) categoryOrder.push(category);
  }

  let nextId = existing.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
  const stats = {};
  const result = [];

  for (const category of categoryOrder) {
    const list = groups.get(category) || [];
    const top = list.slice(0, TOP_N);
    const existingByMlb = new Map(
      existing
        .filter((p) => p.category === category)
        .map((p) => [extractMlbId(p.affiliateUrl), p])
        .filter(([key]) => key)
    );

    const kept = [];
    const added = [];
    top.forEach((card, index) => {
      const base = {
        name: card.name,
        price: card.price,
        consultedAt,
        category,
        rank: index + 1,
        image: card.image || '',
        affiliateUrl: `${card.url}?${AFFILIATE_QUERY}`
      };
      const prior = existingByMlb.get(card.mlbId);
      if (prior) {
        result.push({ ...base, id: prior.id });
        kept.push(card.name);
      } else {
        result.push({ ...base, id: nextId++ });
        added.push(card.name);
      }
    });

    const topIds = new Set(top.map((c) => c.mlbId));
    const removed = existing
      .filter((p) => p.category === category)
      .filter((p) => {
        const id = extractMlbId(p.affiliateUrl);
        return id && !topIds.has(id);
      })
      .map((p) => p.name);

    stats[category] = { kept: kept.length, added, removed };
  }

  return { products: result, stats, consultedAt };
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  console.log('Baixando páginas do Mercado Livre...');
  const [htmlMaisVendidos, htmlBlackFriday] = await Promise.all([
    fetchHtml(URL_MAIS_VENDIDOS),
    fetchHtml(URL_BLACK_FRIDAY)
  ]);

  const groups = new Map();

  // Mais Vendidos: uma seção por categoria oficial
  const mvGroups = groupByCategory(htmlMaisVendidos);
  console.log(
    ` mais-vendidos: ${mvGroups.size} categorias, ${[...mvGroups.values()].reduce((n, l) => n + l.length, 0)} produtos`
  );
  for (const [category, list] of mvGroups) groups.set(category, list);

  // Black Friday: preferimos a seção "Mais Vendidos" da promoção (ranking real)
  const bfSections = parseSectionsWithCards(htmlBlackFriday);
  const bfPreferred = bfSections.find((s) => /^Mais Vendidos/i.test(s.title) && s.cards.length > 0);
  const bfList = bfPreferred
    ? bfPreferred.cards
    : bfSections.flatMap((s) => s.cards).filter((c, i, arr) => arr.findIndex((x) => x.mlbId === c.mlbId) === i);
  groups.set('Black Friday', bfList);
  console.log(
    ` black-friday: seção "${bfPreferred ? bfPreferred.title : 'todas as seções'}", ${bfList.length} produtos`
  );

  const existing = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  const { products, stats, consultedAt } = rebuild(existing, groups);

  console.log(`\nResumo da atualização (data ${consultedAt}):`);
  for (const category of REQUIRED_CATEGORIES) {
    const s = stats[category];
    if (!s) continue;
    console.log(` ${category}: mantidos ${s.kept} | novos ${s.added.length} | saíram ${s.removed.length}`);
    s.added.forEach((name) => console.log(`   + ${name.slice(0, 70)}`));
    s.removed.forEach((name) => console.log(`   - ${name.slice(0, 70)}`));
  }
  console.log(` Total: ${existing.length} → ${products.length} produtos`);

  if (DRY_RUN) {
    console.log('\n[dry-run] products.json NÃO foi alterado.');
    return;
  }

  fs.writeFileSync(PRODUCTS_FILE, `${JSON.stringify(products, null, 2)}\n`, 'utf8');
  console.log('\nproducts.json atualizado com sucesso.');
}

main().catch((error) => {
  console.error(`\nERRO: ${error.message}`);
  process.exit(1);
});
