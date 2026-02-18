function listProjects() {
    fetch('http://127.0.0.1:8000/projects/')
        .then(response => response.json())
        .then(projects => {

            const container = document.querySelector('.row');
            container.innerHTML = '';

            const div = document.createElement('div');
            div.className = 'col-12'
            container.appendChild(div)


            const addedDevelopersPerProject = new Map();

            projects.forEach(project => {
                if (!project.project_active) {
                    return;
                }

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

                fetch('http://127.0.0.1:8000/working-on/')
                    .then(response => response.json())
                    .then(entries => {
                        entries.forEach(entry => {
                            let today = new Date().toISOString().split('T')[0];
                            if (entry.project === project.id && entry.status === 'working' && entry.end_date >= today) {
                                if (!addedDevelopersPerProject.has(project.id)) {
                                    addedDevelopersPerProject.set(project.id, new Set());
                                }
                                const addedDevelopers = addedDevelopersPerProject.get(project.id);

                                if (!addedDevelopers.has(entry.developer)) {
                                    addedDevelopers.add(entry.developer);

                                    fetch(`http://127.0.0.1:8000/developers/${entry.developer}/`)
                                        .then(response => response.json())
                                        .then(developer => {
                                            const li = document.createElement('li');
                                            const link = document.createElement('a');
                                            link.className = 'link-dark';
                                            link.textContent = `${developer.full_name} (${formatDate(entry.start_date)} - ${formatDate(entry.end_date) || ''})`;
                                            link.href = '#';
                                            link.onclick = function () {
                                                showDeveloperDetails(entry.developer);
                                            };
                                            li.appendChild(link);
                                            ul.appendChild(li);
                                        })
                                        .catch(error => console.error(error));
                                }
                            }
                        });

                        cardBody.appendChild(h5);
                        cardBody.appendChild(hr);
                        cardBody.appendChild(devList);
                        cardBody.appendChild(ul);

                        const editBtnDiv = document.createElement('div');
                        editBtnDiv.className = 'd-flex justify-content-between align-items-center';

                        const editBtn = document.createElement('button');
                        editBtn.className = 'btn btn-sm btn-outline-secondary';
                        editBtn.textContent = 'Edit';
                        editBtn.addEventListener('click', () => {
                            showEditProjectForm(project.id);
                        });

                        editBtnDiv.appendChild(editBtn);
                        cardBody.appendChild(editBtnDiv);

                        card.appendChild(cardBody);
                        col.appendChild(card);
                        div.appendChild(col);
                    })
                    .catch(error => console.error(error));
            });

            const buttonLinkDiv = document.createElement('div');
            buttonLinkDiv.className = 'd-flex flex-column align-items-center mt-4 col-12';

            const createProjectBtn = document.createElement('button');
            createProjectBtn.className = 'btn btn-primary mb-2';
            createProjectBtn.textContent = 'Yeni Proje Oluştur';
            createProjectBtn.onclick = showNewProjectForm;

            const linkAll = document.createElement('a');
            linkAll.className = 'link-dark';
            linkAll.textContent = "aktif olmayan projeleri de göster";
            linkAll.href = '#';
            linkAll.onclick = listAllProjects;

            buttonLinkDiv.appendChild(createProjectBtn);
            buttonLinkDiv.appendChild(linkAll);


            div.insertAdjacentElement("afterend", buttonLinkDiv);
        })
        .catch(error => console.error(error));
}


function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}


