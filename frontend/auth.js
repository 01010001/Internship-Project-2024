/**
 * Authentication: OIDC login/logout and UI state.
 */

import { userManager } from './config.js';

export function login() {
    if (userManager) userManager.signinRedirect();
}

export async function logout() {
    // Clear local frontend tokens
    if (userManager) await userManager.removeUser();

    // Construct the Auth Server logout URL
    const authServerLogoutUrl = "http://127.0.0.1:8001/o/logout/";
    const clientId = "HeGqUi3Gw79hlob6v9RbgeVvGg5T68qjlYdAgxxX";
    const postLogoutUri = encodeURIComponent("http://localhost:8080/index.html");

    // Redirect the browser to clear the Django session cookie
    window.location.href = `${authServerLogoutUrl}?client_id=${clientId}&post_logout_redirect_uri=${postLogoutUri}`;
}

export function updateAuthUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!loginBtn || !logoutBtn) return;
    if (user && !user.expired) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

export async function getUser() {
    return userManager ? userManager.getUser() : null;
}

/** Shows a simple message in the main content area when the user must be logged in. */
export function showLoginRequiredMessage() {
    const container = document.querySelector('.row');
    if (!container) return;
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'col-12 text-center text-muted py-5';
    div.textContent = 'You need to be logged in to view this.';
    container.appendChild(div);
}
