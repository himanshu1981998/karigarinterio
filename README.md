# Karigar Interio Deployment

This project is set up for a split deployment:

- `backend/` -> Django API on Render
- `storefrontend/` -> React/Vite storefront on Vercel

## Production checklist

1. Add secrets and env vars from `backend/.env.example` and `storefrontend/.env.example`.
2. Deploy the backend with `render.yaml`.
3. Deploy the frontend with Vercel using `storefrontend` as the project root.
4. Copy the catalog and media to production.
5. Point Razorpay webhooks at the deployed backend.

## Backend on Render

Render blueprint summary:

- Web service root: `backend`
- Plan: `free`
- Build command: `sh build.sh`
- Start command: `sh start.sh`
- Render Free web services do not include a persistent disk, so uploaded media can disappear after restarts. Use the bundled seed media for now and move uploads to Cloudinary or Supabase Storage before serious production use.

After the first deploy, set these values in Render:

- `ALLOWED_HOSTS=karigarinterio.onrender.com`
- `CORS_ALLOWED_ORIGINS=https://karigar-interio.vercel.app`
- `CSRF_TRUSTED_ORIGINS=https://karigarinterio.onrender.com,https://karigar-interio.vercel.app`
- `USE_CLOUDINARY_MEDIA=true`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

## Frontend on Vercel

Use `storefrontend` as the root directory.

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Env var: `VITE_BACKEND_BASE_API=https://karigarinterio.onrender.com/api`
- Direct routes such as `/services`, `/orders`, and `/product/<slug>` are handled by the SPA rewrite in `storefrontend/vercel.json`.

## Copy Catalog Only

Create the production schema first by deploying the backend and letting migrations run. Then copy only the catalog tables from local Postgres:

```bash
pg_dump \
  --data-only \
  --inserts \
  --table=products_category \
  --table=products_product \
  --table=products_productimage \
  --table=products_productspecification \
  karigarinterio_db > catalog-data.sql
```

Import into production:

```bash
psql "$DATABASE_URL" < catalog-data.sql
```

Copy media for product and category images to the Render media folder:

```bash
tar -czf catalog-media.tar.gz backend/media/categories backend/media/products
```

Upload and extract that archive inside the backend service environment so the files land under `MEDIA_ROOT`. On Render Free this storage is not persistent, so keep the bundled seed media and use Cloudinary for new dashboard uploads.

## Cloudinary Media

New product and category images uploaded from the dashboard are stored in Cloudinary when `USE_CLOUDINARY_MEDIA=true`. Existing bundled seed images still load from `/media/...`, so old catalog images continue to work.

After enabling Cloudinary on Render, re-upload any images that currently return `404` because Render Free already lost those local files.

## Seed Catalog On Render

This repo also includes a bundled catalog seed for the current products, categories, specifications, and media files.

The recommended Render build command runs this automatically after migrations:

```bash
sh build.sh
```

The build script installs dependencies, collects static files, runs migrations, and seeds the catalog. The seed command copies media on every run, but it only loads the fixture if the production catalog is empty.

The recommended Render start command also runs this before Gunicorn:

```bash
sh start.sh
```

That keeps bundled seed media available on Render free services after restarts.

If you already created test products in production and want to replace the production catalog with the bundled local catalog, run this manually from the Render service shell:

```bash
python manage.py seed_catalog --replace
```

For a first empty Render database, use `python manage.py seed_catalog`. The command copies files from `products/seed_media/` into `MEDIA_ROOT` and loads `products/fixtures/catalog_seed.json`.

## Verification

Backend:

- `python manage.py check --deploy`
- `python manage.py collectstatic --noinput`
- `python manage.py migrate`

Frontend:

- `npm run lint`
- `npm run build`

Smoke test:

- Homepage categories and product images load
- OTP login works
- Cart and checkout work
- Razorpay test payment verifies successfully
- Admin dashboard can manage products, categories, stock, and orders
