function getSession() {
    const session = localStorage.getItem('sc_session');
    return session ? JSON.parse(session) : null;
}

function requireAuth() {
    if (!getSession()) window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('sc_session');
    window.location.href = 'index.html';
}

function login(email, password) {
    // Creating a robust local session
    const user = { name: "User", email: email, plan: "free" };
    localStorage.setItem('sc_session', JSON.stringify(user));
    window.location.href = 'dashboard.html';
}

function signup(name, email, password, role) {
    const user = { name: name, email: email, role: role, plan: "free" };
    localStorage.setItem('sc_session', JSON.stringify(user));
    window.location.href = 'dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login(document.getElementById('email').value, document.getElementById('password').value);
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            signup(
                document.getElementById('name').value,
                document.getElementById('email').value,
                document.getElementById('password').value,
                document.getElementById('role').value
            );
        });
    }
});