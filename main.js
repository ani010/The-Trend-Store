/**
 * THE TREND STORE - CORE CONTROLLER
 * Handles: Cart State, Drawer Rendering, Product Loading, Filter/Search,
 * Intersection Observer Scroll Reveals, Honeypots, and EmailJS Integrations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. EMAILJS INITIALIZATION
    initializeEmailJS();

    // 2. INITIALIZE SERVICES
    const cart = new Cart();
    initGlobalUI(cart);
    initIntersectionObserver();
    initProductModal(cart); // Initialize product quick view detail modal
    
    // Page-specific initializers
    if (document.getElementById('featured-carousel')) {
        initHomePage(cart);
    }
    if (document.getElementById('shop-grid')) {
        initShopPage(cart);
    }
    if (document.getElementById('contact-page-form')) {
        initContactPage();
    }
});

/* ==========================================
   1. EMAILJS INTEGRATION SYSTEM
   ========================================== */
function initializeEmailJS() {
    if (typeof emailjs !== 'undefined') {
        if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            console.log("EmailJS initialized with public key.");
        } else {
            console.warn("EmailJS Public Key is set to default. Standard mock mode will be active.");
        }
    } else {
        console.error("EmailJS SDK script was not loaded successfully.");
    }
}

/* ==========================================
   2. GLOBAL CART SYSTEM (LOCALSTORAGE SYNCED)
   ========================================== */
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('tts_cart')) || [];
        this.badge = document.getElementById('cart-count');
        this.itemsWrapper = document.getElementById('cart-items-list');
        this.totalAmountEl = document.getElementById('cart-total');
        this.updateBadge();
    }

    save() {
        localStorage.setItem('tts_cart', JSON.stringify(this.items));
        this.updateBadge();
        this.render();
    }

    addItem(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.items.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.save();
        this.triggerCartBounce();
        showToast(`Added "${product.name}" to cart.`);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
    }

    updateQty(productId, amount) {
        const item = this.items.find(item => item.id === productId);
        if (!item) return;

        item.quantity += amount;
        if (item.quantity <= 0) {
            this.removeItem(productId);
        } else {
            this.save();
        }
    }

    clear() {
        this.items = [];
        this.save();
    }

    getQtyTotal() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getPriceTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    }

    updateBadge() {
        if (this.badge) {
            this.badge.textContent = this.getQtyTotal();
        }
    }

    // Satisfaction Pop Bounce Animation on Cart Icon
    triggerCartBounce() {
        const cartBtn = document.getElementById('cart-trigger');
        if (cartBtn) {
            cartBtn.classList.remove('cart-bounce');
            // Force redraw/reflow for restartable keyframe triggers
            void cartBtn.offsetWidth; 
            cartBtn.classList.add('cart-bounce');
            setTimeout(() => {
                cartBtn.classList.remove('cart-bounce');
            }, 500);
        }
    }

    render() {
        if (!this.itemsWrapper || !this.totalAmountEl) return;

        if (this.items.length === 0) {
            this.itemsWrapper.innerHTML = `
                <div class="cart-empty-message">
                    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p>Your shopping cart is empty</p>
                </div>
            `;
            this.totalAmountEl.textContent = "$0.00";
            
            // Disable order button if cart is empty
            const submitBtn = document.getElementById('checkout-submit-btn');
            if (submitBtn) submitBtn.disabled = true;
            return;
        }

        const submitBtn = document.getElementById('checkout-submit-btn');
        if (submitBtn) submitBtn.disabled = false;

        this.itemsWrapper.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    <div class="cart-item-actions">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="window.ttsUpdateQty(${item.id}, -1)">-</button>
                            <span class="qty-num">${item.quantity}</span>
                            <button class="qty-btn" onclick="window.ttsUpdateQty(${item.id}, 1)">+</button>
                        </div>
                        <button class="cart-remove-btn" onclick="window.ttsRemoveItem(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.totalAmountEl.textContent = `$${this.getPriceTotal()}`;
    }
}

// Global window helpers so HTML inline onclicks trigger cart actions properly
window.ttsUpdateQty = (id, amt) => {
    const cartObj = new Cart();
    cartObj.updateQty(id, amt);
};
window.ttsRemoveItem = (id) => {
    const cartObj = new Cart();
    cartObj.removeItem(id);
};

/* ==========================================
   3. GLOBAL UI MECHANICS
   ========================================== */
