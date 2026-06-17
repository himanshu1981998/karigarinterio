#!/usr/bin/env sh
set -e

python manage.py seed_catalog
gunicorn storebackend.wsgi:application --bind 0.0.0.0:${PORT}
