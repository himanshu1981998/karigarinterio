#!/usr/bin/env sh
set -e

python manage.py ensure_superuser --phone "${DJANGO_SUPERUSER_PHONE:-}" --password "${DJANGO_SUPERUSER_PASSWORD:-}"
python manage.py seed_catalog
gunicorn storebackend.wsgi:application --bind 0.0.0.0:${PORT}
