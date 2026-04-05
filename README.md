# 🎓 Clutch: Unified Campus Microservice Ecosystem

![Java](https://img.shields.io/badge/Java-Spring_Boot-green?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![Google Cloud Run](https://img.shields.io/badge/GCP-Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Tested-326CE5?style=for-the-badge&logo=kubernetes)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Extraction-8E75B2?style=for-the-badge&logo=google)

**Clutch** is a cloud-native, distributed campus super-app built to unify university operations. Engineered with a decoupled microservice architecture (Java/Spring Boot) and a React edge-routed frontend, it eliminates campus data silos by centralizing predictive attendance tracking, AI-driven placement analytics, and strict role-based identity management into a single, highly available ecosystem.

## 🌟 The Problem it Solves
Modern university digital infrastructure is plagued by fragmented, monolithic legacy systems. Students and faculty navigate isolated platforms that often crash during high-traffic events (e.g., mass placement registrations). Clutch solves this by partitioning domains into isolated microservices. If the Placement Service experiences a massive traffic spike, the Academic Service remains completely unaffected.

## 🏗️ Advanced Architecture & Tech Stack

![Clutch Architecture](images/clutch_deployment_diagram.png)

Clutch is designed as an extensible Monorepo, allowing future modules to be plugged in seamlessly while maintaining Dev/Prod parity.

* **The Engine (Java/Spring Boot 3):**
  * **Domain-Driven Design:** Strictly partitioned into `identity-service`, `academic-service`, and `placement-service`.
  * **Inter-Service Communication:** Handled via `@FeignClient` with dynamic environment routing (local vs. cloud).
  * **AI Integration:** Utilizes the Google Gemini API to parse complex academic documents and automate placement eligibility extraction.
* **Database & Migrations (Supabase & Flyway):** Centralized PostgreSQL database. Schema versioning is fully automated via Flyway migrations ensuring database integrity across environments.
* **Security & Configuration as Code:** Zero-trust architecture. All credentials (JWT secrets, DB URLs, API keys) are strictly injected via `.env` files and Docker environment variables. 
* **Container Orchestration (Docker Compose):** The entire stack (3 backend services + frontend) can be spun up locally with a single atomic command, perfectly mirroring the production environment.
* **Cloud Deployment (GCP & Vercel):** Backend services are optimized via multi-stage Dockerfiles and deployed to Google Cloud Run for scale-to-zero serverless execution. The React UI is deployed on Vercel, utilizing `vercel.json` rewrites to act as a serverless API Gateway.

## 📊 Visualizing the Ecosystem

Clutch provides dedicated portals tailored to distinct campus roles, driven by real-time analytics.

![Clutch Dashboards](images/clutch_dashboards.png)
> *Left: The Predictive Student Dashboard computing attendance thresholds. Right: The Administrator "God View" AI Placement Center.*

## 🚀 Getting Started (Local Dev/Prod Parity)

This repository is structured as a Monorepo. Thanks to Docker Compose, you do not need to install Java or Node.js locally to run the entire stack.

### Prerequisites
* Docker Desktop / Docker Engine installed
* A Supabase PostgreSQL Database URL
* A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/Karimullah-1303/clutch.git
cd clutch-campus-app
```

### 2. Configure the Security Environment
Create a .env file in the root directory. (Do not commit this file!)
```bash
# Database Credentials (Supabase)
DB_URL=your_jdbc_connection_string
DB_USERNAME=your_supabase_username
DB_PASSWORD=your_secure_supabase_password

# Authentication
JWT_SECRET_KEY=your_secure_32_character_random_string

# AI Features
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Launch the Ecosystem
Run the orchestration command from the root directory. Docker will build the Java microservices, execute the Flyway SQL migrations against Supabase, compile the React frontend, and establish the internal bridge network.
```bash
docker-compose up --build
```



## 🗺️ Roadmap: System Expansion

The microservice foundation makes adding new campus features highly modular. 

**Upcoming Milestones:**
- [ ] **Academic Resource Hub:** Integrate Google Cloud Storage (GCS) buckets to host and serve previous year question papers and departmental study materials directly through the Academic Service.
- [ ] **Automated CI/CD:** Implement GitHub Actions matrix strategies to build, test, and push multi-architecture Docker images directly to GCP Artifact Registry.
- [ ] **Notification Engine:** Plug in an asynchronous message broker (Kafka) for real-time placement alerts.
- [ ] **Production Telemetry & FinOps:** Scale the system to handle live campus traffic and deploy [Green Kube](https://github.com/Karimullah-1303/green-kube) (our custom Kubernetes operator) into the cluster to actively observe resource usage, prevent cloud waste, and optimize HPA limits in real-time.

## 👨‍💻 About the Developer

I am a 3rd-year CSE Core student based in Visakhapatnam with a deep, sustained focus on DevOps, Site Reliability Engineering (SRE), and Cloud Computing. I built Clutch to move beyond basic CRUD applications, specifically tackling real-world distributed systems challenges, configuration as code, and serverless container orchestration.

I am actively looking for a DevOps, SRE, or Software Engineering Internship! Let's connect:

[LinkedIn](www.linkedin.com/in/karimullah-shaik-680139290)

