# Project Schedule Manager

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![MariaDB](https://img.shields.io/badge/mariadb-003545.svg?style=for-the-badge&logo=mariadb&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)

A containerized microservices application designed for efficient resource allocation and project management. This system separates authentication, business logic, databases, and frontend presentation into distinct services, orchestrated via Docker Compose for seamless deployment and scalability.



### Tech Stack

| **Layer** | **Technologies** |
| ------------------ | ------------------------------------- |
| **Frontend** | Vanilla JS, Nginx, oidc-client-ts |
| **Backend API** | Python, Django, Django REST Framework |
| **Auth Provider** | Django OAuth Toolkit (OAuth2/OIDC)    |
| **Databases** | PostgreSQL, MariaDB                   |
| **Infrastructure** | Docker, Docker Compose, Linux/Shell   |


### Services Overview

1.  **Schedule API Service (`schedule-app`)**:
    - **Stack:** Python, Django, Django REST Framework.
    - **Database:** MariaDB (Dedicated storage for application data).
    - **Features:** Manages core entities: `Projects`, `Teams`, and `Developers`. Implements "Insert-Only" data modeling for historical tracking of developer assignments.
    - **Port:** 8000.

2.  **Authentication Service (`auth-app`)**:
    - **Stack:** Python, Django, Django OAuth Toolkit.
    - **Database:** PostgreSQL (Dedicated storage for identity and credentials).
    - **Features:** Centralized Identity Provider (IdP) handling OAuth2 flows (user registration, token issuance/validation).
    - **Port:** 8001.

3.  **Frontend Service (`frontend`)**: 
    - **Stack:** Vanilla JavaScript (ES Modules), Bootstrap 5, Axios, OIDC Client.
    - **Features:** Uses oidc-client-ts to manage the OIDC Authorization Code Flow with PKCE, including token storage and automatic silent renewal.
    - **Port:** 8080 (Mapped to container port 80).
      
## Key Features

- **Microservices Architecture:** Decoupled services for independent scaling and maintenance.
- **Database-per-Service:** Isolated databases (PostgreSQL and MariaDB) to prevent cross-service data coupling.
- **OAuth2 Authentication:** Secure, token-based authentication flow.
- **Containerization:** Fully Dockerized environment ensuring consistency across development, testing, and production.
- **Environment-Agnostic Frontend:** Runtime configuration injection allows the same Docker image to be deployed to any environment without rebuilding.
- **Configuration Management:** Strict separation of config from code via environment variables.
- **Volume Management:** Persistent data storage configuration for development environments.

## Getting Started

### Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/01010001/Internship-Project-Softtech.git
    cd Internship-Project-Softtech
    ```

2.  **Environment Configuration:**
    Create `.env` files for each service based on the provided env.example files.

    **`frontend/.env`**
    ```env
    API_BASE_URL=http://localhost:8000
    AUTH_AUTHORITY=http://localhost:8001
    AUTH_CLIENT_ID=<your-client-id-from-auth-service>
    AUTH_REDIRECT_URI=http://localhost:8080/callback
    AUTH_POST_LOGOUT_URI=http://localhost:8080
    ```

    **`djangoprojectschedule/.env`** (Schedule API & MariaDB)
    ```env
    DEBUG=True
    SECRET_KEY=your-secret-key
    INTROSPECTION_URL=http://auth-app:8001/o/introspect/
    INTROSPECTION_ID=<your-client-id>
    INTROSPECTION_SECRET=<your-client-secret>
    
    DB_NAME=resource_db
    DB_USER=admin
    DB_PASSWORD=your_password
    DB_HOST=schedule-db
    DB_PORT=3306
    MARIADB_DATABASE=resource_db
    MARIADB_USER=admin
    MARIADB_PASSWORD=your_password
    MARIADB_ROOT_PASSWORD=your_root_password
    ```

    **`projectschedule_auth/.env`** (Auth Service & PostgreSQL)
    ```env
    DEBUG=True
    SECRET_KEY=your-auth-secret-key
    
    DB_NAME=auth_db
    DB_USER=admin
    DB_PASSWORD=your_password
    DB_HOST=auth-db
    DB_PORT=5432
    POSTGRES_DB=auth_db
    POSTGRES_USER=admin
    POSTGRES_PASSWORD=your_password
    ```

3.  **Build and Run:**
    ```bash
    docker compose up --build -d
    ```

4.  **Run Database Migrations:**
    ```bash
    docker compose exec auth-app python manage.py migrate
    docker compose exec schedule-app python manage.py migrate
    ```

5.  **Create Admin User:**
    ```bash
    docker compose exec auth-app python manage.py createsuperuser
    ```

6.  **Access the Application:**
    - **Schedule API Admin:** [http://localhost:8000/admin](http://localhost:8000/admin)
    - **Auth Service Admin:** [http://localhost:8001/admin](http://localhost:8001/admin)
    - **Frontend Dashboard:** [http://localhost:8080](http://localhost:8080)
