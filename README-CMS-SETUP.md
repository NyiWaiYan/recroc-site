# Recroc CMS Setup

This version replaces the old `studio-c01ez7hdxx985r8d.html` download workflow with Decap CMS.

New admin URL after setup:

`https://recroc.co/admin/`

## What changes

- Edit homepage text, stats, services, contact links, and projects from `/admin/`.
- Upload images from the admin panel.
- Images save to `images/uploads`.
- Content saves to `projects.json` in GitHub.
- Netlify redeploys automatically after each save.

## Required setup

This cannot work with Netlify Drop only. It needs a GitHub repository connected to Netlify.

1. Create a GitHub repo, for example `recroc-site`.
2. Upload all files from this package to the repo root.
3. In Netlify, create/import a site from GitHub.
4. Build command: leave empty.
5. Publish directory: `.`
6. In Netlify, go to **Identity** and click **Enable Identity**.
7. In **Identity → Registration**, choose **Invite only**.
8. In **Identity → Services**, enable **Git Gateway**.
9. Invite your admin email in **Identity → Invite users**.
10. Open the invite email, set password, then go to `/admin/`.

## Editing content

Go to `/admin/` and open **Website Content → Homepage + Projects**.

When you save, Decap CMS commits the change to GitHub. Netlify will redeploy the site automatically.

## Domain

Keep your existing DNS:

- `recroc.co` A record → `75.2.60.5`
- `www` CNAME → your Netlify subdomain

## Notes

- The old local-export admin page was removed.
- Do not upload `ADMIN-CREDENTIALS.txt` to GitHub or Netlify.
