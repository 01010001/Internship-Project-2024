/**
 * Page logic: list/create/edit projects, developers, working-on, work permits.
 * Uses api.* for all requests, utils.formatDate for dates.
 */

import * as api from './api.js';
import * as auth from './auth.js';
import { formatDate } from './utils.js';

function getContainer() {
    return document.querySelector('.row');
}

// --- listProjects (active only, deterministic order) ---
export async function listProjects() {
    const user = await auth.getUser();
    if (!user || user.expired) {
        auth.login();
        return;
    }
    const container = getContainer();
    container.innerHTML = '';

    const [projects, workingOnList, developersList] = await Promise.all([
        api.getProjects(),
        api.getWorkingOn(),
        api.getDevelopers()
    ]);

    const developersById = new Map(developersList.map(d => [d.id, d]));
    const today = new Date().toISOString().split('T')[0];

    const projectIdToEntries = new Map();
    for (const entry of workingOnList) {
        if (entry.status !== 'working' || (entry.end_date && entry.end_date < today)) continue;
        if (!projectIdToEntries.has(entry.project)) {
            projectIdToEntries.set(entry.project, []);
        }
        const arr = projectIdToEntries.get(entry.project);
        if (!arr.some(e => e.developer === entry.developer)) {
            arr.push({ developer: entry.developer, start_date: entry.start_date, end_date: entry.end_date });
        }
    }

    const activeProjects = projects.filter(p => p.project_active);
    const div = document.createElement('div');
    div.className = 'col-12';
    container.appendChild(div);

    for (const project of activeProjects) {
        const col = document.createElement('div');
        col.className = 'col-12';

        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-3';
        card.style.backgroundColor = '#eeeaee';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const h5 = document.createElement('h5');
        const projectTitle = document.createElement('p');
        projectTitle.className = 'card-text bold';
        projectTitle.textContent = project.project_name;
        h5.appendChild(projectTitle);

        const hr = document.createElement('hr');
        const devList = document.createElement('p');
        devList.textContent = 'Çalışanlar:';
        const ul = document.createElement('ul');

        const entries = projectIdToEntries.get(project.id) || [];
        for (const e of entries) {
            const dev = developersById.get(e.developer);
            const name = dev ? dev.full_name : String(e.developer);
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'link-dark';
            link.textContent = `${name} (${formatDate(e.start_date)} - ${formatDate(e.end_date) || ''})`;
            link.href = '#';
            link.onclick = () => showDeveloperDetails(e.developer);
            li.appendChild(link);
            ul.appendChild(li);
        }

        cardBody.appendChild(h5);
        cardBody.appendChild(hr);
        cardBody.appendChild(devList);
        cardBody.appendChild(ul);

        const editBtnDiv = document.createElement('div');
        editBtnDiv.className = 'd-flex justify-content-between align-items-center';
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => showEditProjectForm(project.id));
        editBtnDiv.appendChild(editBtn);
        cardBody.appendChild(editBtnDiv);

        card.appendChild(cardBody);
        col.appendChild(card);
        div.appendChild(col);
    }

    const buttonLinkDiv = document.createElement('div');
    buttonLinkDiv.className = 'd-flex flex-column align-items-center mt-4 col-12';
    const createProjectBtn = document.createElement('button');
    createProjectBtn.className = 'btn btn-primary mb-2';
    createProjectBtn.textContent = 'Yeni Proje Oluştur';
    createProjectBtn.onclick = showNewProjectForm;
    const linkAll = document.createElement('a');
    linkAll.className = 'link-dark';
    linkAll.textContent = 'aktif olmayan projeleri de göster';
    linkAll.href = '#';
    linkAll.onclick = listAllProjects;
    buttonLinkDiv.appendChild(createProjectBtn);
    buttonLinkDiv.appendChild(linkAll);
    div.insertAdjacentElement('afterend', buttonLinkDiv);
}

