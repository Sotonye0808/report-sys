# config/

## Purpose

Application configuration and business rules. This folder contains the single source of truth for roles, navigation, routes, report templates, and content strings used throughout the UI.

## Key Files

- `config/routes.ts` — Route definitions and URL builders used by pages and navigation.
- `config/roles.ts` — Role configuration and capability matrix for all user roles.
- `config/reports.ts` — Default report template, status transitions, deadline configuration, and report-related constants.
- `config/content.ts` — All user-facing copy strings (labels, messages, headings) organized by feature.
- `config/hierarchy.ts` — Organization structure config (Campus → OrgGroup) and helper utilities.

## Notes

- Config files are pure data; they do not import React or UI components.
- Changes to config may require UI adjustments (e.g., adding a new user role should update navigation and permissions).
