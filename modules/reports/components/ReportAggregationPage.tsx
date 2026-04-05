"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { message, Select, Space, Tag, Checkbox } from "antd";
import { ArrowLeftOutlined, DatabaseOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "antd";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportPeriodType, ReportStatus, UserRole } from "@/types/global";
import { exportAggregatedReport } from "@/lib/utils/exportReports";

const STATUS_OPTIONS = ["APPROVED", "REVIEWED", "SUBMITTED"] as ReportStatus[];

export function ReportAggregationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { role } = useRole();

  const [scopeType, setScopeType] = useState<"campus" | "group" | "all">("all");
  const [scopeId, setScopeId] = useState<string>("");
  const [periodType, setPeriodType] = useState<ReportPeriodType>(ReportPeriodType.MONTHLY);
  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
  const [periodMonth, setPeriodMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  const [periodWeek, setPeriodWeek] = useState<number | undefined>(undefined);
  const [templateId, setTemplateId] = useState<string>("");
  const [metricIds, setMetricIds] = useState<string[]>([]);
  const [includeDrafts, setIncludeDrafts] = useState<boolean>(true);
  const [includeStatuses, setIncludeStatuses] = useState<ReportStatus[]>([
    ...STATUS_OPTIONS,
    ReportStatus.LOCKED,
    ReportStatus.REQUIRES_EDITS,
  ]);

  const [previewResult, setPreviewResult] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  const aggregationContent = CONTENT.reports.aggregation as Record<string, string>;

  const isCampusRole = role === UserRole.CAMPUS_ADMIN || role === UserRole.CAMPUS_PASTOR;
  const isGroupRole = role === UserRole.GROUP_ADMIN || role === UserRole.GROUP_PASTOR;
  const isGlobalRole = !isCampusRole && !isGroupRole;

  const scopeOptions = useMemo(
    () => [
      { value: "campus", label: aggregationContent.scopeCampus },
      { value: "group", label: aggregationContent.scopeGroup },
      { value: "all", label: aggregationContent.scopeAll },
    ],
    [aggregationContent.scopeAll, aggregationContent.scopeCampus, aggregationContent.scopeGroup],
  );

  const { data: templates, loading: templatesLoading } = useApiData<ReportTemplate[]>(
    API_ROUTES.reportTemplates.list,
  );
  const { data: orgHierarchy, loading: hierarchyLoading } = useApiData<OrgGroupWithDetails[]>(
    API_ROUTES.org.hierarchy,
  );

  const scopeItems = useMemo(() => {
    if (!orgHierarchy) return [];
    if (scopeType === "group") {
      return orgHierarchy.map((g) => ({ value: g.id, label: g.name }));
    }
    if (scopeType === "campus") {
      return orgHierarchy.flatMap((g) =>
        g.campuses.map((c) => ({ value: c.id, label: `${g.name} / ${c.name}` })),
      );
    }
    return [];
  }, [orgHierarchy, scopeType]);

  useEffect(() => {
    if (!user || !role || !orgHierarchy) return;

    if (isCampusRole) {
      setScopeType("campus");
      setScopeId(user.campusId ?? "");
      return;
    }

    if (isGroupRole) {
      setScopeType("group");
      setScopeId(user.orgGroupId ?? "");
      return;
    }
  }, [isCampusRole, isGroupRole, orgHierarchy, role, user]);

  if (!user || !role) return <LoadingSkeleton rows={6} />;

  const roleEnabled = [
    UserRole.SUPERADMIN,
    UserRole.CEO,
    UserRole.OFFICE_OF_CEO,
    UserRole.SPO,
    UserRole.CHURCH_MINISTRY,
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.CAMPUS_PASTOR,
  ].includes(role as UserRole);

  if (!roleEnabled) {
    return (
      <PageLayout>
        <EmptyState
          title={aggregationContent.accessDeniedTitle}
          description={aggregationContent.accessDeniedDescription}
        />
      </PageLayout>
    );
  }

  const selectedStatuses = includeDrafts
    ? Array.from(new Set([...includeStatuses, ReportStatus.DRAFT]))
    : includeStatuses;

  const handlePreview = async () => {
    try {
      if ((scopeType === "campus" || scopeType === "group") && !scopeId) {
        message.warning(aggregationContent.scopeRequiredError);
        return;
      }
      setLoadingPreview(true);
      setPreviewResult(null);
      const res = await fetch(API_ROUTES.reports.aggregate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scopeType,
          scopeId: scopeType === "all" ? undefined : scopeId,
          periodType,
          periodYear,
          periodMonth: periodType === ReportPeriodType.MONTHLY ? periodMonth : undefined,
          periodWeek: periodType === ReportPeriodType.WEEKLY ? periodWeek : undefined,
          templateId: templateId || undefined,
          includeStatuses: selectedStatuses,
          metricIds: metricIds.length > 0 ? metricIds : undefined,
          action: "preview",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || (CONTENT.errors as Record<string, string>).previewFailed);
      }
      setPreviewResult(json.data.aggregation ?? json.data);
      message.success(aggregationContent.loadingPreviewSuccess);
    } catch (err: any) {
      message.error(err?.message ?? aggregationContent.loadingPreviewError);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGenerate = async () => {
    if (!previewResult) {
      message.warning(aggregationContent.previewRequiredWarning);
      return;
    }
    try {
      setLoadingGenerate(true);
      const res = await fetch(API_ROUTES.reports.aggregate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scopeType,
          scopeId: scopeType === "all" ? undefined : scopeId,
          periodType,
          periodYear,
          periodMonth: periodType === ReportPeriodType.MONTHLY ? periodMonth : undefined,
          periodWeek: periodType === ReportPeriodType.WEEKLY ? periodWeek : undefined,
          templateId: templateId || undefined,
          includeStatuses: selectedStatuses,
          metricIds: metricIds.length > 0 ? metricIds : undefined,
          action: "generate",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || (CONTENT.errors as Record<string, string>).generationFailed);
      }
      message.success(aggregationContent.generatedSuccess);
      const createdReportId = json.data.report.id;
      router.push(`/reports/${createdReportId}`);
    } catch (err: any) {
      message.error(err?.message ?? aggregationContent.generatedError);
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleExportAggregatedReport = (preview: any) => {
    if (!preview) {
      message.warning(aggregationContent.exportMissingWarning);
      return;
    }

    const dummyReport = {
      id: "aggregated-draft",
      organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
      title: `Aggregated ${scopeType} ${periodType} ${periodYear}`,
      templateId: preview.templateId || "",
      templateVersionId: preview.templateVersionId ?? "",
      campusId: scopeType === "campus" ? scopeId : (preview.sourceReports?.[0]?.campusId ?? ""),
      orgGroupId: scopeType === "group" ? scopeId : (preview.sourceReports?.[0]?.orgGroupId ?? ""),
      period: `${periodType}-${periodYear}`,
      periodType,
      periodYear,
      periodMonth: periodType === ReportPeriodType.MONTHLY ? periodMonth : undefined,
      periodWeek: periodType === ReportPeriodType.WEEKLY ? periodWeek : undefined,
      status: ReportStatus.DRAFT,
      createdById: user?.id ?? "",
      submittedById: undefined,
      reviewedById: undefined,
      approvedById: undefined,
      deadline: undefined,
      lockedAt: undefined,
      isDataEntry: false,
      dataEntryById: undefined,
      dataEntryDate: undefined,
      notes: "Exported aggregated report preview",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [],
    } as unknown as any;

    exportAggregatedReport(
      dummyReport,
      preview.aggregatedSections,
      preview.sourceReports,
      templates ?? [],
      orgHierarchy?.flatMap((g) => g.campuses) ?? [],
    );
  };

  const renderPreview = () => {
    if (loadingPreview) return <LoadingSkeleton rows={5} />;
    if (!previewResult) return null;

    const { sourceReports, aggregatedSections, templateId: selectedTemplateId } = previewResult;

    return (
      <Card title={aggregationContent.previewTitle} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Tag icon={<DatabaseOutlined />} color="blue">
            {aggregationContent.reportsIncluded}: {sourceReports.length}
          </Tag>
          <Tag color="green">
            {aggregationContent.templateTag}: {selectedTemplateId ?? aggregationContent.noTemplate}
          </Tag>
          <Tag color="purple">
            {aggregationContent.sectionsTag}: {aggregatedSections.length}
          </Tag>
        </div>
        <div className="space-y-1">
          {aggregatedSections.slice(0, 5).map((section: any) => (
            <div key={section.templateSectionId}>
              <p className="text-sm font-semibold">{section.sectionName}</p>
              <ul className="text-xs text-ds-text-secondary list-disc ml-5">
                {section.metrics.slice(0, 3).map((m: any) => (
                  <li key={m.templateMetricId}>
                    {m.metricName}: achieved={m.monthlyAchieved}, goal={m.monthlyGoal}, yoy=
                    {m.yoyGoal} ({m.calculationType})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleGenerate}
            loading={loadingGenerate}
            disabled={loadingGenerate}
          >
            {aggregationContent.generateButton}
          </Button>
          <Button
            type="default"
            icon={<DatabaseOutlined />}
            onClick={() => handleExportAggregatedReport(previewResult)}
            disabled={!previewResult}
          >
            {aggregationContent.exportButton}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={aggregationContent.pageTitle}
        subtitle={aggregationContent.pageSubtitle}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(APP_ROUTES.reports)}>
            {aggregationContent.back}
          </Button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title={aggregationContent.selectScopeStep}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Select
              value={scopeType}
              options={scopeOptions}
              onChange={(value) => {
                setScopeType(value as "campus" | "group" | "all");
                setScopeId("");
              }}
              disabled={!isGlobalRole}
            />
            {!isGlobalRole && (
              <span className="text-xs text-ds-text-subtle">
                {aggregationContent.scopeLockedHint}
              </span>
            )}
            {(scopeType === "campus" || scopeType === "group") && (
              <Select
                value={scopeId || undefined}
                options={scopeItems}
                onChange={(value) => setScopeId(value as string)}
                placeholder={
                  scopeType === "campus"
                    ? aggregationContent.selectCampus
                    : aggregationContent.selectGroup
                }
                disabled={isCampusRole || isGroupRole}
              />
            )}
          </Space>
        </Card>

        <Card title={aggregationContent.selectPeriodStep}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Select
              value={periodType}
              options={Object.values(ReportPeriodType).map((v) => ({ value: v, label: v }))}
              onChange={(value) => setPeriodType(value as ReportPeriodType)}
            />
            <input
              type="number"
              className="w-full p-2 border border-ds-border-base rounded-ds-lg"
              value={periodYear}
              min={2000}
              max={2100}
              onChange={(ev) => setPeriodYear(Number(ev.target.value))}
            />
            {periodType === ReportPeriodType.MONTHLY && (
              <input
                type="number"
                className="w-full p-2 border border-ds-border-base rounded-ds-lg"
                value={periodMonth}
                min={1}
                max={12}
                onChange={(ev) => setPeriodMonth(Number(ev.target.value))}
              />
            )}
            {periodType === ReportPeriodType.WEEKLY && (
              <input
                type="number"
                className="w-full p-2 border border-ds-border-base rounded-ds-lg"
                value={periodWeek}
                min={1}
                max={53}
                onChange={(ev) => setPeriodWeek(Number(ev.target.value))}
              />
            )}
          </Space>
        </Card>

        <Card title={aggregationContent.selectTemplateStep}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Select
              value={templateId || undefined}
              options={(templates ?? []).map((t) => ({ value: t.id, label: t.name }))}
              onChange={(v) => setTemplateId(v as string)}
              placeholder={aggregationContent.templatePlaceholder}
              loading={templatesLoading}
              showSearch
              optionFilterProp="label"
            />
            <Select
              mode="multiple"
              value={metricIds}
              options={[]}
              placeholder={aggregationContent.metricsPlaceholder}
              disabled
            />
            <Select
              mode="multiple"
              value={includeStatuses}
              options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
              onChange={(v) => setIncludeStatuses(v as ReportStatus[])}
              placeholder={aggregationContent.statusesPlaceholder}
              dropdownMatchSelectWidth={false}
            />
            <Checkbox checked={includeDrafts} onChange={(e) => setIncludeDrafts(e.target.checked)}>
              {aggregationContent.includeDraftsLabel}
            </Checkbox>
            <span className="text-xs text-ds-text-subtle">{aggregationContent.includeDraftsHint}</span>
          </Space>
        </Card>
      </div>

      <div className="mt-4">
        <Button
          type="primary"
          icon={<DatabaseOutlined />}
          onClick={handlePreview}
          loading={loadingPreview}
        >
          {aggregationContent.previewButton}
        </Button>
      </div>

      <div className="mt-6">{renderPreview()}</div>
    </PageLayout>
  );
}
