/*
    cart.js
    Displays items stored in LocalStorage for the current user.
*/

document.addEventListener('DOMContentLoaded', () => {
    protectRoute();
    loadCartItems();
});

function loadCartItems() {
    const container = document.getElementById('cartItems');
    const totalDisplay = document.getElementById('cartTotal');
    
    const user = getSessionUser();
    const cart = getUserCart(user.email);

    // Empty state check
    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty.</p>
                <a href="shop.html" class="btn btn-sm" style="width:auto; margin-top:10px;">Go Shopping</a>
            </div>`;
        totalDisplay.textContent = '0.00';
        return;
    }

    let grandTotal = 0;

    // Generate HTML for cart items
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        return `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img" alt="product">
                
                <div class="cart-info">
                    <h4>${item.title}</h4>
                    <span class="item-price">$${item.price} x ${item.quantity}</span>
                </div>
                
                <div class="cart-actions">
                    <span class="item-total">$${itemTotal.toFixed(2)}</span>
                    <button class="trash-btn" onclick="removeItem(${item.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    totalDisplay.textContent = grandTotal.toFixed(2);
}

function removeItem(id) {
    const user = getSessionUser();
    
    // Remove from storage
    const newCart = removeItemFromCart(id, user.email);
    
    // Re-render UI
    loadCartItems();
    updateNavbar();
    
    showToast("Item removed from cart", "error");
}