function listAllProjects() {
    fetch('http://127.0.0.1:8000//projects/')
        .then(response => response.json())
        .then(projects => {
            const container = document.querySelector('.row');
            container.innerHTML = '';

            projects.forEach(project => {
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
                const addedDevelopers = new Set();

                Promise.all(
                    project.developers.map(devId =>
                        fetch(`http://127.0.0.1:8000//developers/${devId}/`)
                            .then(response => response.json())
                            .then(developer => {
                                if (!addedDevelopers.has(developer.full_name)) {
                                    addedDevelopers.add(developer.full_name);
                                    const li = document.createElement('li');
                                    const link = document.createElement('a');
                                    link.className = 'link-dark';
                                    link.textContent = developer.full_name;
                                    link.href = '#';
                                    link.onclick = function () {
                                        showDeveloperDetails(devId);
                                    };
                                    li.appendChild(link);
                                    ul.appendChild(li);
                                }
                            })
                            .catch(error => console.error(error))
                    )
                ).then(() => {
                    cardBody.appendChild(h5);
                    cardBody.appendChild(hr);
                    cardBody.appendChild(devList);
                    cardBody.appendChild(ul);

                    const editBtnDiv = document.createElement('div');
                    editBtnDiv.className = 'd-flex justify-content-between align-items-center';

                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn btn-sm btn-outline-secondary';
                    editBtn.textContent = 'Edit';
                    editBtn.addEventListener('click', () => {
                        showEditProjectForm(project.id);
                    });

                    editBtnDiv.appendChild(editBtn);
                    cardBody.appendChild(editBtnDiv);

                    card.appendChild(cardBody);
                    col.appendChild(card);
                    container.appendChild(col);
                });
            });
        })
        .catch(error => console.error(error));
}

