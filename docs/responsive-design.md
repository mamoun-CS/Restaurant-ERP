# Responsive Design

## Supported Viewports

The layout targets:

- 320px and above mobile screens.
- 375px, 390px, and 430px common phone widths.
- 768px portrait tablets.
- 1024px landscape tablets.
- 1280px, 1366px, 1440px, and 1920px desktop widths.

## Layout Behavior

- Desktop admin pages use an expanded sidebar.
- Mobile admin pages use an off-canvas drawer.
- The drawer closes on route selection, outside click, close button, and Escape.
- Background scrolling is disabled while the drawer is open.
- Main content uses `.page-container` with responsive padding and a wider desktop maximum.

## Tables

- Wide financial tables use `.table-scroll` to keep horizontal scrolling inside the card.
- Cash denomination and cash report tables convert to mobile cards below 640px.
- Page-level horizontal scrolling is prevented globally.

## Forms and Buttons

- Inputs use consistent height, radius, focus states, and full width by default.
- Mobile controls stack when needed.
- Icon-only controls keep accessible labels in updated cash screens and existing action menus.

## RTL and LTR

The `LanguageProvider` writes `document.documentElement.dir` as `rtl` or `ltr`. Components use Tailwind logical utilities such as `start`, `end`, `ms`, `me`, and `border-s` so layout mirrors correctly.

## Print

Global print CSS:

- Removes navigation and screen-only actions.
- Uses A4 margins.
- Preserves table headers.
- Avoids breaking cards, rows, and images across pages.
- Keeps `.receipt-print` at thermal width.

## Viewports Checked

The project was statically built after responsive changes. Manual browser viewport screenshots are recommended for:

`320x568`, `375x667`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1280x720`, `1366x768`, `1440x900`, and `1920x1080`.
