/**
 * types/global.ts
 *
 * Single runtime module for all domain enums, constants, AND global interface
 * declarations. Bundlers (Turbopack/webpack) can import enum values from this
 * file. The declare global {} block augments the global TypeScript scope for
 * all files that transitively import this module.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export enum UserRole {
    SUPERADMIN = "SUPERADMIN",
    SPO = "SPO",
    CEO = "CEO",
    CHURCH_MINISTRY = "CHURCH_MINISTRY",
    GROUP_PASTOR = "GROUP_PASTOR",
    GROUP_ADMIN = "GROUP_ADMIN",
    CAMPUS_PASTOR = "CAMPUS_PASTOR",
    CAMPUS_ADMIN = "CAMPUS_ADMIN",
    DATA_ENTRY = "DATA_ENTRY",
    MEMBER = "MEMBER",
}

export enum ReportStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    REQUIRES_EDITS = "REQUIRES_EDITS",
    APPROVED = "APPROVED",
    REVIEWED = "REVIEWED",
    LOCKED = "LOCKED",
}

export enum ReportEventType {
    CREATED = "CREATED",
    SUBMITTED = "SUBMITTED",
    EDIT_REQUESTED = "EDIT_REQUESTED",
    EDIT_SUBMITTED = "EDIT_SUBMITTED",
    EDIT_APPROVED = "EDIT_APPROVED",
    EDIT_REJECTED = "EDIT_REJECTED",
    EDIT_APPLIED = "EDIT_APPLIED",
    APPROVED = "APPROVED",
    REVIEWED = "REVIEWED",
    LOCKED = "LOCKED",
    DEADLINE_PASSED = "DEADLINE_PASSED",
    UPDATE_REQUESTED = "UPDATE_REQUESTED",
    UPDATE_APPROVED = "UPDATE_APPROVED",
    UPDATE_REJECTED = "UPDATE_REJECTED",
    DATA_ENTRY_CREATED = "DATA_ENTRY_CREATED",
    TEMPLATE_VERSION_NOTE = "TEMPLATE_VERSION_NOTE",
    AUTO_APPROVED = "AUTO_APPROVED",
}

export enum ReportPeriodType {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

export enum MetricFieldType {
    NUMBER = "NUMBER",
    PERCENTAGE = "PERCENTAGE",
    TEXT = "TEXT",
    CURRENCY = "CURRENCY",
}

export enum ReportEditStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum ReportUpdateRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum NotificationType {
    REPORT_SUBMITTED = "REPORT_SUBMITTED",
    REPORT_EDIT_REQUESTED = "REPORT_EDIT_REQUESTED",
    REPORT_APPROVED = "REPORT_APPROVED",
    REPORT_REVIEWED = "REPORT_REVIEWED",
    REPORT_LOCKED = "REPORT_LOCKED",
    REPORT_EDIT_SUBMITTED = "REPORT_EDIT_SUBMITTED",
    REPORT_EDIT_APPROVED = "REPORT_EDIT_APPROVED",
    REPORT_EDIT_REJECTED = "REPORT_EDIT_REJECTED",
    REPORT_UPDATE_REQUESTED = "REPORT_UPDATE_REQUESTED",
    REPORT_UPDATE_APPROVED = "REPORT_UPDATE_APPROVED",
    REPORT_UPDATE_REJECTED = "REPORT_UPDATE_REJECTED",
    REPORT_DEADLINE_REMINDER = "REPORT_DEADLINE_REMINDER",
    GOAL_UNLOCK_REQUESTED = "GOAL_UNLOCK_REQUESTED",
    GOAL_UNLOCK_APPROVED = "GOAL_UNLOCK_APPROVED",
    GOAL_UNLOCK_REJECTED = "GOAL_UNLOCK_REJECTED",
}

export enum MetricCalculationType {
    SUM = "SUM",
    AVERAGE = "AVERAGE",
    SNAPSHOT = "SNAPSHOT",
}

export enum GoalMode {
    ANNUAL = "ANNUAL",
    MONTHLY = "MONTHLY",
    CAMPUS_OVERRIDE = "CAMPUS_OVERRIDE",
}

export enum GoalEditRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum InviteLinkType {
    CAMPUS = "CAMPUS",
    GROUP = "GROUP",
    DIRECT = "DIRECT",
}

// ─────────────────────────────────────────────────────────────────────────────
// RUNTIME CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const HIERARCHY_ORDER: Record<UserRole, number> = {
    [UserRole.SUPERADMIN]: 0,
    [UserRole.SPO]: 1,
    [UserRole.CEO]: 2,
    [UserRole.CHURCH_MINISTRY]: 3,
    [UserRole.GROUP_PASTOR]: 4,
    [UserRole.GROUP_ADMIN]: 5,
    [UserRole.CAMPUS_PASTOR]: 6,
    [UserRole.CAMPUS_ADMIN]: 7,
    [UserRole.DATA_ENTRY]: 8,
    [UserRole.MEMBER]: 9,
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL INTERFACE DECLARATIONS
// declare global {} augments the global TypeScript namespace. Because this file
// is a module (has exports), declare global is a module augmentation and is
// activated for all files that import this module directly or transitively.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
    interface AuthUser {
        id: string;
        email: string;
        role: UserRole;
        campusId?: string;
        orgGroupId?: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    }

    interface AuthContextValue {
        user: AuthUser | null;
        isLoading: boolean;
        login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
        logout: () => Promise<void>;
        refreshToken: () => Promise<void>;
    }

    interface UserProfile {
        id: string;
        organisationId?: string;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        gender?: Gender;
        role: UserRole;
        campusId?: string;
        groupId?: string;
        orgGroupId?: string;
        avatar?: string;
        avatarUrl?: string;
        passwordHash?: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface CreateUserInput {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        campusId?: string;
        orgGroupId?: string;
        phone?: string;
        gender?: Gender;
    }

    interface UpdateUserInput {
        firstName?: string;
        lastName?: string;
        phone?: string;
        gender?: Gender;
        avatar?: string;
        campusId?: string;
        orgGroupId?: string;
    }

    interface ChangePasswordInput {
        currentPassword: string;
        newPassword: string;
    }

    interface OrgUnitBase {
        id: string;
        name: string;
        description?: string;
        orgLevel: "GROUP" | "CAMPUS";
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        leaderId?: string;
        adminId?: string;
        country?: string;
        location?: string;
        address?: string;
        phone?: string;
        memberCount?: number;
        inviteCode?: string;
    }

    interface OrgGroup extends OrgUnitBase {
        orgLevel: "GROUP";
        country: string;
        leaderId: string;
    }

    interface Campus extends OrgUnitBase {
        orgLevel: "CAMPUS";
        parentId: string;
        adminId?: string;
        country: string;
        location: string;
    }

    interface OrgGroupWithDetails extends OrgGroup {
        campuses: Campus[];
        leader?: UserProfile;
    }

    interface CampusWithDetails extends Campus {
        orgGroup?: OrgGroup;
        admin?: UserProfile;
    }

    interface CreateOrgGroupInput {
        name: string;
        description?: string;
        country: string;
        leaderId?: string;
    }

    interface CreateCampusInput {
        name: string;
        description?: string;
        parentId: string;
        country: string;
        location: string;
        adminId?: string;
        phone?: string;
        address?: string;
    }

    interface ReportTemplate {
        id: string;
        organisationId: string;
        name: string;
        description?: string;
        version: number;
        sections: ReportTemplateSection[];
        isActive: boolean;
        isDefault: boolean;
        createdById: string;
        campusId?: string;
        orgGroupId?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportTemplateSection {
        id: string;
        templateId: string;
        name: string;
        description?: string;
        order: number;
        isRequired: boolean;
        metrics: ReportTemplateMetric[];
    }

    interface ReportTemplateMetric {
        id: string;
        sectionId: string;
        name: string;
        description?: string;
        fieldType: MetricFieldType;
        calculationType: MetricCalculationType;
        isRequired: boolean;
        minValue?: number;
        maxValue?: number;
        order: number;
        capturesGoal: boolean;
        capturesAchieved: boolean;
        capturesYoY: boolean;
    }

    interface ReportTemplateVersion {
        id: string;
        templateId: string;
        versionNumber: number;
        snapshot: ReportTemplate;
        createdAt: string;
        createdById: string;
    }

    interface CreateReportTemplateInput {
        name: string;
        description?: string;
        sections: CreateTemplateSectionInput[];
        campusId?: string;
        orgGroupId?: string;
    }

    interface CreateTemplateSectionInput {
        name: string;
        description?: string;
        order: number;
        isRequired: boolean;
        metrics: CreateTemplateMetricInput[];
    }

    interface CreateTemplateMetricInput {
        name: string;
        description?: string;
        fieldType: MetricFieldType;
        calculationType: MetricCalculationType;
        isRequired: boolean;
        minValue?: number;
        maxValue?: number;
        order: number;
        capturesGoal: boolean;
        capturesAchieved: boolean;
        capturesYoY: boolean;
    }

    interface Report {
        id: string;
        organisationId?: string;
        title?: string;
        templateId: string;
        templateVersionId: string;
        campusId: string;
        orgGroupId: string;
        period?: string;
        periodType: ReportPeriodType;
        periodYear: number;
        periodMonth?: number;
        periodWeek?: number;
        status: ReportStatus;
        createdById?: string;
        submittedById?: string;
        reviewedById?: string;
        approvedById?: string;
        deadline?: string | null;
        lockedAt?: string;
        isDataEntry: boolean;
        dataEntryById?: string;
        dataEntryDate?: string;
        notes?: string;
        sections?: unknown[];
        createdAt: string;
        updatedAt: string;
    }

    interface ReportSection {
        id: string;
        reportId: string;
        templateSectionId: string;
        sectionName: string;
        metrics: ReportMetric[];
    }

    interface ReportMetric {
        id: string;
        reportSectionId: string;
        templateMetricId: string;
        metricName: string;
        calculationType: MetricCalculationType;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        computedPercentage?: number;
        isLocked: boolean;
        lockedAt?: string;
        lockedById?: string;
        comment?: string;
    }

    interface ReportWithDetails extends Report {
        template?: ReportTemplate;
        sections: ReportSectionWithMetrics[];
        campus?: Campus;
        orgGroup?: OrgGroup;
        submittedBy?: UserProfile;
        reviewedBy?: UserProfile;
        approvedBy?: UserProfile;
    }

    interface ReportSectionWithMetrics extends ReportSection {
        metrics: ReportMetric[];
    }

    interface ReportFilters {
        campusId?: string;
        orgGroupId?: string;
        periodType?: ReportPeriodType;
        periodYear?: number;
        periodMonth?: number;
        status?: ReportStatus;
        templateId?: string;
        isDataEntry?: boolean;
        search?: string;
        page?: number;
        pageSize?: number;
    }

    interface ReportFormValues {
        sections: ReportSectionFormValues[];
        notes?: string;
    }

    interface ReportSectionFormValues {
        templateSectionId: string;
        metrics: ReportMetricFormValues[];
    }

    interface ReportMetricFormValues {
        templateMetricId: string;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        comment?: string;
    }

    interface ReportEdit {
        id: string;
        reportId: string;
        submittedById: string;
        status: ReportEditStatus;
        reason: string;
        sections: ReportEditSection[];
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportEditSection {
        id: string;
        editId: string;
        templateSectionId: string;
        metrics: ReportEditMetric[];
    }

    interface ReportEditMetric {
        id: string;
        editSectionId: string;
        templateMetricId: string;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        comment?: string;
    }

    interface ReportUpdateRequest {
        id: string;
        reportId: string;
        requestedById: string;
        reason: string;
        sections: ReportUpdateSection[];
        status: ReportUpdateRequestStatus;
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportUpdateSection {
        templateSectionId: string;
        metrics: ReportEditMetric[];
    }

    interface ReportEvent {
        id: string;
        reportId: string;
        eventType: ReportEventType;
        actorId: string;
        timestamp: string;
        details?: string;
        previousStatus?: ReportStatus;
        newStatus?: ReportStatus;
        snapshotId?: string;
    }

    interface ReportVersion {
        id: string;
        reportId: string;
        versionNumber: number;
        snapshot: ReportWithDetails;
        createdAt: string;
        createdById: string;
        reason?: string;
    }

    interface Goal {
        id: string;
        campusId: string;
        templateMetricId: string;
        metricName: string;
        mode: GoalMode;
        year: number;
        month?: number;
        targetValue: number;
        isLocked: boolean;
        lockedAt?: string;
        lockedById?: string;
        createdById: string;
        createdAt: string;
        updatedAt: string;
    }

    interface GoalEditRequest {
        id: string;
        goalId: string;
        requestedById: string;
        reason: string;
        proposedValue: number;
        status: GoalEditRequestStatus;
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface MetricEntry {
        id: string;
        reportMetricId: string;
        templateMetricId: string;
        campusId: string;
        year: number;
        month: number;
        goalValue?: number;
        achievedValue?: number;
        comment?: string;
        computedPercentage?: number;
        createdAt: string;
    }

    interface ReportAnalytics {
        campusId?: string;
        orgGroupId?: string;
        period: string;
        totalReports: number;
        submittedOnTime: number;
        submittedLate: number;
        pendingReview: number;
        approved: number;
        complianceRate: number;
    }

    interface KpiCardConfig {
        id: string;
        title: string;
        value: string | number;
        trend?: string;
        trendDirection?: "up" | "down" | "neutral";
        icon?: string;
        colorClass?: string;
        allowedRoles: UserRole[];
    }

    interface AppNotification {
        id: string;
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
        reportId?: string;
        read: boolean;
        isRead?: boolean;
        readAt?: string;
        createdAt: string;
    }

    interface RoleConfig {
        role: UserRole;
        label: string;
        hierarchyOrder: number;
        dashboardRoute: string;
        dashboardMode: "report-fill" | "report-review" | "report-reviewed" | "analytics" | "system";
        canCreateReports: boolean;
        canFillReports: boolean;
        canSubmitReports: boolean;
        canRequestEdits: boolean;
        canApproveReports: boolean;
        canMarkReviewed: boolean;
        canLockReports: boolean;
        canManageTemplates: boolean;
        canDataEntry: boolean;
        canManageUsers: boolean;
        canManageOrg: boolean;
        canSetGoals: boolean;
        canApproveGoalUnlock: boolean;
        reportVisibilityScope: "own" | "campus" | "all";
    }

    interface OrgLevelConfig {
        level: "GROUP" | "CAMPUS";
        label: string;
        parentLevel?: "GROUP";
        childLevel?: "CAMPUS";
        leaderRole: UserRole;
        adminRole?: UserRole;
    }

    interface NavItem {
        key: string;
        label: string;
        href: string;
        icon?: React.ComponentType;
        allowedRoles: UserRole[];
        badge?: number;
    }

    interface InviteLink {
        id: string;
        token: string;
        type: InviteLinkType;
        targetId?: string;
        role?: UserRole;
        targetRole?: UserRole;
        campusId?: string;
        groupId?: string;
        note?: string;
        createdById: string;
        usedAt?: string;
        expiresAt?: string;
        isActive: boolean;
        createdAt: string;
    }

    type ApiResponse<T> =
        | { success: true; data: T }
        | { success: false; error: string; code: number };

    interface PaginatedResponse<T> {
        data: T[];
        total: number;
        page: number;
        pageSize: number;
    }

    interface AppContent {
        nav: Record<string, string>;
        auth: Record<string, unknown>;
        reports: Record<string, unknown>;
        templates: Record<string, unknown>;
        goals: Record<string, unknown>;
        dashboard: Record<string, unknown>;
        users: Record<string, unknown>;
        org: Record<string, unknown>;
        analytics: Record<string, unknown>;
        notifications: Record<string, unknown>;
        profile: Record<string, unknown>;
        invites: Record<string, unknown>;
        settings: Record<string, unknown>;
        errors: Record<string, unknown>;
        common: Record<string, unknown>;
        offline: Record<string, unknown>;
    }
}
