# AgencyTize® — Creator Culture Studio

A high-contrast, editorial-style website built with HTML, CSS and JavaScript for Cloudflare Pages. The hero includes a real Three.js WebGL sculpture (torus knot, reflective materials, orbiting rings and pointer-responsive motion), with CSS-built visual fallbacks.

## Files
- `index.html` — content and page structure
- `styles.css` — responsive design, animations and CSS fallback artwork
- `script.js` — mobile navigation, scroll progress, reveal transitions and Three.js scene

## Run locally
Open `index.html`, or use a simple local server:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

The 3D scene imports Three.js from jsDelivr at runtime. Internet access is required for that scene; if it fails, the page retains its CSS artwork and content.

## Deploy to Cloudflare Pages via Git
1. Create a GitHub repository (for example `agencytize-website`).
2. Put `index.html`, `styles.css`, `script.js` and this README in the repository root.
3. In Cloudflare Dashboard go to Workers & Pages → Create → Pages → Connect to Git.
4. Select the repository and configure:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: leave blank (or `exit 0` if required)
   - Build output directory: `/` or `.` as accepted by the dashboard
5. Deploy. Pushes to the production branch will trigger new deployments.

## Important before launch
- Contact buttons open an email draft addressed to `agencytize.business@gmail.com`; there is no server-side form or CRM connected.
- No client logos, fake testimonials, or invented performance metrics are included.
- This is an original design direction informed by common patterns across creator marketing agency sites: clear positioning, scannable services, transparent process and strong conversion paths.
- Check the deployed URL on a real phone and desktop before sharing publicly.
