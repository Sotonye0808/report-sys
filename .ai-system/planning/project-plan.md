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
- [x] Dynamic org hierarchy (group+campus) with editable tree and modal form
- [x] Strong form persistence behavior with config-driven override and rehydration guard (report forms)
- [x] Analytics draft filtering and aggregation status filtering
- [x] Goals template grouping with per-campus collapsibles and apply-all behavior

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

## Phase 6 — Advanced Flexibility & Analytics

> **Section summary:** Future-facing enhancements for admin control, data entry optimization, and deeper analytical insights.

- [x] Admin-editable configuration system (migrate roles, hierarchy level definitions, and mappings to be config-driven and admin-editable) — substrate landed 2026-04-29; runtime Role + polymorphic OrgUnit + public-copy substrates landed 2026-05-05/06.
- [x] Quick form interface for ushers/data entry (metric-specific exposure and simplified input fields) — landed; quick-form blank-list edge cases (visibility + null orgGroupId) closed 2026-05-05/06.
- [x] Simplified analytical views for various roles with clear insights and statistics — InsightSummary + correlation widgets + scope-overview dashboards.
- [x] Flexible report and metric comparison with automated correlations and insights — Compare metrics + Compare reports tabs under /analytics.
- [x] Excel/Spreadsheet import (mapping abstract values to metrics and templates) — CSV + XLSX flows, multi-sheet picker, friendly parse errors.
- [x] PWA installation notice and optimized PWA onboarding — install banner + push prompt + dismissal API.
- [x] Auto-invite with optimized UI/UX via query parameter links and redirects — sanitised /join redirect targets.
- [x] Multi-tree polymorphic hierarchy — `OrgUnit` substrate with self-FK + `rootKey` supports parallel trees (Group→Campus alongside Department→…) without breaking existing data.
- [x] Plain-language public copy + admin entry point — landing/how-it-works/about/privacy/terms editable via Admin Config with jargon-free fallbacks; SUPERADMIN-only "Edit page copy" CTA on every public page.
- [x] Name resolution everywhere — `useEntityNames` hook + `/api/labels/resolve` route + audit script ensure raw FK UUIDs never render to users.

---

## Completed

> **Section summary:** Features fully shipped. Archived here for reference.

- [x] [Completed item]
