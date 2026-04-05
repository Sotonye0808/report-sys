import crypto from "node:crypto";
import { AssetDomain } from "@/types/global";

interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  folder?: string;
}

interface UploadImageInput {
  dataUrl: string;
  domain: AssetDomain;
  fileName?: string;
  requestId?: string;
}

interface DestroyImageInput {
  publicId: string;
  requestId?: string;
}

function cleanPathPart(input: string): string {
  return input.replace(/^\/+|\/+$/g, "").replace(/\s+/g, "-").toLowerCase();
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required for Cloudinary lifecycle operations.`);
  }
  return value;
}

function buildSignature(params: Record<string, string>, apiSecret: string): string {
  const serialized = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

function assertImageDataUrl(dataUrl: string): void {
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Only image data URLs are supported.");
  }
}

function domainPath(domain: AssetDomain): string {
  if (domain === AssetDomain.BUG_REPORT_SCREENSHOT) {
    return "bug-report-screenshots";
  }
  return "assets";
}

function buildFolder(domain: AssetDomain, now = new Date()): string {
  const root = cleanPathPart(requiredEnv("CLOUDINARY_ROOT_FOLDER"));
  const project = cleanPathPart(requiredEnv("CLOUDINARY_PROJECT_ASSET_FOLDER"));
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${root}/${project}/${domainPath(domain)}/${year}/${month}`;
}

function endpoint(path: string): string {
  const cloudName = requiredEnv("CLOUDINARY_CLOUD_NAME");
  return `https://api.cloudinary.com/v1_1/${cloudName}/${path}`;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_ROOT_FOLDER &&
      process.env.CLOUDINARY_PROJECT_ASSET_FOLDER,
  );
}

export async function uploadImageToCloudinary(input: UploadImageInput): Promise<CloudinaryUploadResult> {
  assertImageDataUrl(input.dataUrl);

  const apiKey = requiredEnv("CLOUDINARY_API_KEY");
  const apiSecret = requiredEnv("CLOUDINARY_API_SECRET");
  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = buildFolder(input.domain);

  const signatureParams = {
    folder,
    timestamp,
    ...(input.fileName ? { filename_override: input.fileName } : {}),
  };

  const signature = buildSignature(signatureParams, apiSecret);

  const form = new FormData();
  form.append("file", input.dataUrl);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);
  if (input.fileName) {
    form.append("filename_override", input.fileName);
  }

  const res = await fetch(endpoint("image/upload"), {
    method: "POST",
    body: form,
    headers: input.requestId ? { "x-request-id": input.requestId } : undefined,
  });

  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((payload.error as any)?.message ?? "Cloudinary upload failed");
  }

  const publicId = String(payload.public_id ?? "");
  const secureUrl = String(payload.secure_url ?? "");

  if (!publicId || !secureUrl) {
    throw new Error("Cloudinary response did not include public_id/secure_url.");
  }

  return {
    publicId,
    secureUrl,
    resourceType: String(payload.resource_type ?? "image"),
    format: payload.format ? String(payload.format) : undefined,
    bytes: typeof payload.bytes === "number" ? payload.bytes : undefined,
    width: typeof payload.width === "number" ? payload.width : undefined,
    height: typeof payload.height === "number" ? payload.height : undefined,
    folder,
  };
}

export async function destroyImageFromCloudinary(input: DestroyImageInput): Promise<void> {
  const apiKey = requiredEnv("CLOUDINARY_API_KEY");
  const apiSecret = requiredEnv("CLOUDINARY_API_SECRET");
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signature = buildSignature({ public_id: input.publicId, timestamp }, apiSecret);

  const form = new FormData();
  form.append("public_id", input.publicId);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);

  const res = await fetch(endpoint("image/destroy"), {
    method: "POST",
    body: form,
    headers: input.requestId ? { "x-request-id": input.requestId } : undefined,
  });

  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((payload.error as any)?.message ?? "Cloudinary destroy failed");
  }

  const result = String(payload.result ?? "");
  if (result !== "ok" && result !== "not found") {
    throw new Error(`Cloudinary destroy failed with result=${result}`);
  }
}
