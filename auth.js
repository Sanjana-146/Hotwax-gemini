/*
    auth.js
    Handles Login and Registration forms on index.html
*/

document.addEventListener('DOMContentLoaded', () => {
    // If user is already logged in, skip login page
    if (getSessionUser()) {
        window.location.href = 'shop.html';
        return;
    }

    // DOM Elements
    const forms = {
        login: document.getElementById('loginForm'),
        register: document.getElementById('registerForm')
    };
    
    const tabs = {
        loginBtn: document.getElementById('showLogin'),
        regBtn: document.getElementById('showRegister')
    };

    // --- Event Listeners ---

    // Switch to Register view
    tabs.regBtn.addEventListener('click', () => {
        toggleView('register');
    });

    // Switch to Login view
    tabs.loginBtn.addEventListener('click', () => {
        toggleView('login');
    });

    // Handle Registration
    forms.register.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPass').value;
        const confirmPass = document.getElementById('regConfirmPass').value;
        const errDisplay = document.getElementById('regError');

        // Basic validation
        if (pass !== confirmPass) {
            showError(errDisplay, "Passwords don't match!");
            return;
        }

        const result = registerNewUser(name, email, pass);
        
        if (result.ok) {
            alert('Account created! Please login.');
            toggleView('login'); // Switch back to login
            forms.register.reset(); // Clear form
        } else {
            showError(errDisplay, result.message);
        }
    });

    // Handle Login
    forms.login.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPass').value;
        const errDisplay = document.getElementById('loginError');

        const result = authenticateUser(email, pass);
        
        if (result.ok) {
            // console.log("Login success", result.user);
            window.location.href = 'shop.html';
        } else {
            showError(errDisplay, result.message);
        }
    });

    // Helper to switch tabs
    function toggleView(view) {
        if (view === 'login') {
            forms.login.classList.remove('hidden');
            forms.register.classList.add('hidden');
            tabs.loginBtn.classList.add('active');
            tabs.regBtn.classList.remove('active');
        } else {
            forms.register.classList.remove('hidden');
            forms.login.classList.add('hidden');
            tabs.regBtn.classList.add('active');
            tabs.loginBtn.classList.remove('active');
        }
    }

    function showError(element, msg) {
        element.textContent = msg;
        element.style.display = 'block';
    }
});