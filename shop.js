/*
    shop.js
    Fetches products from API, handles filtering, and "Add to Cart" logic.
*/

const STORE_API = 'https://fakestoreapi.com/products';
let productsData = []; // Store globally for filtering

document.addEventListener('DOMContentLoaded', () => {
    protectRoute(); // Ensure user is logged in
    loadProducts();

    // Search input with Debounce (Optimization)
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', handleFilter);
});

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    const spinner = document.getElementById('loader');

    try {
        spinner.classList.remove('hidden'); // Show loader
        
        const response = await fetch(STORE_API);
        productsData = await response.json();
        
        renderProductGrid(productsData);
        setupCategoryDropdown();
        
    } catch (error) {
        console.error("API Error:", error);
        grid.innerHTML = '<div class="error-msg" style="display:block; text-align:center">Failed to load products. Check your internet.</div>';
        showToast("Error fetching data", "error");
    } finally {
        spinner.classList.add('hidden'); // Hide loader
    }
}

function renderProductGrid(items) {
    const grid = document.getElementById('productsGrid');
    const user = getSessionUser();
    const userCart = getUserCart(user.email);
    
    // Get list of IDs already in cart for button state
    const cartIds = userCart.map(item => item.id);

    // Map through items and create HTML cards
    const cardsHtml = items.map(product => {
        const isAdded = cartIds.includes(product.id);
        
        // Make simple star rating visualization
        const rate = Math.round(product.rating?.rate || 0);
        const stars = '★'.repeat(rate) + '☆'.repeat(5 - rate);

        return `
            <div class="product-card">
                <span class="card-badge">HOT</span>
                
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                    <div class="overlay-actions">
                        <button class="icon-btn"><i class="far fa-heart"></i></button>
                    </div>
                </div>

                <div class="product-details">
                    <div class="product-meta">
                        <span class="category-tag">${product.category}</span>
                        <span class="rating">${stars}</span>
                    </div>
                    
                    <h3 class="product-title">${product.title}</h3>
                    
                    <div class="product-bottom">
                        <span class="price">$${product.price}</span>
                        <button 
                            class="add-btn ${isAdded ? 'added' : ''}" 
                            onclick="triggerAddToCart(${product.id}, this)">
                            ${isAdded ? 'In Cart <i class="fas fa-check"></i>' : 'Add <i class="fas fa-shopping-bag"></i>'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    grid.innerHTML = cardsHtml;
}

function triggerAddToCart(id, btnElement) {
    const product = productsData.find(p => p.id === id);
    const user = getSessionUser();

    if (!product) return;

    saveToCart(product, user.email);
    updateNavbar(); // Refresh badge count
    
    // Visual feedback
    btnElement.innerHTML = 'In Cart <i class="fas fa-check"></i>';
    btnElement.classList.add('added');
    
    showToast(`Added ${product.title.substring(0, 15)}...`, 'success');
}

function setupCategoryDropdown() {
    const select = document.getElementById('categoryFilter');
    // Get unique categories
    const categories = [...new Set(productsData.map(p => p.category))];
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        select.appendChild(option);
    });
}

function handleSearch() {
    filterData();
}

function handleFilter() {
    filterData();
}

// Combine Search and Category logic
function filterData() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filtered = productsData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(query);
        const matchesCat = category === 'all' || item.category === category;
        return matchesSearch && matchesCat;
    });

    renderProductGrid(filtered);
}

// Debounce Utility (Learned this pattern to optimize search)
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}