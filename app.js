// ================================================================
//   THE PIZZA HOUSE - APPLICATION LOGIC
// ================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Safe localStorage parser helper
  function safeLoadJSON(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      if (!data || data === "undefined" || data === "null") return defaultValue;
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing localStorage key:", key, e);
      return defaultValue;
    }
  }

  // --- Global Application State ---
  let appState = {
    currentUser: safeLoadJSON("pizza_user", null),
    cart: safeLoadJSON("pizza_cart", []),
    activePage: "home",
    activeOrder: safeLoadJSON("pizza_active_order", null),
    orderHistory: safeLoadJSON("pizza_order_history", []),
    appliedCoupon: safeLoadJSON("pizza_applied_coupon", null),
    
    // Customizer Modal Temporary State
    customizer: {
      item: null,
      size: "regular",
      crust: "classic",
      toppings: new Set()
    }
  };

  // --- Constants for Coupons ---
  const AVAILABLE_COUPONS = {
    "PIZZA30": { type: "percentage", value: 30, description: "30% off on subtotal" },
    "FREESHIP": { type: "freedelivery", value: 100, description: "Free delivery charges" }
  };

  // --- DOM Elements ---
  const views = document.querySelectorAll(".page-view");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const closeMobileDrawerBtn = document.getElementById("close-mobile-drawer");
  
  // Cart Drawer Elements
  const cartNavBtn = document.getElementById("cart-nav-btn");
  const cartDrawerOverlay = document.getElementById("cart-drawer-overlay");
  const cartDrawer = document.getElementById("cart-drawer");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartSummaryContainer = document.getElementById("cart-summary-container");
  const cartBadge = document.getElementById("cart-badge");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartDiscountEl = document.getElementById("cart-discount");
  const discountRow = document.getElementById("discount-row");
  const cartTaxEl = document.getElementById("cart-tax");
  const cartDeliveryEl = document.getElementById("cart-delivery");
  const cartTotalEl = document.getElementById("cart-total");
  
  // Coupon elements
  const couponInput = document.getElementById("coupon-input");
  const applyCouponBtn = document.getElementById("apply-coupon-btn");
  const couponFeedback = document.getElementById("coupon-feedback");

  // Checkout Elements
  const proceedCheckoutBtn = document.getElementById("proceed-checkout-btn");
  const checkoutFormView = document.getElementById("checkout-form-view");
  const backToCartBtn = document.getElementById("back-to-cart-btn");
  const checkoutDeliveryForm = document.getElementById("checkout-delivery-form");
  const checkoutTotalEl = document.getElementById("checkout-total-price");
  const creditCardFields = document.getElementById("credit-card-fields");
  const upiQrcodeFields = document.getElementById("upi-qrcode-fields");

  // Customizer Modal Elements
  const customizerModal = document.getElementById("customizer-modal");
  const closeCustomizerBtn = document.getElementById("close-customizer-btn");
  const customizerTitle = document.getElementById("customizer-title");
  const customizerImg = document.getElementById("customizer-img");
  const customizerRatingValue = document.getElementById("customizer-rating-value");
  const customizerDescription = document.getElementById("customizer-description");
  const sizeSelectorsContainer = document.getElementById("size-selectors-container");
  const crustSelectorsContainer = document.getElementById("crust-selectors-container");
  const toppingsContainer = document.getElementById("toppings-container");
  const customizerTotalPrice = document.getElementById("customizer-total-price");
  const addCustomizedCartBtn = document.getElementById("add-customized-cart-btn");

  // Auth Modal Elements
  const profileIcon = document.getElementById("profile-icon");
  const loginNavBtn = document.getElementById("login-nav-btn");
  const signupNavBtn = document.getElementById("signup-nav-btn");
  const userDisplayNameEl = document.getElementById("user-display-name");
  const btnsiContainer = document.getElementById("btnsi");
  const authModal = document.getElementById("auth-modal");
  const closeAuthBtn = document.getElementById("close-auth-btn");
  const tabLoginBtn = document.getElementById("tab-login-btn");
  const tabSignupBtn = document.getElementById("tab-signup-btn");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  // Orders View & Live Tracking
  const activeOrderTracking = document.getElementById("active-order-tracking");
  const trackOrderIdEl = document.getElementById("track-order-id");
  const trackEtaEl = document.getElementById("track-eta");
  const orderHistoryList = document.getElementById("order-history-list");
  
  // Contact View
  const contactForm = document.getElementById("contact-form");

  // --- Initial Setup ---
  initApp();

  function initApp() {
    setupAuthNavbar();
    renderMenuGrid();
    renderCart();
    setupEventListeners();
    checkActiveOrderTracking();
    renderOrderHistory();
  }

  // --- SPA Router System ---
  function navigateTo(pageId) {
    appState.activePage = pageId;
    
    // Hide all views and show active
    views.forEach(view => {
      view.classList.remove("active-view");
    });
    const targetView = document.getElementById(`${pageId}-view`);
    if (targetView) {
      targetView.classList.add("active-view");
      window.scrollTo(0, 0);
    }

    // Update active class in navigation links
    navLinks.forEach(link => {
      if (link.getAttribute("data-page") === pageId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Close drawers
    mobileDrawer.classList.add("drawer-hidden");
  }

  // --- Interactive Menu Listing & Filtering ---
  function renderMenuGrid(categoryFilter = "all", searchQuery = "") {
    const menuGrid = document.getElementById("menu-grid");
    if (!menuGrid) return;

    menuGrid.innerHTML = "";

    // Filter logic
    let filteredItems = PIZZA_MENU;
    if (categoryFilter !== "all") {
      filteredItems = filteredItems.filter(item => item.category === categoryFilter);
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }

    if (filteredItems.length === 0) {
      menuGrid.innerHTML = `
        <div class="empty-search-message" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 10px;">search_off</span>
          <p>No delicious items found matching your filter criteria.</p>
        </div>
      `;
      return;
    }

    filteredItems.forEach(item => {
      const isPizza = item.category.includes("pizza");
      const tagsHtml = item.tags.map(tag => {
        const typeClass = tag.toLowerCase().includes("spicy") ? "spicy" : "";
        return `<span class="card-badge ${typeClass}">${tag}</span>`;
      }).join("");

      const card = document.createElement("div");
      card.className = "menu-card";
      card.innerHTML = `
        <div class="menu-card-img-container">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <div class="menu-card-badges">${tagsHtml}</div>
          <div class="card-rating">
            <span class="material-symbols-outlined">star</span>
            <span>${item.rating}</span>
          </div>
        </div>
        <div class="menu-card-content">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="menu-card-footer">
            <span class="menu-card-price">₹${item.basePrice.toFixed(2)}</span>
            <button class="btn btn-primary btn-small action-menu-btn" data-id="${item.id}">
              ${isPizza ? "Customize" : "Add Basket"}
            </button>
          </div>
        </div>
      `;

      // Event listener for action button
      card.querySelector(".action-menu-btn").addEventListener("click", () => {
        if (isPizza) {
          openCustomizer(item);
        } else {
          addToCart(item, "Standard", item.basePrice);
          showToast(`Added ${item.name} to basket!`, "success");
        }
      });

      menuGrid.appendChild(card);
    });
  }

  // --- Pizza Customizer Modal System ---
  function openCustomizer(item) {
    appState.customizer.item = item;
    appState.customizer.size = "regular";
    appState.customizer.crust = "classic";
    appState.customizer.toppings.clear();

    // Populate static data
    customizerTitle.textContent = `Customize ${item.name}`;
    customizerImg.src = item.image;
    customizerRatingValue.textContent = item.rating;
    customizerDescription.textContent = item.description;

    // Render Size options
    sizeSelectorsContainer.innerHTML = "";
    Object.keys(PIZZA_SIZES).forEach(sizeKey => {
      const sizeObj = PIZZA_SIZES[sizeKey];
      const selected = sizeKey === appState.customizer.size ? "checked" : "";
      sizeSelectorsContainer.innerHTML += `
        <label class="selector-pill">
          <input type="radio" name="cust-size" value="${sizeKey}" ${selected}>
          <span class="pill-label">${sizeObj.name} (+₹${sizeObj.priceModifier.toFixed(2)})</span>
        </label>
      `;
    });

    // Render Crust options
    crustSelectorsContainer.innerHTML = "";
    Object.keys(PIZZA_CRUSTS).forEach(crustKey => {
      const crustObj = PIZZA_CRUSTS[crustKey];
      const selected = crustKey === appState.customizer.crust ? "checked" : "";
      crustSelectorsContainer.innerHTML += `
        <label class="selector-pill">
          <input type="radio" name="cust-crust" value="${crustKey}" ${selected}>
          <span class="pill-label">${crustObj.name} (+₹${crustObj.priceModifier.toFixed(2)})</span>
        </label>
      `;
    });

    // Render Topping options
    toppingsContainer.innerHTML = "";
    Object.keys(EXTRA_TOPPINGS).forEach(toppingKey => {
      const toppingObj = EXTRA_TOPPINGS[toppingKey];
      toppingsContainer.innerHTML += `
        <label class="topping-checkbox">
          <input type="checkbox" name="cust-topping" value="${toppingKey}">
          <span class="topping-label">
            <span>${toppingObj.name}</span>
            <span>+₹${toppingObj.price.toFixed(2)}</span>
          </span>
        </label>
      `;
    });

    // Listen to changes for price calculations
    setupCustomizerStateListeners();
    calculateCustomizerPrice();

    customizerModal.classList.remove("hidden");
  }

  function setupCustomizerStateListeners() {
    // Size changes
    sizeSelectorsContainer.querySelectorAll("input[name='cust-size']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        appState.customizer.size = e.target.value;
        calculateCustomizerPrice();
      });
    });

    // Crust changes
    crustSelectorsContainer.querySelectorAll("input[name='cust-crust']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        appState.customizer.crust = e.target.value;
        calculateCustomizerPrice();
      });
    });

    // Toppings changes
    toppingsContainer.querySelectorAll("input[name='cust-topping']").forEach(checkbox => {
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          appState.customizer.toppings.add(e.target.value);
        } else {
          appState.customizer.toppings.delete(e.target.value);
        }
        calculateCustomizerPrice();
      });
    });
  }

  function calculateCustomizerPrice() {
    const item = appState.customizer.item;
    if (!item) return;

    let price = item.basePrice;
    
    // Size Modifier
    price += PIZZA_SIZES[appState.customizer.size].priceModifier;
    
    // Crust Modifier
    price += PIZZA_CRUSTS[appState.customizer.crust].priceModifier;

    // Toppings Modifier
    appState.customizer.toppings.forEach(toppingKey => {
      price += EXTRA_TOPPINGS[toppingKey].price;
    });

    customizerTotalPrice.textContent = `₹${price.toFixed(2)}`;
  }

  // --- Shopping Cart Management System ---
  function addToCart(menuItem, customDetails, finalPrice) {
    // Check if identical item with exact details is already in cart
    const existingIndex = appState.cart.findIndex(cartItem => 
      cartItem.id === menuItem.id && cartItem.details === customDetails
    );

    if (existingIndex !== -1) {
      appState.cart[existingIndex].quantity += 1;
    } else {
      appState.cart.push({
        id: menuItem.id,
        name: menuItem.name,
        image: menuItem.image,
        details: customDetails,
        price: finalPrice,
        quantity: 1
      });
    }

    saveCart();
    renderCart();
  }

  function updateCartItemQuantity(itemId, detailsString, change) {
    const itemIndex = appState.cart.findIndex(item => 
      item.id === itemId && item.details === detailsString
    );

    if (itemIndex !== -1) {
      appState.cart[itemIndex].quantity += change;
      if (appState.cart[itemIndex].quantity <= 0) {
        appState.cart.splice(itemIndex, 1);
        showToast("Item removed from basket.", "info");
      }
      saveCart();
      renderCart();
    }
  }

  function saveCart() {
    localStorage.setItem("pizza_cart", JSON.stringify(appState.cart));
  }

  function renderCart() {
    // Update navbar cart counts
    const totalCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;

    if (appState.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-message">
          <span class="material-symbols-outlined">shopping_basket</span>
          <p>Your basket is currently empty.</p>
          <button class="btn btn-primary nav-link" data-page="menu" id="start-shopping-btn">Explore Menu</button>
        </div>
      `;
      // Rebind navigate listeners since we injected a dynamic link
      cartItemsContainer.querySelector("#start-shopping-btn").addEventListener("click", () => {
        closeCartDrawer();
        navigateTo("menu");
      });
      cartSummaryContainer.classList.add("hidden");
      return;
    }

    cartSummaryContainer.classList.remove("hidden");
    cartItemsContainer.innerHTML = "";

    // Populate drawer elements
    appState.cart.forEach(item => {
      const cartItemDiv = document.createElement("div");
      cartItemDiv.className = "cart-item";
      cartItemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <span class="cart-item-cust">${item.details}</span>
          <div class="cart-item-action">
            <div class="qty-controller">
              <button class="qty-btn dec-qty" data-id="${item.id}" data-details="${item.details}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn inc-qty" data-id="${item.id}" data-details="${item.details}">+</button>
            </div>
            <span class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
      `;

      // Wire quantity modifiers
      cartItemDiv.querySelector(".dec-qty").addEventListener("click", () => {
        updateCartItemQuantity(item.id, item.details, -1);
      });
      cartItemDiv.querySelector(".inc-qty").addEventListener("click", () => {
        updateCartItemQuantity(item.id, item.details, 1);
      });

      cartItemsContainer.appendChild(cartItemDiv);
    });

    calculateCartSummary();
  }

  function calculateCartSummary() {
    let subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    // Apply discount
    if (appState.appliedCoupon && AVAILABLE_COUPONS[appState.appliedCoupon]) {
      const couponObj = AVAILABLE_COUPONS[appState.appliedCoupon];
      if (couponObj.type === "percentage") {
        discount = subtotal * (couponObj.value / 100);
      }
    }

    // Calculate delivery charge
    let delivery = 40.00;
    const finalSubtotal = subtotal - discount;
    if (finalSubtotal >= 350.00 || (appState.appliedCoupon === "FREESHIP")) {
      delivery = 0.00;
    }

    // Calculate Tax (5% GST)
    let tax = finalSubtotal * 0.05;
    let grandTotal = finalSubtotal + tax + delivery;

    // Render prices
    cartSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    
    if (discount > 0) {
      discountRow.style.display = "flex";
      cartDiscountEl.textContent = `-₹${discount.toFixed(2)}`;
    } else {
      discountRow.style.display = "none";
    }

    cartTaxEl.textContent = `₹${tax.toFixed(2)}`;
    cartDeliveryEl.textContent = delivery === 0 ? "FREE" : `₹${delivery.toFixed(2)}`;
    cartTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;
    checkoutTotalEl.textContent = grandTotal.toFixed(2);
  }

  function applyPromoCoupon(code) {
    code = code.toUpperCase().trim();
    if (!AVAILABLE_COUPONS[code]) {
      couponFeedback.textContent = "Invalid coupon code.";
      couponFeedback.className = "coupon-feedback coupon-error";
      return;
    }

    appState.appliedCoupon = code;
    localStorage.setItem("pizza_applied_coupon", JSON.stringify(code));
    couponFeedback.textContent = `Coupon applied! ${AVAILABLE_COUPONS[code].description}`;
    couponFeedback.className = "coupon-feedback coupon-success";
    
    calculateCartSummary();
    showToast("Promo discount applied!", "success");
  }

  function removePromoCoupon() {
    appState.appliedCoupon = null;
    localStorage.removeItem("pizza_applied_coupon");
    couponInput.value = "";
    couponFeedback.textContent = "";
    calculateCartSummary();
  }

  // --- Checkout Systems ---
  function showCheckoutForm() {
    // Require User Login prior to Checkout
    if (!appState.currentUser) {
      openAuthModal();
      showToast("Please log in or sign up to proceed to checkout.", "info");
      return;
    }

    checkoutFormView.classList.remove("hidden");
    cartItemsContainer.style.opacity = "0.2";
    cartSummaryContainer.style.opacity = "0.2";
  }

  function hideCheckoutForm() {
    checkoutFormView.classList.add("hidden");
    cartItemsContainer.style.opacity = "1";
    cartSummaryContainer.style.opacity = "1";
  }

  function handleOrderPlacement(event) {
    event.preventDefault();

    const address = document.getElementById("checkout-address").value;
    const phone = document.getElementById("checkout-phone").value;
    const notes = document.getElementById("checkout-notes").value;
    const paymentMethod = document.querySelector("input[name='payment-method']:checked").value;

    const total = parseFloat(checkoutTotalEl.textContent);
    const orderId = Math.floor(100000 + Math.random() * 900000); // 6-digit random number

    // Assemble Active Order Object
    const newOrder = {
      id: orderId,
      items: [...appState.cart],
      total: total,
      address: address,
      phone: phone,
      notes: notes,
      paymentMethod: paymentMethod.toUpperCase(),
      date: new Date().toLocaleDateString(),
      status: "placed",
      timestamp: Date.now()
    };

    // Save active order and push to order history
    appState.activeOrder = newOrder;
    localStorage.setItem("pizza_active_order", JSON.stringify(newOrder));
    
    appState.orderHistory.unshift(newOrder);
    localStorage.setItem("pizza_order_history", JSON.stringify(appState.orderHistory));

    // Clear Basket
    appState.cart = [];
    saveCart();
    removePromoCoupon();
    renderCart();

    // Hide checkout form and drawer
    hideCheckoutForm();
    closeCartDrawer();
    checkoutDeliveryForm.reset();
    creditCardFields.classList.add("hidden");
    upiQrcodeFields.classList.add("hidden");

    showToast("Order placed successfully! Tracking live...", "success");
    
    // Navigate to tracking
    navigateTo("orders");
    checkActiveOrderTracking();
    renderOrderHistory();
  }

  // --- Live Status Order Tracking Simulator ---
  function checkActiveOrderTracking() {
    if (!appState.activeOrder) {
      activeOrderTracking.classList.add("hidden");
      return;
    }

    activeOrderTracking.classList.remove("hidden");
    trackOrderIdEl.textContent = appState.activeOrder.id;

    // Track simulated statuses
    // Progress order: placed (0s) -> preparing (10s) -> delivering (20s) -> delivered (30s)
    const elapsedSeconds = Math.floor((Date.now() - appState.activeOrder.timestamp) / 1000);
    let currentStatus = "placed";
    let eta = "25-30 Mins";

    if (elapsedSeconds >= 30) {
      currentStatus = "delivered";
      eta = "Arrived!";
      // Sync status to history
      syncActiveOrderStatus("delivered");
    } else if (elapsedSeconds >= 20) {
      currentStatus = "delivering";
      eta = "10 Mins";
      syncActiveOrderStatus("delivering");
    } else if (elapsedSeconds >= 10) {
      currentStatus = "preparing";
      eta = "20 Mins";
      syncActiveOrderStatus("preparing");
    } else {
      currentStatus = "placed";
      eta = "25 Mins";
    }

    trackEtaEl.textContent = eta;
    updateTimelineUI(currentStatus);

    // If order is not delivered yet, check status progression loop
    if (currentStatus !== "delivered") {
      setTimeout(checkActiveOrderTracking, 2000);
    }
  }

  function syncActiveOrderStatus(status) {
    if (appState.activeOrder && appState.activeOrder.status !== status) {
      appState.activeOrder.status = status;
      localStorage.setItem("pizza_active_order", JSON.stringify(appState.activeOrder));

      // Update in order history too
      const histIndex = appState.orderHistory.findIndex(o => o.id === appState.activeOrder.id);
      if (histIndex !== -1) {
        appState.orderHistory[histIndex].status = status;
        localStorage.setItem("pizza_order_history", JSON.stringify(appState.orderHistory));
      }
      renderOrderHistory();
      
      // Notify user on status progression
      let msg = "Order state updated!";
      if (status === "preparing") msg = "Your pizza is in the oven! 🍕";
      if (status === "delivering") msg = "Pizza out for delivery! 🛵";
      if (status === "delivered") msg = "Pizza delivered! Enjoy your meal! 🎉";
      showToast(msg, "info");
    }
  }

  function updateTimelineUI(status) {
    const stepPlaced = document.getElementById("step-placed");
    const stepPreparing = document.getElementById("step-preparing");
    const stepDelivering = document.getElementById("step-delivering");
    const stepDelivered = document.getElementById("step-delivered");

    // Clear active states
    stepPlaced.classList.remove("active");
    stepPreparing.classList.remove("active");
    stepDelivering.classList.remove("active");
    stepDelivered.classList.remove("active");

    if (status === "placed") {
      stepPlaced.classList.add("active");
    } else if (status === "preparing") {
      stepPlaced.classList.add("active");
      stepPreparing.classList.add("active");
    } else if (status === "delivering") {
      stepPlaced.classList.add("active");
      stepPreparing.classList.add("active");
      stepDelivering.classList.add("active");
    } else if (status === "delivered") {
      stepPlaced.classList.add("active");
      stepPreparing.classList.add("active");
      stepDelivering.classList.add("active");
      stepDelivered.classList.add("active");
    }
  }

  function renderOrderHistory() {
    if (!orderHistoryList) return;

    if (appState.orderHistory.length === 0) {
      orderHistoryList.innerHTML = `<p class="no-orders">No past orders yet. Head to the Menu to order your first pizza!</p>`;
      return;
    }

    orderHistoryList.innerHTML = "";
    appState.orderHistory.forEach(order => {
      const summaryItems = order.items.map(item => `${item.name} (x${item.quantity})`).join(", ");
      const historyCard = document.createElement("div");
      historyCard.className = "history-card";
      historyCard.innerHTML = `
        <div class="history-info">
          <h4>Order #${order.id}</h4>
          <p>${summaryItems}</p>
          <p style="font-size: 11px; margin-top: 4px; color: var(--text-muted);">${order.date} | Payment: ${order.paymentMethod} | Status: <strong style="text-transform: capitalize; color: var(--primary);">${order.status}</strong></p>
        </div>
        <span class="history-price">₹${order.total.toFixed(2)}</span>
      `;
      orderHistoryList.appendChild(historyCard);
    });
  }

  // --- Authenticated User Navbar State ---
  function setupAuthNavbar() {
    if (appState.currentUser) {
      userDisplayNameEl.textContent = appState.currentUser.name.toUpperCase();
      btnsiContainer.innerHTML = `
        <button id="logout-nav-btn">Log Out</button>
      `;
      // Bind logout action
      document.getElementById("logout-nav-btn").addEventListener("click", handleUserLogout);
    } else {
      userDisplayNameEl.textContent = "MY ACCOUNT";
      btnsiContainer.innerHTML = `
        <button id="login-nav-btn">Log in</button>
        <p>|</p>
        <button id="signup-nav-btn">Sign up</button>
      `;
      // Rebind modal button triggers
      document.getElementById("login-nav-btn").addEventListener("click", openAuthModal);
      document.getElementById("signup-nav-btn").addEventListener("click", openAuthModal);
    }
  }

  function handleUserLogout() {
    appState.currentUser = null;
    localStorage.removeItem("pizza_user");
    setupAuthNavbar();
    showToast("Logged out successfully.", "info");
    navigateTo("home");
  }

  function openAuthModal(isSignup = false) {
    if (isSignup) {
      tabSignupBtn.classList.add("active");
      tabLoginBtn.classList.remove("active");
      signupForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    } else {
      tabLoginBtn.classList.add("active");
      tabSignupBtn.classList.remove("active");
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
    }
    authModal.classList.remove("hidden");
  }

  function handleUserLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const registeredUsers = safeLoadJSON("registered_users", []);
    const matchedUser = registeredUsers.find(u => u.email === email && u.password === password);

    if (matchedUser) {
      appState.currentUser = matchedUser;
      localStorage.setItem("pizza_user", JSON.stringify(matchedUser));
      setupAuthNavbar();
      authModal.classList.add("hidden");
      loginForm.reset();
      showToast(`Welcome back, ${matchedUser.name}!`, "success");
    } else {
      showToast("Invalid email credentials or password.", "error");
    }
  }

  function handleUserSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;

    const registeredUsers = safeLoadJSON("registered_users", []);
    if (registeredUsers.some(u => u.email === email)) {
      showToast("Email address already registered.", "error");
      return;
    }

    const newUser = { name, email, password };
    registeredUsers.push(newUser);
    localStorage.setItem("registered_users", JSON.stringify(registeredUsers));

    appState.currentUser = newUser;
    localStorage.setItem("pizza_user", JSON.stringify(newUser));
    setupAuthNavbar();
    authModal.classList.add("hidden");
    signupForm.reset();
    showToast(`Account created! Welcome, ${name}!`, "success");
  }

  // --- Dynamic UI Drawer Controllers ---
  function openCartDrawer() {
    cartDrawerOverlay.classList.remove("hidden");
    cartDrawer.classList.remove("drawer-hidden");
  }

  function closeCartDrawer() {
    cartDrawerOverlay.classList.add("hidden");
    cartDrawer.classList.add("drawer-hidden");
    hideCheckoutForm();
  }

  // --- UI Toast Notifications Helper ---
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "info";
    if (type === "success") icon = "check_circle";
    if (type === "error") icon = "error";

    toast.innerHTML = `
      <span class="material-symbols-outlined">${icon}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Auto fade after 3.5s
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // --- Setup DOM Events and Event Listeners ---
  function setupEventListeners() {
    // Navigation routing bindings
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        const targetPage = link.getAttribute("data-page");
        navigateTo(targetPage);
      });
    });

    // Mobile Hamburger
    mobileMenuBtn.addEventListener("click", () => {
      mobileDrawer.classList.remove("drawer-hidden");
    });
    closeMobileDrawerBtn.addEventListener("click", () => {
      mobileDrawer.classList.add("drawer-hidden");
    });

    // Cart trigger drawer
    cartNavBtn.addEventListener("click", openCartDrawer);
    closeCartBtn.addEventListener("click", closeCartDrawer);
    cartDrawerOverlay.addEventListener("click", closeCartDrawer);

    // Search input behavior
    const searchInput = document.getElementById("menu-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const activeTab = document.querySelector(".category-tab.active");
        const category = activeTab ? activeTab.getAttribute("data-category") : "all";
        renderMenuGrid(category, e.target.value);
      });
    }

    // Category tabs filter
    const categoryTabs = document.querySelectorAll(".category-tab");
    categoryTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        categoryTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        
        const category = tab.getAttribute("data-category");
        const query = searchInput ? searchInput.value : "";
        renderMenuGrid(category, query);
      });
    });

    // Promos quick apply from home page
    const promoApplyBtns = document.querySelectorAll(".promo-apply-btn");
    promoApplyBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const code = e.target.getAttribute("data-code");
        couponInput.value = code;
        openCartDrawer();
        applyPromoCoupon(code);
      });
    });

    // See offers scroll to section
    const seeOffersBtn = document.getElementById("see-promo-btn");
    if (seeOffersBtn) {
      seeOffersBtn.addEventListener("click", () => {
        const promoSection = document.getElementById("promo-section");
        if (promoSection) {
          promoSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // Cart Coupon Apply
    applyCouponBtn.addEventListener("click", () => {
      const val = couponInput.value.trim();
      if (val) {
        applyPromoCoupon(val);
      } else {
        removePromoCoupon();
      }
    });

    // Cart checkout button trigger
    proceedCheckoutBtn.addEventListener("click", showCheckoutForm);
    backToCartBtn.addEventListener("click", hideCheckoutForm);

    // Payment radio details switcher
    const paymentRadios = document.querySelectorAll("input[name='payment-method']");
    paymentRadios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        const method = e.target.value;
        if (method === "card") {
          creditCardFields.classList.remove("hidden");
          upiQrcodeFields.classList.add("hidden");
          // Add required validation attributes
          document.getElementById("card-num").required = true;
          document.getElementById("card-expiry").required = true;
          document.getElementById("card-cvv").required = true;
        } else if (method === "upi") {
          creditCardFields.classList.add("hidden");
          upiQrcodeFields.classList.remove("hidden");
          // Disable validations
          disableCardValidations();
        } else {
          creditCardFields.classList.add("hidden");
          upiQrcodeFields.classList.add("hidden");
          disableCardValidations();
        }
      });
    });

    function disableCardValidations() {
      document.getElementById("card-num").required = false;
      document.getElementById("card-expiry").required = false;
      document.getElementById("card-cvv").required = false;
    }

    // Checkout form order placement submission
    checkoutDeliveryForm.addEventListener("submit", handleOrderPlacement);

    // Customizer Modal close buttons
    closeCustomizerBtn.addEventListener("click", () => {
      customizerModal.classList.add("hidden");
    });
    window.addEventListener("click", (e) => {
      if (e.target === customizerModal) {
        customizerModal.classList.add("hidden");
      }
      if (e.target === authModal) {
        authModal.classList.add("hidden");
      }
    });

    // Customizer Add To Basket
    addCustomizedCartBtn.addEventListener("click", () => {
      const item = appState.customizer.item;
      if (!item) return;

      // Extract text details
      const sizeText = PIZZA_SIZES[appState.customizer.size].name;
      const crustText = PIZZA_CRUSTS[appState.customizer.crust].name;
      
      const toppingsArray = Array.from(appState.customizer.toppings).map(k => EXTRA_TOPPINGS[k].name);
      const toppingsText = toppingsArray.length > 0 ? `Toppings: ${toppingsArray.join(", ")}` : "No extra toppings";
      
      const customString = `Size: ${sizeText} | Crust: ${crustText} | ${toppingsText}`;
      
      // Final calculated price
      let finalPrice = item.basePrice;
      finalPrice += PIZZA_SIZES[appState.customizer.size].priceModifier;
      finalPrice += PIZZA_CRUSTS[appState.customizer.crust].priceModifier;
      appState.customizer.toppings.forEach(k => {
        finalPrice += EXTRA_TOPPINGS[k].price;
      });

      addToCart(item, customString, finalPrice);
      customizerModal.classList.add("hidden");
      showToast(`${item.name} customized and added to basket!`, "success");
    });

    // Auth modal trigger handlers
    profileIcon.addEventListener("click", () => {
      if (appState.currentUser) {
        // Logout or profile details can be toggled. For convenience, trigger profile state
        showToast(`Signed in as ${appState.currentUser.name} (${appState.currentUser.email})`, "success");
      } else {
        openAuthModal();
      }
    });
    
    closeAuthBtn.addEventListener("click", () => {
      authModal.classList.add("hidden");
    });

    // Toggle Modal Tabs (Login vs Signup)
    tabLoginBtn.addEventListener("click", () => openAuthModal(false));
    tabSignupBtn.addEventListener("click", () => openAuthModal(true));

    // Form submit handlers
    loginForm.addEventListener("submit", handleUserLogin);
    signupForm.addEventListener("submit", handleUserSignup);

    // Call driver button
    const callDriverBtn = document.getElementById("call-driver-btn");
    if (callDriverBtn) {
      callDriverBtn.addEventListener("click", () => {
        showToast("Calling driver Mario Rossi at +1 (555) 349-2810...", "info");
      });
    }

    // Contact Form submissions
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Thank you for your message! Our team will contact you shortly.", "success");
        contactForm.reset();
      });
    }
  }
});
