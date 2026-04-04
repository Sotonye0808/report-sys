interface EmailLayoutOptions {
  heading: string;
  bodyHtml: string;
  accent?: string;
}

export function renderEmailLayout(options: EmailLayoutOptions): string {
  const accent = options.accent ?? "#10b981";
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <div style="background:${accent};color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;font-size:20px">Harvesters Reporting System</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="margin-top:0">${options.heading}</h2>
        ${options.bodyHtml}
        <p style="font-size:12px;color:#6b7280;margin-top:24px">
          This message was sent by Harvesters Reporting System.
        </p>
      </div>
    </div>
  `;
}

