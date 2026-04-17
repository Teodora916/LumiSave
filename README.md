# LumiSave

LumiSave is a full-stack e-commerce and utility platform built with a .NET 8 Backend and a modern React/Vite Frontend. It features an automated lighting and smart home calculator interface alongside standard shop functionality, seamlessly orchestrated using Docker containers.

## 🚀 Quick Start Guide

This project is set up with Docker Compose to provide a lightning-fast "one-click" development environment.

### To Start the Application
Simply run the custom boot script from the root of the project:
```powershell
.\start-dev.ps1
```
*This script automatically builds your container images, wires up the postgres database with your backend and frontend, and safely launches your browser directly to the Frontend and Backend API Swagger docs.*

### To Stop the Application
When you are done working, safely tear down the containers by running:
```powershell
docker compose down
```

### To View Live Logs
If you want to view live logs (such as incoming api requests or compilation errors) while the app is running in the background, run:
```powershell
docker compose logs -f
```

---

## 🛠️ Technology Stack

**Frontend**
- React 19 + Vite
- TailwindCSS v4 (configured directly via CSS `@theme` tags)
- Zustand (State Management)
- Shadcn UI + Radix UI Primitives 
- React Hook Form + Zod (Validation)

**Backend (.NET 8)**
- Clean Architecture implementation (Domain, Application, Infrastructure, API)
- Entity Framework Core
- PostgreSQL integration
- Stripe Payment Webhooks
- JWT Authentication

**Infrastructure**
- Docker Compose Orchestration (PostgreSQL 18, .NET API, Node/Vite instances)
- Hot Reloading enabled for both `.NET Watch` and `Vite Server`.

## 📁 Project Structure

- `/frontend` - Your Vite React Application
- `/backend` - Your monolithic .NET Solution, strictly separated by Domain concerns.
- `docker-compose.yaml` - Orchestration schema connecting the Frontend, Backend, and DB.
