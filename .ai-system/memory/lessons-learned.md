# Lessons Learned

> **Overview:** Practical knowledge accumulated during development — things that worked well, things that didn't, and patterns worth repeating. Different from repair-system.md (which tracks errors); this file tracks development process insights and architectural wisdom.

---

## Entry Format

```
## [Lesson Title]

**Context:**
[What situation this came from]

**What We Learned:**
[The insight or pattern discovered]

**Apply When:**
[When future agents/developers should use this knowledge]
```

---

## Lessons

[Entries added here as lessons are discovered]

---

## Centralize Audit/Event Creation for Domain Actions

**Context:**
Multiple API routes in the reports module (submit, approve, lock, etc.) duplicate the same pattern: validate permissions, update the report, create a `ReportEvent`, and optionally emit related notifications.

**What We Learned:**
Creating a shared audit/event helper (e.g., `createReportEvent` or a generic `createAuditEvent`) reduces duplication, enforces consistent event data, and makes it easier to add new resources (templates, goals, etc.) without copying boilerplate.

**Apply When:**
When building a new workflow that needs history/audit tracking or notifications, implement the workflow through the shared helper instead of repeating the same `tx.reportEvent.create` logic.
