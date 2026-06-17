from pathlib import Path
import shutil

from django.conf import settings
from django.core.management import BaseCommand, call_command
from django.db import transaction

from products.models import Category, Product, ProductImage, ProductSpecification


class Command(BaseCommand):
    help = "Seed production catalog data and bundled media files."

    def add_arguments(self, parser):
        parser.add_argument(
            "--replace",
            action="store_true",
            help="Delete existing catalog rows before loading the seed fixture.",
        )

    def handle(self, *args, **options):
        app_dir = Path(__file__).resolve().parents[2]
        fixture_path = app_dir / "fixtures" / "catalog_seed.json"
        seed_media_dir = app_dir / "seed_media"

        if not fixture_path.exists():
            self.stderr.write(self.style.ERROR(f"Missing fixture: {fixture_path}"))
            return

        if not seed_media_dir.exists():
            self.stderr.write(self.style.ERROR(f"Missing seed media folder: {seed_media_dir}"))
            return

        self._copy_seed_media(seed_media_dir)

        if options["replace"]:
            self._clear_catalog()
        elif Category.objects.exists() or Product.objects.exists():
            self.stdout.write(
                self.style.WARNING(
                    "Catalog rows already exist. Media was copied, fixture load skipped. "
                    "Use --replace to reload the bundled catalog."
                )
            )
            return

        call_command("loaddata", str(fixture_path), verbosity=options.get("verbosity", 1))
        self.stdout.write(self.style.SUCCESS("Catalog seed completed."))

    def _copy_seed_media(self, seed_media_dir):
        media_root = Path(settings.MEDIA_ROOT)
        media_root.mkdir(parents=True, exist_ok=True)

        for source_dir in seed_media_dir.iterdir():
            if not source_dir.is_dir():
                continue

            target_dir = media_root / source_dir.name
            target_dir.mkdir(parents=True, exist_ok=True)

            for source_file in source_dir.iterdir():
                if source_file.is_file():
                    shutil.copy2(source_file, target_dir / source_file.name)

        self.stdout.write(self.style.SUCCESS(f"Seed media copied to {media_root}"))

    @transaction.atomic
    def _clear_catalog(self):
        ProductSpecification.objects.all().delete()
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write(self.style.WARNING("Existing catalog rows deleted."))
