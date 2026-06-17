from django.contrib.auth import get_user_model
from django.core.management import BaseCommand
from django.core.management.base import CommandError


class Command(BaseCommand):
    help = "Create or update a superuser from environment variables."

    def add_arguments(self, parser):
        parser.add_argument("--phone", default=None)
        parser.add_argument("--password", default=None)

    def handle(self, *args, **options):
        phone = options["phone"]
        password = options["password"]

        if not phone:
            self.stdout.write(
                self.style.WARNING("DJANGO_SUPERUSER_PHONE is not set. Superuser setup skipped.")
            )
            return

        if not password:
            raise CommandError("DJANGO_SUPERUSER_PASSWORD is required when DJANGO_SUPERUSER_PHONE is set.")

        User = get_user_model()
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "is_phone_verified": True,
            },
        )

        changed = False
        for field in ("is_staff", "is_superuser", "is_active", "is_phone_verified"):
            if not getattr(user, field):
                setattr(user, field, True)
                changed = True

        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Superuser created for phone {phone}."))
        elif changed:
            self.stdout.write(self.style.SUCCESS(f"Superuser permissions updated for phone {phone}."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Superuser password refreshed for phone {phone}."))
