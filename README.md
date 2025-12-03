# participium-team-4

## Deployment Instructions

This repository contains the **Participium** project with all the required services:

- Backend (`participium`)
- Telegram Bot (`telegram_bot`)
- PostgreSQL Database (`db` and `test_db`)

The project is ready to be run via **Docker Compose** and can be deployed by third parties.

## Requirements

- Docker ≥ 20.x
- Docker Compose ≥ 2.x


## Quick Start

1. **Clone the repository**:

```bash
git clone https://github.com/SergioM-98/Participium-Team-4.git
cd Participium-Team-4
```

2. **Set up environment variables**:
	- Copy `.env.example` to `.env` in the root (or create `.env` manually) and fill in the required values (e.g. `BOT_TOKEN`, `DATABASE_URL`, etc.).

3. **Start all services with Docker Compose**:

```bash
docker compose pull
docker compose up -d
```

4. Verify that the containers are running:

```bash
docker ps
```

5. **Access the application**:
	- Backend: [http://localhost:3000](http://localhost:3000)
	- The Telegram bot will respond to messages if the token is valid.

## User Credentials

| Username | Password             | Role                               |
| -------- | -------------------- | ---------------------------------- |
| admin    | adminTeam4           | ADMIN                              |
| mcurie   | tOfficerTeam4        | TECHNICAL_OFFICER                  |
| arossi   | PrOfficerTeam4       | PUBLIC_RELATIONS_OFFICER           |
| everdi   | extMaintWithTeam4    | EXTERNAL_MAINTAINER_WITH_ACCESS    |
| gbianchi | extMaintWithoutTeam4 | EXTERNAL_MAINTAINER_WITHOUT_ACCESS |
| mneri    | citizenTeam4         | CITIZEN                            |

### Notes

- **Admin**: Administrator account enabled to create Officer and External Maintainer accounts
- **Technical Officer**: Responsible for technical management of reports
- **Public Relations Officer**: Responsible for reports approval or rejection
- **External Maintainer With Access**: Has access to Participium
- **External Maintainer Without Access**: Has no access to Participium
- **Citizen**: Can create reports


## Dockerhub

It is also possible to launch the project through Dockerhub, using the commands:

```bash
docker run -d --name participium skeitt/participium-team-4:latest
docker run -d --name participium_bot skeitt/participium-team-4-bot:latest
```

## Available Services

| Service      | Local Port | Description   |
| ------------ | ---------- | ------------- |
| participium  | 3000       | Main backend  |
| telegram_bot | -          | Telegram bot  |
| db           | 5432       | Main Database |
| test_db      | 5433       | Test Database |

## Important Notes

- Data is persisted via Docker volumes (pgdata and pgdata_test)
- The backend uses DATABASE_URL to connect to the database
- End users do not need to build, just run docker compose pull && docker compose up


## For Maintainers

### Branch Name Conventions and Workflow

When working on an issue, create a branch based on the name of the issue. The usual convention is like this:

`<type>/<issue-number>-<short-description>`

where type should be one of the following:

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Branch that implements tests

The issue number is the ID of the issue assigned by GitHub.

When committing, use this format:

`<type>: <description> #<issue-id>`

This should allow GitHub to track the commits you are making in the project issue.

I report for help the convention of names for the type of commits: https://www.conventionalcommits.org/en/v1.0.0/

The basic workflow should be:

1. **Create branch** - Create a new branch based on the assigned GitHub issue
2. **Develop** - Work on the branch to resolve the issue requirements
3. **Create Pull Request** - Start a Pull Request to merge your branch into the standard branch when development is complete
4. **Request Review** - Assign the reviewer in YouTrack as reviewer for your Pull Request
5. **Address Feedback** - If the reviewer identifies issues, solve them and notify the reviewer to re-review
6. **Merge** - Once approved, the reviewer merges the branch into the standard branch. If the reviewer finds other problems, repeat step 5
7. **Cleanup** - Ensure the branch is deleted after successful merge

Standard branches are:

- `dev` - For `feature/`, `fix/`, `docs/`, and `test/` branches
- `QA` - For quality assurance and testing
- `main` - Production-ready code

The merge workflow should be: `dev` → `QA` after a feature or fix is implemented, and after passing all tests, `QA` → `main`

### Folder Structure

```
participium-team-4/
├── .github/                  # CI/CD workflows, issue/PR templates
├── prisma/                   # Prisma: schema.prisma, migrations, seed scripts (contains DB models)
├── scripts/                  # Utility scripts: migrate, seed, etc.
├── src/
│   ├── app/                  # Next.js App Router: pages, layouts, API routes
│   │   ├── components/       # Reusable React components (UI)
│   │   └── lib/              # Business & infrastructure layer
│   │       ├── controllers/  # HTTP orchestration: request mapping → services
│   │       ├── services/     # Domain logic / use-cases
│   │       ├── repositories/ # Data access (DB / API abstraction)
│   │       ├── dtos/         # Zod schemas for input/output validation
│   │       ├── models/       # Domain/business models (if different from Prisma models)
│   │       ├── db/           # Prisma client instance and DB connection
│   │       ├── utils/        # Helpers, logger, generic utilities
│   │       ├── middlewares/  # Error handling, auth guards, wrappers
│   │       └── types/        # Global TypeScript types / definitions
│   └── styles/               # CSS / global styles
└── tests/                    # test/unit, test/integration, e2e
```

### Docker build images

To build and push images for both amd64 and arm64 (Apple Silicon, Raspberry Pi, etc.):

```bash
# Create and use a new builder if you haven't already
docker buildx create --use --name participium-builder

# Build and push the backend image
cd participium
docker buildx build --platform linux/amd64,linux/arm64 -t your_username/participium:latest --push .
cd ..

# Build and push the bot image
cd bot
docker buildx build --platform linux/amd64,linux/arm64 -t your_username/participium-team-4-bot:latest --push .
cd ..
```

> Replace `your_username` with your Docker Hub username.
> The `--push` flag uploads the image directly to Docker Hub for both architectures.

> This README allows anyone to launch the entire system with a single command and without local compilation.