// --- listAllProjects (all projects, deterministic order) ---
export async function listAllProjects() {
    const user = await auth.getUser();
    if (!user || user.expired) {
        auth.login();
        return;
    }
    const container = getContainer();
    container.innerHTML = '';

    const [projects, developersList] = await Promise.all([
        api.getProjects(),
        api.getDevelopers()
    ]);
    const developersById = new Map(developersList.map(d => [d.id, d]));

    for (const project of projects) {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = 'card shadow-sm';
        card.style.backgroundColor = '#eeeaee';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const h5 = document.createElement('h5');
        const projectTitle = document.createElement('p');
        projectTitle.className = 'card-text bold';
        projectTitle.textContent = project.project_name;
        h5.appendChild(projectTitle);

        const hr = document.createElement('hr');
        const devList = document.createElement('p');
        devList.textContent = 'Active Developers:';
        const ul = document.createElement('ul');

        const devIds = project.developers || [];
        const added = new Set();
        for (const devId of devIds) {
            const dev = developersById.get(devId);
            const name = dev ? dev.full_name : String(devId);
            if (added.has(name)) continue;
            added.add(name);
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'link-dark';
            link.textContent = name;
            link.href = '#';
            link.onclick = () => showDeveloperDetails(devId);
            li.appendChild(link);
            ul.appendChild(li);
        }

        cardBody.appendChild(h5);
        cardBody.appendChild(hr);
        cardBody.appendChild(devList);
        cardBody.appendChild(ul);

        const editBtnDiv = document.createElement('div');
        editBtnDiv.className = 'd-flex justify-content-between align-items-center';
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => showEditProjectForm(project.id));
        editBtnDiv.appendChild(editBtn);
        cardBody.appendChild(editBtnDiv);

        card.appendChild(cardBody);
        col.appendChild(card);
        container.appendChild(col);
    }
}

// --- showEditProjectForm ---
export async function showEditProjectForm(projectId) {
    const project = await api.getProject(projectId);
    const container = getContainer();
    container.innerHTML = '';

    const form = document.createElement('form');
    form.className = 'mt-4 col-12';

    const h4 = document.createElement('h4');
    h4.textContent = `Edit Project: ${project.project_name}`;
    form.appendChild(h4);
    form.appendChild(document.createElement('hr'));

    const nameDiv = document.createElement('div');
    nameDiv.className = 'mb-3';
    const nameLabel = document.createElement('label');
    nameLabel.className = 'form-label';
    nameLabel.textContent = 'Project Name';
    const nameInput = document.createElement('input');
    nameInput.className = 'form-control';
    nameInput.type = 'text';
    nameInput.value = project.project_name;
    nameDiv.appendChild(nameLabel);
    nameDiv.appendChild(nameInput);
    form.appendChild(nameDiv);

    const startDateDiv = document.createElement('div');
    startDateDiv.className = 'mb-3';
    const startDateLabel = document.createElement('label');
    startDateLabel.className = 'form-label';
    startDateLabel.textContent = 'Start Date';
    const startDateInput = document.createElement('input');
    startDateInput.className = 'form-control';
    startDateInput.type = 'date';
    startDateInput.value = project.start_date || '';
    startDateInput.placeholder = 'dd-mm-yyyy';
    startDateDiv.appendChild(startDateLabel);
    startDateDiv.appendChild(startDateInput);
    form.appendChild(startDateDiv);

    const endDateDiv = document.createElement('div');
    endDateDiv.className = 'mb-3';
    const endDateLabel = document.createElement('label');
    endDateLabel.className = 'form-label';
    endDateLabel.textContent = 'End Date';
    const endDateInput = document.createElement('input');
    endDateInput.className = 'form-control';
    endDateInput.type = 'date';
    endDateInput.value = project.end_date || '';
    endDateDiv.appendChild(endDateLabel);
    endDateDiv.appendChild(endDateInput);
    form.appendChild(endDateDiv);

    const activeDiv = document.createElement('div');
    activeDiv.className = 'form-check mb-3';
    const activeCheckbox = document.createElement('input');
    activeCheckbox.className = 'form-check-input';
    activeCheckbox.type = 'checkbox';
    activeCheckbox.checked = project.project_active;
    const activeLabel = document.createElement('label');
    activeLabel.className = 'form-check-label';
    activeLabel.textContent = 'Project Active';
    activeDiv.appendChild(activeCheckbox);
    activeDiv.appendChild(activeLabel);
    form.appendChild(activeDiv);

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'kaydet';
    submitBtn.type = 'button';
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (endDateInput.value && startDateInput.value > endDateInput.value) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return;
        }
        try {
            await api.updateProject(projectId, {
                project_name: nameInput.value,
                start_date: startDateInput.value,
                end_date: endDateInput.value || null,
                project_active: activeCheckbox.checked
            });
            listProjects();
        } catch (err) {
            console.error(err);
        }
    });
    form.appendChild(submitBtn);
    container.appendChild(form);

    const workingOnDiv = document.createElement('div');
    workingOnDiv.className = 'mt-4';
    const workingOnBtn = document.createElement('button');
    workingOnBtn.className = 'btn btn-secondary';
    workingOnBtn.textContent = 'projeye çalışan ekle';
    workingOnBtn.type = 'button';
    workingOnBtn.addEventListener('click', () => manageWorkingOnEntry(projectId));
    workingOnDiv.appendChild(workingOnBtn);
    container.appendChild(workingOnDiv);
}

