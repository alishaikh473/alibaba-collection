# Alibaba Collection

A responsive, no-build marketplace starter. Open `index.html` directly in a browser or use **File → Open Folder** in VS Code and open the file there. It uses plain HTML, CSS, and JavaScript, so Node.js and package installation are not required to preview it.

## Working in-browser features

- Responsive storefront with image and digital-document listings, category filters, sorting, search across listings and stories, and detail views.
- Saved items and dark-mode preference stored in browser local storage.
- Image/document uploads with file type and 15 MB size checks, drag and drop, local IndexedDB storage, preview, and download of the uploader's own file.
- Dedicated article-writing page with a title, category, long-form body, and optional cover image. Stories are stored in browser local storage, with cover files in IndexedDB, and appear in the community journal.
- My Corner displays the current browser's uploads and saved items.

Seed imagery is served by Unsplash and Google Fonts; those images and fonts require an internet connection.

## Important: this is not a production marketplace backend

This starter runs entirely in one browser. It does not provide server-side user accounts, authentication, authorization, shared storage, private paid downloads, orders, payment processing, refunds, tax calculation, creator payouts, email, admin moderation, malware scanning, or secure cross-device persistence. Uploads and published stories are private to the browser profile that created them. Checkout deliberately does not claim a purchase or grant access.

Do not use it to collect payments or distribute paid/private files. Before launching a real marketplace, move accounts and content operations to a secured server, provision PostgreSQL and object storage, integrate an authentication provider and Stripe (including verified webhooks), and enforce product, order, download, and admin permissions server-side. Configure secrets outside source control, validate uploads on the server, and deploy behind HTTPS. Those services and credentials are not present in this workspace.
