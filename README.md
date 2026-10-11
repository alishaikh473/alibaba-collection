# Alibaba Collection

A responsive HTML, CSS, and JavaScript marketplace connected to Supabase Auth, Postgres, and Storage. The app has no service-role secret or admin password in its source. Public catalog reads are available to visitors; server-side Row Level Security (RLS) restricts content writes and file uploads to explicitly allowlisted Supabase Auth users.

## Supabase setup

The project URL and publishable key are intentionally placeholders until a Supabase project is provisioned.

1. Create a Supabase project and choose the production HTTPS site URL. Do not use `file://` for authentication. The Supabase project URL and publishable key are browser-visible by design; security comes from Auth, restricted grants, and server-enforced RLS, not from hiding these public values.
2. In Supabase **Authentication → Providers / Sign In**, disable public sign-ups, require email confirmation, set the minimum password length to at least 12 characters, and enable the available password protections. Create/invite only your own admin account. Set the Auth **Site URL** to the exact production URL (including the GitHub Pages repository path if used) and restrict allowed redirect URLs to the production URLs you control. This UI does not implement an MFA challenge, so MFA enrollment alone does not enforce MFA for publishing.
3. Open the Supabase SQL Editor and run [`supabase-schema.sql`](./supabase-schema.sql) once. It creates the admin allowlist, public catalog tables, RLS policies, and a public 15 MB storage bucket with an allowed MIME type list. Then add the exact admin account to the allowlist, replacing the email below with the account's Auth email:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'admin@example.com'
   on conflict (user_id) do nothing;
   ```

   Confirm that this inserts exactly one row. Only an account in this table passes `public.is_admin()` and the RLS write policies. Do not expose any UI that lets users add themselves to this table.
4. In GitHub **Settings → Secrets and variables → Actions → Secrets**, add `SUPABASE_URL` (the exact `https://<project-ref>.supabase.co` project URL) and `SUPABASE_PUBLISHABLE_KEY` (the `sb_publishable_...` key, or legacy anon JWT). The workflow reads these repository secrets during the build, but the publishable key and project URL are embedded in the public site and visible in browser requests. Never use a Supabase secret/service-role key or database password here or in browser code.
5. Deploy the static files over HTTPS using the workflow below. If the final site URL differs from the URL entered in Supabase Auth, update its **Site URL** and allowed redirects before signing in.
6. Verify both sides: anonymous visitors can read products/stories but cannot insert, update, delete, or upload; the allowlisted admin can publish; and a separate non-admin account is still denied.

The existing schema gives visitors read access to published product and story rows, while insert/update/delete requires an authenticated user who passes `public.is_admin()` in restrictive RLS policies. The admin table is not readable or writable by browser roles. Storage writes additionally require the admin's user ID as the first object-path segment. UI visibility checks are only cosmetic; the database and Storage policies are the authorization boundary. The `marketplace-files` bucket is **public** so published product files and story covers can be downloaded without sign-in. Treat every uploaded file as public; do not publish paid, personal, confidential, or otherwise restricted documents. A private-download/checkout flow requires a separate backend and entitlement checks.

### Deploy with GitHub Pages

The workflow at [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) builds and deploys the site on each push to `main`. It reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from repository Actions secrets, rejects placeholder, malformed, or elevated Supabase keys, places the public configuration only in the generated artifact, and restricts the production CSP to the exact Supabase origin. The original checked-in configuration remains placeholders.

The deployed homepage includes a canonical URL and meta description. `robots.txt` permits crawler access and references `sitemap.xml`, which lists the homepage. The site uses hash-based navigation, so its section links are not separate crawlable URLs.

1. Create a GitHub repository for this site and place the contents of this `alibabacollection` folder at the repository root (the root must contain `.github`, `index.html`, and `scripts`). From that folder, initialize and push the repository, replacing the placeholders with your GitHub owner and repository name:

   ```powershell
   git init -b main
   git add .
   git commit -m "Prepare Alibaba Collection for deployment"
   git remote add origin https://github.com/<OWNER>/<REPOSITORY>.git
   git push -u origin main
   ```

   Do not commit `_site`, generated keys, `.env` files, credentials, or service-role/secret keys.