// --- manageWorkingOnEntry ---
export async function manageWorkingOnEntry(projectId) {
    const container = getContainer();
    container.innerHTML = `
        <div class="row g-3 col-12">
            <div class="col-sm-12">
                <label for="developerSelect" class="form-label">Çalışan:</label>
                <select id="developerSelect" class="form-select" required></select>
            </div>
            <div class="col-sm-12">
                <label for="woStartDate" class="form-label">Start Date</label>
                <input type="date" class="form-control" id="woStartDate" required>
            </div>
            <div class="col-sm-12">
                <label for="woEndDate" class="form-label">End Date</label>
                <input type="date" class="form-control" id="woEndDate">
            </div>
            <div class="col-sm-12">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="isActive">
                    <label class="form-check-label" for="isActive">Active</label>
                </div>
            </div>
            <div class="col-sm-6">
                <button class="btn btn-primary mb-2 col-sm-4 align-items-center" type="button" id="assignDeveloperBtn">Çalışan ekle</button>
            </div>
        </div>`;

    const developers = await api.getDevelopers();
    const developerSelect = document.getElementById('developerSelect');
    developers.forEach(developer => {
        const option = document.createElement('option');
        option.value = developer.id;
        option.textContent = developer.full_name;
        developerSelect.appendChild(option);
    });

    document.getElementById('assignDeveloperBtn').addEventListener('click', async () => {
        const developerId = document.getElementById('developerSelect').value;
        const startDate = document.getElementById('woStartDate').value;
        const endDate = document.getElementById('woEndDate').value;
        const isActive = document.getElementById('isActive').checked;
        if (endDate && startDate > endDate) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return;
        }
        try {
            await api.createWorkingOn({
                developer: parseInt(developerId, 10),
                project: projectId,
                start_date: startDate,
                end_date: endDate || null,
                is_relation_active: isActive
            });
            listProjects();
        } catch (err) {
            console.error(err);
        }
    });
}

