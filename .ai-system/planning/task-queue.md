# Development Task Queue

> **Overview:** Sprint-level task queue. Agents execute tasks top to bottom within the current sprint. When a task is completed, mark it [x] and add a checkpoint entry. Future tasks are queued below for prioritisation in the next sprint.

---

## Current Sprint

> **Section summary:** Tasks actively being worked on. Agents pick the first incomplete task.

- [x] Fix report template edit failures (500/504) + stabilize cache invalidation
- [x] Align auth session lifetime with env config and add automatic token refresh
- [ ] Add regression tests for report template API and auth refresh behavior
- [ ] Add regression tests for report unlock and audit trail visibility
- [x] Ensure superadmin (and other empowered roles) can edit/submit draft reports and see action buttons on report detail
- [x] Add unlock-report action + backend endpoint so superadmin can unlock & edit locked reports
- [x] Make “Add report” button always visible for superadmin and roles with create-report privilege

---

## Up Next

> **Section summary:** Tasks planned for the next sprint. Not yet started.

- [ ] [Queued task 1]
- [ ] [Queued task 2]

---

## Backlog

> **Section summary:** Known work that needs to be done but hasn't been scheduled yet.

- [ ] [Backlog item 1]
- [ ] [Backlog item 2]

---

## Completed This Sprint

> **Section summary:** Tasks finished in the current sprint. Cleared at sprint end and moved to dev-history.md.

- [x] Fix report template edit failures (500/504) + stabilize cache invalidation
- [x] Align auth session lifetime with env config and add automatic token refresh
- [x] Ensure superadmin (and other empowered roles) can edit/submit draft reports and see action buttons on report detail
- [x] Add unlock-report action + backend endpoint so superadmin can unlock & edit locked reports
- [x] Make “Add report” button always visible for superadmin and roles with create-report privilege
- [x] Add create report privilege to Office of CEO role

---

## Notes

[Any context agents need to know about current sprint constraints, blockers, or priorities]
