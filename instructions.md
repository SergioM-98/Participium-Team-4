# Participium - Deployment Instructions

## Description

This repository contains the **Participium** project with all the required services:

* Backend (`participium`)
* Telegram Bot (`telegram_bot`)
* PostgreSQL Database (`db` and `test_db`)

The project is ready to be run via **Docker Compose** and can be deployed by third parties.

## Requirements

* Docker ≥ 20.x
* Docker Compose ≥ 2.x

## Quick Start

1. Clone the repository:

```bash
git clone <REPO_URL>
cd participium
```

2. Create a .env file with the necessary variables (e.g., BOT_TOKEN):

```
BOT_TOKEN=tuo_token
```

3. Start all services:

```bash
docker compose pull
docker compose up -d
```

4. Verify that the containers are running:

```bash
docker ps
```

## Available Services

| Service      | Local Port   | Description         |
| ------------ | ------------ | ------------------- |
| participium  | 3000         | Main backend  |
| telegram_bot | -            | Telegram bot        |
| db           | 5432         | Main Database |
| test_db      | 5433         | Test Database   |

## Important Notes

* Data is persisted via Docker volumes (pgdata and pgdata_test)
* The backend uses DATABASE_URL to connect to the database
* End users do not need to build, just run docker compose pull && docker compose up

## For Maintainers (build and push images)

```bash
# Local build
docker compose build

# Tag images
docker tag participium:latest your_username/participium:latest
docker tag telegram_bot:latest your_username/telegram_bot:latest

# Push to Docker Hub
docker push your_username/participium:latest
docker push your_username/telegram_bot:latest
```

> This README allows anyone to launch the entire system with a single command and without local compilation.
