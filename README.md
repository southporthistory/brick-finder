# SHS Brick Finder Prototype

This is a static GitHub Pages-ready prototype for the Southport Historical Society Brick Finder.

## Files

- `index.html` — public interface
- `styles.css` — SHS-inspired styling
- `app.js` — client-side search/filter behavior
- `bricks.json` — public-only data export

## Privacy

`bricks.json` contains only public locator information: Brick ID, site, area, column, brick number, location, inscription, optional public image filename, and optional story URL.

Purchaser/contact information belongs only in the internal `SHS_Brick_Master_Inventory.xlsx` and must never be copied into this repository.

## Publishing

Create a GitHub repository, add these files at the repository root, and enable GitHub Pages for the main branch. The site can later be mapped to a custom SHS subdomain.

## Adding photos later

Keep original photos in SHS institutional storage. Create web-sized derivative images named by Brick ID, for example:

`FJ-FR-C04-B001.jpg`

Place those derivatives in an `images/` folder and set the matching `image` field in `bricks.json`.

## Current scope

This prototype contains 484 transcribed Fort Johnston Front Sidewalk bricks. Column 3 is only partially inventoried in the current source workbook.
