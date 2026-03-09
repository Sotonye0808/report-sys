"use client";

import { useState } from "react";
import { Form, Select, message, Upload } from "antd";
import { BugOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { BugReportCategory } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";

const CATEGORY_OPTIONS = Object.values(BugReportCategory).map((cat) => ({
  value: cat,
  label: (CONTENT.bugReports.categories as Record<string, string>)[cat],
}));

export function BugReportPage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const handleSubmit = async (values: {
    category: BugReportCategory;
    description: string;
    contactEmail: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await fetch(API_ROUTES.bugReports.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          screenshotUrl: screenshotUrl ?? undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.bugReports.submitSuccess as string);
      form.resetFields();
      setScreenshotUrl(null);
      // Reset email to user's email
      form.setFieldValue("contactEmail", user?.email ?? "");
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = (file: File) => {
    // Convert to base64 data URL for storage
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false; // prevent auto upload
  };

  return (
    <PageLayout>
      <PageHeader title={CONTENT.bugReports.pageTitle as string} icon={<BugOutlined />} />
      <div className="max-w-lg">
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
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
                onRemove={() => setScreenshotUrl(null)}
              >
                <Button icon={<UploadOutlined />}>
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
              <Input placeholder={CONTENT.bugReports.emailPlaceholder as string} />
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
