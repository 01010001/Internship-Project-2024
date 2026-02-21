/**
 * Entry point: OIDC callback, auth UI, expose globals for HTML onclick handlers.
 */

import { userManager } from './config.js';
import * as auth from './auth.js';
import * as app from './app.js';

window.login = auth.login;
window.logout = auth.logout;
window.listProjects = app.listProjects;
window.listDevelopers = app.listDevelopers;
window.workPermit = app.workPermit;

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.search.includes('code=') && userManager) {
        try {
            await userManager.signinCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Error processing login:', error);
        }
    }

    const user = await auth.getUser();
    auth.updateAuthUI(user);

    if (user && !user.expired) {
        app.listProjects();
    }
});
