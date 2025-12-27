// --- BACKEND SIMULATION (LocalStorage) ---

const DB_KEYS = {
    USERS: 'users',
    CURRENT_USER: 'currentUser',
    CART_PREFIX: 'cart_'
};

// User Data Methods
function getUsers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
}

function registerUser(name, email, pass) {
    const users = getUsers();
    if (users.find(u => u.email === email)) return { success: false, msg: "Email already exists" };
    
    users.push({ name, email, pass });
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return { success: true };
}

function loginUser(email, pass) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.pass === pass);
    if (user) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, msg: "Invalid credentials" };
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
}

function logout() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
}

// Cart Data Methods
function getCart(userEmail) {
    if (!userEmail) return [];
    return JSON.parse(localStorage.getItem(DB_KEYS.CART_PREFIX + userEmail)) || [];
}

function addToCartDB(product, userEmail) {
    let cart = getCart(userEmail);
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem(DB_KEYS.CART_PREFIX + userEmail, JSON.stringify(cart));
    return cart;
}

function removeFromCartDB(productId, userEmail) {
    let cart = getCart(userEmail);
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem(DB_KEYS.CART_PREFIX + userEmail, JSON.stringify(cart));
    return cart;
}