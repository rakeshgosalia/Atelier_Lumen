(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const state = { size: '50ml', bundleQty: 1, quantity: 1, price: 148, cart: [], review: 0, productName: 'Signature Eau de Parfum', productImage: 'assets/hero-main.webp', productDetail: '50ml bottle' };

  // Header shadow
  const header = $('[data-header]');
  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  // Scroll reveal
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Scent pyramid stagger
  const noteTiers = $$('.reveal-note');
  const notesSection = $('#composition');
  if (notesSection && noteTiers.length) {
    const noteObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        noteTiers.forEach((tier, index) => setTimeout(() => tier.classList.add('is-visible'), index * 150));
        noteObserver.disconnect();
      }
    }, { threshold: 0.28 });
    noteObserver.observe(notesSection);
  }

  // Product gallery
  const mainImage = $('[data-main-image]');
  const zoomImage = $('[data-zoom-image]');
  $$('.thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.thumb').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (!mainImage) return;
      mainImage.style.opacity = '0';
      setTimeout(() => {
        mainImage.src = btn.dataset.image;
        mainImage.alt = btn.dataset.alt || '';
        if (zoomImage) zoomImage.src = btn.dataset.image;
        mainImage.style.opacity = '1';
      }, 180);
    });
  });

  // Bundle selection
  const updatePurchaseUI = () => {
    $('[data-price]').textContent = `$${state.price}`;
    $('[data-mobile-price]').textContent = `$${state.price}`;
    $('[data-mobile-size]').textContent = `${state.bundleQty} ${state.bundleQty === 1 ? 'bottle' : 'bottles'}`;
    $('[data-qty]').textContent = state.quantity;
    $('[data-sticky-qty]').textContent = state.quantity;
    $('[data-sticky-price]').textContent = `$${state.price}`;
    $('[data-sticky-description]').textContent = `${state.bundleQty} ${state.bundleQty === 1 ? 'bottle' : 'bottles'} · 50ml`;
    $('[data-mobile-image]').src = state.productImage;
    $('[data-mobile-image]').alt = state.productName;
  };
  $$('[data-bundle-options] button').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-bundle-options] button').forEach(b => { b.classList.remove('is-selected'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('is-selected');
    btn.setAttribute('aria-pressed', 'true');
    state.bundleQty = Number(btn.dataset.bundle);
    state.price = Number(btn.dataset.price);
    state.productName = 'Signature Eau de Parfum';
    state.productImage = 'assets/hero-main.webp';
    state.productDetail = `${state.bundleQty * 50}ml set`;
    updatePurchaseUI();
  }));
  $('[data-qty-minus]')?.addEventListener('click', () => { state.quantity = Math.max(1, state.quantity - 1); updatePurchaseUI(); });
  $('[data-qty-plus]')?.addEventListener('click', () => { state.quantity += 1; updatePurchaseUI(); });
  $('[data-sticky-qty-minus]')?.addEventListener('click', () => { state.quantity = Math.max(1, state.quantity - 1); updatePurchaseUI(); });
  $('[data-sticky-qty-plus]')?.addEventListener('click', () => { state.quantity += 1; updatePurchaseUI(); });

  // Cart drawer
  const cartDrawer = $('[data-cart-drawer]');
  const mobileMenu = $('[data-mobile-menu]');
  const backdrop = $('[data-drawer-backdrop]');
  const lock = on => document.body.classList.toggle('is-locked', on);
  const openLayer = layer => {
    layer?.classList.add('is-open');
    layer?.setAttribute('aria-hidden','false');
    backdrop?.classList.add('is-open');
    lock(true);
  };
  const closeLayers = () => {
    cartDrawer?.classList.remove('is-open');
    mobileMenu?.classList.remove('is-open');
    cartDrawer?.setAttribute('aria-hidden','true');
    mobileMenu?.setAttribute('aria-hidden','true');
    backdrop?.classList.remove('is-open');
    lock(false);
  };
  $$('[data-cart-open]').forEach(btn => btn.addEventListener('click', () => openLayer(cartDrawer)));
  $('[data-cart-close]')?.addEventListener('click', closeLayers);
  $('[data-menu-open]')?.addEventListener('click', () => openLayer(mobileMenu));
  $('[data-menu-close]')?.addEventListener('click', closeLayers);
  backdrop?.addEventListener('click', closeLayers);
  $$('[data-mobile-menu] a').forEach(a => a.addEventListener('click', closeLayers));

  // Add to cart simulation
  const toast = $('[data-toast]');
  const cartBody = $('[data-cart-body]');
  const cartCounts = $$('[data-cart-count]');
  const cartSubtotal = $('[data-cart-subtotal]');
  let toastTimer;
  function showToast(message) {
    toast?.querySelector('span')?.replaceChildren(message);
    toast?.classList.add('is-showing');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast?.classList.remove('is-showing'), 2200);
  }
  function renderCart() {
    if (!cartBody) return;
    const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = state.cart.reduce((sum, item) => sum + item.quantity * item.bundleQty, 0);
    cartCounts.forEach(count => { count.textContent = itemCount; });
    cartSubtotal.textContent = `$${total}`;
    if (state.cart.length === 0) {
      cartBody.innerHTML = `<div class="empty-cart"><i class="ph ph-shopping-bag-open" aria-hidden="true"></i><p>Your bag is currently empty.</p></div>`;
      return;
    }
    cartBody.innerHTML = state.cart.map((item, index) => `
      <article class="cart-line">
        <img src="${item.image}" alt="${item.name}" />
        <div><h3>${item.name}</h3><p>${item.bundleQty > 1 ? `${item.bundleQty} bottles per set · ` : ''}${item.detail}</p><div class="cart-line__controls"><button type="button" aria-label="Decrease ${item.name} quantity" data-cart-decrease="${index}"><i class="ph ph-minus" aria-hidden="true"></i></button><span aria-label="Quantity">${item.quantity}</span><button type="button" aria-label="Increase ${item.name} quantity" data-cart-increase="${index}"><i class="ph ph-plus" aria-hidden="true"></i></button><button class="cart-line__remove" type="button" data-cart-remove="${index}">Remove</button></div></div>
        <span class="line-price">$${item.price * item.quantity}</span>
      </article>`).join('');
  }
  function addToCart() {
    const existingItem = state.cart.find(item => item.name === state.productName && item.price === state.price && item.detail === state.productDetail);
    if (existingItem) {
      existingItem.quantity += state.quantity;
    } else {
      state.cart.push({ name: state.productName, image: state.productImage, detail: state.productDetail, price: state.price, quantity: state.quantity, bundleQty: state.bundleQty });
    }
    renderCart();
    showToast('Added to your bag');
  }
  cartBody?.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const index = Number(button.dataset.cartIncrease ?? button.dataset.cartDecrease ?? button.dataset.cartRemove);
    if (!Number.isInteger(index) || !state.cart[index]) return;
    if (button.dataset.cartIncrease !== undefined) state.cart[index].quantity += 1;
    if (button.dataset.cartDecrease !== undefined) state.cart[index].quantity -= 1;
    if (button.dataset.cartRemove !== undefined || state.cart[index].quantity <= 0) state.cart.splice(index, 1);
    renderCart();
  });
  $('[data-add-to-cart]')?.addEventListener('click', addToCart);
  $('[data-add-to-cart-mobile]')?.addEventListener('click', addToCart);
  $('[data-add-to-cart-sticky]')?.addEventListener('click', addToCart);
  $$('[data-collection-add]').forEach(button => button.addEventListener('click', () => {
    state.productName = button.dataset.name;
    state.productImage = button.dataset.image;
    state.productDetail = button.dataset.detail;
    state.price = Number(button.dataset.price);
    state.bundleQty = 1;
    state.quantity = 1;
    updatePurchaseUI();
    addToCart();
  }));
  $('[data-buy-now]')?.addEventListener('click', () => {
    addToCart();
    openLayer(cartDrawer);
  });
  $('[data-checkout]')?.addEventListener('click', () => {
    showToast(state.cart.length === 0 ? 'Add a fragrance before checking out' : 'Checkout is ready');
  });

  // Mobile sticky ATC appears after primary buybox button leaves viewport
  const mobileAtc = $('[data-mobile-atc]');
  const stickyPurchase = $('[data-sticky-purchase]');
  const primaryAtc = $('[data-add-to-cart]');
  if (primaryAtc) {
    const syncStickyAtc = () => {
      const shouldShow = primaryAtc.getBoundingClientRect().bottom < 0;
      mobileAtc?.classList.toggle('is-visible', shouldShow);
      stickyPurchase?.classList.toggle('is-visible', shouldShow);
      stickyPurchase?.setAttribute('aria-hidden', String(!shouldShow));
    };
    syncStickyAtc();
    window.addEventListener('scroll', syncStickyAtc, { passive: true });
    window.addEventListener('resize', syncStickyAtc);
  }

  // Reviews
  const reviews = $$('.review');
  const dots = $$('[data-review-dots] button');
  const showReview = index => {
    if (!reviews.length) return;
    state.review = (index + reviews.length) % reviews.length;
    reviews.forEach((r,i) => r.classList.toggle('is-active', i === state.review));
    dots.forEach((d,i) => d.classList.toggle('is-active', i === state.review));
  };
  $('[data-review-prev]')?.addEventListener('click', () => showReview(state.review - 1));
  $('[data-review-next]')?.addEventListener('click', () => showReview(state.review + 1));
  dots.forEach((d,i) => d.addEventListener('click', () => showReview(i)));
  if (reviews.length > 1) window.setInterval(() => showReview(state.review + 1), 6000);

  // Compact product-page reviews rotate independently, so shoppers see fresh proof before selecting a bundle.
  const miniReviews = $$('.mini-review');
  const miniDots = $$('[data-mini-review-dots] span');
  let miniReviewIndex = 0;
  const showMiniReview = index => {
    if (!miniReviews.length) return;
    miniReviewIndex = (index + miniReviews.length) % miniReviews.length;
    miniReviews.forEach((review, i) => review.classList.toggle('is-active', i === miniReviewIndex));
    miniDots.forEach((dot, i) => dot.classList.toggle('is-active', i === miniReviewIndex));
  };
  if (miniReviews.length > 1) window.setInterval(() => showMiniReview(miniReviewIndex + 1), 4200);

  // Collection filmstrip: one consistent card step, native swipe support, and a reliable loop.
  const film = $('[data-filmstrip]');
  const collectionCards = film ? $$('.collection-card', film) : [];
  let collectionIndex = 0;
  const showCollectionCard = index => {
    if (!film || !collectionCards.length) return;
    collectionIndex = (index + collectionCards.length) % collectionCards.length;
    film.scrollTo({ left: collectionCards[collectionIndex].offsetLeft, behavior: 'smooth' });
  };
  $('[data-film-prev]')?.addEventListener('click', () => showCollectionCard(collectionIndex - 1));
  $('[data-film-next]')?.addEventListener('click', () => showCollectionCard(collectionIndex + 1));
  film?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showCollectionCard(collectionIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showCollectionCard(collectionIndex + 1); }
  });

  // Desktop FAQ persistent answer panel
  const faqData = [
    ['How long does Signature wear?', 'Signature is an eau de parfum designed for a gradual, close-to-skin wear. Longevity naturally varies with skin chemistry, climate, and application.'],
    ['Is gift wrapping included?', 'Yes. Add a gift note at checkout and your order will arrive in our signature presentation box, ready to give.'],
    ['When will my order ship?', 'Orders are prepared within 2–4 business days. Once shipped, you will receive a confirmation email with tracking details.'],
    ['What is the return window?', 'We accept returns requested within 30 days of delivery. Please keep the bottle and original presentation packaging together.']
  ];
  const faqAnswer = $('[data-faq-answer]');
  $$('[data-faq]').forEach(btn => btn.addEventListener('click', () => {
    const i = Number(btn.dataset.faq);
    $$('[data-faq]').forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected','true');
    if (faqAnswer) {
      faqAnswer.animate([{opacity:.2, transform:'translateY(6px)'},{opacity:1, transform:'none'}], {duration:280, easing:'ease-out'});
      faqAnswer.innerHTML = `<span>0${i+1}</span><h3>${faqData[i][0]}</h3><p>${faqData[i][1]}</p>`;
    }
  }));

  // Image zoom modal
  const zoomModal = $('[data-zoom-modal]');
  const openZoom = () => { zoomModal?.classList.add('is-open'); zoomModal?.setAttribute('aria-hidden','false'); lock(true); };
  const closeZoom = () => { zoomModal?.classList.remove('is-open'); zoomModal?.setAttribute('aria-hidden','true'); lock(false); };
  $('[data-zoom-open]')?.addEventListener('click', openZoom);
  $('[data-zoom-close]')?.addEventListener('click', closeZoom);
  zoomModal?.addEventListener('click', e => { if (e.target === zoomModal) closeZoom(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLayers(); closeZoom(); }
  });

  updatePurchaseUI();
  renderCart();
})();
