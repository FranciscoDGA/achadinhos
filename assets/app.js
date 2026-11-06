/**
 * ACHADO REVIEWS — Script Principal (assets/app.js)
 * Carrega products.json, organiza por categoria oficial do Mercado Livre,
 * gerencia busca em tempo real, filtros de preço/ranking, atalhos de escolha segura,
 * lembretes de compra consciente (redução de devoluções), comparador lado a lado (até 3 itens),
 * favoritos no navegador e compartilhamento rápido no WhatsApp.
 */

(function () {
  'use strict';

  const FAVORITES_STORAGE_KEY = 'achadinhos_ml_favorites_v1';

  // Ícones e dicas de "Compra Sem Erro" das 11 categorias da vitrine (10 oficiais do ML + Black Friday)
  const CATEGORY_META = {
    'Games': {
      icon: '🎮',
      shortName: 'Games',
      cardTip: '🎮 Confira plataforma ou região da conta no ML',
      categoryAlert: 'Dica de Compra Consciente: Para gift cards e jogos digitais, confirme a região da sua conta; para acessórios, verifique a compatibilidade com seu console/PC.'
    },
    'Eletrodomésticos': {
      icon: '🍳',
      shortName: 'Eletrodomésticos',
      cardTip: '⚡ Confira a voltagem (110V ou 220V) no anúncio',
      categoryAlert: 'Evite devoluções: Antes de finalizar no Mercado Livre, selecione a voltagem correta da sua tomada (110V ou 220V) e confira as dimensões do aparelho.'
    },
    'Ferramentas': {
      icon: '🛠️',
      shortName: 'Ferramentas',
      cardTip: '⚡ Confira voltagem/bateria e itens da maleta',
      categoryAlert: 'Evite devoluções: Verifique no anúncio a voltagem (110V/220V ou Bivolt) e a lista exata de brocas, baterias ou acessórios inclusos na embalagem.'
    },
    'Beleza e Cuidado Pessoal': {
      icon: '🧴',
      shortName: 'Beleza e Cuidado',
      cardTip: '🧴 Confira volume/peso e avaliações de uso',
      categoryAlert: 'Dica de Compra Consciente: Para aparelhos elétricos (secadores/escovas), confira a voltagem; para cosméticos, verifique a volumetria (ml/g) na descrição.'
    },
    'Celulares e Telefones': {
      icon: '📱',
      shortName: 'Celulares e Telefones',
      cardTip: '📱 Confira memória (GB/RAM) na ficha técnica',
      categoryAlert: 'Compra Segura: Confira a capacidade de armazenamento (GB), memória RAM e se o vendedor possui termômetro verde ou selo de Loja Oficial.'
    },
    'Informática': {
      icon: '💻',
      shortName: 'Informática',
      cardTip: '💻 Confira conexões e especificações técnicas',
      categoryAlert: 'Dica de Compra Consciente: Verifique conexões (USB, HDMI, Wi-Fi), sistema operacional e requisitos de compatibilidade na ficha técnica do anúncio.'
    },
    'Eletrônicos, Áudio e Vídeo': {
      icon: '🎧',
      shortName: 'Eletrônicos e Áudio',
      cardTip: '🔌 Confira conexões e polegadas compatíveis',
      categoryAlert: 'Evite erros de compatibilidade: Em suportes de TV, confira o padrão VESA e polegadas; em cabos e áudio, verifique o tipo de entrada do seu aparelho.'
    },
    'Esportes e Fitness': {
      icon: '⚽',
      shortName: 'Esportes e Fitness',
      cardTip: '🏅 Confira peso/tamanho e tabela nutricional',
      categoryAlert: 'Dica de Compra Consciente: Em suplementos, verifique o peso líquido (g/kg) e sabor selecionado; em equipamentos, confira o tamanho ou carga suportada.'
    },
    'Calçados, Roupas e Bolsas': {
      icon: '👕',
      shortName: 'Calçados e Moda',
      cardTip: '📏 Confira a tabela de medidas (cm) no anúncio',
      categoryAlert: 'Evite trocas de numeração: Consulte o Guia de Tamanhos (em centímetros) dentro do anúncio do Mercado Livre e veja nos comentários se a forma é normal.'
    },
    'Acessórios para Veículos': {
      icon: '🛞',
      shortName: 'Acessórios Veículos',
      cardTip: '🚗 Confirme ano/modelo do seu veículo no ML',
      categoryAlert: 'Evite devoluções: Use o verificador de compatibilidade de veículos do Mercado Livre ou confirme nas perguntas se a peça atende ao ano/modelo do seu carro ou moto.'
    },
    'Black Friday': {
      icon: '🖤',
      shortName: 'Black Friday',
      cardTip: '🖤 Confira o desconto real: compare preço antes e depois no anúncio',
      categoryAlert: 'Black Friday: Compare o preço de antes e depois do desconto, confira o frete para o seu CEP e valide se a oferta é do vendedor oficial antes de finalizar a compra.'
    }
  };

  // Estado Global da Vitrine
  const state = {
    products: [],
    categories: [],
    searchQuery: '',
    selectedCategory: 'all',
    categoryGroup: null, // 'home' | 'tech' | null
    activePreset: 'all',
    maxPrice: 2500,
    maxRank: 'all',
    onlyFavorites: false,
    sortBy: 'rank',
    favorites: new Set(),
    compareList: [] // IDs de até 3 produtos para comparação lado a lado
  };

  // Elementos do DOM
  const els = {
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    searchBtn: document.getElementById('searchBtn'),
    headerFavBtn: document.getElementById('headerFavBtn'),
    favCountBadge: document.getElementById('favCountBadge'),
    drawerFavCount: document.getElementById('drawerFavCount'),
    headerUpdatedDate: document.getElementById('headerUpdatedDate'),
    allCategoriesToggle: document.getElementById('allCategoriesToggle'),
    categoriesDropdownMenu: document.getElementById('categoriesDropdownMenu'),
    subnavLinks: document.getElementById('subnavLinks'),
    categoryCardsGrid: document.getElementById('categoryCardsGrid'),
    sidebarCategorySelect: document.getElementById('sidebarCategorySelect'),
    priceRangeSlider: document.getElementById('priceRangeSlider'),
    priceRangeLabel: document.getElementById('priceRangeLabel'),
    onlyFavoritesToggle: document.getElementById('onlyFavoritesToggle'),
    sortSelect: document.getElementById('sortSelect'),
    smartShortcutsBar: document.getElementById('smartShortcutsBar'),
    productsContainer: document.getElementById('productsContainer'),
    emptyState: document.getElementById('emptyState'),
    emptyStateTitle: document.getElementById('emptyStateTitle'),
    emptyStateDesc: document.getElementById('emptyStateDesc'),
    emptyMlSearchBtn: document.getElementById('emptyMlSearchBtn'),
    emptyMlSearchBtnText: document.getElementById('emptyMlSearchBtnText'),
    activeSectionTitle: document.getElementById('activeSectionTitle'),
    resultsCounterText: document.getElementById('resultsCounterText'),
    leadersGrid: document.getElementById('leadersGrid'),
    openDrawerBtn: document.getElementById('openDrawerBtn'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    mobileDrawer: document.getElementById('mobileDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    drawerCategoryList: document.getElementById('drawerCategoryList'),
    drawerFavLink: document.getElementById('drawerFavLink'),
    openFilterPanelBtn: document.getElementById('openFilterPanelBtn'),
    closeFilterPanelBtn: document.getElementById('closeFilterPanelBtn'),
    filtersSidebar: document.getElementById('filtersSidebar'),
    filterBackdrop: document.getElementById('filterBackdrop'),
    mobileFilterDot: document.getElementById('mobileFilterDot'),
    applyFiltersBtn: document.getElementById('applyFiltersBtn'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),
    resetCatBtn: document.getElementById('resetCatBtn'),
    logoResetBtn: document.getElementById('logoResetBtn'),
    footerAllLink: document.getElementById('footerAllLink'),
    footerFavLink: document.getElementById('footerFavLink'),
    backToTopBtn: document.getElementById('backToTopBtn'),
    compareFloatingBar: document.getElementById('compareFloatingBar'),
    compareCountText: document.getElementById('compareCountText'),
    compareThumbsList: document.getElementById('compareThumbsList'),
    clearCompareBtn: document.getElementById('clearCompareBtn'),
    openCompareModalBtn: document.getElementById('openCompareModalBtn'),
    compareModalBackdrop: document.getElementById('compareModalBackdrop'),
    compareModal: document.getElementById('compareModal'),
    closeCompareModalBtn: document.getElementById('closeCompareModalBtn'),
    compareModalBody: document.getElementById('compareModalBody'),
    shareFavsWhatsAppBtn: document.getElementById('shareFavsWhatsAppBtn'),
    shareSelectionWhatsAppBtn: document.getElementById('shareSelectionWhatsAppBtn'),
    copySelectionLinkBtn: document.getElementById('copySelectionLinkBtn'),
    shareCompareWhatsAppBtn: document.getElementById('shareCompareWhatsAppBtn'),
    sendTop10WhatsappBtn: document.getElementById('sendTop10WhatsappBtn'),
    shareSiteWhatsappBtn: document.getElementById('shareSiteWhatsappBtn'),
    copySiteLinkBottomBtn: document.getElementById('copySiteLinkBottomBtn'),
    toastNotification: document.getElementById('toastNotification'),
    dynamicItemListSchema: document.getElementById('dynamicItemListSchema')
  };

  let toastTimeout = null;
  function showToast(message) {
    if (!els.toastNotification) return;
    els.toastNotification.textContent = message;
    els.toastNotification.hidden = false;
    els.toastNotification.classList.add('visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      els.toastNotification.classList.remove('visible');
      setTimeout(() => {
        if (els.toastNotification) els.toastNotification.hidden = true;
      }, 250);
    }, 3200);
  }

  // =========================================================================
  // UTILITÁRIOS DE FORMATAÇÃO E DICAS DE COMPRA CONSCIENTE
  // =========================================================================
  const AFFILIATE_QUERY = 'matt_word=trgatyva20230819121948&matt_tool=21540510';

  function buildMlSearchAffiliateUrl(rawQuery) {
    const clean = String(rawQuery || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
    if (!clean) {
      return `https://www.mercadolivre.com.br/mais-vendidos?${AFFILIATE_QUERY}`;
    }
    return `https://lista.mercadolivre.com.br/${encodeURIComponent(clean)}?${AFFILIATE_QUERY}`;
  }

  function formatCurrencyBRL(value) {
    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function formatShortDate(dateStr) {
    if (!dateStr) return '02/11';
    const parts = String(dateStr).split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : dateStr;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCategoryTip(categoryName) {
    const meta = CATEGORY_META[categoryName];
    return meta ? meta.cardTip : '✅ Confira descrição e avaliações no ML';
  }

  function getCategoryAlert(categoryName) {
    const meta = CATEGORY_META[categoryName];
    return meta
      ? meta.categoryAlert
      : 'Confira sempre as especificações técnicas e avaliações de compradores no anúncio oficial.';
  }

  // =========================================================================
  // FAVORITOS (LOCALSTORAGE)
  // =========================================================================
  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          state.favorites = new Set(parsed.map(Number));
        }
      }
    } catch (e) {
      console.warn('Não foi possível ler favoritos do navegador:', e);
    }
    updateFavoritesBadges();
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(state.favorites)));
    } catch (e) {
      console.warn('Não foi possível salvar favoritos:', e);
    }
    updateFavoritesBadges();
  }

  function toggleFavorite(productId) {
    const id = Number(productId);
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
    } else {
      state.favorites.add(id);
    }
    saveFavorites();
    renderProducts();
  }

  function updateFavoritesBadges() {
    const count = state.favorites.size;
    if (els.favCountBadge) els.favCountBadge.textContent = count;
    if (els.drawerFavCount) els.drawerFavCount.textContent = count;
    if (els.headerFavBtn) {
      els.headerFavBtn.classList.toggle('active-fav-filter', state.onlyFavorites);
    }
    if (els.shareFavsWhatsAppBtn) {
      els.shareFavsWhatsAppBtn.hidden = count === 0;
      els.shareFavsWhatsAppBtn.innerHTML = `<span>📲 Enviar Favoritos (${count}) no WhatsApp</span>`;
    }
  }

  // =========================================================================
  // COMPARADOR LADO A LADO (ATÉ 3 PRODUTOS)
  // =========================================================================
  function toggleCompare(productId) {
    const id = Number(productId);
    const idx = state.compareList.indexOf(id);
    if (idx >= 0) {
      state.compareList.splice(idx, 1);
    } else {
      if (state.compareList.length >= 3) {
        state.compareList.shift(); // Substitui o mais antigo se já tiver 3
      }
      state.compareList.push(id);
    }
    renderCompareBar();
    renderProducts();
  }

  function renderCompareBar() {
    if (!els.compareFloatingBar) return;
    const count = state.compareList.length;
    if (count === 0) {
      els.compareFloatingBar.hidden = true;
      return;
    }

    els.compareFloatingBar.hidden = false;
    if (els.compareCountText) els.compareCountText.textContent = String(count);

    const selectedProducts = state.compareList
      .map((id) => state.products.find((p) => Number(p.id) === id))
      .filter(Boolean);

    if (els.compareThumbsList) {
      els.compareThumbsList.innerHTML = selectedProducts
        .map(
          (p) => `
          <div class="compare-thumb-chip" title="${escapeHtml(p.name)}">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" />
            <span class="compare-thumb-name">${escapeHtml(p.name)}</span>
            <button type="button" class="compare-thumb-remove" data-action="remove-compare" data-id="${p.id}" aria-label="Remover da comparação">&times;</button>
          </div>
        `
        )
        .join('');
    }
  }

  function openCompareModal() {
    if (!els.compareModal || !els.compareModalBody) return;
    const selectedProducts = state.compareList
      .map((id) => state.products.find((p) => Number(p.id) === id))
      .filter(Boolean);

    if (selectedProducts.length === 0) return;

    const minPrice = Math.min(...selectedProducts.map((p) => Number(p.price)));
    const minRank = Math.min(...selectedProducts.map((p) => Number(p.rank)));

    const cardsHtml = selectedProducts
      .map((p) => {
        const isCheapest = selectedProducts.length > 1 && Number(p.price) === minPrice;
        const isBestRank = selectedProducts.length > 1 && Number(p.rank) === minRank;
        const shortDate = formatShortDate(p.consultedAt);

        return `
          <div class="compare-col-card">
            <div class="compare-col-badges">
              <span class="rank-badge ${p.rank === 1 ? 'rank-top1' : ''}">${p.rank}º em ${escapeHtml(p.category)}</span>
              ${isBestRank ? '<span class="compare-win-badge">🏆 Melhor Ranking</span>' : ''}
              ${isCheapest ? '<span class="compare-save-badge">💰 Menor Preço</span>' : ''}
            </div>
            <div class="compare-col-img-wrap">
              <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="compare-col-img" />
            </div>
            <h4 class="compare-col-title">${escapeHtml(p.name)}</h4>
            <div class="compare-col-price">
              <strong>${formatCurrencyBRL(p.price)}</strong>
              <span>Consultado em ${shortDate}</span>
            </div>
            <div class="compare-col-checklist">
              <strong>🛡️ O que conferir no anúncio:</strong>
              <p>${escapeHtml(getCategoryAlert(p.category))}</p>
            </div>
            <div class="compare-col-actions">
              <a
                href="${escapeHtml(p.affiliateUrl)}"
                target="_blank"
                rel="sponsored nofollow noopener"
                class="card-cta-btn"
              >
                <span>Ver no Mercado Livre</span>
              </a>
              <a
                href="${escapeHtml(p.affiliateUrl)}"
                target="_blank"
                rel="sponsored nofollow noopener"
                class="card-Sub-cta"
              >
                Conferir avaliações e ficha técnica &rarr;
              </a>
            </div>
          </div>
        `;
      })
      .join('');

    els.compareModalBody.innerHTML = `<div class="compare-grid cols-${selectedProducts.length}">${cardsHtml}</div>`;
    els.compareModalBackdrop.hidden = false;
    els.compareModal.hidden = false;
  }

  function closeCompareModal() {
    if (els.compareModal) els.compareModal.hidden = true;
    if (els.compareModalBackdrop) els.compareModalBackdrop.hidden = true;
  }

  // =========================================================================
  // COMPARTILHAMENTO NO WHATSAPP & LINKS COMPARTILHÁVEIS (MOTORES DE TRÁFEGO)
  // =========================================================================
  function getBaseSiteUrl() {
    if (window.location.protocol === 'file:') {
      return 'https://achadoreviews.com.br/';
    }
    return `${window.location.origin}${window.location.pathname}`;
  }

  function getShareableSelectionUrl() {
    const base = getBaseSiteUrl();
    const params = new URLSearchParams();

    if (state.searchQuery && state.searchQuery.trim() !== '') {
      params.set('busca', state.searchQuery.trim());
    } else if (state.selectedCategory && state.selectedCategory !== 'all') {
      params.set('categoria', state.selectedCategory);
    } else if (state.activePreset && state.activePreset !== 'all') {
      params.set('filtro', state.activePreset);
    }

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  function syncUrlWithState() {
    if (window.location.protocol === 'file:') return;
    try {
      const url = getShareableSelectionUrl();
      window.history.replaceState({}, '', url);
    } catch (e) {
      // Ignora em ambientes restritos
    }
  }

  function copyCurrentSelectionLink(forceRoot = false) {
    const urlToCopy = forceRoot ? getBaseSiteUrl() : getShareableSelectionUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(urlToCopy)
        .then(() => {
          showToast('🔗 Link copiado! Pronto para colar no WhatsApp, Instagram ou TikTok.');
        })
        .catch(() => {
          showToast(`🔗 Link para compartilhar: ${urlToCopy}`);
        });
    } else {
      showToast(`🔗 Link para compartilhar: ${urlToCopy}`);
    }
  }

  function shareOnWhatsApp(product) {
    const priceFormatted = formatCurrencyBRL(product.price);
    const shortDate = formatShortDate(product.consultedAt);
    const link = product.affiliateUrl;
    const siteUrl = getBaseSiteUrl();
    const message =
      `🔥 *Achadinho nos Mais Vendidos do Mercado Livre!*\n\n` +
      `📦 *${product.name}*\n` +
      `🏆 ${product.rank}º mais vendido em ${product.category}\n` +
      `💰 Preço consultado em ${shortDate}: *${priceFormatted}*\n\n` +
      `👉 Confira avaliações, frete e preço atual no Mercado Livre:\n${link}\n\n` +
      `✨ Veja todos os 110 mais vendidos em:\n${siteUrl}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  function shareFavoritesOnWhatsApp() {
    const favProducts = state.products.filter((p) => state.favorites.has(Number(p.id)));
    if (favProducts.length === 0) {
      showToast('❤️ Clique no coração nos produtos para montar sua lista de favoritos primeiro!');
      return;
    }

    const itemsLines = favProducts
      .slice(0, 12)
      .map(
        (p, idx) =>
          `*${idx + 1}. ${p.name}*\n` +
          `🏆 ${p.rank}º em ${p.category} • 💰 Ref: *${formatCurrencyBRL(p.price)}*\n` +
          `👉 Ver no ML: ${p.affiliateUrl}`
      )
      .join('\n\n');

    const message =
      `❤️ *Minha Lista de Favoritos — Achado Reviews (Mercado Livre)*\n` +
      `Separei esses produtos campeões de vendas para conferir com calma:\n\n` +
      `${itemsLines}\n\n` +
      `✨ Veja a vitrine completa dos 110 Mais Vendidos em:\n${getBaseSiteUrl()}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  function shareCompareOnWhatsApp() {
    const selectedProducts = state.compareList
      .map((id) => state.products.find((p) => Number(p.id) === id))
      .filter(Boolean);

    if (selectedProducts.length === 0) return;

    const itemsLines = selectedProducts
      .map(
        (p, idx) =>
          `*Opção ${idx + 1}: ${p.name}*\n` +
          `🏆 ${p.rank}º mais vendido em ${p.category}\n` +
          `💰 Preço ref: *${formatCurrencyBRL(p.price)}*\n` +
          `👉 Anúncio oficial: ${p.affiliateUrl}`
      )
      .join('\n\n');

    const message =
      `⚖️ *Comparativo de Produtos — Qual vale mais a pena?*\n` +
      `Estou em dúvida entre esses campeões de vendas do Mercado Livre:\n\n` +
      `${itemsLines}\n\n` +
      `✨ Compare também no Achado Reviews:\n${getBaseSiteUrl()}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  function shareTop10LeadersOnWhatsApp() {
    const leaders = state.products.filter((p) => Number(p.rank) === 1);
    if (leaders.length === 0) return;

    const itemsLines = leaders
      .map(
        (p, idx) =>
          `🏆 *1º em ${p.category}:* ${p.name}\n` +
          `💰 Ref: *${formatCurrencyBRL(p.price)}*\n` +
          `👉 ${p.affiliateUrl}`
      )
      .join('\n\n');

    const message =
      `🏆 *Os 10 Campeões de Vendas (1º Lugar de Cada Categoria no Mercado Livre)*\n` +
      `Resumo atualizado do Achado Reviews para guardar e consultar sempre que precisar:\n\n` +
      `${itemsLines}\n\n` +
      `✨ Vitrine completa com os 110 Mais Vendidos:\n${getBaseSiteUrl()}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  function shareCurrentSelectionOnWhatsApp(forceRoot = false) {
    const shareUrl = forceRoot ? getBaseSiteUrl() : getShareableSelectionUrl();
    const filtered = getFilteredProducts();
    const sectionTitle = els.activeSectionTitle ? els.activeSectionTitle.textContent.trim() : 'Mais Vendidos no Mercado Livre';

    const highlights = filtered
      .slice(0, 3)
      .map((p) => `• *${p.name}* (${formatCurrencyBRL(p.price)})\n  👉 ${p.affiliateUrl}`)
      .join('\n\n');

    const message =
      `⚡ *Achado Reviews — ${sectionTitle}*\n` +
      `Olha essa curadoria dos produtos mais vendidos e bem avaliados do Mercado Livre (sem empurrometria!):\n\n` +
      (highlights ? `*Destaques desta seleção:*\n${highlights}\n\n` : '') +
      `👉 *Acesse a seleção completa aqui:*\n${shareUrl}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  function injectDynamicSeoItemList() {
    if (!els.dynamicItemListSchema || state.products.length === 0) return;
    const leaders = state.products.filter((p) => Number(p.rank) === 1);
    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Campeões de Vendas — 1º Lugar de Cada Categoria no Mercado Livre',
      description: 'Os produtos mais vendidos em cada departamento oficial do Mercado Livre curados pelo Achado Reviews.',
      numberOfItems: leaders.length,
      itemListElement: leaders.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${p.name} (1º Lugar em ${p.category})`,
        url: p.affiliateUrl
      }))
    };
    els.dynamicItemListSchema.textContent = JSON.stringify(schemaObj);
  }

  function applyUrlParamsOnLoad() {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('categoria');
    const filtroParam = params.get('filtro');
    const buscaParam = params.get('busca');

    if (buscaParam && buscaParam.trim() !== '') {
      state.searchQuery = buscaParam.trim();
      state.activePreset = '';
      if (els.searchInput) els.searchInput.value = state.searchQuery;
      if (els.clearSearchBtn) els.clearSearchBtn.hidden = false;
      return true;
    }

    if (catParam) {
      const matchedCat = state.categories.find(
        (c) => c.name.toLowerCase() === catParam.trim().toLowerCase()
      );
      if (matchedCat) {
        state.selectedCategory = matchedCat.name;
        state.activePreset = '';
        return true;
      }
    }

    if (filtroParam) {
      const validPresets = ['top1', 'top3', 'under50', 'under100', 'home', 'tech', 'wellness', 'bf'];
      if (validPresets.includes(filtroParam)) {
        applySmartPreset(filtroParam);
        return true;
      }
    }

    return false;
  }

  // =========================================================================
  // RENDERIZAÇÃO DE CATEGORIAS E MENUS
  // =========================================================================
  function extractCategories(products) {
    const map = new Map();
    products.forEach((p) => {
      if (!map.has(p.category)) {
        map.set(p.category, 0);
      }
      map.set(p.category, map.get(p.category) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
      icon: (CATEGORY_META[name] && CATEGORY_META[name].icon) || '📦',
      shortName: (CATEGORY_META[name] && CATEGORY_META[name].shortName) || name
    }));
  }

  function updateSmartPillsUI() {
    if (!els.smartShortcutsBar) return;
    els.smartShortcutsBar.querySelectorAll('.smart-pill').forEach((btn) => {
      const preset = btn.getAttribute('data-preset');
      btn.classList.toggle('active', preset === state.activePreset);
    });
  }

  function renderNavigationAndCategories() {
    const totalCount = state.products.length;

    // 1. Subnav links
    if (els.subnavLinks) {
      const itemsHtml = [
        `<li><button type="button" class="subnav-link-btn ${state.selectedCategory === 'all' && !state.categoryGroup ? 'active' : ''}" data-cat="all">Mais Vendidos (${totalCount})</button></li>`
      ];
      state.categories.forEach((cat) => {
        const isActive = state.selectedCategory === cat.name ? 'active' : '';
        itemsHtml.push(
          `<li><button type="button" class="subnav-link-btn ${isActive}" data-cat="${escapeHtml(cat.name)}">${escapeHtml(cat.shortName)}</button></li>`
        );
      });
      els.subnavLinks.innerHTML = itemsHtml.join('');
    }

    // 2. Dropdown "Todas as Categorias"
    if (els.categoriesDropdownMenu) {
      const dropHtml = [
        `<button type="button" class="dropdown-cat-item ${state.selectedCategory === 'all' && !state.categoryGroup ? 'active' : ''}" data-cat="all">
          <span>🏠 Todas as Categorias</span>
          <span class="dropdown-cat-count">${totalCount}</span>
        </button>`
      ];
      state.categories.forEach((cat) => {
        const isActive = state.selectedCategory === cat.name ? 'active' : '';
        dropHtml.push(
          `<button type="button" class="dropdown-cat-item ${isActive}" data-cat="${escapeHtml(cat.name)}">
            <span>${cat.icon} ${escapeHtml(cat.name)}</span>
            <span class="dropdown-cat-count">${cat.count}</span>
          </button>`
        );
      });
      els.categoriesDropdownMenu.innerHTML = dropHtml.join('');
    }

    // 3. Cards de Categorias em Destaque
    if (els.categoryCardsGrid) {
      const cardsHtml = [
        `<button type="button" role="tab" aria-selected="${state.selectedCategory === 'all' && !state.categoryGroup}" class="category-card-btn ${state.selectedCategory === 'all' && !state.categoryGroup ? 'active' : ''}" data-cat="all">
          <div class="cat-icon-box" aria-hidden="true">🔥</div>
          <span class="cat-card-name">Todas (${totalCount})</span>
        </button>`
      ];
      state.categories.forEach((cat) => {
        const isActive = state.selectedCategory === cat.name;
        cardsHtml.push(
          `<button type="button" role="tab" aria-selected="${isActive}" class="category-card-btn ${isActive ? 'active' : ''}" data-cat="${escapeHtml(cat.name)}">
            <div class="cat-icon-box" aria-hidden="true">${cat.icon}</div>
            <span class="cat-card-name">${escapeHtml(cat.name)}</span>
          </button>`
        );
      });
      els.categoryCardsGrid.innerHTML = cardsHtml.join('');
    }

    // 4. Select Lateral de Categoria
    if (els.sidebarCategorySelect) {
      const optsHtml = [
        `<option value="all">Todas as categorias (${totalCount})</option>`
      ];
      state.categories.forEach((cat) => {
        optsHtml.push(
          `<option value="${escapeHtml(cat.name)}">${escapeHtml(cat.name)} (${cat.count})</option>`
        );
      });
      els.sidebarCategorySelect.innerHTML = optsHtml.join('');
      els.sidebarCategorySelect.value = state.selectedCategory;
    }

    // 5. Menu Gaveta Mobile
    if (els.drawerCategoryList) {
      els.drawerCategoryList.innerHTML = state.categories
        .map(
          (cat) =>
            `<li>
              <a href="#vitrine" class="drawer-link ${state.selectedCategory === cat.name ? 'active' : ''}" data-cat="${escapeHtml(cat.name)}">
                <span>${cat.icon} ${escapeHtml(cat.name)}</span>
                <span class="dropdown-cat-count">${cat.count}</span>
              </a>
            </li>`
        )
        .join('');
    }

    updateSmartPillsUI();
  }

  // =========================================================================
  // RENDERIZAÇÃO DO CARD DE PRODUTO
  // =========================================================================
  function createProductCardHtml(product) {
    const id = Number(product.id);
    const isFav = state.favorites.has(id);
    const isCompared = state.compareList.includes(id);
    const shortDate = formatShortDate(product.consultedAt);
    const priceFormatted = formatCurrencyBRL(product.price);
    const rankClass = product.rank === 1 ? 'rank-badge rank-top1' : 'rank-badge';
    const rankLabel = `${product.rank}º Mais Vendido`;
    const smartTip = getCategoryTip(product.category);

    return `
      <article class="product-card ${isCompared ? 'card-compared' : ''}" data-product-id="${product.id}">
        <div>
          <div class="card-top-badges">
            <span class="${rankClass}" title="Posição no ranking de mais vendidos da categoria ${escapeHtml(product.category)}">
              ${rankLabel}
            </span>
            <div class="card-Quick-actions">
              <button
                type="button"
                class="card-icon-btn compare-btn ${isCompared ? 'compare-active' : ''}"
                data-action="compare"
                data-id="${product.id}"
                aria-label="${isCompared ? 'Remover da comparação' : 'Comparar lado a lado'}"
                title="${isCompared ? 'Remover da comparação' : 'Comparar lado a lado (até 3)'}"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </button>
              <button
                type="button"
                class="card-icon-btn ${isFav ? 'fav-active' : ''}"
                data-action="fav"
                data-id="${product.id}"
                aria-label="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
                title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button
                type="button"
                class="card-icon-btn whatsapp-btn"
                data-action="share"
                data-id="${product.id}"
                aria-label="Compartilhar no WhatsApp"
                title="Compartilhar no WhatsApp"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </button>
            </div>
          </div>

          <a
            href="${escapeHtml(product.affiliateUrl)}"
            target="_blank"
            rel="sponsored nofollow noopener"
            class="card-image-link"
            aria-label="Ver ${escapeHtml(product.name)} no Mercado Livre"
          >
            <img
              src="${escapeHtml(product.image)}"
              alt="${escapeHtml(product.name)}"
              class="card-image"
              loading="lazy"
              decoding="async"
            />
          </a>

          <span class="card-category-tag">${escapeHtml(product.category)}</span>

          <a
            href="${escapeHtml(product.affiliateUrl)}"
            target="_blank"
            rel="sponsored nofollow noopener"
            class="card-title-link"
          >
            <h3 class="card-title">${escapeHtml(product.name)}</h3>
          </a>

          <div class="card-smart-tip" title="${escapeHtml(getCategoryAlert(product.category))}">
            ${escapeHtml(smartTip)}
          </div>
        </div>

        <div class="card-price-box">
          <div class="card-price-value">${priceFormatted}</div>
          <span class="card-consulted-date">Preço consultado em ${shortDate}</span>

          <a
            href="${escapeHtml(product.affiliateUrl)}"
            target="_blank"
            rel="sponsored nofollow noopener"
            class="card-cta-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Ver no Mercado Livre</span>
          </a>

          <a
            href="${escapeHtml(product.affiliateUrl)}"
            target="_blank"
            rel="sponsored nofollow noopener"
            class="card-Sub-cta"
          >
            Conferir avaliações e ficha técnica &rarr;
          </a>
        </div>
      </article>
    `;
  }

  // =========================================================================
  // FILTRAGEM E ORDENAÇÃO DE PRODUTOS
  // =========================================================================
  function getFilteredProducts() {
    const query = state.searchQuery.trim().toLowerCase();

    const filtered = state.products.filter((p) => {
      // Grupo de categorias dos Atalhos de Escolha Segura
      if (state.categoryGroup === 'home') {
        if (!['Eletrodomésticos', 'Ferramentas'].includes(p.category)) return false;
      } else if (state.categoryGroup === 'tech') {
        if (!['Games', 'Celulares e Telefones', 'Informática', 'Eletrônicos, Áudio e Vídeo'].includes(p.category)) return false;
      } else if (state.categoryGroup === 'wellness') {
        if (!['Beleza e Cuidado Pessoal', 'Esportes e Fitness', 'Calçados, Roupas e Bolsas'].includes(p.category)) return false;
      } else if (state.selectedCategory !== 'all' && p.category !== state.selectedCategory) {
        return false;
      }

      // Faixa de preço
      if (state.maxPrice < 2500 && Number(p.price) > state.maxPrice) {
        return false;
      }
      // Posição no ranking
      if (state.maxRank !== 'all' && Number(p.rank) > Number(state.maxRank)) {
        return false;
      }
      // Somente Favoritos
      if (state.onlyFavorites && !state.favorites.has(Number(p.id))) {
        return false;
      }
      // Busca por texto
      if (query) {
        const haystack = `${p.name} ${p.category}`.toLowerCase();
        return haystack.includes(query);
      }
      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      if (state.sortBy === 'price-asc') return a.price - b.price;
      if (state.sortBy === 'price-desc') return b.price - a.price;
      if (state.sortBy === 'name-asc') return a.name.localeCompare(b.name, 'pt-BR');
      return a.rank - b.rank;
    });

    return filtered;
  }

  function renderProducts() {
    const filtered = getFilteredProducts();
    syncUrlWithState();

    // Atualiza título ativo e contador
    if (els.activeSectionTitle) {
      if (state.onlyFavorites) {
        els.activeSectionTitle.textContent = 'Meus Produtos Favoritos ❤️';
      } else if (state.activePreset === 'top1') {
        els.activeSectionTitle.textContent = 'Líderes Absolutos (1º Lugar de Cada Categoria)';
      } else if (state.activePreset === 'top3') {
        els.activeSectionTitle.textContent = 'Pódio de Vendas (Top 1º ao 3º)';
      } else if (state.activePreset === 'under50') {
        els.activeSectionTitle.textContent = 'Presentes & Achadinhos Úteis até R$ 50';
      } else if (state.activePreset === 'under100') {
        els.activeSectionTitle.textContent = 'Utilidades do Dia a Dia até R$ 100';
      } else if (state.activePreset === 'bf') {
        els.activeSectionTitle.textContent = 'Ofertas de Black Friday 🖤';
      } else if (state.categoryGroup === 'home') {
        els.activeSectionTitle.textContent = 'Casa, Cozinha & Oficina';
      } else if (state.categoryGroup === 'tech') {
        els.activeSectionTitle.textContent = 'Tecnologia, Áudio & Games';
      } else if (state.categoryGroup === 'wellness') {
        els.activeSectionTitle.textContent = 'Saúde, Beleza, Moda & Treino';
      } else if (state.selectedCategory !== 'all') {
        els.activeSectionTitle.textContent = `Mais vendidos em ${state.selectedCategory}`;
      } else {
        els.activeSectionTitle.textContent = 'Mais vendidos no Mercado Livre';
      }
    }

    if (els.resultsCounterText) {
      els.resultsCounterText.textContent = `Exibindo ${filtered.length} de ${state.products.length} produtos oficiais`;
    }

    // Ponto indicador de filtro ativo no mobile
    const hasActiveFilter =
      state.selectedCategory !== 'all' ||
      state.categoryGroup !== null ||
      state.maxPrice < 2500 ||
      state.maxRank !== 'all' ||
      state.onlyFavorites ||
      state.searchQuery.trim() !== '';
    if (els.mobileFilterDot) {
      els.mobileFilterDot.hidden = !hasActiveFilter;
    }

    // Estado vazio (com botão direto para buscar o termo no Mercado Livre com seu código de afiliado)
    const trimmedQuery = state.searchQuery.trim();
    if (filtered.length === 0) {
      els.emptyState.hidden = false;
      els.productsContainer.innerHTML = '';

      if (trimmedQuery) {
        if (els.emptyStateTitle) {
          els.emptyStateTitle.textContent = `Não encontrou "${trimmedQuery}" nos 110 da vitrine?`;
        }
        if (els.emptyStateDesc) {
          els.emptyStateDesc.textContent = `Sem problemas! Clique no botão abaixo para ver todas as ofertas, preços e avaliações de "${trimmedQuery}" direto na busca oficial do Mercado Livre:`;
        }
        if (els.emptyMlSearchBtn) {
          els.emptyMlSearchBtn.href = buildMlSearchAffiliateUrl(trimmedQuery);
        }
        if (els.emptyMlSearchBtnText) {
          els.emptyMlSearchBtnText.textContent = `Ver ofertas de "${trimmedQuery}" no Mercado Livre →`;
        }
      } else if (state.onlyFavorites) {
        if (els.emptyStateTitle) {
          els.emptyStateTitle.textContent = 'Você ainda não salvou produtos nos Favoritos ❤️';
        }
        if (els.emptyStateDesc) {
          els.emptyStateDesc.textContent = 'Clique no coração nos produtos da vitrine para salvá-los aqui, ou explore o ranking completo no Mercado Livre:';
        }
        if (els.emptyMlSearchBtn) {
          els.emptyMlSearchBtn.href = buildMlSearchAffiliateUrl('');
        }
        if (els.emptyMlSearchBtnText) {
          els.emptyMlSearchBtnText.textContent = 'Explorar Mais Vendidos no Mercado Livre →';
        }
      } else {
        if (els.emptyStateTitle) {
          els.emptyStateTitle.textContent = 'Nenhum produto encontrado com esses filtros';
        }
        if (els.emptyStateDesc) {
          els.emptyStateDesc.textContent = 'Limpe os filtros abaixo ou pesquise qualquer produto diretamente no Mercado Livre:';
        }
        if (els.emptyMlSearchBtn) {
          els.emptyMlSearchBtn.href = buildMlSearchAffiliateUrl('');
        }
        if (els.emptyMlSearchBtnText) {
          els.emptyMlSearchBtnText.textContent = 'Buscar direto no Mercado Livre →';
        }
      }
      return;
    }

    els.emptyState.hidden = true;

    const searchMoreBannerHtml = trimmedQuery
      ? `
        <div class="ml-search-more-banner">
          <div class="ml-search-more-text">
            <strong>🔎 Quer ver mais modelos de "${escapeHtml(trimmedQuery)}"?</strong>
            <span>Confira centenas de outras marcas, tamanhos e preços para "${escapeHtml(trimmedQuery)}" direto na plataforma oficial:</span>
          </div>
          <a
            href="${escapeHtml(buildMlSearchAffiliateUrl(trimmedQuery))}"
            target="_blank"
            rel="sponsored nofollow noopener"
            class="empty-ml-search-btn"
          >
            <span>Ver mais opções de "${escapeHtml(trimmedQuery)}" no Mercado Livre &rarr;</span>
          </a>
        </div>
      `
      : '';

    // Se estiver mostrando uma única categoria selecionada, exibe o alerta educativo da categoria no topo
    if (state.selectedCategory !== 'all' && !state.categoryGroup) {
      const catAlert = getCategoryAlert(state.selectedCategory);
      els.productsContainer.innerHTML = `
        <div class="category-smart-banner">
          <span class="category-smart-icon">🛡️</span>
          <p>${escapeHtml(catAlert)}</p>
        </div>
        <div class="products-grid">
          ${filtered.map(createProductCardHtml).join('')}
        </div>
        ${searchMoreBannerHtml}
      `;
      return;
    }

    // Se estiver agrupado por categoria (visão padrão)
    if (
      state.selectedCategory === 'all' &&
      !state.categoryGroup &&
      state.sortBy === 'rank' &&
      !state.onlyFavorites &&
      !trimmedQuery &&
      state.maxRank !== '1'
    ) {
      const groupedHtml = [];
      state.categories.forEach((cat) => {
        const catProducts = filtered.filter((p) => p.category === cat.name);
        if (catProducts.length === 0) return;

        groupedHtml.push(`
          <div class="category-block" id="cat-${escapeHtml(cat.name)}">
            <div class="category-block-header">
              <div>
                <h3 class="category-block-title">
                  <span>${cat.icon}</span>
                  <span>Mais vendidos em ${escapeHtml(cat.name)}</span>
                </h3>
                <p class="category-block-tip">🛡️ ${escapeHtml(getCategoryAlert(cat.name))}</p>
              </div>
              <span class="category-block-badge">Top ${catProducts.length}</span>
            </div>
            <div class="products-grid">
              ${catProducts.map(createProductCardHtml).join('')}
            </div>
          </div>
        `);
      });
      els.productsContainer.innerHTML = groupedHtml.join('');
    } else {
      // Visualização direta em grid
      els.productsContainer.innerHTML = `
        <div class="products-grid">
          ${filtered.map(createProductCardHtml).join('')}
        </div>
        ${searchMoreBannerHtml}
      `;
    }
  }

  // =========================================================================
  // RENDERIZAÇÃO DOS 1º LUGARES DE CADA CATEGORIA (SEÇÃO INFERIOR)
  // =========================================================================
  function renderTopLeaders() {
    if (!els.leadersGrid) return;
    const leaders = state.products.filter((p) => Number(p.rank) === 1);
    els.leadersGrid.innerHTML = leaders
      .map((p, index) => {
        const shortDate = formatShortDate(p.consultedAt);
        return `
          <a
            href="${escapeHtml(p.affiliateUrl)}"
            target="_blank"
            rel="sponsored nofollow noopener"
            class="leader-card"
            title="Ver 1º lugar em ${escapeHtml(p.category)} no Mercado Livre"
          >
            <span class="leader-number">${index + 1}</span>
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="leader-img" loading="lazy" />
            <div class="leader-info">
              <span class="leader-cat">1º em ${escapeHtml(p.category)}</span>
              <span class="leader-name">${escapeHtml(p.name)}</span>
              <span class="leader-price">${formatCurrencyBRL(p.price)} <small style="font-weight:500;color:#6B7280;">(${shortDate})</small></span>
            </div>
          </a>
        `;
      })
      .join('');
  }

  // =========================================================================
  // ATALHOS DE ESCOLHA SEGURA E SINCRONIZAÇÃO DE FILTROS
  // =========================================================================
  function applySmartPreset(preset) {
    state.activePreset = preset;
    state.onlyFavorites = false;
    state.selectedCategory = 'all';
    state.categoryGroup = null;
    state.maxPrice = 2500;
    state.maxRank = 'all';
    state.sortBy = 'rank';

    if (preset === 'top1') {
      state.maxRank = '1';
    } else if (preset === 'top3') {
      state.maxRank = '3';
    } else if (preset === 'under50') {
      state.maxPrice = 50;
      state.sortBy = 'price-asc';
    } else if (preset === 'under100') {
      state.maxPrice = 100;
      state.sortBy = 'price-asc';
    } else if (preset === 'home') {
      state.categoryGroup = 'home';
    } else if (preset === 'tech') {
      state.categoryGroup = 'tech';
    } else if (preset === 'wellness') {
      state.categoryGroup = 'wellness';
    } else if (preset === 'bf') {
      state.selectedCategory = 'Black Friday';
    }

    // Sincroniza controles da sidebar
    if (els.sidebarCategorySelect) els.sidebarCategorySelect.value = 'all';
    if (els.priceRangeSlider) els.priceRangeSlider.value = state.maxPrice;
    if (els.priceRangeLabel) {
      els.priceRangeLabel.textContent =
        state.maxPrice >= 2500 ? 'Até R$ 2.500+' : `Até ${formatCurrencyBRL(state.maxPrice)}`;
    }
    if (els.onlyFavoritesToggle) els.onlyFavoritesToggle.checked = false;
    if (els.sortSelect) els.sortSelect.value = state.sortBy;

    document.querySelectorAll('input[name="rankFilter"]').forEach((r) => {
      r.checked = r.value === state.maxRank;
    });
    document.querySelectorAll('.price-chip').forEach((chip) => {
      chip.classList.toggle('active', Number(chip.getAttribute('data-max')) === state.maxPrice && state.maxPrice < 2500);
    });

    updateFavoritesBadges();
    renderNavigationAndCategories();
    renderProducts();
  }

  function setCategory(catName, scrollToVitrine = false) {
    state.selectedCategory = catName || 'all';
    state.categoryGroup = null;
    state.activePreset = state.selectedCategory === 'all' ? 'all' : '';
    if (els.sidebarCategorySelect) {
      els.sidebarCategorySelect.value = state.selectedCategory;
    }
    renderNavigationAndCategories();
    renderProducts();
    if (scrollToVitrine) {
      const vitrineEl = document.getElementById('vitrine');
      if (vitrineEl) vitrineEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resetAllFilters() {
    state.searchQuery = '';
    if (els.searchInput) els.searchInput.value = '';
    if (els.clearSearchBtn) els.clearSearchBtn.hidden = true;
    applySmartPreset('all');
  }

  function closeMobileDrawer() {
    if (!els.mobileDrawer) return;
    els.mobileDrawer.classList.remove('open');
    els.mobileDrawer.setAttribute('aria-hidden', 'true');
    if (els.drawerBackdrop) els.drawerBackdrop.hidden = true;
    if (els.openDrawerBtn) els.openDrawerBtn.setAttribute('aria-expanded', 'false');
  }

  function closeMobileFilterPanel() {
    if (!els.filtersSidebar) return;
    els.filtersSidebar.classList.remove('open');
    if (els.filterBackdrop) els.filterBackdrop.hidden = true;
    if (els.openFilterPanelBtn) els.openFilterPanelBtn.setAttribute('aria-expanded', 'false');
  }

  function bindEvents() {
    // Busca em tempo real enquanto digita
    if (els.searchInput) {
      els.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        state.activePreset = '';
        if (els.clearSearchBtn) {
          els.clearSearchBtn.hidden = !state.searchQuery;
        }
        updateSmartPillsUI();
        renderProducts();
      });

      els.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const vitrineEl = document.getElementById('vitrine');
          if (vitrineEl) vitrineEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (els.clearSearchBtn) {
      els.clearSearchBtn.addEventListener('click', () => {
        state.searchQuery = '';
        els.searchInput.value = '';
        els.clearSearchBtn.hidden = true;
        els.searchInput.focus();
        renderProducts();
      });
    }

    if (els.searchBtn) {
      els.searchBtn.addEventListener('click', () => {
        const vitrineEl = document.getElementById('vitrine');
        if (vitrineEl) vitrineEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Atalhos de Escolha Segura
    if (els.smartShortcutsBar) {
      els.smartShortcutsBar.addEventListener('click', (e) => {
        const pill = e.target.closest('[data-preset]');
        if (!pill) return;
        const preset = pill.getAttribute('data-preset');
        applySmartPreset(preset);
      });
    }

    // Botões de Compartilhamento Viral e Copiar Link
    if (els.shareFavsWhatsAppBtn) {
      els.shareFavsWhatsAppBtn.addEventListener('click', shareFavoritesOnWhatsApp);
    }
    if (els.shareSelectionWhatsAppBtn) {
      els.shareSelectionWhatsAppBtn.addEventListener('click', () => shareCurrentSelectionOnWhatsApp(false));
    }
    if (els.copySelectionLinkBtn) {
      els.copySelectionLinkBtn.addEventListener('click', () => copyCurrentSelectionLink(false));
    }
    if (els.shareCompareWhatsAppBtn) {
      els.shareCompareWhatsAppBtn.addEventListener('click', shareCompareOnWhatsApp);
    }
    if (els.sendTop10WhatsappBtn) {
      els.sendTop10WhatsappBtn.addEventListener('click', shareTop10LeadersOnWhatsApp);
    }
    if (els.shareSiteWhatsappBtn) {
      els.shareSiteWhatsappBtn.addEventListener('click', () => shareCurrentSelectionOnWhatsApp(true));
    }
    if (els.copySiteLinkBottomBtn) {
      els.copySiteLinkBottomBtn.addEventListener('click', () => copyCurrentSelectionLink(true));
    }

    // Cliques globais (Categorias, Favoritos, WhatsApp, Comparador)
    document.addEventListener('click', (e) => {
      // Categoria em qualquer botão com data-cat
      const catBtn = e.target.closest('[data-cat]');
      if (catBtn) {
        const cat = catBtn.getAttribute('data-cat');
        setCategory(cat, true);
        if (els.categoriesDropdownMenu) els.categoriesDropdownMenu.hidden = true;
        closeMobileDrawer();
        return;
      }

      // Ações dentro do card ou barra de comparação
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        e.preventDefault();
        const action = actionBtn.getAttribute('data-action');
        const id = Number(actionBtn.getAttribute('data-id'));
        const product = state.products.find((p) => Number(p.id) === id);
        if (!product) return;

        if (action === 'fav') {
          toggleFavorite(id);
        } else if (action === 'share') {
          shareOnWhatsApp(product);
        } else if (action === 'compare' || action === 'remove-compare') {
          toggleCompare(id);
        }
        return;
      }

      // Fechar dropdown de categorias ao clicar fora
      if (
        els.categoriesDropdownMenu &&
        !els.categoriesDropdownMenu.hidden &&
        !e.target.closest('.subnav-dropdown-wrap')
      ) {
        els.categoriesDropdownMenu.hidden = true;
      }
    });

    // Barra e Modal de Comparação
    if (els.clearCompareBtn) {
      els.clearCompareBtn.addEventListener('click', () => {
        state.compareList = [];
        renderCompareBar();
        renderProducts();
      });
    }
    if (els.openCompareModalBtn) {
      els.openCompareModalBtn.addEventListener('click', openCompareModal);
    }
    if (els.closeCompareModalBtn) {
      els.closeCompareModalBtn.addEventListener('click', closeCompareModal);
    }
    if (els.compareModalBackdrop) {
      els.compareModalBackdrop.addEventListener('click', closeCompareModal);
    }

    // Toggle Dropdown "Todas as Categorias"
    if (els.allCategoriesToggle && els.categoriesDropdownMenu) {
      els.allCategoriesToggle.addEventListener('click', () => {
        const isHidden = els.categoriesDropdownMenu.hidden;
        els.categoriesDropdownMenu.hidden = !isHidden;
        els.allCategoriesToggle.setAttribute('aria-expanded', String(isHidden));
      });
    }

    // Select lateral de categoria
    if (els.sidebarCategorySelect) {
      els.sidebarCategorySelect.addEventListener('change', (e) => {
        setCategory(e.target.value, false);
      });
    }

    // Slider de faixa de preço
    if (els.priceRangeSlider) {
      els.priceRangeSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        state.maxPrice = val;
        state.activePreset = '';
        if (els.priceRangeLabel) {
          els.priceRangeLabel.textContent = val >= 2500 ? 'Até R$ 2.500+' : `Até ${formatCurrencyBRL(val)}`;
        }
        updateSmartPillsUI();
        renderProducts();
      });
    }

    // Chips rápidos de preço
    document.querySelectorAll('.price-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const max = Number(chip.getAttribute('data-max'));
        state.maxPrice = max;
        state.activePreset = max === 50 ? 'under50' : max === 100 ? 'under100' : '';
        if (els.priceRangeSlider) els.priceRangeSlider.value = max;
        if (els.priceRangeLabel) {
          els.priceRangeLabel.textContent = max >= 2500 ? 'Até R$ 2.500+' : `Até ${formatCurrencyBRL(max)}`;
        }
        document.querySelectorAll('.price-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        updateSmartPillsUI();
        renderProducts();
      });
    });

    // Filtro de posição no ranking
    document.querySelectorAll('input[name="rankFilter"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        state.maxRank = e.target.value;
        state.activePreset = state.maxRank === '1' ? 'top1' : state.maxRank === '3' ? 'top3' : '';
        updateSmartPillsUI();
        renderProducts();
      });
    });

    // Toggle Somente Favoritos
    if (els.onlyFavoritesToggle) {
      els.onlyFavoritesToggle.addEventListener('change', (e) => {
        state.onlyFavorites = e.target.checked;
        state.activePreset = '';
        updateSmartPillsUI();
        updateFavoritesBadges();
        renderProducts();
      });
    }

    // Botão Meus Favoritos no cabeçalho
    if (els.headerFavBtn) {
      els.headerFavBtn.addEventListener('click', () => {
        state.onlyFavorites = !state.onlyFavorites;
        state.activePreset = '';
        if (els.onlyFavoritesToggle) els.onlyFavoritesToggle.checked = state.onlyFavorites;
        updateSmartPillsUI();
        updateFavoritesBadges();
        renderProducts();
        const vitrineEl = document.getElementById('vitrine');
        if (vitrineEl) vitrineEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (els.drawerFavLink) {
      els.drawerFavLink.addEventListener('click', () => {
        state.onlyFavorites = true;
        state.activePreset = '';
        if (els.onlyFavoritesToggle) els.onlyFavoritesToggle.checked = true;
        updateSmartPillsUI();
        updateFavoritesBadges();
        renderProducts();
        closeMobileDrawer();
      });
    }

    if (els.footerFavLink) {
      els.footerFavLink.addEventListener('click', () => {
        state.onlyFavorites = true;
        state.activePreset = '';
        if (els.onlyFavoritesToggle) els.onlyFavoritesToggle.checked = true;
        updateSmartPillsUI();
        updateFavoritesBadges();
        renderProducts();
      });
    }

    // Ordenação
    if (els.sortSelect) {
      els.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderProducts();
      });
    }

    // Botões de aplicar/limpar filtros
    if (els.applyFiltersBtn) {
      els.applyFiltersBtn.addEventListener('click', () => {
        renderProducts();
        closeMobileFilterPanel();
      });
    }

    [els.resetFiltersBtn, els.emptyResetBtn, els.resetCatBtn, els.logoResetBtn, els.footerAllLink].forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          resetAllFilters();
          closeMobileFilterPanel();
        });
      }
    });

    // Gaveta Mobile
    if (els.openDrawerBtn) {
      els.openDrawerBtn.addEventListener('click', () => {
        els.mobileDrawer.classList.add('open');
        els.mobileDrawer.setAttribute('aria-hidden', 'false');
        els.drawerBackdrop.hidden = false;
        els.openDrawerBtn.setAttribute('aria-expanded', 'true');
      });
    }
    if (els.closeDrawerBtn) els.closeDrawerBtn.addEventListener('click', closeMobileDrawer);
    if (els.drawerBackdrop) els.drawerBackdrop.addEventListener('click', closeMobileDrawer);

    // Painel de Filtros Mobile
    if (els.openFilterPanelBtn) {
      els.openFilterPanelBtn.addEventListener('click', () => {
        els.filtersSidebar.classList.add('open');
        els.filterBackdrop.hidden = false;
        els.openFilterPanelBtn.setAttribute('aria-expanded', 'true');
      });
    }
    if (els.closeFilterPanelBtn) els.closeFilterPanelBtn.addEventListener('click', closeMobileFilterPanel);
    if (els.filterBackdrop) els.filterBackdrop.addEventListener('click', closeMobileFilterPanel);

    // Botão Flutuante Voltar ao Topo
    window.addEventListener('scroll', () => {
      if (!els.backToTopBtn) return;
      els.backToTopBtn.hidden = window.scrollY < 420;
    });

    if (els.backToTopBtn) {
      els.backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // =========================================================================
  // INICIALIZAÇÃO E CARREGAMENTO DO PRODUCTS.JSON
  // =========================================================================
  async function init() {
    loadFavorites();
    bindEvents();

    try {
      const response = await fetch('products.json', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status} ao carregar products.json`);
      }
      const data = await response.json();
      state.products = Array.isArray(data) ? data : [];
      state.categories = extractCategories(state.products);

      // Atualiza a data no topo com base no primeiro produto
      if (state.products.length > 0 && els.headerUpdatedDate) {
        const shortDate = formatShortDate(state.products[0].consultedAt);
        els.headerUpdatedDate.textContent = `Atualizado em ${shortDate}`;
      }

      const hadUrlFilter = applyUrlParamsOnLoad();
      renderNavigationAndCategories();
      renderProducts();
      renderTopLeaders();
      injectDynamicSeoItemList();

      if (hadUrlFilter) {
        const vitrineEl = document.getElementById('vitrine');
        if (vitrineEl) {
          setTimeout(() => vitrineEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      if (els.productsContainer) {
        els.productsContainer.innerHTML = `
          <div class="empty-state">
            <h3>Não foi possível carregar o arquivo products.json</h3>
            <p>Se você abriu o arquivo direto pelo computador (file://), use um servidor local ou suba os arquivos na hospedagem para que o navegador permita carregar o products.json.</p>
          </div>
        `;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
