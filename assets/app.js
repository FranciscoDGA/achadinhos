/**
 * ACHADINHOS ONLINES — Script Principal (assets/app.js)
 * Carrega products.json, organiza por categoria oficial do Mercado Livre,
 * gerencia busca em tempo real, filtros de preço/ranking, favoritos no navegador
 * e compartilhamento rápido no WhatsApp.
 */

(function () {
  'use strict';

  const FAVORITES_STORAGE_KEY = 'achadinhos_ml_favorites_v1';

  // Ícones das 10 categorias oficiais da página Mais Vendidos do Mercado Livre
  const CATEGORY_META = {
    'Games': { icon: '🎮', shortName: 'Games' },
    'Eletrodomésticos': { icon: '🍳', shortName: 'Eletrodomésticos' },
    'Ferramentas': { icon: '🛠️', shortName: 'Ferramentas' },
    'Beleza e Cuidado Pessoal': { icon: '🧴', shortName: 'Beleza e Cuidado' },
    'Celulares e Telefones': { icon: '📱', shortName: 'Celulares e Telefones' },
    'Informática': { icon: '💻', shortName: 'Informática' },
    'Eletrônicos, Áudio e Vídeo': { icon: '🎧', shortName: 'Eletrônicos e Áudio' },
    'Esportes e Fitness': { icon: '⚽', shortName: 'Esportes e Fitness' },
    'Calçados, Roupas e Bolsas': { icon: '👕', shortName: 'Calçados e Moda' },
    'Acessórios para Veículos': { icon: '🛞', shortName: 'Acessórios Veículos' }
  };

  // Estado Global da Vitrine
  const state = {
    products: [],
    categories: [],
    searchQuery: '',
    selectedCategory: 'all',
    maxPrice: 2500,
    maxRank: 'all',
    onlyFavorites: false,
    sortBy: 'rank',
    favorites: new Set()
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
    productsContainer: document.getElementById('productsContainer'),
    emptyState: document.getElementById('emptyState'),
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
    backToTopBtn: document.getElementById('backToTopBtn')
  };

  // =========================================================================
  // UTILITÁRIOS DE FORMATAÇÃO
  // =========================================================================
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
  }

  // =========================================================================
  // COMPARTILHAMENTO NO WHATSAPP
  // =========================================================================
  function shareOnWhatsApp(product) {
    const priceFormatted = formatCurrencyBRL(product.price);
    const shortDate = formatShortDate(product.consultedAt);
    const link = product.affiliateUrl;
    const message =
      `🔥 *Achadinho nos Mais Vendidos do Mercado Livre!*\n\n` +
      `📦 *${product.name}*\n` +
      `🏆 ${product.rank}º mais vendido em ${product.category}\n` +
      `💰 Preço consultado em ${shortDate}: *${priceFormatted}*\n\n` +
      `👉 Confira o preço atual no Mercado Livre:\n${link}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
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

  function renderNavigationAndCategories() {
    const totalCount = state.products.length;

    // 1. Subnav links
    if (els.subnavLinks) {
      const itemsHtml = [
        `<li><button type="button" class="subnav-link-btn ${state.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">Mais Vendidos (${totalCount})</button></li>`
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
        `<button type="button" class="dropdown-cat-item ${state.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">
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
        `<button type="button" role="tab" aria-selected="${state.selectedCategory === 'all'}" class="category-card-btn ${state.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">
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
  }

  // =========================================================================
  // RENDERIZAÇÃO DO CARD DE PRODUTO
  // =========================================================================
  function createProductCardHtml(product) {
    const isFav = state.favorites.has(Number(product.id));
    const shortDate = formatShortDate(product.consultedAt);
    const priceFormatted = formatCurrencyBRL(product.price);
    const rankClass = product.rank === 1 ? 'rank-badge rank-top1' : 'rank-badge';
    const rankLabel = product.rank === 1 ? '🏆 1º MAIS VENDIDO' : `${product.rank}º Mais Vendido`;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div>
          <div class="card-top-badges">
            <span class="${rankClass}" title="Posição no ranking de mais vendidos da categoria ${escapeHtml(product.category)}">
              ${rankLabel}
            </span>
            <div class="card-Quick-actions">
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
            Ver preço atual no Mercado Livre &rarr;
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
      // Categoria
      if (state.selectedCategory !== 'all' && p.category !== state.selectedCategory) {
        return false;
      }
      // Faixa de preço (se maxPrice < 2500 aplica teto; 2500 significa sem limite)
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

    // Atualiza título ativo e contador
    if (els.activeSectionTitle) {
      if (state.onlyFavorites) {
        els.activeSectionTitle.textContent = 'Meus Produtos Favoritos ❤️';
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
      state.maxPrice < 2500 ||
      state.maxRank !== 'all' ||
      state.onlyFavorites ||
      state.searchQuery.trim() !== '';
    if (els.mobileFilterDot) {
      els.mobileFilterDot.hidden = !hasActiveFilter;
    }

    // Estado vazio
    if (filtered.length === 0) {
      els.emptyState.hidden = false;
      els.productsContainer.innerHTML = '';
      return;
    }

    els.emptyState.hidden = true;

    // Se estiver mostrando TODAS as categorias e ordenando por posição no ranking (padrão),
    // agrupa visualmente por seção de categoria igual ao Mercado Livre
    if (state.selectedCategory === 'all' && state.sortBy === 'rank' && !state.onlyFavorites && !state.searchQuery.trim()) {
      const groupedHtml = [];
      state.categories.forEach((cat) => {
        const catProducts = filtered.filter((p) => p.category === cat.name);
        if (catProducts.length === 0) return;

        groupedHtml.push(`
          <div class="category-block" id="cat-${escapeHtml(cat.name)}">
            <div class="category-block-header">
              <h3 class="category-block-title">
                <span>${cat.icon}</span>
                <span>Mais vendidos em ${escapeHtml(cat.name)}</span>
              </h3>
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
      `;
    }
  }

  // =========================================================================
  // RENDERIZAÇÃO DOS #1 DE CADA CATEGORIA (SEÇÃO INFERIOR)
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
            title="Ver #1 em ${escapeHtml(p.category)} no Mercado Livre"
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
  // SINCRONIZAÇÃO DE CONTROLES E EVENTOS
  // =========================================================================
  function setCategory(catName, scrollToVitrine = false) {
    state.selectedCategory = catName || 'all';
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
    state.selectedCategory = 'all';
    state.maxPrice = 2500;
    state.maxRank = 'all';
    state.onlyFavorites = false;
    state.sortBy = 'rank';

    if (els.searchInput) els.searchInput.value = '';
    if (els.clearSearchBtn) els.clearSearchBtn.hidden = true;
    if (els.priceRangeSlider) els.priceRangeSlider.value = 2500;
    if (els.priceRangeLabel) els.priceRangeLabel.textContent = 'Até R$ 2.500+';
    if (els.onlyFavoritesToggle) els.onlyFavoritesToggle.checked = false;
    if (els.sortSelect) els.sortSelect.value = 'rank';

    const rankRadios = document.querySelectorAll('input[name="rankFilter"]');
    rankRadios.forEach((r) => {
      r.checked = r.value === 'all';
    });

    document.querySelectorAll('.price-chip').forEach((chip) => {
      chip.classList.remove('active');
    });

    updateFavoritesBadges();
    renderNavigationAndCategories();
    renderProducts();
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
        if (els.clearSearchBtn) {
          els.clearSearchBtn.hidden = !state.searchQuery;
        }
        renderProducts();
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

    // Clique nos cards de categoria, subnav e dropdown
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

      // Ações dentro do card de produto (Favoritar / WhatsApp)
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
        if (els.priceRangeLabel) {
          els.priceRangeLabel.textContent = val >= 2500 ? 'Até R$ 2.500+' : `Até ${formatCurrencyBRL(val)}`;
        }
        renderProducts();
      });
    }

    // Chips rápidos de preço
    document.querySelectorAll('.price-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const max = Number(chip.getAttribute('data-max'));
        state.maxPrice = max;
        if (els.priceRangeSlider) els.priceRangeSlider.value = max;
        if (els.priceRangeLabel) {
          els.priceRangeLabel.textContent = max >= 2500 ? 'Até R$ 2.500+' : `Até ${formatCurrencyBRL(max)}`;
        }
        document.querySelectorAll('.price-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        renderProducts();
      });
    });

    // Filtro de posição no ranking
    document.querySelectorAll('input[name="rankFilter"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        state.maxRank = e.target.value;
        renderProducts();
      });
    });

    // Toggle Somente Favoritos
    if (els.onlyFavoritesToggle) {
      els.onlyFavoritesToggle.addEventListener('change', (e) => {
        state.onlyFavorites = e.target.checked;
        updateFavoritesBadges();
        renderProducts();
      });
    }

    // Botão Meus Favoritos no cabeçalho
    if (els.headerFavBtn) {
      els.headerFavBtn.addEventListener('click', () => {
        state.onlyFavorites = !state.onlyFavorites;
        if (els.onlyFavoritesToggle) els.onlyFavoritesToggle.checked = state.onlyFavorites;
        updateFavoritesBadges();
        renderProducts();
        const vitrineEl = document.getElementById('vitrine');
        if (vitrineEl) vitrineEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (els.drawerFavLink) {
      els.drawerFavLink.addEventListener('click', () => {
        state.onlyFavorites = true;
        if (els.onlyFavoritesToggle) els.onlyFavoritesToggle.checked = true;
        updateFavoritesBadges();
        renderProducts();
        closeMobileDrawer();
      });
    }

    if (els.footerFavLink) {
      els.footerFavLink.addEventListener('click', () => {
        state.onlyFavorites = true;
        if (els.onlyFavoritesToggle) els.onlyFavoritesToggle.checked = true;
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

      renderNavigationAndCategories();
      renderProducts();
      renderTopLeaders();
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      if (els.productsContainer) {
        els.productsContainer.innerHTML = `
          <div class="empty-state">
            <h3>Não foi possível carregar o arquivo products.json</h3>
            <p>Se você abriu o arquivo direto pelo computador (file://), use um servidor local ou suba os arquivos na HostGator para que o navegador permita carregar o products.json.</p>
          </div>
        `;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
