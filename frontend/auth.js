/**
 * Authentication: OIDC login/logout and UI state.
 */

import { userManager } from './config.js';

export function login() {
    if (userManager) userManager.signinRedirect();
}

export function logout() {
    if (userManager) userManager.signoutRedirect();
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

/** Returns the current user if valid; otherwise redirects to login once and returns null. */
export async function ensureUser() {
    const user = await getUser();
    if (user && !user.expired) return user;
    login();
    return null;
}
