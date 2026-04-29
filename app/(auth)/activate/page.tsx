"use client";

/**
 * /activate?token=...
 *
 * Consumes a UserActivationToken (server-side hashed) and forces a new
 * password before issuing a full sign-in session.
 *
 * Token is one-time and rotates on use; expired/used links surface
 * dedicated copy and a CTA back to login.
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Input, message } from "antd";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";

function ActivatePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [tokenInvalid, setTokenInvalid] = useState(!token);

    useEffect(() => {
        if (!token) setTokenInvalid(true);
    }, [token]);

    const copy = (CONTENT.activation ?? {}) as Record<string, string>;
    const auth = CONTENT.auth as unknown as Record<string, string>;

    const onSubmit = async (values: { password: string; confirm: string }) => {
        if (values.password !== values.confirm) {
            message.error(auth.errors_passwordsDoNotMatch ?? "Passwords do not match");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(API_ROUTES.activate, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: values.password }),
            });
            const json = (await res.json()) as { success: boolean; error?: string };
            if (!res.ok || !json.success) {
                if (res.status === 400) setTokenInvalid(true);
                message.error(json.error ?? copy.invalidDescription ?? "Activation failed");
                return;
            }
            setDone(true);
            setTimeout(() => router.replace(APP_ROUTES.dashboard), 1200);
        } catch {
            message.error(copy.invalidDescription ?? "Activation failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (tokenInvalid) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12 max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold text-ds-text-primary">{copy.invalidTitle ?? "Activation invalid"}</h1>
                <p className="text-sm text-ds-text-secondary">{copy.invalidDescription ?? ""}</p>
                <Button onClick={() => router.replace(APP_ROUTES.login)}>{auth.goToLogin ?? "Go to login"}</Button>
            </div>
        );
    }

    if (done) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12 max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold text-ds-text-primary">{copy.successTitle ?? "Account activated"}</h1>
                <p className="text-sm text-ds-text-secondary">{copy.successDescription ?? ""}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 py-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-ds-text-primary">{copy.pageTitle ?? "Activate"}</h1>
            <p className="text-sm text-ds-text-secondary">{copy.subtitle ?? ""}</p>
            <Form layout="vertical" onFinish={onSubmit} disabled={submitting}>
                <Form.Item
                    name="password"
                    label={auth.newPasswordLabel ?? "New password"}
                    rules={[
                        { required: true, message: auth.errors_passwordRequired ?? "Required" },
                        { min: 8, message: auth.errors_passwordTooShort ?? "Min 8 chars" },
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="confirm"
                    label={auth.confirmPasswordLabel ?? "Confirm password"}
                    rules={[{ required: true, message: auth.errors_passwordRequired ?? "Required" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Button htmlType="submit" type="primary" loading={submitting} block>
                    {copy.actionSubmit ?? "Activate"}
                </Button>
            </Form>
        </div>
    );
}

export default function ActivatePage() {
    return (
        <Suspense fallback={null}>
            <ActivatePageInner />
        </Suspense>
    );
}
