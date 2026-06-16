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
- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start command: `gunicorn storebackend.wsgi:application --bind 0.0.0.0:$PORT`
- Persistent disk mount: `/opt/render/project/src/backend/media`

After the first deploy, set these values in Render:

- `ALLOWED_HOSTS=<your-render-backend-host>`
- `CORS_ALLOWED_ORIGINS=<your-vercel-frontend-url>`
- `CSRF_TRUSTED_ORIGINS=<your-render-backend-url>,<your-vercel-frontend-url>`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

## Frontend on Vercel

Use `storefrontend` as the root directory.

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Env var: `VITE_BACKEND_BASE_API=https://<your-render-backend-host>/api`

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

Copy media for product and category images to the Render disk-backed media folder:

```bash
tar -czf catalog-media.tar.gz backend/media/categories backend/media/products
```

Upload and extract that archive inside the backend service environment so the files land under `MEDIA_ROOT`.

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