function showEditProjectForm(projectId) {
    fetch(`http://127.0.0.1:8000/projects/${projectId}/`)
        .then(response => response.json())
        .then(project => {



            const container = document.querySelector('.row');
            container.innerHTML = '';

            const form = document.createElement('form');
            form.className = 'mt-4 col-12';

            const h4 = document.createElement('h4');
            h4.textContent = `Edit Project: ${project.project_name}`;
            form.appendChild(h4);

            const hr = document.createElement('hr');
            form.appendChild(hr);

            const nameDiv = document.createElement('div');
            nameDiv.className = 'mb-3';

            const nameLabel = document.createElement('label');
            nameLabel.className = 'form-label';
            nameLabel.textContent = 'Project Name';
            nameDiv.appendChild(nameLabel);

            const nameInput = document.createElement('input');
            nameInput.className = 'form-control';
            nameInput.type = 'text';
            nameInput.value = project.project_name;
            nameDiv.appendChild(nameInput);

            form.appendChild(nameDiv);


            const startDateDiv = document.createElement('div');
            startDateDiv.className = 'mb-3';

            const startDateLabel = document.createElement('label');
            startDateLabel.className = 'form-label';
            startDateLabel.textContent = 'Start Date';
            startDateDiv.appendChild(startDateLabel);




            const startDateInput = document.createElement('input');
            startDateInput.className = 'form-control';
            startDateInput.type = 'date';
            startDateInput.value = project.start_date;
            startDateInput.placeholder = "dd-mm-yyyy";
            startDateDiv.appendChild(startDateInput);

            form.appendChild(startDateDiv);


            const endDateDiv = document.createElement('div');
            endDateDiv.className = 'mb-3';

            const endDateLabel = document.createElement('label');
            endDateLabel.className = 'form-label';
            endDateLabel.textContent = 'End Date';
            endDateDiv.appendChild(endDateLabel);

            const endDateInput = document.createElement('input');
            endDateInput.className = 'form-control';
            endDateInput.type = 'date';
            endDateInput.value = project.end_date;
            endDateDiv.appendChild(endDateInput);

            form.appendChild(endDateDiv);


            const activeDiv = document.createElement('div');
            activeDiv.className = 'form-check mb-3';

            const activeCheckbox = document.createElement('input');
            activeCheckbox.className = 'form-check-input';
            activeCheckbox.type = 'checkbox';
            activeCheckbox.checked = project.project_active;
            activeDiv.appendChild(activeCheckbox);

            const activeLabel = document.createElement('label');
            activeLabel.className = 'form-check-label';
            activeLabel.textContent = 'Project Active';
            activeDiv.appendChild(activeLabel);

            form.appendChild(activeDiv);


            const submitBtn = document.createElement('button');
            submitBtn.className = 'btn btn-primary';
            submitBtn.textContent = 'kaydet';
            submitBtn.addEventListener('click', (event) => {
                event.preventDefault();

                if (endDateInput.value && startDateInput.value > endDateInput.value) {
                    alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
                    return;
                }

                const updatedProject = {
                    project_name: nameInput.value,
                    start_date: startDateInput.value,
                    end_date: endDateInput.value || null,
                    project_active: activeCheckbox.checked
                };

                fetch(`http://127.0.0.1:8000/projects/${projectId}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedProject)
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('proje güncellendi:', data);
                        listProjects()
                    })
                    .catch(error => console.error(error));
            });

            form.appendChild(submitBtn);

            container.appendChild(form);


            const workingOnDiv = document.createElement('div');
            workingOnDiv.className = 'mt-4';

            const workingOnBtn = document.createElement('button');
            workingOnBtn.className = 'btn btn-secondary';
            workingOnBtn.textContent = 'projeye çalışan ekle';
            workingOnBtn.addEventListener('click', () => {
                manageWorkingOnEntry(projectId);
            });

            workingOnDiv.appendChild(workingOnBtn);
            container.appendChild(workingOnDiv);
        })
        .catch(error => console.error(error));
}


function manageWorkingOnEntry(projectId) {
    const container = document.querySelector('.row');
    container.innerHTML = '';
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
        // w-100 btn btn-primary btn-lg mt-3

    fetch('http://127.0.0.1:8000/developers/')
        .then(response => response.json())
        .then(developers => {
            const developerSelect = document.getElementById('developerSelect');
            developers.forEach(developer => {
                const option = document.createElement('option');
                option.value = developer.id;
                option.textContent = developer.full_name;
                developerSelect.appendChild(option);
            });
        })
        .catch(error => console.error(error));

    document.getElementById('assignDeveloperBtn').addEventListener('click', function () {
        const developerId = document.getElementById('developerSelect').value;
        const startDate = document.getElementById('woStartDate').value;
        const endDate = document.getElementById('woEndDate').value;
        const isActive = document.getElementById('isActive').checked;

        if (endDate && startDate > endDate) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return;
        }

        const newAssignment = {
            developer: developerId,
            project: projectId,
            start_date: startDate,
            end_date: endDate || null,
            is_relation_active: isActive
        };

        fetch('http://127.0.0.1:8000/working-on/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAssignment)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                listProjects()

            })
            .catch(error => console.error(error));
    });
}





//
function editWorkingOn(work) {

    Promise.all([
        fetch(`http://127.0.0.1:8000/developers/${work.developer}/`).then(response => response.json()),
        fetch(`http://127.0.0.1:8000/projects/${work.project}/`).then(response => response.json())
    ])
        .then(([developer, project]) => {
            const container = document.querySelector('.row');
            container.innerHTML = `
            <div class="mx-auto">
                <form class="needs-validation" novalidate>
                    <div class="row g-3">
                        <div class="col-sm-12">
                            <input class="form-control" type="text" id="developer" value="${developer.full_name}" readonly>
                        </div>
                        <div class="col-sm-12">
                            <input class="form-control" type="text" id="project" value="${project.project_name}" readonly>
                        </div>
                        <div class="col-sm-12">
                            <label for="startDate" class="form-label">Start Date:</label>
                            <input type="date" class="form-control" id="startDate" value="${work.start_date}" required>
                        </div>
                        <div class="col-sm-12">
                            <label for="endDate" class="form-label">End Date:</label>
                            <input type="date" class="form-control" id="endDate" value="${work.end_date}" required>
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
            relationStatus.value = work.status;

            document.querySelector('form').addEventListener('submit', function (event) {
                event.preventDefault();
                const formData = {
                    is_relation_active: document.getElementById('isActive').checked,
                    start_date: document.getElementById('startDate').value,
                    end_date: document.getElementById('endDate').value || null,
                    status: relationStatus.value,
                    developer: work.developer,
                    project: work.project
                };

                fetch(`http://127.0.0.1:8000/working-on/${work.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        listProjects();
                    })
                    .catch(error => console.error('Error:', error));
            });
        })
        .catch(error => console.error(error));
}



function listDevelopers() {
    fetch('http://127.0.0.1:8000/developers/')
        .then(response => response.json())
        .then(developers => {
            const container = document.querySelector('.row');
            container.innerHTML = '';

            const div = document.createElement('div');
            div.className = 'col-12 flex row row-cols-2 row-cols-sm-2 row-cols-md-2 g-3'
            container.appendChild(div)


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
                link.href = `#`;
                link.onclick = function () {
                    showDeveloperDetails(developer.id);
                };
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

            const createProjectBtn = document.createElement('button');
            createProjectBtn.className = 'btn btn-primary mb-2';
            createProjectBtn.textContent = 'Yeni çalışan ekle';
            createProjectBtn.onclick = showNewDeveloperForm;



            buttonLinkDiv.appendChild(createProjectBtn);



            div.insertAdjacentElement("afterend", buttonLinkDiv);
        })
        .catch(error => console.error(error));
}