// --- editWorkingOn ---
export async function editWorkingOn(work) {
    const [developer, project] = await Promise.all([
        api.getDeveloper(work.developer),
        api.getProject(work.project)
    ]);

    const container = getContainer();
    container.innerHTML = `
        <div class="mx-auto">
            <form class="needs-validation" novalidate>
                <div class="row g-3">
                    <div class="col-sm-12">
                        <input class="form-control" type="text" id="developer" value="${escapeHtml(developer.full_name)}" readonly>
                    </div>
                    <div class="col-sm-12">
                        <input class="form-control" type="text" id="project" value="${escapeHtml(project.project_name)}" readonly>
                    </div>
                    <div class="col-sm-12">
                        <label for="startDate" class="form-label">Start Date:</label>
                        <input type="date" class="form-control" id="startDate" value="${work.start_date || ''}" required>
                    </div>
                    <div class="col-sm-12">
                        <label for="endDate" class="form-label">End Date:</label>
                        <input type="date" class="form-control" id="endDate" value="${work.end_date || ''}" required>
                    </div>
                    <div class="col-sm-12">
                        <label for="statusSelect" class="form-label">Status:</label>
                        <select id="statusSelect" class="form-select" required>
                            <option value="working">working</option>
                            <option value="workpermit">workpermit</option>
                        </select>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="isActive" ${work.is_relation_active ? 'checked' : ''}>
                            <label class="form-check-label" for="isActive">Is Active</label>
                        </div>
                    </div>
                </div>
                <br>
                <button class="w-100 btn btn-primary btn-lg" type="submit">Submit</button>
            </form>
        </div>`;

    const relationStatus = document.getElementById('statusSelect');
    relationStatus.value = work.status || 'working';

    document.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api.updateWorkingOn(work.id, {
                is_relation_active: document.getElementById('isActive').checked,
                start_date: document.getElementById('startDate').value,
                end_date: document.getElementById('endDate').value || null,
                status: relationStatus.value,
                developer: work.developer,
                project: work.project
            });
            listProjects();
        } catch (err) {
            console.error(err);
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- listDevelopers ---
export async function listDevelopers() {
    const user = await auth.getUser();
    if (!user || user.expired) {
        auth.login();
        return;
    }
    const container = getContainer();
    container.innerHTML = '';

    const developers = await api.getDevelopers();

    const div = document.createElement('div');
    div.className = 'col-12 flex row row-cols-2 row-cols-sm-2 row-cols-md-2 g-3';
    container.appendChild(div);

    developers.forEach(developer => {
        const col = document.createElement('div');
        col.className = 'col-6';

        const card = document.createElement('div');
        card.className = 'card shadow-sm';
        card.style.backgroundColor = '#eeeaee';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const h5 = document.createElement('h5');
        const developerTitle = document.createElement('p');
        developerTitle.className = 'card-text bold';
        const link = document.createElement('a');
        link.className = 'link-dark';
        link.textContent = developer.full_name;
        link.href = '#';
        link.onclick = () => showDeveloperDetails(developer.id);
        developerTitle.appendChild(link);
        h5.appendChild(developerTitle);

        const ul = document.createElement('ul');
        cardBody.appendChild(h5);
        cardBody.appendChild(ul);
        card.appendChild(cardBody);
        col.appendChild(card);
        div.appendChild(col);
    });

    const buttonLinkDiv = document.createElement('div');
    buttonLinkDiv.className = 'd-flex flex-column align-items-center mt-4 col-12';
    const createBtn = document.createElement('button');
    createBtn.className = 'btn btn-primary mb-2';
    createBtn.textContent = 'Yeni çalışan ekle';
    createBtn.onclick = showNewDeveloperForm;
    buttonLinkDiv.appendChild(createBtn);
    div.insertAdjacentElement('afterend', buttonLinkDiv);
}

// --- showNewDeveloperForm (on success call listDevelopers) ---
export function showNewDeveloperForm() {
    const container = getContainer();
    container.innerHTML = `
        <div class="mx-auto">
            <form id="developerForm" class="needs-validation" novalidate>
                <div class="row g-3">
                    <div class="col-sm-12">
                        <label for="fullName" class="form-label">Full Name:</label>
                        <input type="text" class="form-control" id="fullName" required>
                    </div>
                    <div class="col-sm-12">
                        <label for="startDate" class="form-label">Start Date:</label>
                        <input type="date" class="form-control" id="startDate">
                    </div>
                    <div class="col-sm-12">
                        <label for="endDate" class="form-label">End Date:</label>
                        <input type="date" class="form-control" id="endDate">
                    </div>
                    <div class="col-sm-12">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="active">
                            <label class="form-check-label" for="active">Active</label>
                        </div>
                    </div>
                </div>
                <br>
                <button class="w-100 btn btn-primary btn-lg" type="submit">ekle</button>
            </form>
        </div>`;

    document.getElementById('developerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return;
        }
        try {
            await api.createDeveloper({
                full_name: document.getElementById('fullName').value,
                start_date: startDate || null,
                end_date: endDate || null,
                developer_active: document.getElementById('active').checked
            });
            listDevelopers();
        } catch (err) {
            console.error(err);
        }
    });
}