function initGlobalUI(cart) {
    const header = document.getElementById('main-header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const cartTrigger = document.getElementById('cart-trigger');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutForm = document.getElementById('checkout-form');
    const successClose = document.getElementById('success-close-btn');

    // Sticky Header Scroll Handler
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // Close mobile nav on click links
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // Slide-out Cart Drawer Triggers
    if (cartTrigger && cartOverlay) {
        cartTrigger.addEventListener('click', () => {
            cart.render();
            cartOverlay.classList.add('open');
        });
    }

    if (cartClose && cartOverlay) {
        cartClose.addEventListener('click', () => {
            cartOverlay.classList.remove('open');
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                cartOverlay.classList.remove('open');
            }
        });
    }

    // Checkout Form Order Submission Logic
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCheckoutSubmit(cart);
        });
    }

    // Success Screen Closing
    if (successClose && cartOverlay) {
        successClose.addEventListener('click', () => {
            document.getElementById('success-screen').classList.remove('active');
            cartOverlay.classList.remove('open');
        });
    }
}

/* ==========================================
   4. CHECKOUT SUBMIT & EMAILJS SENDER
   ========================================== */
function handleCheckoutSubmit(cart) {
    const hpValue = document.getElementById('honeypot_field').value;
    
    // 1. Anti-Spam Check: silently abort if field is filled
    if (hpValue.trim() !== "") {
        console.warn("Spambot submission blocked via Honeypot.");
        cart.clear();
        document.getElementById('checkout-form').reset();
        document.getElementById('cart-overlay').classList.remove('open');
        return;
    }

    const form = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('checkout-submit-btn');
    const fields = form.querySelectorAll('.form-control');

    // Disable all fields to freeze inputs
    fields.forEach(f => f.disabled = true);
    submitBtn.disabled = true;
    
    // Store original button text and load spinner
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="spinner"></span> Placing Order...`;

    // Compile items metadata for email formatting
    const itemString = cart.items.map(item => `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const totalAmount = `$${cart.getPriceTotal()}`;
    const clientName = document.getElementById('cust-name').value;
    const clientPhone = document.getElementById('cust-phone').value;
    const clientAddress = document.getElementById('cust-address').value;
    const clientNotes = document.getElementById('cust-notes').value || 'No notes provided.';

    // EmailJS Parameters Structure
    const emailParams = {
        to_email: "thetrendstore@gmail.com",
        customer_name: clientName,
        customer_phone: clientPhone,
        customer_address: clientAddress,
        order_details: itemString,
        total_price: totalAmount,
        order_notes: clientNotes
    };

    // Check if configuration credentials are set to decide API call vs Mock fallback
    const isRealCredentialsSet = (
        EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' &&
        EMAILJS_CONFIG.SERVICE_ID && EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
        EMAILJS_CONFIG.TEMPLATE_ID && EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID'
    );

    if (isRealCredentialsSet) {
        // Send actual EmailJS request
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, emailParams)
            .then(() => {
                handleOrderSuccess(cart, form, submitBtn, fields, originalBtnText);
            })
            .catch((error) => {
                console.error("EmailJS Order Submission failed: ", error);
                showToast("Order failed. Please check connection and try again.", true);
                // Unlock inputs
                fields.forEach(f => f.disabled = false);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
    } else {
        // Mock fallback simulates API request delay
        console.log("Mocking EmailJS order send details:", emailParams);
        setTimeout(() => {
            handleOrderSuccess(cart, form, submitBtn, fields, originalBtnText);
        }, 1500);
    }
}

function handleOrderSuccess(cart, form, submitBtn, fields, originalBtnText) {
    // 1. Trigger celebratory Success Screen inside the drawer
    const successScreen = document.getElementById('success-screen');
    if (successScreen) {
        successScreen.classList.add('active');
    }

    // 2. Clear Cart state
    cart.clear();
    
    // 3. Reset form inputs and unlock
    form.reset();
    fields.forEach(f => f.disabled = false);
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    showToast("Order placed successfully!");
}

/* ==========================================
   5. CONTACT PAGE SUBMISSION (EMAILJS INTEGRATED)
   ========================================== */
function initContactPage() {
    const contactForm = document.getElementById('contact-page-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Anti-spam Honeypot Check
        const hpVal = document.getElementById('contact_honeypot').value;
        if (hpVal.trim() !== "") {
            console.warn("Contact Spambot blocked.");
            contactForm.reset();
            return;
        }

        const submitBtn = document.getElementById('contact-submit-btn');
        const fields = contactForm.querySelectorAll('.form-control');

        // Lock form inputs
        fields.forEach(f => f.disabled = true);
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span class="spinner"></span> Sending Message...`;

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;

        const emailParams = {
            to_email: "thetrendstore@gmail.com",
            user_name: name,
            user_email: email,
            subject: subject,
            message: message
        };

        const isRealCredentialsSet = (
            EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' &&
            EMAILJS_CONFIG.SERVICE_ID && EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
            EMAILJS_CONFIG.CONTACT_TEMPLATE_ID && EMAILJS_CONFIG.CONTACT_TEMPLATE_ID !== 'YOUR_CONTACT_TEMPLATE_ID'
        );

        if (isRealCredentialsSet) {
            emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.CONTACT_TEMPLATE_ID, emailParams)
                .then(() => {
                    showToast("Message sent successfully!");
                    contactForm.reset();
                    fields.forEach(f => f.disabled = false);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                })
                .catch((error) => {
                    console.error("Contact EmailJS Send failed: ", error);
                    showToast("Failed to send message. Please try again.", true);
                    fields.forEach(f => f.disabled = false);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                });
        } else {
            console.log("Mocking Contact EmailJS send details:", emailParams);
            setTimeout(() => {
                showToast("Message sent successfully!");
                contactForm.reset();
                fields.forEach(f => f.disabled = false);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 1500);
        }
    });
}

/* ==========================================
   6. SCROLL REVEALS (INTERSECTION OBSERVER)
   ========================================== */
function initIntersectionObserver() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observerOptions = {
        root: null, // Viewport
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Unobserve once revealed to save process threads
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================
   7. TOAST NOTIFICATION ALERTS
   ========================================== */
function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    if (isError) {
        toast.style.backgroundColor = '#DC2626';
    }

    toast.innerHTML = `
        <span>${message}</span>
        <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
    `;

    container.appendChild(toast);

    // Auto-remove toast notification after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

/* ==========================================
   8. HOME PAGE LOGIC (CAROUSEL RENDERING)
   ========================================== */
function initHomePage(cart) {
    const carousel = document.getElementById('featured-carousel');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (!carousel) return;

    // Load featured catalog items
    const featuredItems = PRODUCTS.filter(p => p.featured);
    carousel.innerHTML = featuredItems.map(p => {
        const pct = Math.round((1 - p.price / p.originalPrice) * 100);
        return `
            <article class="product-card" onclick="window.ttsViewProduct(${p.id})">
                <span class="product-badge">Sale -${pct}%</span>
                <div class="product-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
                    <div class="product-action-overlay">
                        <button class="btn btn-primary product-card-btn" onclick="window.ttsAdd(event, ${p.id})">Add to Cart</button>
                    </div>
                </div>
                <div class="product-details">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-name">${p.name}</h3>
                    <div class="product-price-wrapper">
                        <span class="product-price">$${p.price.toFixed(2)}</span>
                        <del class="product-price-del">$${p.originalPrice.toFixed(2)}</del>
                        <span class="product-save-tag">Save ${pct}%</span>
                    </div>
                    <button class="product-card-mobile-btn" onclick="window.ttsAdd(event, ${p.id})">Add to Cart</button>
                </div>
            </article>
        `;
    }).join('');

    // Global helper mapping for onclick add references
    window.ttsAdd = (e, id) => {
        if (e) e.stopPropagation(); // Stop click from triggering parent card details modal
        cart.addItem(id);
    };

    // Carousel Navigation Calculations
    if (prevBtn && nextBtn) {
        const updateControls = () => {
            prevBtn.disabled = carousel.scrollLeft <= 0;
            // Allow a buffer for decimal pixel values on high-density screens
            nextBtn.disabled = Math.ceil(carousel.scrollLeft + carousel.clientWidth) >= carousel.scrollWidth;
        };

        // Scroll listener to toggle disabled button styles
        carousel.addEventListener('scroll', updateControls);
        window.addEventListener('resize', updateControls);
        setTimeout(updateControls, 100); // Small initial timeout to let DOM render

        prevBtn.addEventListener('click', () => {
            const cardWidth = carousel.querySelector('.product-card').clientWidth + 24; // Width + gap
            carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = carousel.querySelector('.product-card').clientWidth + 24; // Width + gap
            carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
    }
}

/* ==========================================
   9. SHOP PAGE LOGIC (SEARCH/FILTER/SORT GRID)
   ========================================== */
function initShopPage(cart) {
    const shopGrid = document.getElementById('shop-grid');
    const searchBox = document.getElementById('search-box');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const sortBox = document.getElementById('sort-box');
    const resultsCountEl = document.getElementById('results-count');

    let activeCategory = 'all';
    let searchQuery = '';
    let activeSort = 'featured';

    // Check url search query parameter (e.g. ?category=womens)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        // Map shorthand url terms to real categories
        const mapping = {
            'mens': "Men's Fashion",
            'womens': "Women's Fashion",
            'accessories': "Accessories",
            'footwear': "Footwear"
        };
        const mappedCat = mapping[categoryParam.toLowerCase()];
        if (mappedCat) {
            activeCategory = mappedCat;
            // Update UI class active state
            categoryBtns.forEach(btn => {
                if (btn.getAttribute('data-category') === mappedCat) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    const renderGrid = () => {
        if (!shopGrid) return;

        // 1. Filter by category
        let filtered = PRODUCTS;
        if (activeCategory !== 'all') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }

        // 2. Filter by search keyword
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        // 3. Sort logic
        if (activeSort === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (activeSort === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (activeSort === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (activeSort === 'name-desc') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        } else {
            // Default "featured" - sort by product ID
            filtered.sort((a, b) => a.id - b.id);
        }

        // 4. Update count title
        if (resultsCountEl) {
            resultsCountEl.textContent = `Showing ${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
        }

        // 5. Build grid HTML
        if (filtered.length === 0) {
            shopGrid.innerHTML = `
                <div class="empty-catalog">
                    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap: "round" stroke-linejoin: "round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <h3>No products found</h3>
                    <p>Try refining your search keyword or clearing category filters.</p>
                </div>
            `;
            return;
        }

        shopGrid.innerHTML = filtered.map(p => {
            const pct = Math.round((1 - p.price / p.originalPrice) * 100);
            return `
                <article class="product-card" onclick="window.ttsViewProduct(${p.id})">
                    <span class="product-badge">Sale -${pct}%</span>
                    <div class="product-img-wrapper">
                        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
                        <div class="product-action-overlay">
                            <button class="btn btn-primary product-card-btn" onclick="window.ttsAdd(event, ${p.id})">Add to Cart</button>
                        </div>
                    </div>
                    <div class="product-details">
                        <span class="product-category">${p.category}</span>
                        <h3 class="product-name">${p.name}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.4;">${p.description}</p>
                        <div class="product-price-wrapper">
                            <span class="product-price">$${p.price.toFixed(2)}</span>
                            <del class="product-price-del">$${p.originalPrice.toFixed(2)}</del>
                            <span class="product-save-tag">Save ${pct}%</span>
                        </div>
                        <button class="product-card-mobile-btn" onclick="window.ttsAdd(event, ${p.id})">Add to Cart</button>
                    </div>
                </article>
            `;
        }).join('');
    };

    // Search Keyup Handler
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderGrid();
        });
    }

    // Category Button Clicks
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-category');
            renderGrid();
        });
    });

    // Sorting Selection Clicks
    if (sortBox) {
        sortBox.addEventListener('change', (e) => {
            activeSort = e.target.value;
            renderGrid();
        });
    }

    // Run first render
    renderGrid();
}

