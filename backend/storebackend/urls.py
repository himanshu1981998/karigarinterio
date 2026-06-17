"""
URL configuration for storebackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from pathlib import Path

from django.contrib import admin
from django.http import Http404
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from rest_framework_simplejwt.views import TokenRefreshView


def serve_media_or_seed(request, path):
    media_root = Path(settings.MEDIA_ROOT)
    media_path = media_root / path

    if media_path.exists():
        return serve(request, path, document_root=settings.MEDIA_ROOT)

    seed_media_root = settings.BASE_DIR / "products" / "seed_media"
    seed_path = seed_media_root / path

    if seed_path.exists():
        return serve(request, path, document_root=seed_media_root)

    raise Http404("Media file was not found.")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/', include('orders.urls')),
    path("api/auth/token/refresh/",TokenRefreshView.as_view(),name="token_refresh"),
    path("api/", include("services.urls")),
]
if settings.DEBUG or settings.SERVE_MEDIA:
    urlpatterns += [
        re_path(
            rf"^{settings.MEDIA_URL.lstrip('/')}(.+)$",
            serve_media_or_seed,
            name="media",
        )
    ]
