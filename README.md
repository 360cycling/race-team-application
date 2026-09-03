# 360 Cycling - 2027 Junior & U23 Team Applications

Recruitment and application site for the **360 Cycling** 2027 Junior (JRT) and Under-23 race teams.
Live at: https://360cycling.github.io/race-team-application/

## Structure

    index.html            page markup
    og_card.jpg           social share image (1200x630)
    assets/css/style.css  styles
    assets/js/app.js      team toggle, form validation, application composition
    assets/images/        optimised photography (JPEG, lazy-loaded below the fold)

## How applications work

The site is fully static (GitHub Pages). The application form validates client-side, then
composes an email addressed to josh@360cycling.co.uk (cc info@360cycling.co.uk) containing
the structured application, and opens it in the applicant's mail client. The applicant
attaches their rider CV and presses send. A copy-and-paste fallback covers devices with no
configured mail client. Nothing is stored on any server and there are no API keys in the
frontend.

**For production-grade in-page submission** (no mail client involved), connect the form to a
hosted form endpoint (for example Formspree, Getform, or a small serverless function that
relays to email) and point the submit handler in `assets/js/app.js` at it. File uploads for
CVs would also need such a backend; until then the CV travels as an email attachment.

## Publishing

Pushed to `main`, served from the `gh-pages` branch (kept in sync with `main`).
