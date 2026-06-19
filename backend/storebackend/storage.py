from pathlib import PurePosixPath
from urllib.parse import urljoin
from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.files.storage import Storage
from django.utils.encoding import filepath_to_uri
from django.utils.text import slugify


CLOUDINARY_PREFIX = "cloudinary/"


def is_cloudinary_name(name):
    return bool(name and str(name).startswith(CLOUDINARY_PREFIX))


def _cloudinary_public_id(name):
    return str(name)[len(CLOUDINARY_PREFIX) :]


def _configure_cloudinary():
    if not (
        settings.CLOUDINARY_CLOUD_NAME
        and settings.CLOUDINARY_API_KEY
        and settings.CLOUDINARY_API_SECRET
    ):
        raise ImproperlyConfigured(
            "Cloudinary media storage requires CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        )

    import cloudinary

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


class CloudinaryMediaStorage(Storage):
    """
    Stores new uploads on Cloudinary while preserving existing local /media paths.
    Database names that start with cloudinary/ are Cloudinary public IDs.
    All other names are treated as legacy local/seed media.
    """

    def _open(self, name, mode="rb"):
        raise FileNotFoundError("Cloudinary media is not available as a local file.")

    def _save(self, name, content):
        _configure_cloudinary()

        from cloudinary import uploader

        source_path = PurePosixPath(name)
        upload_dir = "" if str(source_path.parent) == "." else str(source_path.parent)
        folder = "/".join(
            part.strip("/")
            for part in (settings.CLOUDINARY_FOLDER, upload_dir)
            if part and part.strip("/")
        )
        public_stem = slugify(source_path.stem) or "image"
        public_id = f"{public_stem}-{uuid4().hex[:12]}"

        if hasattr(content, "seek"):
            content.seek(0)

        upload_result = uploader.upload(
            content,
            folder=folder or None,
            public_id=public_id,
            overwrite=False,
            resource_type="image",
        )

        return f"{CLOUDINARY_PREFIX}{upload_result['public_id']}"

    def delete(self, name):
        if not is_cloudinary_name(name):
            return

        _configure_cloudinary()

        from cloudinary import uploader

        uploader.destroy(_cloudinary_public_id(name), resource_type="image")

    def exists(self, name):
        return False

    def url(self, name):
        if is_cloudinary_name(name):
            _configure_cloudinary()

            from cloudinary import CloudinaryImage

            return CloudinaryImage(_cloudinary_public_id(name)).build_url(
                secure=True,
                resource_type="image",
            )

        return urljoin(settings.MEDIA_URL, filepath_to_uri(name))

    def size(self, name):
        return 0
