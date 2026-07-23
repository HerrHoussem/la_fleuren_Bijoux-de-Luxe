# La Fleuren — Enhanced final build

## Improvements applied

- Added canonical, Arabic/French hreflang, Open Graph, Twitter card, and favicon metadata.
- Added a keyboard-accessible skip link and clearer focus indicators.
- Added Escape-key support for drawers, search, checkout, quick view, and splash screen.
- Prevented background scrolling while a drawer or modal is open.
- Added reduced-motion support for visitors who disable animation.
- Improved product image loading with lazy loading, async decoding, URL validation, and graceful failures.
- Escaped product/category content inserted into HTML to reduce cross-site scripting risk from database content.
- Made search resilient to missing product names or categories.
- Added safer network error handling for checkout and newsletter requests.
- Kept the existing Supabase configuration, database structure, admin page, and bilingual URLs unchanged.

## Deployment

Upload all files from this folder to the root of the GitHub repository. Keep `index.html`, `fr/`, `admin/`, and `assets/` in the same positions.

After deployment, use a hard refresh (`Ctrl + F5`) and test one order with a test customer before advertising the website.
