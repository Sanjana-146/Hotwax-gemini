/* storage.js
    Handles all the localStorage operations (simulating a backend database).
    Keys used: 'users', 'currentUser', and dynamic cart keys.
*/

const APP_PREFIX = 'shopeasy_'; // Best practice to prevent collisions

const DB = {
    USERS: `${APP_PREFIX}users`,
    SESSION: `${APP_PREFIX}currentUser`,
    CART: `${APP_PREFIX}cart_`
};

// --- USER MANAGEMENT ---

function getAllUsers() {
    const rawData = localStorage.getItem(DB.USERS);
    return rawData ? JSON.parse(rawData) : [];
}

function registerNewUser(fullName, email, password) {
    const users = getAllUsers();
    
    // Check if user already exists
    const exists = users.some(user => user.email === email);
    if (exists) {
        return { ok: false, message: "This email is already registered." };
    }
    
    // Save new user
    users.push({ 
        name: fullName, 
        email: email, 
        pass: password 
    });
    
    localStorage.setItem(DB.USERS, JSON.stringify(users));
    return { ok: true };
}

function authenticateUser(email, password) {
    const users = getAllUsers();
    // Simple check for matching credentials
    const validUser = users.find(u => u.email === email && u.pass === password);
    
    if (validUser) {
        localStorage.setItem(DB.SESSION, JSON.stringify(validUser));
        return { ok: true, user: validUser };
    }
    return { ok: false, message: "Wrong email or password." };
}

function getSessionUser() {
    return JSON.parse(localStorage.getItem(DB.SESSION));
}

function logoutUser() {
    localStorage.removeItem(DB.SESSION);
}

// --- CART MANAGEMENT ---

function getUserCart(email) {
    if (!email) return [];
    const key = DB.CART + email;
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveToCart(item, email) {
    let currentCart = getUserCart(email);
    
    // Check if product is already in cart to update quantity
    const existingIndex = currentCart.findIndex(p => p.id === item.id);
    
    if (existingIndex > -1) {
        currentCart[existingIndex].quantity += 1;
    } else {
        // Add new item with quantity 1
        currentCart.push({ ...item, quantity: 1 });
    }
    
    localStorage.setItem(DB.CART + email, JSON.stringify(currentCart));
    return currentCart;
}

function removeItemFromCart(itemId, email) {
    let cart = getUserCart(email);
    // Filter out the item to remove it
    const updatedCart = cart.filter(item => item.id !== itemId);
    localStorage.setItem(DB.CART + email, JSON.stringify(updatedCart));
    return updatedCart;
}