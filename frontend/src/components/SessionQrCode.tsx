import { QRCodeSVG } from 'qrcode.react';

export function SessionQrCode({ sessionGuid }: { sessionGuid: string }) {
  const sessionUrl = new URL(
    `/session/${encodeURIComponent(sessionGuid)}`,
    window.location.origin,
  ).toString();

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <QRCodeSVG value={sessionUrl} size={256} includeMargin />
      <a
        href={sessionUrl}
        className="max-w-full break-all text-xs text-primary underline"
      >
        {sessionUrl}
      </a>
    </div>
  );
}
