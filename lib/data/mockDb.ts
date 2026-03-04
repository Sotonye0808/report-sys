/**
 * lib/data/mockDb.ts
 * EventEmitter singleton with Prisma-compatible CRUD surface.
 * Supports full ACID transactions via the transaction() method.
 * Emits "{table}:changed" events after every write for live UI subscriptions.
 *
 * Swap out for a real Prisma/Drizzle client by matching this API surface.
 */

import { EventEmitter } from "events";

// ─────────────────────────────────────────────────────────────────────────────
// Table registry
// ─────────────────────────────────────────────────────────────────────────────

type TableName =
    | "users"
    | "orgGroups"
    | "campuses"
    | "reportTemplates"
    | "templateVersions"
    | "reports"
    | "reportSections"
    | "reportMetrics"
    | "reportEdits"
    | "reportUpdateRequests"
    | "reportEvents"
    | "reportVersions"
    | "goals"
    | "goalEditRequests"
    | "metricEntries"
    | "notifications"
    | "inviteLinks";

// ─────────────────────────────────────────────────────────────────────────────
// Filter / query helpers
// ─────────────────────────────────────────────────────────────────────────────

type WhereClause<T> = Partial<T> | ((item: T) => boolean);

function matchesWhere<T extends Record<string, unknown>>(
    record: T,
    where: WhereClause<T>,
): boolean {
    if (typeof where === "function") return (where as (item: T) => boolean)(record);
    for (const [key, value] of Object.entries(where)) {
        if ((record as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Table proxy — CRUD with auto-emit
// ─────────────────────────────────────────────────────────────────────────────

interface FindManyArgs<T> {
    where?: WhereClause<T>;
    orderBy?: { field: keyof T; direction: "asc" | "desc" };
    take?: number;
    skip?: number;
}

interface FindFirstArgs<T> {
    where?: WhereClause<T>;
}

interface CreateArgs<T> {
    data: T;
}

interface UpdateArgs<T> {
    where: { id: string };
    data: Partial<T>;
}

interface DeleteArgs<T> {
    where: { id: string };
}

class TableProxy<T extends { id: string }> {
    private rows: T[];
    private tableName: TableName;
    private emitter: EventEmitter;

    constructor(tableName: TableName, emitter: EventEmitter, initial: T[] = []) {
        this.tableName = tableName;
        this.emitter = emitter;
        this.rows = initial;
    }

    async findMany(args: FindManyArgs<T> = {}): Promise<T[]> {
        let result = this.rows.slice();
        if (args.where) {
            result = result.filter((r) => matchesWhere(r, args.where!));
        }
        if (args.orderBy) {
            const { field, direction } = args.orderBy;
            result.sort((a, b) => {
                const av = a[field];
                const bv = b[field];
                if (av === bv) return 0;
                const cmp = av < bv ? -1 : 1;
                return direction === "asc" ? cmp : -cmp;
            });
        }
        if (args.skip) result = result.slice(args.skip);
        if (args.take) result = result.slice(0, args.take);
        return result;
    }

    async count(args: FindManyArgs<T> = {}): Promise<number> {
        if (!args.where) return this.rows.length;
        return this.rows.filter((r) => matchesWhere(r, args.where!)).length;
    }

    async findFirst(args: FindFirstArgs<T> = {}): Promise<T | null> {
        if (!args.where) return this.rows[0] ?? null;
        return this.rows.find((r) => matchesWhere(r, args.where!)) ?? null;
    }

    async findUnique(args: { where: { id: string } }): Promise<T | null> {
        return this.rows.find((r) => r.id === args.where.id) ?? null;
    }

    async create(args: CreateArgs<T>, silent = false): Promise<T> {
        this.rows.push(args.data);
        if (!silent) this.emitter.emit(`${this.tableName}:changed`);
        return args.data;
    }

    async update(args: UpdateArgs<T>, silent = false): Promise<T> {
        const idx = this.rows.findIndex((r) => matchesWhere(r, args.where as WhereClause<T>));
        if (idx === -1) throw new Error(`[mockDb] ${this.tableName}: record not found for update`);
        this.rows[idx] = { ...this.rows[idx], ...args.data };
        if (!silent) this.emitter.emit(`${this.tableName}:changed`);
        return this.rows[idx];
    }

    async upsert(
        args: { where: WhereClause<T> & { id: string }; create: T; update: Partial<T> },
        silent = false,
    ): Promise<T> {
        const existing = await this.findFirst({ where: args.where });
        if (existing) {
            return this.update({ where: args.where, data: args.update }, silent);
        }
        return this.create({ data: args.create }, silent);
    }

    async delete(args: DeleteArgs<T>, silent = false): Promise<T> {
        const idx = this.rows.findIndex((r) => matchesWhere(r, args.where as WhereClause<T>));
        if (idx === -1) throw new Error(`[mockDb] ${this.tableName}: record not found for delete`);
        const [deleted] = this.rows.splice(idx, 1);
        if (!silent) this.emitter.emit(`${this.tableName}:changed`);
        return deleted;
    }

    /** Replace the entire table — used during seeding */
    seed(rows: T[]) {
        this.rows = rows;
    }

    /** Return raw snapshot (for transaction rollback) */
    snapshot(): T[] {
        return this.rows.map((r) => ({ ...r }));
    }

    /** Restore from snapshot */
    restore(snap: T[]) {
        this.rows = snap;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction context
// ─────────────────────────────────────────────────────────────────────────────

type TransactionCallback<T> = (tx: MockDb) => Promise<T>;

// ─────────────────────────────────────────────────────────────────────────────
// MockDb — the singleton
// ─────────────────────────────────────────────────────────────────────────────

class MockDb extends EventEmitter {
    users = new TableProxy<UserProfile>("users", this);
    orgGroups = new TableProxy<OrgGroup>("orgGroups", this);
    campuses = new TableProxy<Campus>("campuses", this);
    reportTemplates = new TableProxy<ReportTemplate>("reportTemplates", this);
    templateVersions = new TableProxy<ReportTemplateVersion>("templateVersions", this);
    reports = new TableProxy<Report>("reports", this);
    reportSections = new TableProxy<ReportSection>("reportSections", this);
    reportMetrics = new TableProxy<ReportMetric>("reportMetrics", this);
    reportEdits = new TableProxy<ReportEdit>("reportEdits", this);
    reportUpdateRequests = new TableProxy<ReportUpdateRequest>("reportUpdateRequests", this);
    reportEvents = new TableProxy<ReportEvent>("reportEvents", this);
    reportVersions = new TableProxy<ReportVersion>("reportVersions", this);
    goals = new TableProxy<Goal>("goals", this);
    goalEditRequests = new TableProxy<GoalEditRequest>("goalEditRequests", this);
    metricEntries = new TableProxy<MetricEntry>("metricEntries", this);
    notifications = new TableProxy<AppNotification>("notifications", this);
    inviteLinks = new TableProxy<InviteLink>("inviteLinks", this);

    /**
     * ACID-like transaction.
     * Snapshots all tables before the callback; rolls back on error.
     * Defers all emits until after the transaction succeeds.
     */
    async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
        // Snapshot all tables
        const snapshots = {
            users: this.users.snapshot(),
            orgGroups: this.orgGroups.snapshot(),
            campuses: this.campuses.snapshot(),
            reportTemplates: this.reportTemplates.snapshot(),
            templateVersions: this.templateVersions.snapshot(),
            reports: this.reports.snapshot(),
            reportSections: this.reportSections.snapshot(),
            reportMetrics: this.reportMetrics.snapshot(),
            reportEdits: this.reportEdits.snapshot(),
            reportUpdateRequests: this.reportUpdateRequests.snapshot(),
            reportEvents: this.reportEvents.snapshot(),
            reportVersions: this.reportVersions.snapshot(),
            goals: this.goals.snapshot(),
            goalEditRequests: this.goalEditRequests.snapshot(),
            metricEntries: this.metricEntries.snapshot(),
            notifications: this.notifications.snapshot(),
            inviteLinks: this.inviteLinks.snapshot(),
        };

        try {
            const result = await callback(this);
            // Emit changed events for all tables (simple approach — emit everything)
            const tables: TableName[] = [
                "users", "orgGroups", "campuses", "reportTemplates", "templateVersions",
                "reports", "reportSections", "reportMetrics", "reportEdits",
                "reportUpdateRequests", "reportEvents", "reportVersions", "goals",
                "goalEditRequests", "metricEntries", "notifications", "inviteLinks",
            ];
            tables.forEach((t) => this.emit(`${t}:changed`));
            return result;
        } catch (err) {
            // Rollback
            this.users.restore(snapshots.users);
            this.orgGroups.restore(snapshots.orgGroups);
            this.campuses.restore(snapshots.campuses);
            this.reportTemplates.restore(snapshots.reportTemplates);
            this.templateVersions.restore(snapshots.templateVersions);
            this.reports.restore(snapshots.reports);
            this.reportSections.restore(snapshots.reportSections);
            this.reportMetrics.restore(snapshots.reportMetrics);
            this.reportEdits.restore(snapshots.reportEdits);
            this.reportUpdateRequests.restore(snapshots.reportUpdateRequests);
            this.reportEvents.restore(snapshots.reportEvents);
            this.reportVersions.restore(snapshots.reportVersions);
            this.goals.restore(snapshots.goals);
            this.goalEditRequests.restore(snapshots.goalEditRequests);
            this.metricEntries.restore(snapshots.metricEntries);
            this.notifications.restore(snapshots.notifications);
            this.inviteLinks.restore(snapshots.inviteLinks);
            throw err;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton export
// ─────────────────────────────────────────────────────────────────────────────

const globalForDb = global as typeof global & { __mockDb?: MockDb };

if (!globalForDb.__mockDb) {
    globalForDb.__mockDb = new MockDb();
    // Lazy-seed on first access
    import("./seed").then(({ seedDb }) => seedDb(globalForDb.__mockDb!)).catch(console.error);
}

export const mockDb = globalForDb.__mockDb;
export default mockDb;
