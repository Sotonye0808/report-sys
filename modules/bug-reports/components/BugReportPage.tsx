"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, Select, message, Upload } from "antd";
import { BugOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { AssetDomain, AssetUploadMode, BugReportCategory } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { apiMutation } from "@/lib/utils/apiMutation";
import { useFormPersistence } from "@/lib/hooks/useFormPersistence";
import { FormDraftBanner } from "@/components/ui/FormDraftBanner";

const CATEGORY_OPTIONS = Object.values(BugReportCategory).map((cat) => ({
  value: cat,
  label: (CONTENT.bugReports.categories as Record<string, string>)[cat],
}));

export function BugReportPage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assetSessionId, setAssetSessionId] = useState<string | null>(null);
  const [screenshotAssetId, setScreenshotAssetId] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);
  const [screenshotMimeType, setScreenshotMimeType] = useState<string | null>(null);
  const uploadModeFromEnv = process.env.NEXT_PUBLIC_BUG_REPORT_ASSET_UPLOAD_MODE;
  const preuploadEnabled = uploadModeFromEnv === "preupload_draft";
  const [sessionMode] = useState<AssetUploadMode>(
    preuploadEnabled ? AssetUploadMode.PREUPLOAD_DRAFT : AssetUploadMode.DEFERRED_SUBMIT,
  );

  const draftState = useMemo(
    () => ({
      category: form.getFieldValue("category") as BugReportCategory | undefined,
      description: form.getFieldValue("description") as string | undefined,
      contactEmail: form.getFieldValue("contactEmail") as string | undefined,
      screenshotAssetId: screenshotAssetId ?? undefined,
      screenshotUrl: screenshotUrl ?? undefined,
      screenshotFileName: screenshotFileName ?? undefined,
      screenshotMimeType: screenshotMimeType ?? undefined,
      assetSessionId: assetSessionId ?? undefined,
      sessionMode,
    }),
    [assetSessionId, form, screenshotAssetId, screenshotFileName, screenshotMimeType, screenshotUrl, sessionMode],
  );

  const { status: draftStatus, lastSavedAt: draftLastSaved, clearDraft: clearPersistedDraft } =
    useFormPersistence({
      formKey: "bug-report-form",
      formState: draftState,
      enabled: true,
      onRestore: (draft) => {
        form.setFieldsValue({
          category: draft.category,
          description: draft.description,
          contactEmail: draft.contactEmail ?? user?.email ?? "",
        });
        setAssetSessionId(draft.assetSessionId ?? null);
        setScreenshotAssetId(draft.screenshotAssetId ?? null);
        setScreenshotUrl(draft.screenshotUrl ?? null);
        setScreenshotFileName(draft.screenshotFileName ?? null);
        setScreenshotMimeType(draft.screenshotMimeType ?? null);
      },
    });

  useEffect(() => {
    form.setFieldValue("contactEmail", user?.email ?? "");
  }, [form, user?.email]);

  const clearScreenshotState = async () => {
    if (assetSessionId) {
      await apiMutation(API_ROUTES.assets.sessionDiscard(assetSessionId), { method: "POST" });
    }
    setAssetSessionId(null);
    setScreenshotAssetId(null);
    setScreenshotUrl(null);
    setScreenshotFileName(null);
    setScreenshotMimeType(null);
  };

  const ensureSession = async (): Promise<string | null> => {
    if (assetSessionId) return assetSessionId;
    const sessionRes = await apiMutation<AssetUploadSession>(API_ROUTES.assets.sessions, {
      method: "POST",
      body: {
        domain: AssetDomain.BUG_REPORT_SCREENSHOT,
        mode: sessionMode,
        idempotencyKey: `bug-report-${crypto.randomUUID()}`,
      },
    });
    if (!sessionRes.ok || !sessionRes.data?.id) {
      message.error(sessionRes.error ?? (CONTENT.errors as Record<string, string>).generic);
      return null;
    }
    setAssetSessionId(sessionRes.data.id);
    return sessionRes.data.id;
  };

  const handleSubmit = async (values: {
    category: BugReportCategory;
    description: string;
    contactEmail: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await apiMutation<BugReport>(API_ROUTES.bugReports.list, {
        method: "POST",
        body: {
          ...values,
          screenshotAssetId: screenshotAssetId ?? undefined,
          screenshotDataUrl:
            !screenshotAssetId && screenshotUrl ? screenshotUrl : undefined,
          screenshotFileName: screenshotFileName ?? undefined,
          screenshotMimeType: screenshotMimeType ?? undefined,
          uploadMode: sessionMode,
          screenshotUrl:
            screenshotAssetId && !preuploadEnabled ? undefined : screenshotUrl ?? undefined,
        },
      });
      if (!res.ok) {
        message.error(res.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.bugReports.submitSuccess as string);
      form.resetFields();
      clearPersistedDraft();
      await clearScreenshotState();
      // Reset email to user's email
      form.setFieldValue("contactEmail", user?.email ?? "");
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      const dataUrl = reader.result as string;
      setScreenshotUrl(dataUrl);
      setScreenshotFileName(file.name);
      setScreenshotMimeType(file.type);

      if (!preuploadEnabled) {
        setUploading(false);
        return;
      }

      const sessionId = await ensureSession();
      if (!sessionId) {
        setUploading(false);
        return;
      }

      const uploadRes = await apiMutation<AssetUploadSession>(
        API_ROUTES.assets.sessionUpload(sessionId),
        {
          method: "POST",
          body: {
            dataUrl,
            fileName: file.name,
            mimeType: file.type,
          },
        },
      );

      if (!uploadRes.ok) {
        message.error(uploadRes.error ?? (CONTENT.errors as Record<string, string>).generic);
        setUploading(false);
        return;
      }

      const activeAssetId = uploadRes.data?.activeAssetId ?? null;
      setScreenshotAssetId(activeAssetId);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    return false; // prevent auto upload
  };

  return (
    <PageLayout>
      <PageHeader title={CONTENT.bugReports.pageTitle as string} icon={<BugOutlined />} />
      <div className="max-w-lg">
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <FormDraftBanner
            status={draftStatus}
            lastSavedAt={draftLastSaved}
            onClear={() => {
              clearPersistedDraft();
              void clearScreenshotState();
              form.resetFields();
              form.setFieldValue("contactEmail", user?.email ?? "");
            }}
          />
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ contactEmail: user?.email ?? "" }}
          >
            <Form.Item
              name="category"
              label={CONTENT.bugReports.categoryLabel as string}
              rules={[{ required: true, message: "Please select an issue type." }]}
            >
              <Select
                placeholder={CONTENT.bugReports.categoryPlaceholder as string}
                options={CATEGORY_OPTIONS}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={CONTENT.bugReports.descriptionLabel as string}
              rules={[
                { required: true, message: "Please describe the issue." },
                { min: 10, message: "Description must be at least 10 characters." },
              ]}
            >
              <Input.TextArea
                placeholder={CONTENT.bugReports.descriptionPlaceholder as string}
                rows={5}
                maxLength={2000}
                showCount
              />
            </Form.Item>

            <Form.Item label={CONTENT.bugReports.screenshotLabel as string}>
              <Upload
                beforeUpload={handleUpload}
                accept="image/*"
                maxCount={1}
                listType="picture"
                onRemove={() => {
                  void clearScreenshotState();
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {CONTENT.bugReports.screenshotHint as string}
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="contactEmail"
              label={CONTENT.bugReports.emailLabel as string}
              rules={[
                { required: true, message: "Please provide your email." },
                { type: "email", message: "Please enter a valid email." },
              ]}
            >
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={CONTENT.bugReports.emailPlaceholder as string}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              icon={<BugOutlined />}
            >
              {submitting
                ? (CONTENT.bugReports.submitting as string)
                : (CONTENT.bugReports.submitButton as string)}
            </Button>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
