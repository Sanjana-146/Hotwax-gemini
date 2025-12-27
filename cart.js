// --- CART PAGE LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    checkAuthRedirect();
    renderCart();
});

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const user = getCurrentUser();
    const cart = getCart(user.email);

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 3rem;">
                <i class="fas fa-shopping-basket" style="font-size: 3rem; color: #ddd;"></i>
                <p style="margin-top: 1rem; color: #666;">Your cart is empty.</p>
                <a href="shop.html" class="btn btn-sm" style="display:inline-block; margin-top:1rem;">Start Shopping</a>
            </div>`;
        totalEl.textContent = '0.00';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img" alt="${item.title}">
                <div class="cart-info">
                    <h4>${item.title}</h4>
                    <span class="item-price">$${item.price} x ${item.quantity}</span>
                </div>
                <div class="cart-actions">
                    <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="trash-btn" onclick="handleRemove(${item.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    totalEl.textContent = total.toFixed(2);
}

function handleRemove(id) {
    const user = getCurrentUser();
    removeFromCartDB(id, user.email);
    renderCart();
    updateCartBadge();
}