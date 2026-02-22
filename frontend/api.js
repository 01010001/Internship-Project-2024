/**
 * Authenticated API layer using axios. All requests go through one instance
 * with a request interceptor that attaches the Bearer token (or rejects with UNAUTHORIZED).
 */

import { API_BASE_URL, userManager } from './config.js';
import { showLoginRequiredMessage } from './auth.js';

const axios = typeof globalThis !== 'undefined' ? globalThis.axios : typeof window !== 'undefined' ? window.axios : null;
const api = axios ? axios.create({ baseURL: API_BASE_URL }) : null;

if (api) {
    api.interceptors.request.use(
        async (config) => {
            const user = userManager ? await userManager.getUser() : null;
            if (!user || !user.access_token) {
                const err = new Error('Unauthorized');
                err.code = 'UNAUTHORIZED';
                return Promise.reject(err);
            }
            config.headers.Authorization = `Bearer ${user.access_token}`;
            return config;
        },
        (err) => Promise.reject(err)
    );

    api.interceptors.response.use(
        (res) => res,
        (err) => {
            if (err.response && err.response.status === 401) {
                showLoginRequiredMessage();
                const e = new Error('Unauthorized');
                e.code = 'UNAUTHORIZED';
                return Promise.reject(e);
            }
            return Promise.reject(err);
        }
    );
}

function req(path, options = {}) {
    if (!api) return Promise.reject(new Error('Axios not available'));
    return api.get(path, options).then((r) => r.data);
}

function post(path, data) {
    if (!api) return Promise.reject(new Error('Axios not available'));
    return api.post(path, data, { headers: { 'Content-Type': 'application/json' } }).then((r) => r.data);
}

function put(path, data) {
    if (!api) return Promise.reject(new Error('Axios not available'));
    return api.put(path, data, { headers: { 'Content-Type': 'application/json' } }).then((r) => r.data);
}

// Projects
export function getProjects() {
    return req('/projects/');
}

export function getProject(id) {
    return req(`/projects/${id}/`);
}

export function createProject(data) {
    return post('/projects/', data);
}

export function updateProject(id, data) {
    return put(`/projects/${id}/`, data);
}

// Developers
export function getDevelopers() {
    return req('/developers/');
}

export function getDeveloper(id) {
    return req(`/developers/${id}/`);
}

export function createDeveloper(data) {
    return post('/developers/', data);
}

// Working-on
export function getWorkingOn() {
    return req('/working-on/');
}

export function createWorkingOn(data) {
    return post('/working-on/', data);
}

export function updateWorkingOn(id, data) {
    return put(`/working-on/${id}/`, data);
}
