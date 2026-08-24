# recroc-site

Static site for RecRoc. Plain HTML, CSS and JS. Netlify serves the committed
files directly, so **there is no build step on deploy**.

## Editing copy

All words live in two files:

- `content/site.json` — global copy: hero, about, process, values, shared FAQs
- `content/services.json` — the 23 service pages

After editing, regenerate the HTML and commit the result:

    npm run build

That rewrites `index.html`, `services/`, `about/`, `process/`, `contact/`,
`404.html` and `sitemap.xml`. Nothing else needs touching. Editing a generated
HTML file by hand works but gets overwritten on the next build, so change the
JSON instead.

## Structure

    content/          copy (edit this)
    src/              stylesheet and script SOURCES (edit these)
    tools/            generator (build.js + pages.js)
    assets/           GENERATED, fingerprinted assets. Do not edit.
    images/           photography
    services/<slug>/  generated service pages

## Asset caching

Netlify serves `/assets/*` with a one year immutable cache. That is only safe
because the build fingerprints the filenames: `src/site.css` is emitted as
`assets/css/site.<hash>.css`, and a content change produces a new hash, so
browsers fetch the new file instead of holding the old one.

Never edit anything in `assets/` and never reference an unhashed asset path.
Edit `src/site.css` or `src/site.js`, then run `npm run build`.

## Design system

Tokens are in `src/site.css` under `:root`. Always use the variables.
Type scale is 88 / 68 / 30 / 25 / 19 / 16. No shadows, no stroke text.
Icons are an inline SVG sprite drawn on a 24px grid at 1.5 stroke, defined in
`tools/build.js`.

## Forms

The contact form uses Netlify Forms (`data-netlify="true"`). Submissions appear
under Forms in the Netlify dashboard. The `company-website` field is a honeypot
and should stay empty.