// --- showNewProjectForm ---
export function showNewProjectForm() {
    const container = getContainer();
    container.innerHTML = `
        <div class="mx-auto">
            <form id="projectForm" class="needs-validation" novalidate>
                <div class="row g-3">
                    <div class="col-sm-12">
                        <label for="projectName" class="form-label">Project Name:</label>
                        <input type="text" class="form-control" id="projectName" required>
                    </div>
                    <div class="col-sm-12">
                        <label for="startDate" class="form-label">Start Date:</label>
                        <input type="date" class="form-control" id="startDate" required>
                    </div>
                    <div class="col-sm-12">
                        <label for="endDate" class="form-label">End Date:</label>
                        <input type="date" class="form-control" id="endDate" required>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="active">
                            <label class="form-check-label" for="active">Active</label>
                        </div>
                    </div>
                </div>
                <br>
                <button class="w-100 btn btn-primary btn-lg" type="submit">Add Project</button>
            </form>
        </div>`;

    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return;
        }
        try {
            await api.createProject({
                project_name: document.getElementById('projectName').value,
                start_date: startDate,
                end_date: endDate,
                project_active: document.getElementById('active').checked
            });
            listProjects();
        } catch (err) {
            console.error(err);
        }
    });
}

// --- workPermit ---
export async function workPermit() {
    const user = await auth.getUser();
    if (!user || user.expired) {
        auth.login();
        return;
    }
    const container = getContainer();
    container.innerHTML = '';

    const formDiv = document.createElement('div');
    formDiv.className = 'mx-auto';

    const form = document.createElement('form');
    form.className = 'form-class';

    const developerSelect = document.createElement('select');
    developerSelect.className = 'form-select';
    developerSelect.required = true;

    const developers = await api.getDevelopers();
    developers.forEach(developer => {
        const option = document.createElement('option');
        option.value = developer.id;
        option.textContent = developer.full_name;
        developerSelect.appendChild(option);
    });

    const startDateLabel = document.createElement('label');
    startDateLabel.textContent = 'Start date:';
    const startDateInput = document.createElement('input');
    startDateInput.type = 'date';
    startDateInput.className = 'form-control';
    startDateInput.required = true;

    const endDateLabel = document.createElement('label');
    endDateLabel.textContent = 'End date:';
    const endDateInput = document.createElement('input');
    endDateInput.type = 'date';
    endDateInput.className = 'form-control';
    endDateInput.required = true;

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-primary mt-3';
    submitButton.textContent = 'Submit';

    form.onsubmit = async (e) => {
        e.preventDefault();
        const developerId = developerSelect.value;
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        if (endDate < startDate) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return;
        }

        try {
            const allPermits = await api.getWorkingOn();
            const developerPermits = allPermits.filter(
                p => p.developer === parseInt(developerId, 10) && p.status === 'workpermit'
            );
            for (const permit of developerPermits) {
                const permitStart = new Date(permit.start_date);
                const permitEnd = new Date(permit.end_date);
                if (
                    (startDate <= permitStart && endDate >= permitEnd) ||
                    (startDate >= permitStart && startDate <= permitEnd) ||
                    (endDate >= permitStart && endDate <= permitEnd)
                ) {
                    alert('halihazırda olan bir izin tarihi ile çakışıyor.');
                    return;
                }
            }

            const developer = await api.getDeveloper(developerId);
            const projectIds = developer.project || [];
            for (const projectId of projectIds) {
                await api.createWorkingOn({
                    is_relation_active: true,
                    start_date: startDateInput.value,
                    end_date: endDateInput.value,
                    status: 'workpermit',
                    developer: parseInt(developerId, 10),
                    project: projectId
                });
            }
            listProjects();
        } catch (err) {
            console.error(err);
        }
    };

    form.appendChild(developerSelect);
    form.appendChild(document.createElement('br'));
    form.appendChild(startDateLabel);
    form.appendChild(startDateInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(endDateLabel);
    form.appendChild(endDateInput);
    form.appendChild(submitButton);

    const formLabel = document.createElement('h2');
    formLabel.textContent = 'izin oluştur:';
    formLabel.className = 'mt-3';
    formDiv.appendChild(formLabel);
    formDiv.appendChild(form);
    container.appendChild(formDiv);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const activeDevelopersHeading = document.createElement('h2');
    activeDevelopersHeading.textContent = 'izinliler:';
    cardBody.appendChild(activeDevelopersHeading);

    const developerList = document.createElement('ul');
    developerList.className = 'list-group';

    const workPermits = await api.getWorkingOn();
    const groupedPermits = {};
    workPermits.forEach(permit => {
        if (permit.is_relation_active && permit.status === 'workpermit') {
            const key = `${permit.developer}-${permit.start_date}-${permit.end_date}`;
            if (!groupedPermits[key]) groupedPermits[key] = permit;
        }
    });
    const activeDeveloperIds = [...new Set(Object.values(groupedPermits).map(p => p.developer))];

    for (const devId of activeDeveloperIds) {
        try {
            const dev = await api.getDeveloper(devId);
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.style.backgroundColor = 'rgb(238, 234, 238)';
            listItem.textContent = dev.full_name;
            const devPermits = Object.values(groupedPermits).filter(p => p.developer === devId);
            devPermits.slice(-2).forEach(permit => {
                listItem.textContent += ` | izinli: ${formatDate(permit.start_date)} - ${formatDate(permit.end_date)}`;
            });
            developerList.appendChild(listItem);
        } catch (err) {
            console.error(err);
        }
    }
    cardBody.appendChild(developerList);
    container.appendChild(cardBody);
}