2. Add the two repository **Actions variables** `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as described above. Never use the Supabase secret/service-role key here. The publishable key is necessarily present in the public site; Actions variables avoid committing it to your source.
3. In the repository, open **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**, and save.
4. Push to `main` or run **Actions → Deploy secure static site → Run workflow**. The workflow builds `_site` and deploys it. Configure the actual Pages URL in Supabase **Authentication → URL Configuration** after the first deployment, then trigger another deployment if needed.
5. Confirm the Actions deployment succeeded, open the published HTTPS URL, and verify public catalog reads, a valid admin login, and denied writes with a non-admin account. Rotate the Supabase publishable key if it is unintentionally exposed before launch; never rotate or expose a secret key in the browser.

For a local production-build check, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the current PowerShell process and run `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\prepare-deploy.ps1` from this folder. The output is `_site`; serve that folder over HTTPS or deploy it. The script does not contact or modify the Supabase project.

**Security headers and hosting:** the build writes a strict CSP into the HTML and a `_headers` file containing CSP, HSTS, frame-denial, MIME-sniffing, referrer, and permissions headers. GitHub Pages provides HTTPS but does not process `_headers` or let this project configure arbitrary response headers; the meta CSP works there, but `frame-ancestors` and the other response-only protections in `_headers` are not enforced by GitHub Pages. For those additional response headers, deploy the same `_site` output to a static host/CDN that supports `_headers` (for example, Cloudflare Pages) or configure equivalent headers at your host. No static host can make a browser publishable key secret.

For a linked cloud database deployment using the CLI instead of the SQL Editor, install the Supabase CLI, authenticate it locally, run `supabase link --project-ref <project-ref>` from this folder, then `supabase db push`. This applies the checked-in migration. The admin Auth user must still be created/invited and added to the allowlist as described above.

## Local preview without Supabase

- Serve the `alibabacollection` folder with a local web server and open its URL (for example, `http://localhost:5500`). Opening `index.html` directly with `file://` can render sample content but is not suitable for testing Supabase authentication.
- With the placeholder values in `supabase-config.js`, the app intentionally stays in **Preview mode**: it shows the built-in sample listings and stories, does not call Supabase, and keeps admin-only controls unavailable. The Admin login button opens an informational dialog explaining that Supabase setup is needed. No backend error should interrupt browsing.
- If a configured Supabase project is temporarily offline or unreachable, the same sample content remains visible with a non-blocking notice. Check the browser console for the underlying network error.
- If the notice says the catalog tables are missing, or the console reports `PGRST205`, the site is connected but the database schema has not been applied (or its API schema cache has not refreshed). Run [`supabase-schema.sql`](./supabase-schema.sql) in the Supabase SQL Editor, then reload the site.
- `ERR_CONNECTION_REFUSED` at `http://127.0.0.1:8765/` means no local web server is listening at that address/port; missing Supabase credentials do not cause that browser error. Start a local server, confirm its port, and open the matching URL. In VS Code, an installed Live Server extension can serve this folder; use its **Go Live** action. Alternatively, from a terminal in this folder run `python -m http.server 8765 --bind 127.0.0.1` if Python is installed, then open `http://127.0.0.1:8765/`. Stop the server with Ctrl+C.

## Full local Supabase setup

For realistic local authentication, database, storage, and RLS testing, run the Supabase stack locally instead of using a browser-only mock. This does not require a cloud project or Supabase dashboard:

1. Install and start [Docker Desktop](https://docs.docker.com/desktop/) and the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started). On Windows, the CLI can be installed with Scoop (`scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`, then `scoop install supabase`).
2. From this folder, run `powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-local.ps1`. The execution-policy bypass applies only to that PowerShell process. The script starts the local stack, applies `supabase/migrations/20261009000000_marketplace.sql`, prompts for a local admin email and password, creates the Auth account (or verifies the password if it already exists), and adds it to the local admin allowlist. Choose a unique password of at least 12 characters. The password and local service-role/secret key are held only in process memory; the script writes only the local publishable/anon key to `supabase-config.js`.
3. In a second terminal in this folder, run `python -m http.server 5500 --bind 127.0.0.1`, then visit `http://127.0.0.1:5500`. Sign in using the email and password you entered in the setup prompt. Supabase Studio is available at `http://127.0.0.1:54323`.
4. Stop the website server with Ctrl+C and stop Supabase with `supabase stop`. Your local database persists between stops. **`supabase db reset` deletes local database data and recreates it from migrations.**

The local API configuration is selected only on `localhost` and `127.0.0.1`; other hosts use the production configuration in `supabase-config.js`. Local Auth disables public sign-up, and the bootstrap script creates only the admin account you enter. The checked-in migration and `supabase-schema.sql` contain the same schema; keep them in sync when changing the database. For deployment, provision your cloud Supabase project separately, apply `supabase-schema.sql`, and set its project URL and publishable key in the production configuration. No browser-only or local fallback authentication is used to authorize deployed writes.

Do not leave a bootstrap admin account, public registration, or broad redirect origin enabled in production. Set Supabase Auth's minimum password length to at least 12 characters, enable its strongest available password protections, and review Auth rate limits, MFA policy, logs, backups, and project access controls before launch. This UI does not complete an MFA challenge and its RLS policies do not require JWT assurance level `aal2`; enrolling an MFA factor alone does not make writes MFA-protected. Add an MFA challenge flow and `aal2` RLS checks before claiming MFA is enforced.

## Security behavior

- Admin sign-in and password updates use Supabase Auth. Supabase manages password hashing and issues short-lived JWT access tokens. Access and refresh tokens are held in JavaScript memory only and are cleared on reload/sign-out; no admin credential or session token is saved in local storage.
- Each privileged write sends the Supabase access token. Postgres RLS and Storage policies validate the authenticated user on the service side against the `admin_users` allowlist. Hiding a button is only a UX measure, not the authorization boundary.
- Product and story inputs also have database length/range constraints. Storage enforces a 15 MB limit and an allowed MIME type list in addition to admin-only object-write policies. Browser validation is supplementary and cannot be trusted as a security check.
- The storage bucket is public so visitors can read/download published files. **Do not upload paid, private, or entitlement-controlled files.** Paid downloads require private storage, payment processing, and a server/Edge Function that checks purchase entitlements before issuing short-lived signed URLs; none is included here.
- Supabase Storage's MIME and size checks do not scan file contents or detect malware. Before accepting untrusted public uploads at scale, add a server-side/Edge Function upload pipeline with file-signature validation, malware scanning, quotas, and moderation. Do not treat client-supplied filenames or MIME types as proof of file contents.
- Seed listings remain in the static app. New products and stories are shared through Supabase. Existing uploads/stories saved by the previous local-only demo are not migrated automatically; back them up before removing browser-local data.
- Startup removes the old `ac-admin-credential` demo hash. Local-only `ac-products`/`ac-stories` data is ignored, not trusted for publication.

## Current product limitations

This integration secures admin authentication, publishing, and uploads with Supabase RLS. It does not add checkout, order records, purchase entitlements, private downloads, refund handling, tax, payouts, moderation workflows, or malware scanning. The public bucket means every uploaded file is downloadable by anyone who has its URL. Configure a private bucket plus an authenticated entitlement-checking backend before selling restricted digital goods.
