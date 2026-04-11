interface ReportOwnershipShape {
    createdById?: string | null;
    submittedById?: string | null;
    dataEntryById?: string | null;
}

export function isOwnScopedReport(report: ReportOwnershipShape, userId?: string | null): boolean {
    if (!userId) return false;
    return (
        report.createdById === userId ||
        report.submittedById === userId ||
        report.dataEntryById === userId
    );
}

export function buildOwnScopeCondition(userId: string) {
    return {
        OR: [
            { createdById: userId },
            { submittedById: userId },
            { dataEntryById: userId },
        ],
    };
}
