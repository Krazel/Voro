# Pause artwork fidelity correction

The user rejected the flat pause menu and requested the approved design in both
normal and PC play. Reference: reference.png, copied from the existing
menu-imagegen-2026-09-20/pause-menu.png. The prior screenshot pc-demo/pause-shared
is superseded; it confirmed shared code, not visual fidelity.

ChatGPT Images removed the baked text and central creature from the reference,
preserving its three membrane controls and microscopic background. Result:
public/ui/approved/pause-plate-v1.png. Original generated output is retained under
the thread's generated_images directory. Hashes are in assets.json.

The pause now uses that textured plate. All text and actions remain real DOM,
translated ES/EN; the protagonist is the game's live animated organism. Shared
LivingMenuArt deforms the three membrane regions at the same 3.5 timing factor
as approved settings, with a static-art fallback for reduced motion/WebGL loss.
The former solid-fill SVG buttons and generic translucent backdrop are removed.
Normal launch ignores stale saved development UI preferences; explicit
development access remains available for testing.

Validation: 191 tests passed, TypeScript clean, PC and mobile builds passed.
Mobile verification checks the shipped pause plate bytes against its source and
the compiled CSS reference. Browser UI checked at 1280x720 and 390x844: pause,
settings navigation, ES/EN text and automatic language preference restored.
Evidence: pc-pause.png, portrait-es.png, portrait-en.png. Desktop browser only;
the change is not yet uploaded to TestFlight and is not native device QA.
