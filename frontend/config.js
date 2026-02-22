/**
 * App configuration: API base URL and OIDC auth.
 * OIDC library is loaded via script tag and exposed as global (oidc-client-ts).
 * Use the same origin for the app and redirect_uri (e.g. always localhost:8080 or always 127.0.0.1:8080)
 * so OIDC state and user storage match after redirect.
 */

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const authConfig = {
    authority: 'http://127.0.0.1:8001/o',
    client_id: 'HeGqUi3Gw79hlob6v9RbgeVvGg5T68qjlYdAgxxX',
    redirect_uri: 'http://localhost:8080/index.html',
    response_type: 'code',
    scope: 'openid read write',
    post_logout_redirect_uri: 'http://localhost:8080/index.html'
};

const Oidc = typeof globalThis !== 'undefined' ? globalThis.oidc : typeof window !== 'undefined' ? window.oidc : undefined;
export const userManager = Oidc ? new Oidc.UserManager(authConfig) : null;
