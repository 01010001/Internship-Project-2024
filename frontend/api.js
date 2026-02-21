/**
 * Authenticated API layer. All requests to the schedule backend go through apiFetch.
 */

import { API_BASE_URL, userManager } from './config.js';
import { login } from './auth.js';

function ensurePath(path) {
    return path.startsWith('/') ? path : '/' + path;
}

export async function apiFetch(path, options = {}) {
    const user = userManager ? await userManager.getUser() : null;
    if (!user || !user.access_token) {
        console.error('No access token. Redirecting to login.');
        login();
        throw new Error('Unauthorized');
    }
    const url = `${API_BASE_URL}${ensurePath(path)}`;
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${user.access_token}`
    };
    return fetch(url, { ...options, headers });
}

async function apiJson(path, options = {}) {
    const res = await apiFetch(path, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
}

// Projects
export function getProjects() {
    return apiJson('/projects/');
}

export function getProject(id) {
    return apiJson(`/projects/${id}/`);
}

export function createProject(data) {
    return apiFetch('/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))));
}

export function updateProject(id, data) {
    return apiFetch(`/projects/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))));
}

// Developers
export function getDevelopers() {
    return apiJson('/developers/');
}

export function getDeveloper(id) {
    return apiJson(`/developers/${id}/`);
}

export function createDeveloper(data) {
    return apiFetch('/developers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))));
}

// Working-on
export function getWorkingOn() {
    return apiJson('/working-on/');
}

export function createWorkingOn(data) {
    return apiFetch('/working-on/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))));
}

export function updateWorkingOn(id, data) {
    return apiFetch(`/working-on/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))));
}
