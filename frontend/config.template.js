/**
 * App configuration template for Docker environment injection.
 */

export const API_BASE_URL = '${API_BASE_URL}';

export const authConfig = {
    authority: '${AUTH_AUTHORITY}',
    client_id: '${AUTH_CLIENT_ID}',
    redirect_uri: '${AUTH_REDIRECT_URI}',
    response_type: 'code',
    scope: 'openid read write',
    post_logout_redirect_uri: '${AUTH_POST_LOGOUT_URI}'
};

const Oidc = typeof globalThis !== 'undefined' ? globalThis.oidc : typeof window !== 'undefined' ? window.oidc : undefined;
export const userManager = Oidc ? new Oidc.UserManager(authConfig) : null;