function showNewDeveloperForm() {
    const container = document.querySelector('.row');
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

    const form = document.getElementById('developerForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        // Check if the end date is before the start date
        if (endDate < startDate) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return; // Prevent form submission
        }

        const developerData = {
            full_name: document.getElementById('fullName').value,
            start_date: document.getElementById('startDate').value,
            end_date: document.getElementById('endDate').value,
            developer_active: document.getElementById('active').checked
        };

        fetch('http://127.0.0.1:8000/developers/?format=json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(developerData)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                listProjects()
            })
            .catch(error => console.error(error));
    });
}



function showNewProjectForm() {
    const container = document.querySelector('.row');
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

    const form = document.getElementById('projectForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        // Check if the end date is before the start date
        if (endDate < startDate) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return; // Prevent form submission
        }

        const projectData = {
            project_name: document.getElementById('projectName').value,
            start_date: document.getElementById('startDate').value,
            end_date: document.getElementById('endDate').value,
            project_active: document.getElementById('active').checked
        };

        fetch('http://127.0.0.1:8000/projects/?format=json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                listProjects();
            })
            .catch(error => console.error(error));
    });
}



function workPermit() {
    const container = document.querySelector('.row');
    container.innerHTML = '';

    const formDiv = document.createElement('div');
    formDiv.className = 'mx-auto';

    const form = document.createElement('form');
    form.className = 'form-class';

    const developerSelect = document.createElement('select');
    developerSelect.className = 'form-select';
    developerSelect.required = true;

    fetch('http://127.0.0.1:8000/developers/?format=json')
        .then(response => response.json())
        .then(developers => {
            developers.forEach(developer => {
                const option = document.createElement('option');
                option.value = developer.id;
                option.textContent = developer.full_name;
                developerSelect.appendChild(option);
            });
        })
        .catch(error => console.error(error));

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

    form.onsubmit = function (event) {
        event.preventDefault();

        const developerId = developerSelect.value;
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);


        if (endDate < startDate) {
            alert('başlangıç tarihi bitiş tarihinden önce olamaz.');
            return;
        }

        fetch('http://127.0.0.1:8000/working-on/?format=json')
            .then(response => response.json())
            .then(allPermits => {
                const developerPermits = allPermits.filter(permit =>
                    permit.developer === parseInt(developerId) && permit.status === "workpermit"
                );

                for (const permit of developerPermits) {
                    const permitStartDate = new Date(permit.start_date);
                    const permitEndDate = new Date(permit.end_date);

                    if (
                        (startDate <= permitStartDate && endDate >= permitEndDate) ||
                        (startDate >= permitStartDate && startDate <= permitEndDate) ||
                        (endDate >= permitStartDate && endDate <= permitEndDate)
                    ) {
                        alert('halihazırda olan bir izin tarihi ile çakışıyor.');
                        return;
                    }
                }


                return fetch(`http://127.0.0.1:8000/developers/${developerId}/?format=json`);
            })
            .then(response => response.json())
            .then(developer => {

                developer.project.forEach(projectId => {
                    fetch('http://127.0.0.1:8000/working-on/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            "is_relation_active": true,
                            "start_date": startDateInput.value,
                            "end_date": endDateInput.value,
                            "status": "workpermit",
                            "developer": developerId,
                            "project": projectId
                        })
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('hata');
                        }
                        return response.json();
                    }).then(data => {
                        console.log(data);
                        listProjects();
                    })
                        .catch(error => console.error(error));
                });
            })
            .catch(error => console.error(error));
    };



    form.appendChild(developerSelect);
    form.appendChild(document.createElement('br'));
    form.appendChild(startDateLabel);
    form.appendChild(startDateInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(endDateLabel);
    form.appendChild(endDateInput);
    form.appendChild(submitButton);

    const formLabel = document.createElement("h2");
    formLabel.textContent = "izin oluştur:";
    formLabel.className = "mt-3"
    formDiv.appendChild(formLabel);
    formDiv.appendChild(form);

    container.appendChild(formDiv);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    // cardBody.style = "background-color: rgb(238, 234, 238);"

    const activeDevelopersHeading = document.createElement('h2');
    activeDevelopersHeading.textContent = 'izinliler:';
    cardBody.appendChild(activeDevelopersHeading);

    const developerList = document.createElement('ul');
    developerList.className = 'list-group';
    // developerList.style = "background-color: rgb(238, 234, 238)"

    fetch('http://127.0.0.1:8000/working-on/?format=json')
        .then(response => response.json())
        .then(workPermits => {
            const activeDevelopers = new Set();
            const groupedPermits = {};

            workPermits.forEach(permit => {
                if (permit.is_relation_active && permit.status === "workpermit") {
                    const key = `${permit.developer}-${permit.start_date}-${permit.end_date}`;
                    if (!groupedPermits[key]) {
                        groupedPermits[key] = permit;
                    }
                }
            });

            Object.values(groupedPermits).forEach(permit => {
                activeDevelopers.add(permit.developer);
            });

            activeDevelopers.forEach(developerId => {
                fetch(`http://127.0.0.1:8000/developers/${developerId}/?format=json`)
                    .then(response => response.json())
                    .then(developer => {
                        const listItem = document.createElement('li');
                        listItem.className = 'list-group-item';
                        listItem.textContent = developer.full_name;
                        listItem.style = "background-color: rgb(238, 234, 238)"

                        const developerPermits = Object.values(groupedPermits).filter(permit => permit.developer === developerId);
                        developerPermits.slice(-2).forEach(permit => {
                            listItem.textContent += ` | izinli: ${formatDate(permit.start_date)} - ${formatDate(permit.end_date)}`;
                        });
                        developerList.appendChild(listItem);
                    })
                    .catch(error => console.error(error));
            });
        })
        .catch(error => console.error(error));

    cardBody.appendChild(developerList);

    container.appendChild(cardBody);
}




