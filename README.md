
# Lavish Ladies Beauty Salon

## Quick Start

1. Install dependencies:
```bash
npm ci
```
2. Start frontend:
```bash
npm start
```
3. Start backend:
```bash
npm run server
```

## Quality Commands

- Lint:
```bash
npm run lint
```
- Build:
```bash
npm run build
```
- Test (CI mode):
```bash
npm run test:ci
```

## Monitoring

- Frontend runtime errors are posted to:
  - `POST /api/security/client-error`
- Backend unhandled errors are logged in `SecurityLog` with event `server_error`.

## Backup/Restore Checks

Run prerequisite checks for Mongo backup/restore tooling and DB connectivity:
```bash
npm run backup:check
```

This validates:
- `mongodump` availability
- `mongorestore` availability
- MongoDB ping using `MONGODB_URI`

## SEO/Indexing Notes

- Open graph preview image: `public/og-image.svg`
- Sitemap: `public/sitemap.xml`
- Robots: `public/robots.txt`

Important:
- Replace `https://example.com` in `public/index.html`, `public/robots.txt`, and `public/sitemap.xml` with your live domain before production deployment.
