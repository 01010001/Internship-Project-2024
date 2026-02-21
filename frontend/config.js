/**
 * App configuration: API base URL and OIDC auth.
 * OIDC library is loaded via script tag and exposed as global (oidc-client-ts).
 */

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const authConfig = {
    authority: 'http://127.0.0.1:8001/o',
    client_id: 'c99uuHdyMV5UxbPMnuLyB3HMtdOagYeh8dHXCrvQ',
    redirect_uri: 'http://localhost:8080/index.html',
    response_type: 'code',
    scope: 'openid profile',
    post_logout_redirect_uri: 'http://localhost:8080/index.html'
};

const Oidc = typeof globalThis !== 'undefined' ? globalThis.oidc : typeof window !== 'undefined' ? window.oidc : undefined;
export const userManager = Oidc ? new Oidc.UserManager(authConfig) : null;
