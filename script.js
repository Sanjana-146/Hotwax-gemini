// --- STATE MANAGEMENT ---
const API_URL = 'https://fakestoreapi.com/products';

// Helper to get data
const getUsers = () => JSON.parse(localStorage.getItem('users')) || [];
const getCurrentUser = () => JSON.parse(localStorage.getItem('currentUser'));
const getCart = () => {
    const user = getCurrentUser();
    if (!user) return [];
    // Cart is specific to logged in user to avoid conflicts
    return JSON.parse(localStorage.getItem(`cart_${user.email}`)) || [];
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Update Cart Badge if nav exists
    updateCartCount();

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // Page Specific Logic
    if (path.includes('index.html') || path === '/') {
        initAuth();
    } else if (path.includes('shop.html')) {
        checkAuth();
        initShop();
    } else if (path.includes('cart.html')) {
        checkAuth();
        initCart();
    }
});

function checkAuth() {
    if (!getCurrentUser()) window.location.href = 'index.html';
    const userDisplay = document.getElementById('userGreeting');
    if (userDisplay) userDisplay.textContent = `Hello, ${getCurrentUser().name}`;
}

// --- AUTHENTICATION LOGIC ---
function initAuth() {
    // If already logged in, go to shop
    if (getCurrentUser()) window.location.href = 'shop.html';

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');

    // Toggle Forms
    showLogin.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        showLogin.classList.add('active');
        showRegister.classList.remove('active');
    });

    showRegister.addEventListener('click', () => {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        showRegister.classList.add('active');
        showLogin.classList.remove('active');
    });

    // Register Logic
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;
        const confirm = document.getElementById('regConfirmPass').value;
        const error = document.getElementById('regError');

        if (pass !== confirm) {
            showError(error, "Passwords do not match"); // [cite: 16]
            return;
        }

        const users = getUsers();
        if (users.find(u => u.email === email)) {
            showError(error, "Email already exists");
            return;
        }

        users.push({ name, email, pass });
        localStorage.setItem('users', JSON.stringify(users)); // [cite: 18]
        alert('Registration Successful! Please Login.');
        showLogin.click();
    });

    // Login Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        const error = document.getElementById('loginError');

        const users = getUsers();
        const user = users.find(u => u.email === email && u.pass === pass); // [cite: 19]

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'shop.html'; // [cite: 20]
        } else {
            showError(error, "Invalid Email or Password");
        }
    });
}

function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
}

// --- SHOP LOGIC ---
let allProducts = [];

async function initShop() {
    const grid = document.getElementById('productsGrid');
    const loader = document.getElementById('loader');
    
    loader.classList.remove('hidden');
    
    try {
        const res = await fetch(API_URL); // [cite: 23]
        allProducts = await res.json();
        renderProducts(allProducts);
        populateCategories();
    } catch (err) {
        grid.innerHTML = '<p>Failed to load products. Please try again.</p>';
    } finally {
        loader.classList.add('hidden'); // [cite: 52]
    }

    // Filter & Search Listeners
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-image">
                <img src="${p.image}" alt="${p.title}">
            </div>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <div class="product-title">${p.title.substring(0, 40)}...</div>
                <div class="product-footer">
                    <div class="price">$${p.price}</div>
                    <button class="btn btn-sm" onclick="addToCart(${p.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join(''); // [cite: 27, 42]
}

function populateCategories() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    const select = document.getElementById('categoryFilter');
    categories.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c.charAt(0).toUpperCase() + c.slice(1);
        select.appendChild(option);
    });
}

function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;

    const filtered = allProducts.filter(p => { // [cite: 33]
        const matchesSearch = p.title.toLowerCase().includes(search);
        const matchesCat = cat === 'all' || p.category === cat;
        return matchesSearch && matchesCat;
    });
    renderProducts(filtered);
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    const user = getCurrentUser();
    let cart = getCart();

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart)); // [cite: 43]
    updateCartCount();
    alert('Added to cart!');
}

// --- CART LOGIC ---
function initCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalEl.textContent = '0.00';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img" alt="${item.title}">
                <div class="cart-details">
                    <h4>${item.title}</h4>
                    <p>Price: $${item.price}</p>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    }).join(''); // [cite: 45]

    totalEl.textContent = total.toFixed(2); // [cite: 47]
}

function removeFromCart(id) {
    const user = getCurrentUser();
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    initCart(); // Re-render
    updateCartCount();
}

function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (badge) {
        const cart = getCart();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = count;
    }
}