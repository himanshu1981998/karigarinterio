from django.db import models


class ServiceEnquiry(models.Model):
    SERVICE_CHOICES = (
        ("plumbing", "Plumbing"),
        ("false-ceiling", "False Ceiling Work"),
        ("electrical", "Electrical Work"),
        ("window-installation", "Window Installation"),
        ("modular-kitchen", "Modular Kitchen"),
        ("wardrobe-installation", "Wardrobe Installation"),
        ("painting", "Painting"),
        ("carpentry", "Carpentry"),
        ("tile-work", "Tile Work"),
        ("consultation", "Interior Consultation"),
    )

    STATUS_CHOICES = (
        ("new", "New"),
        ("contacted", "Contacted"),
        ("in-progress", "In Progress"),
        ("closed", "Closed"),
    )

    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    city = models.CharField(max_length=120, blank=True, default="")

    selected_services = models.JSONField(default=list, blank=True)
    other_service = models.CharField(max_length=255, blank=True)
    requirements = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} - {self.phone}"
