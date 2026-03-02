/**
 * Authentication: OIDC login/logout and UI state.
 */

import { userManager, authConfig } from './config.js';

export function login() {
    if (userManager) userManager.signinRedirect();
}

export async function logout() {
    // Clear local frontend tokens
    if (userManager) await userManager.removeUser();

    // Redirect to Auth Server logout (uses config)
    const logoutUrl = `${authConfig.authority}/logout/`;
    const postLogoutUri = encodeURIComponent(authConfig.post_logout_redirect_uri);
    window.location.href = `${logoutUrl}?client_id=${authConfig.client_id}&post_logout_redirect_uri=${postLogoutUri}`;
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
