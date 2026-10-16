# DevOps Dojo

From sysadmin to DevOps engineer, one 10-minute chapter a day.

Forty chapters in eight parts:

- The DevOps mindset
- Fundamentals: Linux, networking, shell, YAML, SSH
- Git
- Containers and Docker Compose
- CI/CD: GitHub Actions, GitLab CI, Jenkins
- Infrastructure as code: Ansible, AWS, Terraform
- Kubernetes and Helm
- Running clusters in production

Each chapter starts from a situation a sysadmin knows and walks a diagram one step at a time. Then it shows a real open-source file at a fixed commit, and ends with a small exercise and three questions. Questions you answer come back 1, 3, 7, 21 and 45 days later. Progress stays in your browser.

## Run it

```sh
npm install
npm run dev
```

## Add a chapter

A chapter is one file in `src/lib/chapters/`, named `NN-slug.js`. The number is the day. The `Chapter` type in `src/lib/chapters/index.js` lists the fields. Diagrams are Mermaid flowchart lines, shown one step at a time.

Every claim about a codebase links to the source at a fixed commit.

## Deploy

A push to `main` checks and builds the site (`.github/workflows/deploy.yml`). When the repo is public, it also publishes it to GitHub Pages. Any static host works too: `npm run build` writes the site to `build/`. Set `BASE_PATH` when the site is served from a sub-path.
