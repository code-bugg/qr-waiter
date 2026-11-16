import { QRCodeSVG } from 'qrcode.react';
import { sessionCustomerUrl } from '@/lib/session-link';

export function SessionQrCode({ sessionGuid, label, showLink = true }: { sessionGuid: string; label: string; showLink?: boolean }) {
  const sessionUrl = sessionCustomerUrl(sessionGuid, window.location.origin);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <QRCodeSVG value={sessionUrl} size={256} marginSize={4} title={label} className="h-auto max-w-full" />
      <p className="text-sm text-muted-foreground">{label}</p>
      {showLink && <a
        href={sessionUrl}
        className="max-w-full break-all text-xs text-primary underline"
      >
        {sessionUrl}
      </a>}
    </div>
  );
}
