// --- AUTHENTICATION LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (getCurrentUser()) window.location.href = 'shop.html';

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');

    // Toggle Logic
    const switchTab = (isLogin) => {
        if (isLogin) {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            showLogin.classList.add('active');
            showRegister.classList.remove('active');
        } else {
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            showRegister.classList.add('active');
            showLogin.classList.remove('active');
        }
    };

    showLogin.addEventListener('click', () => switchTab(true));
    showRegister.addEventListener('click', () => switchTab(false));

    // Register Handler
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;
        const confirm = document.getElementById('regConfirmPass').value;
        const error = document.getElementById('regError');

        if (pass !== confirm) return showError(error, "Passwords do not match");

        const result = registerUser(name, email, pass);
        if (result.success) {
            alert('Registration Successful! Please Login.');
            switchTab(true);
        } else {
            showError(error, result.msg);
        }
    });

    // Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        const error = document.getElementById('loginError');

        const result = loginUser(email, pass);
        if (result.success) {
            window.location.href = 'shop.html';
        } else {
            showError(error, result.msg);
        }
    });
});

function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
}