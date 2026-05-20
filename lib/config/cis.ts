import crypto from "node:crypto";

import { z } from "zod/v4";

const cisEnvSchema = z.object({
    CIS_API_URL: z.string().url().optional(),
    CIS_PLATFORM_SLUG: z.string().trim().min(1).default("report-sys"),
    CIS_CLIENT_ID: z.string().trim().min(1).optional(),
    CIS_CLIENT_SECRET: z.string().trim().min(1).optional(),
    CIS_WEBHOOK_SECRET: z.string().trim().min(1).optional(),
    CIS_WEBHOOK_PATH: z.string().trim().min(1).default("/api/cis/webhook"),
    CIS_WEBHOOK_ALLOWED_SKEW_SECONDS: z.coerce.number().int().min(1).default(300),
});

const parsedEnv = cisEnvSchema.parse(process.env);

export const cisConfig = {
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Harvesters Reporting System",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    apiUrl: parsedEnv.CIS_API_URL ?? null,
    platformSlug: parsedEnv.CIS_PLATFORM_SLUG,
    clientId: parsedEnv.CIS_CLIENT_ID ?? null,
    clientSecret: parsedEnv.CIS_CLIENT_SECRET ?? null,
    webhookSecret: parsedEnv.CIS_WEBHOOK_SECRET ?? null,
    webhookPath: parsedEnv.CIS_WEBHOOK_PATH,
    webhookAllowedSkewSeconds: parsedEnv.CIS_WEBHOOK_ALLOWED_SKEW_SECONDS,
    ready: Boolean(parsedEnv.CIS_API_URL && parsedEnv.CIS_CLIENT_ID && parsedEnv.CIS_CLIENT_SECRET && parsedEnv.CIS_WEBHOOK_SECRET),
} as const;

function normaliseSignature(signature: string | null): string | null {
    if (!signature) {
        return null;
    }

    const trimmed = signature.trim();
    if (trimmed.startsWith("sha256=")) {
        return trimmed.slice("sha256=".length);
    }

    return trimmed.length > 0 ? trimmed : null;
}

export function buildCisWebhookSignature(timestamp: string, payload: string): string {
    const secret = cisConfig.webhookSecret;
    if (!secret) {
        return "";
    }

    return crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
}

export function verifyCisWebhookSignature(params: {
    payload: string;
    signature: string | null;
    timestamp: string | null;
}): boolean {
    if (!cisConfig.webhookSecret) {
        return false;
    }

    const { payload, signature, timestamp } = params;
    const normalizedSignature = normaliseSignature(signature);
    const numericTimestamp = timestamp ? Number.parseInt(timestamp, 10) : Number.NaN;

    if (!normalizedSignature || Number.isNaN(numericTimestamp)) {
        return false;
    }

    const ageSeconds = Math.abs(Date.now() - numericTimestamp) / 1000;
    if (ageSeconds > cisConfig.webhookAllowedSkewSeconds) {
        return false;
    }

    const expectedSignature = timestamp ? buildCisWebhookSignature(timestamp, payload) : "";
    if (!expectedSignature) {
        return false;
    }

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const providedBuffer = Buffer.from(normalizedSignature, "hex");

    if (expectedBuffer.length !== providedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}