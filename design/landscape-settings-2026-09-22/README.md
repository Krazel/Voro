# Landscape settings, journey and credits

User requested horizontal configuration sections on PC and iPad, retaining
portrait iPhone and iPad. The existing approved settings-plate.png is recomposed
using SVG source regions and the same LivingMenuArt animation. No raster image
was created or edited. SVG remains visible with reduced motion or unavailable
WebGL. Original portrait rendering uses the full texture and original dimensions.

Landscape menu: section navigation on the left, larger live controls/content on
the right, original amber return control below. Journey still shows only visited
stages, with a scrollable two-column list and stats. Credits and license sheet
remain functional. Sidebar reset uses the existing confirmation; development is
still accessible. Active section survives changing orientation/window size.

Only PC and landscape iPad enable this layout, with a minimum available window
of 760x520; smaller windows fall back to the existing portrait layout. Pause A
(Respira) is untouched and shared with the normal iPhone entry.

QA: TypeScript, 6 viewport/UI-mode tests, mobile and PC builds pass. Mobile asset
verification still excludes rejected pause B/C. Browser screenshots at 1280x720,
1194x834, 800x600 and portrait 390x844. Checked section navigation, visited route,
credits/licenses, English control labels, and return to automatic language.
Screenshots are browser evidence, not native device verification.

Shared camera and pc-demo branches contain the change. No new TestFlight upload:
installed 0.5.1(1) remains unchanged; physical iPad orientation/touch QA is pending.
