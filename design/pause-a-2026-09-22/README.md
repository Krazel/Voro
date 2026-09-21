# Pause A restored — explicit user selection 2026-09-22

User chose A from the three displayed screenshots: the original «Respira.»
overlay with Continuar and Configuración, showing the actual game behind it.
Reference: design/final-ui-2026-09-19/final-pause.png.

Restored the exact pause JSX from 0b8042b (pre-0.5.1), retaining its existing
Cristal styles and membrane buttons. Compared the complete pause block against
git show 0b8042b:app/page.tsx: exact match after line-ending normalization.
Settings, journey and credits components and artwork are unchanged.
Removed the unused ApprovedPause component, its CSS and rejected C texture from
public assets. Reverted LivingMenuArt to its settings-only implementation.
Rejected alternatives remain in Git history and prior design evidence only.

Validation: TypeScript and UI-mode tests pass; mobile/PC builds pass. The mobile
asset verifier rejects the B/C selector and C texture if they ever ship again.
Browser checked pause A -> approved configuration -> return. Screenshot:
pc-restored.png. Shared implementation covers normal mobile and the PC entry.
No TestFlight upload or publishing. Current installed 0.5.1(1) is unchanged until
a new build is delivered; native iPad rotation/performance QA remains pending.