function showDeveloperDetails(developerId) {
    fetch(`http://127.0.0.1:8000/developers/${developerId}/?format=json`)
        .then(response => response.json())
        .then(developer => {
            const container = document.querySelector('.row');
            container.innerHTML = '';

            const col = document.createElement('div');
            col.className = 'col mx-auto';

            const card = document.createElement('div');
            card.className = 'card shadow-sm';
            card.style = "width: 120%;";
            card.style.backgroundColor = '#eeeaee';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const h5 = document.createElement('h5');
            h5.textContent = developer.full_name;
            cardBody.appendChild(h5);

            // const hr = document.createElement('hr');
            // cardBody.appendChild(hr);

            const infoList = document.createElement('ul');

            // const projectsLi = document.createElement('li');
            // projectsLi.textContent = `Projects: ${developer.project.join(', ')}`;
            // infoList.appendChild(projectsLi);




            cardBody.appendChild(infoList);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);


            fetch(`http://127.0.0.1:8000/working-on/?format=json`)
                .then(response => response.json())
                .then(works => {
                    const worksList = document.createElement('ul');
                    works.forEach(work => {
                        if (developerId == work.developer) {
                            fetch(`http://127.0.0.1:8000/projects/${work.project}/?format=json`)
                                .then(response => response.json())
                                .then(project => {
                                    const workLi = document.createElement('li');
                                    const editLink = document.createElement('a');
                                    editLink.textContent = "edit";
                                    editLink.className = 'link-dark';
                                    editLink.href = '#';
                                    editLink.onclick = function () {
                                        editWorkingOn(work);
                                    };
                                    workLi.textContent = `Project Name: ${project.project_name}, Status: ${work.status}, Start Date: ${formatDate(work.start_date)}, End Date: ${formatDate(work.end_date) || ' '}`;
                                    workLi.innerHTML += " "

                                    workLi.append(editLink);
                                    worksList.appendChild(workLi);
                                })
                                .catch(error => console.error(error));
                        }
                    });

                    cardBody.appendChild(document.createElement('hr'));
                    cardBody.appendChild(worksList);
                })
                .catch(error => console.error(error));
        })
        .catch(error => console.error(error));
}


document.addEventListener("DOMContentLoaded", function () {
    //initial page.
    listProjects()
});