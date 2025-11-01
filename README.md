# participium-team-4

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
├── prisma/                   - Prisma: schema.prisma, migrations, seed scripts (contains DB models)
├── src/
│   ├── app/                  - Next.js App Router: pages, layouts, API routes (add other folders inside to create pages)
│   │   ├── components/       - Reusable React components (UI)
│   │   └── lib/              - Business & infrastructure (controllers, services, repositories, etc.)
│   │       ├── controllers/  - HTTP orchestration: request mapping → services
│   │       ├── services/     - Domain logic / use-cases
│   │       ├── repositories/ - Data access (DB / API abstraction)
│   │       ├── dtos/         - Zod schemas for input/output validation
│   │       ├── models/       - Domain/business models (only to use if different from Prisma models)
│   │       ├── db/           - Prisma client instance and DB connection
│   │       ├── utils/        - Helpers, logger, generic utilities
│   │       ├── middlewares/  - Error handling, auth guards, wrappers
│   │       └── types/        - Global TypeScript types / definitions
│   └── styles/               - CSS / global styles
├── tests/                    - test/unit, test/integration, e2e
├── scripts/                  - Utility scripts: migrate, seed, etc.
└── .github/                  - CI/CD workflows, issue/PR templates