// --- showDeveloperDetails (deterministic order: fetch all then build list once) ---
export async function showDeveloperDetails(developerId) {
    const developer = await api.getDeveloper(developerId);
    const works = await api.getWorkingOn();
    const devWorks = works.filter(w => w.developer === parseInt(developerId, 10));

    const projectIds = [...new Set(devWorks.map(w => w.project))];
    const projectsById = new Map();
    await Promise.all(
        projectIds.map(async (id) => {
            const p = await api.getProject(id);
            projectsById.set(id, p);
        })
    );

    devWorks.sort((a, b) => (a.id || 0) - (b.id || 0));

    const container = getContainer();
    container.innerHTML = '';

    const col = document.createElement('div');
    col.className = 'col mx-auto';

    const card = document.createElement('div');
    card.className = 'card shadow-sm';
    card.style.width = '120%';
    card.style.backgroundColor = '#eeeaee';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const h5 = document.createElement('h5');
    h5.textContent = developer.full_name;
    cardBody.appendChild(h5);

    const infoList = document.createElement('ul');
    cardBody.appendChild(infoList);

    const worksList = document.createElement('ul');
    for (const work of devWorks) {
        const project = projectsById.get(work.project);
        const projectName = project ? project.project_name : String(work.project);
        const workLi = document.createElement('li');
        const editLink = document.createElement('a');
        editLink.textContent = 'edit';
        editLink.className = 'link-dark';
        editLink.href = '#';
        editLink.onclick = (e) => {
            e.preventDefault();
            editWorkingOn(work);
        };
        workLi.textContent = `Project Name: ${projectName}, Status: ${work.status}, Start Date: ${formatDate(work.start_date)}, End Date: ${formatDate(work.end_date) || ' '} `;
        workLi.appendChild(editLink);
        worksList.appendChild(workLi);
    }

    cardBody.appendChild(document.createElement('hr'));
    cardBody.appendChild(worksList);
    card.appendChild(cardBody);
    col.appendChild(card);
    container.appendChild(col);
}
