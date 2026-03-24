# Project Plan

> **Overview:** High-level feature checklist for the project. Agents update checkboxes as work is completed. Sections represent major development phases. See task-queue.md for granular, sprint-level tasks.

---

## Phase 1 — Foundation

> **Section summary:** Core infrastructure that everything else depends on.

- [ ] Repository structure and folder conventions established
- [ ] Configuration system implemented (env vars, config files)
- [ ] Logging framework in place
- [ ] Error handling middleware / global error boundaries
- [ ] CI/CD pipeline (if applicable)

---

## Phase 2 — Core Features

> **Section summary:** The primary features that define the product's value.

- [ ] [Feature 1]
- [ ] [Feature 2]
- [ ] [Feature 3]

---

## Phase 3 — Secondary Features

> **Section summary:** Supporting features that enhance the core experience.

- [ ] [Feature 4]
- [ ] [Feature 5]

---

## Phase 4 — Quality & Polish

> **Section summary:** Reliability, performance, and user experience improvements.

- [x] Unit test coverage for core modules (in progress; PRD core paths covered, new tests pending for workflow edge cases)
- [x] Integration tests for critical paths (base workflows validated; resilience tests pending)
- [ ] Performance audit and optimisation
- [ ] Accessibility audit
- [x] Error states and loading states complete (API endpoint error handling and offline fallback reviewed)

## Phase 5 — Launch Preparation

> **Section summary:** Final steps before production deployment.

- [x] Production environment configured (build verified for no `RESEND_API_KEY` and Prisma route fix)
- [ ] Security audit (auth, input validation, secrets)
- [ ] Documentation complete
- [ ] Deployment pipeline tested

---

## Phase 5 — Launch Preparation

> **Section summary:** Final steps before production deployment.

- [ ] Production environment configured
- [ ] Security audit (auth, input validation, secrets)
- [ ] Documentation complete
- [ ] Deployment pipeline tested

---

## Completed

> **Section summary:** Features fully shipped. Archived here for reference.

- [x] [Completed item]
