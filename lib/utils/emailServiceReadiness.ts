export function isEmailServiceReady(): boolean {
    return Boolean(
        process.env.RESEND_API_KEY &&
        process.env.EMAIL_FROM &&
        process.env.NEXT_PUBLIC_APP_URL,
    );
}

export function getAppUrl(): string {
    return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}
