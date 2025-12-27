// --- SHARED UI LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
    // Greeting
    const user = getCurrentUser();
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl && user) {
        greetingEl.textContent = `Hi, ${user.name.split(' ')[0]}`;
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            window.location.href = 'index.html';
        });
    }
});

function updateCartBadge() {
    const user = getCurrentUser();
    const badge = document.getElementById('cartCount');
    if (badge && user) {
        const cart = getCart(user.email);
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = count;
        
        // Animation pop effect
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
}

function checkAuthRedirect() {
    if (!getCurrentUser()) {
        window.location.href = 'index.html';
    }
}