/* ==========================================
   10. PRODUCT QUICK VIEW MODAL CREATOR
   ========================================== */
function initProductModal(cart) {
    let modal = document.getElementById('product-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'product-detail-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
    });

    window.ttsCloseModal = () => {
        modal.classList.remove('open');
    };

    window.ttsViewProduct = (productId) => {
        const p = PRODUCTS.find(prod => prod.id === productId);
        if (!p) return;

        modal.innerHTML = `
            <div class="modal-container">
                <button class="modal-close" onclick="window.ttsCloseModal()" aria-label="Close details">&times;</button>
                <div class="modal-image-wrapper">
                    <img src="${p.image}" alt="${p.name}" class="modal-img">
                </div>
                <div class="modal-info-panel">
                    <span class="modal-category">${p.category}</span>
                    <h2 class="modal-title">${p.name}</h2>
                    <span class="modal-price">$${p.price.toFixed(2)}</span>
                    <p class="modal-desc">${p.description}</p>
                    <div class="modal-actions">
                        <div class="modal-qty-control">
                            <button class="modal-qty-btn" onclick="window.ttsAdjustModalQty(-1)">-</button>
                            <span class="modal-qty-num" id="modal-qty-display">1</span>
                            <button class="modal-qty-btn" onclick="window.ttsAdjustModalQty(1)">+</button>
                        </div>
                        <button class="btn btn-primary modal-add-btn" onclick="window.ttsAddFromModal(${p.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;

        window.modalQtyVal = 1;

        window.ttsAdjustModalQty = (amt) => {
            window.modalQtyVal += amt;
            if (window.modalQtyVal < 1) window.modalQtyVal = 1;
            const display = document.getElementById('modal-qty-display');
            if (display) display.textContent = window.modalQtyVal;
        };

        window.ttsAddFromModal = (id) => {
            for (let i = 0; i < window.modalQtyVal; i++) {
                cart.addItem(id);
            }
            modal.classList.remove('open');
        };

        modal.classList.add('open');
    };
}
