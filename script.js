/* =====================================================
       Supabase config — replace with your own project values
       (Settings → API in your Supabase dashboard)
       ===================================================== */
    const SUPABASE_URL = 'https://cpskjljyhdklpdrpxiln.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_e6rAZOeo_8pJrt-kRoX47Q_5YdgBpf6';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    /* Fallback sample products, used only if Supabase has none yet */
    const FALLBACK_PRODUCTS = [
      { id: 'f1', name: 'Floral Pearl Necklace', category: 'Necklaces', price: 2900, icon: '📿', badge: 'Best seller', image_url: null },
      { id: 'f2', name: 'Rose Charm Bracelet', category: 'Bracelets', price: 1900, icon: '💫', badge: 'New', image_url: null },
      { id: 'f3', name: 'Elegant Moon Earrings', category: 'Earrings', price: 1500, icon: '🌙', badge: 'Gift', image_url: null },
      { id: 'f4', name: 'Princess Hair Clip Set', category: 'Hair Accessories', price: 1200, icon: '🎀', badge: 'Cute', image_url: null },
    ];

    let PRODUCTS = [];
    let activeCategory = 'all';

    const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('en-US')} دج`;

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.hidden = false;
      requestAnimationFrame(() => toast.classList.add('show'));
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.hidden = true; }, 250);
      }, 2200);
    }

    /* ---------------- Load products ---------------- */
    async function loadProducts() {
      try {
        const { data, error } = await supabaseClient
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        PRODUCTS = (data && data.length) ? data : FALLBACK_PRODUCTS;
      } catch (err) {
        console.warn('Supabase products unavailable, using fallback list:', err.message || err);
        PRODUCTS = FALLBACK_PRODUCTS;
      }
      buildCategoryChips();
      renderProducts();
      document.getElementById('productsLoading').remove();
    }

    function buildCategoryChips() {
      const cats = ['all', ...new Set(PRODUCTS.map(p => p.category).filter(Boolean))];
      const wrap = document.getElementById('categoryChips');
      wrap.innerHTML = cats.map(c =>
        `<button class="chip${c === 'all' ? ' active' : ''}" data-category="${c}" type="button">${c === 'all' ? 'All' : c}</button>`
      ).join('');
      wrap.querySelectorAll('.chip').forEach(btn => {
        btn.addEventListener('click', () => {
          activeCategory = btn.dataset.category;
          wrap.querySelectorAll('.chip').forEach(b => b.classList.toggle('active', b === btn));
          renderProducts();
        });
      });
    }

    function productCardHtml(p) {
      const wished = isWishlisted(p.id);
      const media = p.image_url
        ? `<img src="${p.image_url}" alt="${p.name}" loading="lazy" />`
        : '';
      return `
        <article class="product" data-id="${p.id}">
          <div class="product-img" data-icon="${p.image_url ? '' : (p.icon || '✦')}">
            ${media}
            <button type="button" class="wishlist-toggle${wished ? ' active' : ''}" data-id="${p.id}" aria-label="تبديل المفضلة">${wished ? '♥' : '♡'}</button>
            ${p.badge ? `<span class="sale">${p.badge}</span>` : ''}
          </div>
          <div class="product-body">
            <h3>${p.name}</h3>
            <div class="stars">★★★★★</div>
            <div class="price-row">
              <span class="price">${money(p.price)}</span>
              <button type="button" class="btn add" data-id="${p.id}">أضيفي للسلة</button>
            </div>
          </div>
        </article>`;
    }

    function wireProductCards(container) {
      container.querySelectorAll('.wishlist-toggle').forEach(btn =>
        btn.addEventListener('click', (e) => { e.stopPropagation(); toggleWishlist(btn.dataset.id); })
      );
      container.querySelectorAll('.btn.add').forEach(btn =>
        btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(btn.dataset.id); })
      );
      container.querySelectorAll('.product-img').forEach(img => {
        img.addEventListener('click', (e) => {
          if (e.target.closest('.wishlist-toggle')) return;
          const card = img.closest('.product');
          if (card) openQuickView(card.dataset.id);
        });
      });
    }

    function renderProducts(filterText) {
      const grid = document.getElementById('productsGrid');
      const emptyMsg = document.getElementById('productsEmpty');
      let list = PRODUCTS;
      if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
      if (filterText) {
        const q = filterText.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
      }
      grid.innerHTML = list.map(productCardHtml).join('');
      emptyMsg.hidden = list.length !== 0;

      wireProductCards(grid);
    }

    document.getElementById('productSearchInline').addEventListener('input', (e) => renderProducts(e.target.value));

    function openQuickView(id) {
      const p = findProduct(id);
      if (!p) return;

      const img = document.getElementById('qvImage');
      img.setAttribute('data-icon', p.image_url ? '' : (p.icon || '✦'));
      img.innerHTML = p.image_url ? `<img src="${p.image_url}" alt="${p.name}" />` : '';

      document.getElementById('qvBadgeCat').textContent = p.category || '';
      document.getElementById('qvName').textContent = p.name;

      const descEl = document.getElementById('qvDescription');
      if (p.description) {
        descEl.textContent = p.description;
        descEl.hidden = false;
      } else {
        descEl.hidden = true;
      }

      document.getElementById('qvPrice').textContent = money(p.price);
      document.getElementById('qvCategory').textContent = p.category || '—';

      const qty = p.stock_quantity ?? (p.in_stock ? null : 0);
      document.getElementById('qvStock').textContent = (qty !== null && qty <= 0) ? 'نفد المخزون' : 'متوفر';

      const addBtn = document.getElementById('qvAddBtn');
      addBtn.dataset.id = p.id;

      openPanel(quickViewModal);
    }

    document.getElementById('quickViewClose').addEventListener('click', () => closePanel(quickViewModal));
    document.getElementById('qvAddBtn').addEventListener('click', () => {
      const id = document.getElementById('qvAddBtn').dataset.id;
      addToCart(id);
      closePanel(quickViewModal);
    });

    function findProduct(id) {
      return PRODUCTS.find(p => String(p.id) === String(id));
    }

    /* ---------------- Cart (localStorage) ---------------- */
    const CART_KEY = 'lafleuren_cart';
    const WISHLIST_KEY = 'lafleuren_wishlist';

    function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
    function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); renderCartBadge(); }
    function getWishlist() { try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; } catch { return []; } }
    function saveWishlist(list) { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); renderWishlistBadge(); }
    function isWishlisted(id) { return getWishlist().includes(String(id)); }

    function addToCart(id) {
      const cart = getCart();
      const existing = cart.find(i => i.id === String(id));
      if (existing) existing.qty += 1;
      else cart.push({ id: String(id), qty: 1 });
      saveCart(cart);
      renderCartDrawer();
      const p = findProduct(id);
      showToast(`تمت إضافة ${p ? p.name : 'المنتج'} إلى سلتك`);
    }

    function changeQty(id, delta) {
      const cart = getCart();
      const item = cart.find(i => i.id === String(id));
      if (!item) return;
      item.qty += delta;
      const next = item.qty <= 0 ? cart.filter(i => i.id !== String(id)) : cart;
      saveCart(next);
      renderCartDrawer();
    }

    function removeFromCart(id) {
      saveCart(getCart().filter(i => i.id !== String(id)));
      renderCartDrawer();
    }

    function cartTotal(cart) {
      return cart.reduce((sum, i) => {
        const p = findProduct(i.id);
        return sum + (p ? p.price * i.qty : 0);
      }, 0);
    }

    function renderCartDrawer() {
      const cart = getCart();
      const body = document.getElementById('cartItems');
      if (!cart.length) {
        body.innerHTML = '<p class="drawer-empty">سلتك فارغة. استكشفي المجموعة وأضيفي شيئًا جميلًا ✦</p>';
      } else {
        body.innerHTML = cart.map(item => {
          const p = findProduct(item.id);
          if (!p) return '';
          const media = p.image_url ? `<img src="${p.image_url}" alt="${p.name}" />` : (p.icon || '✦');
          return `
            <div class="cart-row" data-id="${p.id}">
              <div class="thumb">${media}</div>
              <div class="info">
                <h4>${p.name}</h4>
                <span class="price">${money(p.price)}</span>
                <div class="qty-control">
                  <button type="button" class="qty-minus" data-id="${p.id}">−</button>
                  <span>${item.qty}</span>
                  <button type="button" class="qty-plus" data-id="${p.id}">+</button>
                </div>
              </div>
              <button type="button" class="row-remove" data-id="${p.id}" aria-label="إزالة">✕</button>
            </div>`;
        }).join('');
        body.querySelectorAll('.qty-plus').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.id, 1)));
        body.querySelectorAll('.qty-minus').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.id, -1)));
        body.querySelectorAll('.row-remove').forEach(b => b.addEventListener('click', () => removeFromCart(b.dataset.id)));
      }
      document.getElementById('cartSubtotal').textContent = money(cartTotal(cart));
    }

    function renderCartBadge() {
      const cart = getCart();
      const count = cart.reduce((n, i) => n + i.qty, 0);
      const badge = document.getElementById('cartCount');
      badge.textContent = count;
      badge.hidden = count === 0;
    }

    /* ---------------- Wishlist ---------------- */
    function toggleWishlist(id) {
      id = String(id);
      let list = getWishlist();
      if (list.includes(id)) {
        list = list.filter(i => i !== id);
        showToast('تمت الإزالة من المفضلة');
      } else {
        list.push(id);
        showToast('أُضيف إلى المفضلة ♥');
      }
      saveWishlist(list);
      renderProducts(document.getElementById('productSearchInline').value);
      renderWishlistDrawer();
    }

    function renderWishlistDrawer() {
      const list = getWishlist();
      const body = document.getElementById('wishlistItems');
      if (!list.length) {
        body.innerHTML = '<p class="drawer-empty">لا توجد مفضلات بعد. اضغطي على ♡ في أي منتج لحفظه هنا.</p>';
        return;
      }
      body.innerHTML = list.map(id => {
        const p = findProduct(id);
        if (!p) return '';
        const media = p.image_url ? `<img src="${p.image_url}" alt="${p.name}" />` : (p.icon || '✦');
        return `
          <div class="wish-row" data-id="${p.id}">
            <div class="thumb">${media}</div>
            <div class="info"><h4>${p.name}</h4><span class="price">${money(p.price)}</span></div>
            <button type="button" class="btn add-from-wish" data-id="${p.id}">أضيفي</button>
            <button type="button" class="row-remove" data-id="${p.id}" aria-label="إزالة">✕</button>
          </div>`;
      }).join('');
      body.querySelectorAll('.add-from-wish').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.id)));
      body.querySelectorAll('.row-remove').forEach(b => b.addEventListener('click', () => toggleWishlist(b.dataset.id)));
    }

    function renderWishlistBadge() {
      const count = getWishlist().length;
      const badge = document.getElementById('wishlistCount');
      badge.textContent = count;
      badge.hidden = count === 0;
    }

    /* ---------------- Drawers / overlay open-close ---------------- */
    const backdrop = document.getElementById('overlayBackdrop');
    const cartDrawer = document.getElementById('cartDrawer');
    const wishlistDrawer = document.getElementById('wishlistDrawer');
    const searchOverlay = document.getElementById('searchOverlay');
    const checkoutModal = document.getElementById('checkoutModal');
    const quickViewModal = document.getElementById('quickViewModal');

    function openPanel(panel) {
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add('show'));
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('show'));
      panel.setAttribute('aria-hidden', 'false');
    }
    function closePanel(panel) {
      panel.classList.remove('show');
      panel.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('show');
      setTimeout(() => {
        if (![cartDrawer, wishlistDrawer, searchOverlay, checkoutModal, quickViewModal].some(p => p.classList.contains('show'))) {
          backdrop.hidden = true;
        }
      }, 250);
    }

    document.getElementById('cartBtn').addEventListener('click', () => { renderCartDrawer(); openPanel(cartDrawer); });
    document.getElementById('cartClose').addEventListener('click', () => closePanel(cartDrawer));
    document.getElementById('wishlistBtn').addEventListener('click', () => { renderWishlistDrawer(); openPanel(wishlistDrawer); });
    document.getElementById('wishlistClose').addEventListener('click', () => closePanel(wishlistDrawer));
    document.getElementById('searchBtn').addEventListener('click', () => {
      openPanel(searchOverlay);
      document.getElementById('searchInput').focus();
    });
    document.getElementById('searchClose').addEventListener('click', () => closePanel(searchOverlay));
    backdrop.addEventListener('click', () => {
      [cartDrawer, wishlistDrawer, searchOverlay, checkoutModal, quickViewModal].forEach(p => { if (p.classList.contains('show')) closePanel(p); });
    });

    /* Mobile tab bar mirrors the header icon buttons */
    document.getElementById('tabSearchBtn').addEventListener('click', () => {
      openPanel(searchOverlay);
      document.getElementById('searchInput').focus();
    });
    document.getElementById('tabWishlistBtn').addEventListener('click', () => { renderWishlistDrawer(); openPanel(wishlistDrawer); });
    document.getElementById('tabCartBtn').addEventListener('click', () => { renderCartDrawer(); openPanel(cartDrawer); });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const results = document.getElementById('searchResults');
      if (!q) { results.innerHTML = ''; return; }
      const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
      results.innerHTML = matches.length
        ? matches.map(productCardHtml).join('')
        : '<p class="products-empty">لم يتم العثور على منتجات.</p>';
      results.querySelectorAll('.wishlist-toggle').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); toggleWishlist(btn.dataset.id); }));
      results.querySelectorAll('.btn.add').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(btn.dataset.id); }));
      results.querySelectorAll('.product-img').forEach(img => {
        img.addEventListener('click', (e) => {
          if (e.target.closest('.wishlist-toggle')) return;
          const card = img.closest('.product');
          if (card) openQuickView(card.dataset.id);
        });
      });
    });

    /* ---------------- Checkout ---------------- */
    function generateOrderNumber() {
      return `LF-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    document.getElementById('checkoutBtn').addEventListener('click', () => {
      const cart = getCart();
      if (!cart.length) { showToast('سلتك فارغة'); return; }
      closePanel(cartDrawer);
      document.getElementById('checkoutFormWrap').hidden = false;
      document.getElementById('checkoutSuccess').hidden = true;
      const summary = document.getElementById('checkoutSummary');
      const lines = cart.map(i => {
        const p = findProduct(i.id);
        return p ? `${p.name} × ${i.qty}` : '';
      }).filter(Boolean).join(', ');
      summary.innerHTML = `${lines}<br><strong>المجموع: ${money(cartTotal(cart))}</strong>`;
      openPanel(checkoutModal);
    });
    document.getElementById('checkoutClose').addEventListener('click', () => closePanel(checkoutModal));
    document.getElementById('checkoutDone').addEventListener('click', () => closePanel(checkoutModal));

    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const cart = getCart();
      if (!cart.length) { showToast('سلتك فارغة'); return; }

      const items = cart.map(i => {
        const p = findProduct(i.id);
        return { id: i.id, name: p ? p.name : 'منتج', price: p ? p.price : 0, qty: i.qty };
      });
      const subtotal = cartTotal(cart);
      const orderNumber = generateOrderNumber();
      const placeBtn = document.getElementById('placeOrderBtn');
      const msg = document.getElementById('checkoutMessage');

      placeBtn.disabled = true;
      placeBtn.textContent = 'جارٍ إرسال الطلب…';
      msg.textContent = '';

      const { error } = await supabaseClient.from('orders').insert({
        order_number: orderNumber,
        customer_name: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        email: document.getElementById('custEmail').value.trim() || null,
        address: document.getElementById('custAddress').value.trim(),
        notes: document.getElementById('custNotes').value.trim() || null,
        items: items,
        subtotal: subtotal,
        status: 'new',
      });

      placeBtn.disabled = false;
      placeBtn.textContent = 'تأكيد الطلب';

      if (error) {
        console.error('Order insert error:', error);
        msg.textContent = 'حدث خطأ أثناء إرسال طلبك. حاولي مرة أخرى أو راسلينا عبر واتساب.';
        return;
      }

      saveCart([]);
      renderCartDrawer();
      document.getElementById('checkoutFormWrap').hidden = true;
      document.getElementById('checkoutSuccess').hidden = false;
      document.getElementById('successOrderNumber').textContent = orderNumber;
      document.getElementById('checkoutForm').reset();
    });

    /* ---------------- Newsletter ---------------- */
    document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const msg = document.getElementById('newsletterMessage');
      const email = emailInput.value.trim();
      if (!email) return;

      const { error } = await supabaseClient.from('newsletter_subscribers').insert({ email });
      if (error) {
        if (error.code === '23505') {
          msg.textContent = 'أنتِ مشتركة بالفعل ✦';
        } else {
          console.error('Newsletter insert error:', error);
          msg.textContent = 'تعذّر الاشتراك حاليًا — حاولي مرة أخرى لاحقًا.';
        }
        return;
      }
      msg.textContent = 'شكرًا لانضمامكِ إلى La_Fleuren!';
      emailInput.value = '';
    });

    /* ---------------- Theme toggle (light default, dark optional) ---------------- */
    (function initThemeToggle() {
      const STORAGE_KEY = 'lafleuren_theme';
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark') document.body.classList.add('dark-mode');

      const btn = document.getElementById('themeToggle');
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!btn) return;

      function syncThemeButton() {
        const isDark = document.body.classList.contains('dark-mode');
        btn.textContent = isDark ? '☀' : '🌙';
        btn.setAttribute('aria-label', isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
        if (metaTheme) metaTheme.setAttribute('content', isDark ? '#241b20' : '#ffffff');
      }

      btn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem(STORAGE_KEY, document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        syncThemeButton();
      });

      syncThemeButton();
    })();

    /* ---------------- Active tab highlight on scroll ---------------- */
    (function initTabHighlight() {
      const tabLinks = document.querySelectorAll('.mobile-tabbar a[href^="#"]');
      if (!tabLinks.length) return;
      const sections = Array.from(tabLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
      const setActive = (id) => {
        tabLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
      sections.forEach(s => observer.observe(s));
    })();

    /* ---------------- Init ---------------- */
    renderCartBadge();
    renderWishlistBadge();
    loadProducts();