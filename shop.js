// --- SHOP PAGE LOGIC ---

const API_URL = 'https://fakestoreapi.com/products';
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuthRedirect();
    initShop();
});

async function initShop() {
    const grid = document.getElementById('productsGrid');
    const loader = document.getElementById('loader');
    
    loader.classList.remove('hidden');
    
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        renderProducts(allProducts);
        populateCategories();
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<p style="text-align:center; color: red;">Failed to load products.</p>';
    } finally {
        loader.classList.add('hidden');
    }

    // Event Listeners for Filters
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const user = getCurrentUser();
    const cart = getCart(user.email);
    const cartIds = cart.map(i => i.id);

    grid.innerHTML = products.map(p => {
        const isInCart = cartIds.includes(p.id);
        
        // Generating random rating stars for UI appeal
        const rating = Math.round(p.rating?.rate || 4);
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

        return `
        <div class="product-card">
            <div class="card-badge">HOT</div>
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.title}">
                <div class="overlay-actions">
                    <button class="icon-btn"><i class="far fa-heart"></i></button>
                    <button class="icon-btn"><i class="far fa-eye"></i></button>
                </div>
            </div>
            <div class="product-details">
                <div class="product-meta">
                    <span class="category-tag">${p.category}</span>
                    <span class="rating">${stars}</span>
                </div>
                <h3 class="product-title" title="${p.title}">${p.title}</h3>
                <div class="product-bottom">
                    <span class="price">$${p.price}</span>
                    <button 
                        class="add-btn ${isInCart ? 'added' : ''}" 
                        onclick="handleAddToCart(${p.id}, this)">
                        ${isInCart ? 'In Cart <i class="fas fa-check"></i>' : 'Add <i class="fas fa-shopping-bag"></i>'}
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

function handleAddToCart(id, btn) {
    const product = allProducts.find(p => p.id === id);
    const user = getCurrentUser();
    
    addToCartDB(product, user.email);
    updateCartBadge();
    
    // UI Feedback
    btn.innerHTML = 'In Cart <i class="fas fa-check"></i>';
    btn.classList.add('added');
}

function populateCategories() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    const select = document.getElementById('categoryFilter');
    categories.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c.toUpperCase();
        select.appendChild(option);
    });
}

function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;

    const filtered = allProducts.filter(p => {
        return (cat === 'all' || p.category === cat) && 
               p.title.toLowerCase().includes(search);
    });
    renderProducts(filtered);
}