document.addEventListener('DOMContentLoaded', () => {
    // console.log("Common JS loaded"); // Debugging
    
    updateNavbar();
    setupLogout();
});

function updateNavbar() {
    const user = getSessionUser();
    const greeting = document.querySelector('#userGreeting');
    const badge = document.querySelector('#cartCount');

    // If user is logged in, show their name and cart count
    if (user) {
        if (greeting) {
            // Just show the first name
            const firstName = user.name.split(' ')[0];
            greeting.textContent = `Hi, ${firstName}`;
        }
        
        if (badge) {
            const cart = getUserCart(user.email);
            const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
            badge.textContent = totalItems;
            
            // Tiny pop animation when updating
            badge.style.transform = 'scale(1.2)';
            setTimeout(() => badge.style.transform = 'scale(1)', 200);
        }
    }
}

function setupLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log("Logging out...");
            logoutUser();
            window.location.href = 'index.html';
        });
    }
}

// Helper: Redirect to login if no session found
function protectRoute() {
    if (!getSessionUser()) {
        window.location.href = 'index.html';
    }
}

/* Custom Toast Notification 
    Replaces default alerts. Usage: showToast("Message", "success/error")
*/
function showToast(msg, type = 'success') {
    const box = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Choose icon based on type
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span class="toast-msg">${msg}</span>
    `;
    
    box.appendChild(toast);

    // Auto remove after 3s
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

function createToastContainer() {
    const div = document.createElement('div');
    div.className = 'toast-container';
    document.body.appendChild(div);
    return div;
}