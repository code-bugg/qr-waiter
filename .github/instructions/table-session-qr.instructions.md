---
description: QR code ownership and table session generation rules
applyTo: 'frontend/src/**/*.{ts,tsx}'
---

The frontend renders QR codes; the backend creates or retrieves table sessions and returns the
stable session GUID. Encode the full customer URL in a QR, such as
`https://host.example/session/{sessionGuid}`, and never store the generated QR image in the
database. Session creation must not happen in the QR component itself.
