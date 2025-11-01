# participium-team-4

## Branch Name Conventions and Workflow

When working on an issue, create a branch based on the name of the issue. The usual convention is like this:

`<type>/<issue-number>-<short-description>`

where type should be one of the following: 
* `feature/` - New features or enhancements
* `fix/` - Bug fixes
* `docs/` - Documentation updates
* `test/` - Branch that implements tests

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

* `dev` - For `feature/`, `fix/`, `docs/`, and `test/` branches
* `QA` - For quality assurance and testing
* `main` - Production-ready code

The merge workflow should be: `dev` → `QA` after a feature or fix is implemented, and after passing all tests, `QA` → `main`


## Folder Structure

participium
├── src/
│   ├── app/                  - Next.js App Router: pages, layouts, API routes
│   │   ├── components/       - Reusable React components (UI)
│   │   └── lib/              - Business & infrastructure (controllers, services, repositories, etc.)
│   │       ├── controllers/  - HTTP orchestration: request mapping → services
│   │       ├── services/     - Domain logic / use-cases
│   │       ├── repositories/ - Data access (DB / API abstraction)
│   │       ├── dtos/         - Zod schemas for input/output validation
│   │       ├── models/       - Domain models / persistent types
│   │       ├── db/           - Prisma: schema, client and DB setup
│   │       ├── utils/        - Helpers, logger, generic utilities
│   │       └── middlewares/  - Error handling, auth guards, wrappers
│   ├── hooks/                - React hooks (client/server)
│   ├── styles/               - CSS / global styles
│   └── types/                - Global TypeScript types / definitions
├── tests/                    - test/unit, test/integration, e2e
├── scripts/                  - Utility scripts: migrate, seed, etc.
└── .github/                  - CI/CD workflows, issue/PR templates