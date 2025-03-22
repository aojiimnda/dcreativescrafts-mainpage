document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded: Initializing components...")

  // Store DOM references that are used multiple times
  const header = document.querySelector("header")
  const body = document.body
  const mainNav = document.querySelector(".main-nav")

  // Initialize all components
  initHeader()
  initMobileMenu()
  initCart()
  initProductInteractions()
  initSmoothScroll()
  initLocationSteps()
  initFormValidation()
  initTestimonials()
  initBackToTop()
  initWishlist()
  initDarkMode()
  initAnimations()

  console.log("All components initialized successfully")

  // ==========================================
  // HEADER & NAVIGATION
  // ==========================================
  function initHeader() {
    // Performance optimization: Use throttling for scroll events
    let lastScrollPosition = 0
    let ticking = false

    window.addEventListener("scroll", () => {
      lastScrollPosition = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll(lastScrollPosition)
          ticking = false
        })
        ticking = true
      }
    })

    function handleScroll(scrollPosition) {
      if (scrollPosition > 50) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
    }
  }

  function initMobileMenu() {
    const burgerMenu = document.querySelector(".burger-menu")
    const burgerIcon = document.querySelector(".burger-icon")
    const mobileNav = document.querySelector(".mobile-nav")

    // Create mobile menu toggle with better event delegation
    const createMobileMenu = () => {
      const headerWrapper = document.querySelector(".header-wrapper")

      // Only create if it doesn't exist
      if (!document.querySelector(".mobile-menu-btn") && headerWrapper) {
        const mobileMenuBtn = document.createElement("div")
        mobileMenuBtn.className = "mobile-menu-btn"
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>'

        headerWrapper.insertBefore(mobileMenuBtn, headerWrapper.firstChild)

        // Use a single event listener with better toggle logic
        mobileMenuBtn.addEventListener("click", () => {
          const isOpen = mainNav.classList.toggle("open")
          mobileMenuBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>'
          body.classList.toggle("menu-open", isOpen)
        })
      }
    }

    // Handle standard burger menu if it exists
    if (burgerMenu && burgerIcon && mobileNav) {
      burgerMenu.addEventListener("click", () => {
        burgerIcon.classList.toggle("open")
        mobileNav.classList.toggle("open")
        body.classList.toggle("menu-open")
      })

      // Close mobile menu when clicking on a link
      const mobileLinks = mobileNav.querySelectorAll("a")
      mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
          burgerIcon.classList.remove("open")
          mobileNav.classList.remove("open")
          body.classList.remove("menu-open")
        })
      })
    }

    // Use a more efficient resize handler with debouncing
    let resizeTimeout
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth < 768) {
          createMobileMenu()
        } else {
          // Close mobile menu on larger screens
          if (burgerIcon && mobileNav) {
            burgerIcon.classList.remove("open")
            mobileNav.classList.remove("open")
            body.classList.remove("menu-open")
          }

          const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
          if (mobileMenuBtn) {
            mobileMenuBtn.remove()
          }
          if (mainNav) {
            mainNav.classList.remove("open")
          }
        }
      }, 100) // 100ms debounce
    })

    // Initial call based on viewport
    if (window.innerWidth < 768) {
      createMobileMenu()
    }
  }

  // ==========================================
  // CART SYSTEM
  // ==========================================
  function initCart() {
    console.log("Initializing cart system...")

    // Initialize cart from localStorage or create empty cart
    let cart = {
      items: [],
      totalPrice: 0,
    }

    try {
      const savedCart = localStorage.getItem("dcreativeCart")
      if (savedCart) {
        cart = JSON.parse(savedCart)
        updateCartCounter()
        renderCartItems()
      }
    } catch (e) {
      console.error("Error parsing saved cart:", e)
      localStorage.removeItem("dcreativeCart")
      cart = { items: [], totalPrice: 0 }
    }

    // Create cart modal if it doesn't exist
    createCartModal()

    // Cart DOM elements
    const cartIcon = document.getElementById("cart-icon")
    const cartModal = document.getElementById("cartModal")
    const cartItemsContainer = document.getElementById("cartItems")
    const closeCartBtn = document.querySelector(".close-cart-modal")

    // Add event listeners for buy now buttons
    initBuyNowButtonListeners()

    // Add to cart functionality with event delegation
    document.addEventListener("click", (e) => {
      // Handle Add to Cart buttons
      if (
        e.target.classList.contains("cart-btn") ||
        e.target.classList.contains("modal-cart-btn") ||
        e.target.closest(".cart-btn") ||
        e.target.closest(".modal-cart-btn")
      ) {
        const btn =
          e.target.classList.contains("cart-btn") || e.target.classList.contains("modal-cart-btn")
            ? e.target
            : e.target.closest(".cart-btn") || e.target.closest(".modal-cart-btn")

        e.preventDefault()
        e.stopPropagation() // Prevent event bubbling

        // Get product info
        const productCard = btn.closest(".product-card") || btn.closest(".modal-content")
        if (!productCard) {
          console.log("No product card found")
          return
        }

        const productName =
          productCard.querySelector("h4")?.textContent ||
          document.getElementById("modal-product-title")?.textContent ||
          ""
        const productPrice =
          productCard.querySelector(".product-price")?.textContent ||
          document.getElementById("modal-product-price")?.textContent ||
          ""
        const productImage =
          productCard.querySelector(".product-image img")?.src ||
          document.getElementById("modal-product-image")?.src ||
          ""

        // Get product ID from data attribute or generate one
        const productId = productCard.dataset.productId || generateProductId(productName)

        console.log(`Adding to cart: ${productName}, ${productPrice}`)

        // Create product object
        const product = {
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: 1,
        }

        addToCart(product)
      }

      // Handle Buy Now buttons
      if (
        e.target.classList.contains("buy-btn") ||
        e.target.classList.contains("modal-buy-btn") ||
        e.target.closest(".buy-btn") ||
        e.target.closest(".modal-buy-btn")
      ) {
        const btn =
          e.target.classList.contains("buy-btn") || e.target.classList.contains("modal-buy-btn")
            ? e.target
            : e.target.closest(".buy-btn") || e.target.closest(".modal-buy-btn")

        e.preventDefault()
        e.stopPropagation() // Prevent event bubbling

        // Get product info
        const productCard = btn.closest(".product-card") || btn.closest(".modal-content")
        if (!productCard) {
          console.log("No product card found")
          return
        }

        const productName =
          productCard.querySelector("h4")?.textContent ||
          document.getElementById("modal-product-title")?.textContent ||
          ""
        const productPrice =
          productCard.querySelector(".product-price")?.textContent ||
          document.getElementById("modal-product-price")?.textContent ||
          ""
        const productImage =
          productCard.querySelector(".product-image img")?.src ||
          document.getElementById("modal-product-image")?.src ||
          ""

        // Get product ID from data attribute or generate one
        const productId = productCard.dataset.productId || generateProductId(productName)

        console.log(`Buying now: ${productName}, ${productPrice}`)

        // Create product object
        const product = {
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: 1,
        }

        // Create temporary cart with just this product for checkout
        const checkoutCart = [product]

        // Save to localStorage
        localStorage.setItem("dcreativeCheckout", JSON.stringify(checkoutCart))

        // Display "buy now" cart modal with just this product
        displayBuyNowModal(checkoutCart)

        // Close product modal if open
        const productModal = document.getElementById("productModal")
        if (productModal && productModal.classList.contains("active")) {
          closeProductModal()
        }
      }
    })

    // Cart icon click to view cart
    if (cartIcon) {
      cartIcon.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation() // Stop event propagation
        console.log("Cart icon clicked")
        openCartModal()
      })
    }

    // Close cart modal with animation
    if (closeCartBtn) {
      closeCartBtn.addEventListener("click", closeCartModal)
    }

    // Close cart when clicking outside modal content
    window.addEventListener("click", (e) => {
      if (e.target === cartModal) {
        closeCartModal()
      }
    })

    // Event delegation for cart modal buttons
    document.addEventListener("click", (e) => {
      if (!cartItemsContainer) return

      // Handle quantity decrease buttons
      if (e.target.closest(".quantity-btn.decrease-qty") || e.target.closest(".quantity-btn.minus")) {
        const button = e.target.closest(".quantity-btn.decrease-qty") || e.target.closest(".quantity-btn.minus")
        const item = button.closest(".cart-item")
        const index = Number.parseInt(item.getAttribute("data-index") || item.dataset.id)

        if (cart.items[index] && cart.items[index].quantity > 1) {
          updateItemQuantity(index, cart.items[index].quantity - 1)
        } else {
          removeFromCart(index)
        }
      }

      // Handle quantity increase buttons
      if (e.target.closest(".quantity-btn.increase-qty") || e.target.closest(".quantity-btn.plus")) {
        const button = e.target.closest(".quantity-btn.increase-qty") || e.target.closest(".quantity-btn.plus")
        const item = button.closest(".cart-item")
        const index = Number.parseInt(item.getAttribute("data-index") || item.dataset.id)

        if (cart.items[index]) {
          updateItemQuantity(index, cart.items[index].quantity + 1)
        }
      }

      // Handle remove item buttons
      if (e.target.closest(".remove-item")) {
        const button = e.target.closest(".remove-item")
        const index = Number.parseInt(button.getAttribute("data-index") || button.dataset.id)
        removeFromCart(index)
      }

      // Clear cart button
      if (e.target.closest(".clear-cart-btn") || e.target.id === "clearCartBtn" || e.target.closest("#clearCartBtn")) {
        clearCart()
      }

      // Checkout button
      if (e.target.closest(".checkout-btn") || e.target.id === "checkoutBtn" || e.target.closest("#checkoutBtn")) {
        proceedToCheckout()
      }
    })

    // Set up the Buy Now button listeners
    function initBuyNowButtonListeners() {
      // Use event delegation for the Buy Now modal buttons
      document.addEventListener("click", (e) => {
        // Proceed to checkout button
        if (e.target.id === "proceedToCheckoutBtn" || e.target.closest("#proceedToCheckoutBtn")) {
          showNotification("Processing your order...", 2000, () => {
            // In a real implementation, this would redirect to checkout
            console.log("Redirect to checkout page")
            closeCartModal()
            showNotification("Thank you for your purchase!", 3000)
          })
        }

        // Continue shopping button
        if (e.target.id === "continueShopping" || e.target.closest("#continueShopping")) {
          closeCartModal()
        }
      })
    }

    // Generate a simple product ID from name
    function generateProductId(name) {
      return name.toLowerCase().replace(/[^a-z0-9]/g, "")
    }

    // Update cart counter display with smoother animation
    function updateCartCounter() {
      const cartCount = document.querySelector(".cart span")
      if (cartCount) {
        const count = cart.items.reduce((total, item) => total + item.quantity, 0)
        cartCount.textContent = count

        // Show/hide counter based on count
        if (count === 0) {
          cartCount.style.display = "none"
        } else {
          cartCount.style.display = "flex"
        }

        // Reset animation to ensure it plays
        cartCount.style.animation = "none"
        cartCount.offsetHeight // Trigger reflow
        cartCount.style.animation = "cartBump 0.3s ease"
      }
    }

    // Calculate total price with better handling of currency conversion
    function calculateTotal() {
      cart.totalPrice = cart.items.reduce((total, item) => {
        // Use parseFloat with regex to handle different currency symbols
        const price = Number.parseFloat(item.price.replace(/[^\d.]/g, ""))
        return total + price * item.quantity
      }, 0)
      return cart.totalPrice
    }

    // Render cart items in modal with performance optimizations
    function renderCartItems() {
      if (!cartItemsContainer) return

      if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="empty-cart">
            <i class="fas fa-shopping-bag"></i>
            <p>Your cart is empty</p>
            <a href="#products" class="btn outline-btn">Continue Shopping</a>
          </div>
        `
        return
      }

      // Build HTML string for better performance instead of multiple DOM operations
      let itemsHTML = ""

      cart.items.forEach((item, index) => {
        // Calculate item total
        const itemPrice = Number.parseFloat(item.price.replace(/[^\d.]/g, ""))
        const itemTotal = (itemPrice * item.quantity).toFixed(2)

        itemsHTML += `
          <div class="cart-item" data-index="${index}">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <div class="cart-item-price">${item.price}</div>
            </div>
            <div class="cart-item-quantity">
              <button class="quantity-btn decrease-qty">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn increase-qty">+</button>
            </div>
            <div class="cart-item-total">
              ₱${itemTotal}
            </div>
            <button class="remove-item" data-index="${index}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `
      })

      const total = calculateTotal()

      // Add total and action buttons
      itemsHTML += `
        <div class="cart-total">
          <span>Total:</span>
          <span>₱${total.toFixed(2)}</span>
        </div>
        <div class="cart-buttons">
          <button class="btn outline-btn clear-cart-btn">Clear Cart</button>
          <button class="btn primary-btn checkout-btn">Checkout</button>
        </div>
      `

      cartItemsContainer.innerHTML = itemsHTML
    }

    // Add item to cart with improved UX
    function addToCart(product) {
      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.id === product.id || (item.name === product.name && item.price === product.price),
      )

      if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        cart.items[existingItemIndex].quantity += 1
        showNotification(`Increased ${product.name} quantity in cart!`)
      } else {
        // Add new item
        cart.items.push(product)
        showNotification(`${product.name} added to cart!`)
      }

      // Update cart display and save
      updateCartCounter()
      renderCartItems()
      saveCart()

      // Add cart animation
      animateAddToCart(product.image)
    }

    // Remove item from cart
    function removeFromCart(index) {
      if (index < 0 || index >= cart.items.length) return

      const removedItem = cart.items[index]
      cart.items.splice(index, 1)

      // Update cart display and save
      updateCartCounter()
      renderCartItems()
      saveCart()

      // Show notification
      showNotification(`${removedItem.name} removed from cart.`)
    }

    // Update item quantity
    function updateItemQuantity(index, newQuantity) {
      if (index < 0 || index >= cart.items.length) return

      if (newQuantity > 0) {
        cart.items[index].quantity = newQuantity

        // Update cart display and save
        updateCartCounter()
        renderCartItems()
        saveCart()
      }
    }

    // Clear entire cart with confirmation
    function clearCart() {
      if (confirm("Are you sure you want to clear your cart?")) {
        cart.items = []
        cart.totalPrice = 0

        // Update cart display and save
        updateCartCounter()
        renderCartItems()
        saveCart()

        // Show notification
        showNotification("Cart has been cleared.")
      }
    }

    // Proceed to checkout
    function proceedToCheckout() {
      if (cart.items.length === 0) {
        showNotification("Your cart is empty. Add some products before checking out.")
        return
      }

      // Create checkout URL with cart data
      const cartData = encodeURIComponent(JSON.stringify(cart))
      const checkoutUrl = `checkout.html?cart=${cartData}`

      // Redirect to checkout page
      showNotification("Proceeding to checkout...", 2000, () => {
        // In a real implementation, this would redirect to checkout
        console.log("Redirect to checkout page with URL:", checkoutUrl)
        // window.location.href = checkoutUrl;

        // If the checkout page doesn't exist, show alert instead
        setTimeout(() => {
          if (!window.location.href.includes("checkout.html")) {
            alert(`Proceeding to checkout with ${cart.items.length} item(s). Total: ₱${calculateTotal().toFixed(2)}`)
          }
        }, 100)
      })
    }

    // Save cart to localStorage with error handling
    function saveCart() {
      try {
        localStorage.setItem("dcreativeCart", JSON.stringify(cart))
      } catch (e) {
        console.error("Error saving cart:", e)
        showNotification("There was an error saving your cart. Please try again.")
      }
    }

    // Open cart modal with animation
    function openCartModal() {
      if (cartModal) {
        renderCartItems()

        cartModal.style.display = "block"

        // Smoother animation
        setTimeout(() => {
          cartModal.classList.add("active")
          body.style.overflow = "hidden"
        }, 10)
      }
    }

    // Close cart modal with animation
    function closeCartModal() {
      if (cartModal) {
        cartModal.classList.remove("active")

        // Wait for animation to complete before hiding
        setTimeout(() => {
          cartModal.style.display = "none"
          body.style.overflow = "auto"
        }, 300)
      }
    }

    // Display buy now modal
    function displayBuyNowModal(cart) {
      console.log("Displaying buy now modal with", cart.length, "items")
      if (!cartModal || !cartItemsContainer) {
        console.error("Cart modal elements not found")
        return
      }

      // Clear previous items
      cartItemsContainer.innerHTML = ""

      // Display cart items
      let total = 0

      cart.forEach((item) => {
        // Calculate item total
        const itemPrice = Number.parseFloat(item.price.replace(/[^\d.]/g, ""))
        const itemTotal = itemPrice * item.quantity
        total += itemTotal

        // Create cart item
        const cartItem = document.createElement("div")
        cartItem.className = "cart-item"
        cartItem.innerHTML = `
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <div class="cart-item-price">${item.price}</div>
            <div class="cart-item-quantity">
              <span>Quantity: ${item.quantity}</span>
            </div>
          </div>
          <div class="cart-item-total">₱${itemTotal.toFixed(2)}</div>
        `

        cartItemsContainer.appendChild(cartItem)
      })

      // Add cart total
      const cartTotal = document.createElement("div")
      cartTotal.className = "cart-total"
      cartTotal.innerHTML = `
        <div class="cart-total-label">Total:</div>
        <div class="cart-total-value">₱${total.toFixed(2)}</div>
      `

      cartItemsContainer.appendChild(cartTotal)

      // Add checkout buttons with clear text
      const checkoutActions = document.createElement("div")
      checkoutActions.className = "cart-buttons"
      checkoutActions.innerHTML = `
        <button id="proceedToCheckoutBtn" class="btn primary-btn">Proceed to Checkout</button>
        <button id="continueShopping" class="btn outline-btn">Continue Shopping</button>
      `

      cartItemsContainer.appendChild(checkoutActions)

      // Display modal
      cartModal.style.display = "block"
      setTimeout(() => {
        cartModal.classList.add("active")
        body.style.overflow = "hidden"
      }, 10)
    }

    // Add to cart animation
    function animateAddToCart(imageSrc) {
      if (!imageSrc) return

      // Create animation style if not exists
      if (!document.getElementById("cart-animation-style")) {
        const style = document.createElement("style")
        style.id = "cart-animation-style"
        style.innerHTML = `
          @keyframes addToCartAnimation {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            20% {
              transform: scale(1.2);
              opacity: 1;
            }
            100% {
              transform: scale(0.5) translate(var(--end-x), var(--end-y));
              opacity: 0;
            }
          }
          .cart-animation-clone {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            animation: addToCartAnimation 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            border-radius: 8px;
          }
        `
        document.head.appendChild(style)
      }

      // Get cart icon position
      const cartIcon = document.querySelector(".cart")
      if (!cartIcon) return

      const cartRect = cartIcon.getBoundingClientRect()

      // Create image clone
      const clone = document.createElement("img")
      clone.src = imageSrc
      clone.className = "cart-animation-clone"

      // Position at center of screen initially
      const startX = window.innerWidth / 2 - 50
      const startY = window.innerHeight / 2 - 50

      clone.style.width = "100px"
      clone.style.height = "100px"
      clone.style.top = startY + "px"
      clone.style.left = startX + "px"
      clone.style.objectFit = "cover"

      // Calculate end position (cart icon)
      const endX = cartRect.left + cartRect.width / 2 - startX - 50
      const endY = cartRect.top - startY - 50

      // Set custom properties for the animation
      clone.style.setProperty("--end-x", `${endX}px`)
      clone.style.setProperty("--end-y", `${endY}px`)

      // Append to body
      document.body.appendChild(clone)

      // Animate cart icon when animation completes
      setTimeout(() => {
        const cartCount = document.querySelector(".cart span")
        if (cartCount) {
          cartCount.style.animation = "none"
          cartCount.offsetHeight // Trigger reflow
          cartCount.style.animation = "cartBump 0.3s ease"
        }
      }, 700)

      // Remove clone after animation
      setTimeout(() => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone)
        }
      }, 800)
    }

    // Create cart modal if it doesn't exist
    function createCartModal() {
      if (!document.getElementById("cartModal")) {
        const cartModalHTML = `
          <div id="cartModal" class="cart-modal">
            <div class="cart-modal-content">
              <div class="cart-modal-header">
                <h3>Your Shopping Cart</h3>
                <button class="close-cart-modal">&times;</button>
              </div>
              <div id="cartItems" class="cart-modal-body">
                <!-- Cart items will be rendered here -->
              </div>
            </div>
          </div>
        `

        // Add cart modal styles
        if (!document.getElementById("cart-modal-styles")) {
          const style = document.createElement("style")
          style.id = "cart-modal-styles"
          style.textContent = `
            .cart-modal {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            
            .cart-modal.active {
              opacity: 1;
            }
            
            .cart-modal-content {
              position: absolute;
              top: 0;
              right: 0;
              width: 100%;
              max-width: 400px;
              height: 100%;
              background-color: white;
              box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
              transform: translateX(100%);
              transition: transform 0.3s ease;
            }
            
            .cart-modal.active .cart-modal-content {
              transform: translateX(0);
            }
            
            .cart-modal-header {
              padding: 15px;
              border-bottom: 1px solid var(--lightest-pink);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .cart-modal-header h3 {
              margin: 0;
              font-size: 1.2rem;
            }
            
            .close-cart-modal {
              background: none;
              border: none;
              font-size: 1.5rem;
              cursor: pointer;
              color: var(--light-text);
            }
            
            .close-cart-modal:hover {
              color: var(--darker-pink);
            }
            
            .cart-modal-body {
              padding: 15px;
              overflow-y: auto;
              max-height: calc(100% - 60px);
            }
            
            .empty-cart {
              text-align: center;
              padding: 30px 0;
            }
            
            .empty-cart i {
              font-size: 3rem;
              color: var(--light-pink);
              margin-bottom: 15px;
            }
            
            .empty-cart p {
              margin-bottom: 20px;
            }
            
            .cart-item {
              display: flex;
              align-items: center;
              padding: 15px 0;
              border-bottom: 1px solid var(--lightest-pink);
            }
            
            .cart-item-image {
              width: 60px;
              height: 60px;
              border-radius: 5px;
              overflow: hidden;
              margin-right: 15px;
            }
            
            .cart-item-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .cart-item-info {
              flex: 1;
            }
            
            .cart-item-info h4 {
              margin: 0 0 5px;
              font-size: 0.9rem;
            }
            
            .cart-item-price {
              font-size: 0.9rem;
              color: var(--darker-pink);
            }
            
            .cart-item-quantity {
              display: flex;
              align-items: center;
              margin: 0 15px;
            }
            
            .quantity-btn {
              width: 25px;
              height: 25px;
              border-radius: 50%;
              border: 1px solid var(--lightest-pink);
              background-color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 0.8rem;
              transition: var(--transition);
            }
            
            .quantity-btn:hover {
              background-color: var(--lightest-pink);
            }
            
            .cart-item-quantity span {
              margin: 0 8px;
              font-size: 0.9rem;
            }
            
            .cart-item-total {
              font-weight: 600;
              font-size: 0.9rem;
              margin-right: 10px;
            }
            
            .remove-item {
              background: none;
              border: none;
              color: var(--light-text);
              cursor: pointer;
              transition: var(--transition);
            }
            
            .remove-item:hover {
              color: var(--darker-pink);
            }
            
            .cart-total {
              display: flex;
              justify-content: space-between;
              padding: 15px 0;
              border-top: 1px solid var(--lightest-pink);
              font-weight: 600;
              margin-top: 15px;
            }
            
            .cart-buttons {
              display: flex;
              gap: 10px;
              margin-top: 15px;
            }
          `
          document.head.appendChild(style)
        }

        // Append modal to body
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = cartModalHTML
        document.body.appendChild(tempDiv.firstChild)
      }
    }
  }

  // ==========================================
  // PRODUCT INTERACTIONS
  // ==========================================
  function initProductInteractions() {
    // Product carousel functionality
    initProductCarousel()

    // Product details modal
    initProductModal()
  }

  function initProductCarousel() {
    const carousel = document.querySelector(".products-carousel")
    if (!carousel) return

    const prevBtn = document.querySelector(".prev-arrow")
    const nextBtn = document.querySelector(".next-arrow")
    const dots = document.querySelectorAll(".carousel-dot")

    // Cache values that don't change frequently
    let scrollDistance = 0
    let carouselWidth = 0
    let carouselScrollWidth = 0
    let totalCards = 0
    let visibleCards = 0

    // Calculate measurements - call this on load and resize
    function calculateCarouselMeasurements() {
      // Get the first card for measurements
      const firstCard = carousel.querySelector(".product-card")
      if (!firstCard) {
        scrollDistance = 300 // Default fallback
        return
      }

      const cardRect = firstCard.getBoundingClientRect()
      scrollDistance = cardRect.width + 25 // Width + gap

      carouselWidth = carousel.clientWidth
      carouselScrollWidth = carousel.scrollWidth

      totalCards = carousel.querySelectorAll(".product-card").length
      visibleCards = Math.floor(carouselWidth / scrollDistance)
    }

    // Initial calculation
    calculateCarouselMeasurements()

    // Recalculate on window resize with debounce
    window.addEventListener("resize", debounce(calculateCarouselMeasurements, 200))

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        carousel.scrollBy({
          left: -scrollDistance,
          behavior: "smooth",
        })
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        carousel.scrollBy({
          left: scrollDistance,
          behavior: "smooth",
        })
      })
    }

    // Dot navigation with improved performance
    if (dots.length) {
      dots.forEach((dot, index) => {
        dot.addEventListener("click", function () {
          // Update active dot
          dots.forEach((d) => d.classList.remove("active"))
          this.classList.add("active")

          // Calculate the appropriate scroll position
          const maxScrollSections = Math.ceil(totalCards / visibleCards)
          const sectionIndex = Math.min(index, maxScrollSections - 1)
          const scrollPosition = sectionIndex * (visibleCards * scrollDistance)

          carousel.scrollTo({
            left: scrollPosition,
            behavior: "smooth",
          })
        })
      })

      // Optimize scroll event handling with throttling
      let scrollTimeout
      carousel.addEventListener("scroll", () => {
        if (scrollTimeout) return

        scrollTimeout = setTimeout(() => {
          updateActiveDot()
          scrollTimeout = null
        }, 100)
      })

      function updateActiveDot() {
        if (dots.length === 0) return

        const scrollPercentage = carousel.scrollLeft / (carouselScrollWidth - carouselWidth)
        const activeDotIndex = Math.min(Math.floor(scrollPercentage * dots.length), dots.length - 1)

        dots.forEach((dot, index) => {
          dot.classList.toggle("active", index === activeDotIndex)
        })
      }
    }
  }

  function initProductModal() {
    // Product descriptions map
    const productDescriptions = {
      "Cherry Blossom Bouquet":
        "🌸 Cherry Blossom Bouquet – A delicate arrangement of soft pink cherry blossoms, embodying the essence of spring and renewal. Each bloom is carefully selected and arranged to create a stunning visual display that brings the beauty of cherry blossoms into any space. Perfect for birthdays, anniversaries, or as a thoughtful gift to brighten someone's day.",
      "Blue Berry Blossom Bouquet":
        "🫐 Blue Berry Blossom Bouquet – A striking mix of blue and purple blooms, evoking the richness of a berry-filled garden. This unique arrangement combines various shades of blue and purple flowers to create a cool, calming aesthetic that stands out from traditional bouquets. Ideal for those who appreciate distinctive and elegant floral designs.",
      "Blossom Symphony Bouquet":
        "🎶 Blossom Symphony Bouquet – A harmonious blend of vibrant seasonal flowers, designed to create a mesmerizing floral masterpiece. This premium arrangement features a carefully orchestrated combination of colors and textures that work together like notes in a beautiful symphony. A perfect centerpiece for special occasions or as a luxury gift.",
      "Emerald Serenity Bouquet":
        "💚 Emerald Serenity Bouquet – Lush green accents complement serene blooms, offering a refreshing and tranquil touch. This bouquet brings the peaceful essence of a garden into any space with its focus on verdant foliage and calming flower selections. An excellent choice for creating a sense of calm and natural beauty in any environment.",
      "Ethereal Petal Radiance Bouquet":
        "✨ Ethereal Petal Radiance Bouquet – A dreamy selection of radiant petals that glow with timeless beauty and grace. This arrangement features flowers with luminous qualities that seem to capture and reflect light, creating an almost magical appearance. Perfect for romantic occasions or adding a touch of enchantment to everyday spaces.",
      "Eternal Sunshine Bouquet":
        "☀️ Eternal Sunshine Bouquet – Bright and cheerful yellow blooms that bring warmth and joy to any space. This vibrant arrangement is designed to evoke feelings of happiness and optimism with its sunny palette. Ideal for celebrations, congratulations, or simply brightening someone's day with a burst of sunshine.",
      "Barbie Blush Daisy Bouquet":
        "💖 Barbie Blush Daisy Bouquet – A playful and feminine bouquet featuring blush-hued daisies, inspired by Barbie's signature charm. This whimsical arrangement combines the innocence of daisies with the iconic pink tones associated with the beloved doll. Perfect for birthdays, girl power celebrations, or adding a touch of fun femininity to any space.",
      "Lavender Elegance Tulip Bouquet":
        "💜 Lavender Elegance Tulip Bouquet – Elegant lavender tulips arranged to perfection, exuding sophistication and grace. This refined arrangement showcases the timeless beauty of tulips in soothing lavender hues. Ideal for those who appreciate understated luxury and classic floral design.",
      "Crimson Charm Daisy Bouquet":
        "❤️ Crimson Charm Daisy Bouquet (Medium) – A vibrant mix of bold red daisies, radiating passion and charm. This medium-sized arrangement makes a striking statement with its rich crimson blooms. Perfect for expressing deep emotions or adding a dramatic touch to home decor.",
      "Cherry Blossom Delight Daisy Bouquet":
        "🌸 Cherry Blossom Delight Daisy Bouquet (Large) – A larger-than-life arrangement bursting with the beauty of cherry blossoms and daisies. This generous bouquet combines the delicate charm of cherry blossoms with the cheerful simplicity of daisies for a truly delightful visual experience. Ideal for making a big impression at special events or as a luxurious gift.",
      "Verdant Whimsy Wrapped Bouquet":
        "🌿 Verdant Whimsy Wrapped Bouquet – A lush, garden-fresh bouquet wrapped with love and care for a whimsical touch. This arrangement celebrates the beauty of greenery with playful accents and a unique wrapping style. Perfect for nature lovers or adding a touch of garden-inspired whimsy to any space.",
      "Rosé Romance Bloom Bouquet":
        "🌹 Rosé Romance Bloom Bouquet – A romantic selection of pink and red blooms, perfect for expressing love and admiration. This elegant arrangement combines various shades of pink and red flowers to create a bouquet that speaks the language of romance. Ideal for anniversaries, Valentine's Day, or any occasion when you want to convey deep affection and appreciation.",
    }

    // Use event delegation for product detail buttons with improved targeting
    document.addEventListener("click", (e) => {
      // First check if we clicked on a product-details-btn or its child
      const detailsBtn = e.target.classList.contains("product-details-btn")
        ? e.target
        : e.target.closest(".product-details-btn")

      if (detailsBtn) {
        e.preventDefault()
        e.stopPropagation()

        // Get product info from the card
        const card = detailsBtn.closest(".product-card")
        if (!card) {
          console.log("No product card found")
          return
        }

        const title = card.querySelector("h4")?.textContent || ""
        const price = card.querySelector(".product-price")?.textContent || ""
        const image = card.querySelector(".product-image img")?.src || ""
        const rating = card.querySelector(".product-rating")?.innerHTML || ""

        console.log(`Opening modal for: ${title}`)

        // Get description from our map or use a default
        let description = productDescriptions[title] || ""

        // Add additional details if needed
        if (!description) {
          // Create generic description based on title
          description = `This ${title} features hand-crafted premium quality materials with attention to detail. 
                         Each bouquet is uniquely designed to bring elegance to any space or occasion.
                         Our bouquets use only the finest materials to ensure a beautiful, long-lasting arrangement.
                         
                         Perfect for birthdays, anniversaries, or simply brightening someone's day!
                         
                         • Handmade with premium materials
                         • Artistically arranged for maximum visual impact
                         • Long-lasting beauty
                         • Comes in a protective packaging`
        }

        const productModal = document.getElementById("productModal")
        if (!productModal) {
          console.error("Product modal not found")
          return
        }

        // Set modal content
        const titleElement = document.getElementById("modal-product-title")
        const priceElement = document.getElementById("modal-product-price")
        const imageElement = document.getElementById("modal-product-image")
        const ratingElement = document.getElementById("modal-product-rating")
        const descriptionElement = document.getElementById("modal-product-description")

        if (titleElement) titleElement.textContent = title
        if (priceElement) priceElement.textContent = price
        if (imageElement) {
          imageElement.src = image
          imageElement.alt = title
        }
        if (ratingElement) ratingElement.innerHTML = rating
        if (descriptionElement) descriptionElement.textContent = description

        // Show modal with animation
        productModal.style.display = "block"
        setTimeout(() => {
          productModal.classList.add("active")
          body.style.overflow = "hidden"
        }, 10)

        return // Important: prevent other handlers from executing
      }

      // Close modal button
      if (e.target.classList.contains("close-modal") || e.target.closest(".close-modal")) {
        closeProductModal()
      }
    })

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      const productModal = document.getElementById("productModal")
      if (e.target === productModal) {
        closeProductModal()
      }
    })

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const productModal = document.getElementById("productModal")
        if (productModal && productModal.classList.contains("active")) {
          closeProductModal()
        }
      }
    })
  }

  // Close product modal with animation
  function closeProductModal() {
    const productModal = document.getElementById("productModal")
    if (!productModal) return

    productModal.classList.remove("active")

    // Wait for animation to complete before hiding
    setTimeout(() => {
      productModal.style.display = "none"
      body.style.overflow = "auto"
    }, 300)
  }

  // ==========================================
  // UTILITIES
  // ==========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href")

        if (targetId === "#") return

        e.preventDefault()

        const targetElement = document.querySelector(targetId)
        if (targetElement) {
          const headerHeight = document.querySelector("header")?.offsetHeight || 0
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })

          // Close mobile menu if open
          if (mainNav) {
            mainNav.classList.remove("open")
          }
          const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
          if (mobileMenuBtn) {
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>'
          }
        }
      })
    })
  }

  function initLocationSteps() {
    // Location step selection - use event delegation for better performance
    const locationStepsContainer = document.querySelector(".location-steps")
    if (locationStepsContainer) {
      locationStepsContainer.addEventListener("click", (e) => {
        const step = e.target.closest(".location-step")
        if (!step) return

        document.querySelectorAll(".location-step").forEach((s) => s.classList.remove("active"))
        step.classList.add("active")
      })
    }

    // Copy address functionality - use event delegation
    const copyLinksContainer = document.querySelector(".store-content")
    if (copyLinksContainer) {
      copyLinksContainer.addEventListener("click", (e) => {
        const copyLink = e.target.closest(".copy-link")
        if (!copyLink) return

        e.preventDefault()
        const text = copyLink.dataset.copy || copyLink.previousElementSibling.textContent

        // Use modern clipboard API with fallback
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              showCopyFeedback(copyLink)
            })
            .catch((err) => {
              console.error("Failed to copy text: ", err)
              fallbackCopyText(text, copyLink)
            })
        } else {
          fallbackCopyText(text, copyLink)
        }
      })
    }

    // Fallback copy method
    function fallbackCopyText(text, element) {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand("copy")
        showCopyFeedback(element)
      } catch (err) {
        console.error("Fallback copy failed: ", err)
      }

      document.body.removeChild(textArea)
    }

    // Show copy feedback with animation
    function showCopyFeedback(element) {
      const originalIcon = element.innerHTML
      element.innerHTML = '<i class="fas fa-check"></i>'

      // Use CSS animations for smoother transitions
      element.classList.add("copy-success")

      setTimeout(() => {
        element.innerHTML = originalIcon
        element.classList.remove("copy-success")
      }, 1500)

      showNotification("Copied to clipboard!", 1500)
    }
  }

  function initFormValidation() {
    const contactForm = document.querySelector(".contact-form form")
    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault()

        // Get form fields
        const nameField = this.querySelector('input[name="name"]')
        const emailField = this.querySelector('input[name="email"]')
        const subjectField = this.querySelector('input[name="subject"]')
        const messageField = this.querySelector('textarea[name="message"]')

        // Reset previous error states
        ;[nameField, emailField, subjectField, messageField].forEach((field) => {
          if (!field) return // Skip if field doesn't exist
          field.classList.remove("error")
          const errorMsg = field.parentNode.querySelector(".error-message")
          if (errorMsg) errorMsg.remove()
        })

        // Validation with inline error messages for better UX
        let isValid = true

        if (nameField && !nameField.value.trim()) {
          showFieldError(nameField, "Name is required")
          isValid = false
        }

        if (emailField) {
          if (!emailField.value.trim()) {
            showFieldError(emailField, "Email is required")
            isValid = false
          } else {
            // Improved email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailPattern.test(emailField.value.trim())) {
              showFieldError(emailField, "Please enter a valid email address")
              isValid = false
            }
          }
        }

        if (subjectField && !subjectField.value.trim()) {
          showFieldError(subjectField, "Subject is required")
          isValid = false
        }

        if (messageField) {
          const messageValue = messageField.value.trim()
          if (!messageValue) {
            showFieldError(messageField, "Message is required")
            isValid = false
          } else if (messageValue.length < 10) {
            showFieldError(messageField, "Message should be at least 10 characters long")
            isValid = false
          }
        }

        if (isValid) {
          // Simulate form submission success
          showNotification("Thank you for your message! We will get back to you soon.")

          // Reset form
          this.reset()
        }
      })

      function showFieldError(field, message) {
        field.classList.add("error")

        const errorMessage = document.createElement("div")
        errorMessage.className = "error-message"
        errorMessage.textContent = message

        field.parentNode.appendChild(errorMessage)
      }
    }
  }

  function initTestimonials() {
    // Testimonial functionality with "Show All" button
    const showAllTestimonialsBtn = document.getElementById("show-all-testimonials")
    if (showAllTestimonialsBtn) {
      const hiddenTestimonials = document.querySelectorAll(".testimonial-hidden")

      showAllTestimonialsBtn.addEventListener("click", function (e) {
        e.preventDefault()

        const isShowing = this.textContent === "Show All"
        this.textContent = isShowing ? "Show Less" : "Show All"

        hiddenTestimonials.forEach((testimonial) => {
          // Use smoother transitions for showing/hiding
          if (isShowing) {
            testimonial.style.display = "flex"
            setTimeout(() => {
              testimonial.style.opacity = "1"
              testimonial.style.transform = "translateY(0)"
            }, 10)
          } else {
            testimonial.style.opacity = "0"
            testimonial.style.transform = "translateY(20px)"
            setTimeout(() => {
              testimonial.style.display = "none"
            }, 300)
          }
        })
      })
    }

    // Auto-rotate testimonials
    const testimonialCards = document.querySelectorAll(".testimonial-card")
    if (testimonialCards.length > 1) {
      let currentIndex = 0

      // Apply initial highlight to first testimonial
      testimonialCards[0].classList.add("highlighted")

      // Set interval for rotation
      setInterval(() => {
        // Remove highlight from current testimonial
        testimonialCards[currentIndex].classList.remove("highlighted")

        // Move to next testimonial
        currentIndex = (currentIndex + 1) % testimonialCards.length

        // Add highlight to new current testimonial
        testimonialCards[currentIndex].classList.add("highlighted")
      }, 5000)
    }
  }

  function initBackToTop() {
    // Initialize back-to-top button with smooth animation
    if (!document.querySelector(".back-to-top")) {
      const backToTopBtn = document.createElement("a")
      backToTopBtn.className = "back-to-top"
      backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
      backToTopBtn.href = "#"
      document.body.appendChild(backToTopBtn)

      // Show/hide button based on scroll position with throttling
      let lastScrollY = 0
      let ticking = false

      window.addEventListener("scroll", () => {
        lastScrollY = window.scrollY

        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (lastScrollY > 300) {
              backToTopBtn.classList.add("visible")
            } else {
              backToTopBtn.classList.remove("visible")
            }
            ticking = false
          })
          ticking = true
        }
      })

      // Scroll to top when clicked with smooth animation
      backToTopBtn.addEventListener("click", (e) => {
        e.preventDefault()

        // Use smooth scroll with easing
        smoothScrollToTop()
      })
    }

    // Smooth scroll to top function with easing
    function smoothScrollToTop() {
      const currentScroll = document.documentElement.scrollTop || body.scrollTop

      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothScrollToTop)
        window.scrollTo(0, currentScroll - currentScroll / 8)
      }
    }
  }

  // ==========================================
  // WISHLIST FUNCTIONALITY
  // ==========================================
  function initWishlist() {
    // Create wishlist data structure with proper error handling
    let wishlist = []
    try {
      const savedWishlist = localStorage.getItem("dcreativeWishlist")
      if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist)
      }
    } catch (e) {
      console.error("Error loading wishlist:", e)
      localStorage.removeItem("dcreativeWishlist")
    }

    // Create wishlist button for product cards
    const productCards = document.querySelectorAll(".product-card")

    productCards.forEach((card) => {
      // Create wishlist button if it doesn't exist
      if (!card.querySelector(".wishlist-btn")) {
        const wishlistBtn = document.createElement("button")
        wishlistBtn.className = "wishlist-btn"
        wishlistBtn.setAttribute("aria-label", "Add to wishlist")

        // Check if product is in wishlist
        const productName = card.querySelector("h4")?.textContent || ""
        const isInWishlist = wishlist.includes(productName)

        wishlistBtn.innerHTML = isInWishlist ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'

        if (isInWishlist) {
          wishlistBtn.classList.add("active")
          wishlistBtn.setAttribute("aria-label", "Remove from wishlist")
        }

        // Add styles if not already in CSS
        if (!document.getElementById("wishlist-styles")) {
          const style = document.createElement("style")
          style.id = "wishlist-styles"
          style.textContent = `
            .wishlist-btn {
              position: absolute;
              top: 15px;
              right: 15px;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background-color: white;
              border: none;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 5;
              transition: transform 0.3s, background-color 0.3s;
              overflow: hidden;
            }
            
            .wishlist-btn::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: var(--medium-pink);
              transform: scale(0);
              border-radius: 50%;
              transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
              z-index: -1;
            }
            
            .wishlist-btn:hover {
              transform: scale(1.1);
            }
            
            .wishlist-btn:hover::before {
              transform: scale(1);
            }
            
            .wishlist-btn.active {
              background-color: var(--medium-pink);
            }
            
            .wishlist-btn.active i {
              color: white;
            }
            
            .wishlist-btn:hover i {
              color: var(--darker-pink);
            }
            
            .wishlist-btn.active:hover i {
              color: white;
            }
            
            .wishlist-btn i {
              color: var(--dark-text);
              font-size: 16px;
              position: relative;
              z-index: 1;
              transition: color 0.3s;
            }
            
            @keyframes wishlistHeartbeat {
              0% { transform: scale(1); }
              25% { transform: scale(1.3); }
              50% { transform: scale(1); }
              75% { transform: scale(1.3); }
              100% { transform: scale(1); }
            }
            
            .wishlist-btn i.heartbeat {
              animation: wishlistHeartbeat 0.6s ease-in-out;
            }
          `
          document.head.appendChild(style)
        }

        // Add to product image container
        const imageContainer = card.querySelector(".product-image")
        if (imageContainer) {
          imageContainer.appendChild(wishlistBtn)

          // Add event listener with animation
          wishlistBtn.addEventListener("click", function (e) {
            e.preventDefault()
            e.stopPropagation()

            const productName = card.querySelector("h4")?.textContent || ""
            if (!productName) return

            const index = wishlist.indexOf(productName)
            const heartIcon = this.querySelector("i")

            if (index === -1) {
              // Add to wishlist with animation
              wishlist.push(productName)
              this.innerHTML = '<i class="fas fa-heart"></i>'
              this.classList.add("active")
              this.setAttribute("aria-label", "Remove from wishlist")

              // Add heartbeat animation
              const newIcon = this.querySelector("i")
              newIcon.classList.add("heartbeat")

              showNotification(`${productName} added to wishlist!`)
            } else {
              // Remove from wishlist
              wishlist.splice(index, 1)
              this.innerHTML = '<i class="far fa-heart"></i>'
              this.classList.remove("active")
              this.setAttribute("aria-label", "Add to wishlist")

              showNotification(`${productName} removed from wishlist.`)
            }

            // Save to localStorage with error handling
            try {
              localStorage.setItem("dcreativeWishlist", JSON.stringify(wishlist))
            } catch (e) {
              console.error("Error saving wishlist:", e)
              showNotification("There was an error saving your wishlist.")
            }
          })
        }
      }
    })
  }

  // ==========================================
  // DARK MODE
  // ==========================================
  function initDarkMode() {
    // Check if toggle already exists
    if (document.querySelector(".dark-mode-toggle")) return

    // Create dark mode toggle
    const darkModeToggle = document.createElement("div")
    darkModeToggle.className = "dark-mode-toggle"
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'
    darkModeToggle.setAttribute("aria-label", "Toggle dark mode")
    darkModeToggle.setAttribute("role", "button")
    darkModeToggle.setAttribute("tabindex", "0")

    // Add styles if not already in CSS
    if (!document.getElementById("dark-mode-styles")) {
      const style = document.createElement("style")
      style.id = "dark-mode-styles"
      style.textContent = `
        .dark-mode-toggle {
          position: fixed;
          bottom: 80px;
          right: 30px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--darker-pink);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 99;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: var(--transition);
          transform: scale(1);
          overflow: hidden;
        }
        
        .dark-mode-toggle::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom right, var(--darker-pink), var(--medium-pink));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        
        .dark-mode-toggle:hover {
          transform: scale(1.1);
        }
        
        .dark-mode-toggle:hover::before {
          opacity: 1;
        }
        
        .dark-mode-toggle i {
          transition: transform 0.5s ease;
        }
        
        body.dark-mode {
          --background-light: #222;
          --white: #333;
          --dark-text: #f0f0f0;
          --light-text: #ccc;
          --lightest-pink: #3a2a2e;
          --light-pink: #4d2f38;
          --background-dark: #5a3043;
          --footer-bg: #5a3043;
          --footer-text: #f0f0f0;
        }
        
        body.dark-mode .logo a,
        body.dark-mode h1,
        body.dark-mode h2,
        body.dark-mode h3,
        body.dark-mode h4 {
          color: #f0f0f0;
        }
        
        body.dark-mode .product-card,
        body.dark-mode .testimonial-card,
        body.dark-mode .modal-content,
        body.dark-mode .search-box {
          background-color: #333;
        }
        
        /* Add transition to all elements for smoother dark mode toggle */
        html {
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
      `
      document.head.appendChild(style)
    }

    // Append to body
    document.body.appendChild(darkModeToggle)

    // Check for saved preference
    const isDarkMode = localStorage.getItem("dcreativeDarkMode") === "true"
    if (isDarkMode) {
      document.body.classList.add("dark-mode")
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      darkModeToggle.setAttribute("aria-label", "Toggle light mode")
    }

    // Add event listener with animation
    darkModeToggle.addEventListener("click", function () {
      // Rotate icon first
      const icon = this.querySelector("i")
      icon.style.transform = "rotate(360deg)"

      // Toggle dark mode class after small delay for smoother transition
      setTimeout(() => {
        const isDark = document.body.classList.toggle("dark-mode")
        localStorage.setItem("dcreativeDarkMode", isDark)

        // Update icon and aria-label
        this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'

        this.setAttribute("aria-label", isDark ? "Toggle light mode" : "Toggle dark mode")
      }, 150)
    })

    // Add keyboard accessibility
    darkModeToggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        this.click()
      }
    })
  }

  // ==========================================
  // ANIMATIONS
  // ==========================================
  function initAnimations() {
    // Animate elements when they come into view
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(
        ".about-values .value-item, .featured-item, .section-header, .about-content, .about-image",
      )

      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top
        const screenPosition = window.innerHeight / 1.2

        if (elementPosition < screenPosition) {
          element.classList.add("animated")
        }
      })
    }

    // Run on initial load
    animateOnScroll()

    // Run on scroll
    window.addEventListener("scroll", animateOnScroll)

    // Bouquet card hover effect - use transform and opacity for better performance
    const bouquetCards = document.querySelectorAll(".bouquet-card, .top-bouquet-card")
    bouquetCards.forEach((card) => {
      card.addEventListener("mouseover", function () {
        this.style.transform = "translateY(-10px)"
        this.style.boxShadow = "0 8px 20px rgba(251, 111, 146, 0.15)"
      })

      card.addEventListener("mouseout", function () {
        this.style.transform = ""
        this.style.boxShadow = ""
      })
    })
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  function showNotification(message, duration = 3000, callback = null, type = "success") {
    // Create notification element if it doesn't exist
    let notification = document.querySelector(".notification")

    if (!notification) {
      notification = document.createElement("div")
      notification.className = "notification"
      document.body.appendChild(notification)

      // Add notification styles if not already in CSS
      if (!document.getElementById("notification-styles")) {
        const style = document.createElement("style")
        style.id = "notification-styles"
        style.textContent = `
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--darker-pink);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            z-index: 2000;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            font-size: 0.9rem;
            max-width: 300px;
          }
          
          .notification.show {
            opacity: 1;
            transform: translateY(0);
          }
          
          @keyframes notificationEntrance {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes notificationExit {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
        `
        document.head.appendChild(style)
      }
    }

    // Set message and show notification with animation
    notification.textContent = message
    notification.style.animation = "notificationEntrance 0.3s forwards"

    // Hide notification after duration with exit animation
    setTimeout(() => {
      notification.style.animation = "notificationExit 0.3s forwards"

      // Remove from DOM after animation completes
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }

        // Run callback if provided
        if (callback) {
          callback()
        }
      }, 300)
    }, duration)
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  // Utility function: Debounce to limit function calls
  function debounce(func, wait) {
    let timeout
    return function () {
      const args = arguments
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  // Utility function: Throttle to limit function calls
  function throttle(func, limit) {
    let lastCall = 0
    return function () {
      const now = Date.now()
      if (now - lastCall >= limit) {
        func.apply(this, arguments)
        lastCall = now
      }
    }
  }
})

