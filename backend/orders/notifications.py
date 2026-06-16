from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import NotificationLog


def log_notification(
    event_type,
    message,
    order=None,
    user=None,
    channel="internal",
    recipient="",
    subject="",
    status="pending",
):
    return NotificationLog.objects.create(
        event_type=event_type,
        order=order,
        user=user or getattr(order, "user", None),
        channel=channel,
        recipient=recipient,
        subject=subject,
        message=message,
        status=status,
    )


def notify_customer_order_event(order, event_type, subject, message):
    user = order.user
    email = getattr(getattr(user, "profile", None), "email", "") or ""
    phone = getattr(user, "phone", "") or order.shipping_phone or ""

    log_notification(
        event_type=event_type,
        order=order,
        user=user,
        channel="whatsapp",
        recipient=phone,
        subject=subject,
        message=message,
        status="skipped",
    )

    if not email:
        return log_notification(
            event_type=event_type,
            order=order,
            user=user,
            channel="email",
            recipient="",
            subject=subject,
            message=message,
            status="skipped",
        )

    notification = log_notification(
        event_type=event_type,
        order=order,
        user=user,
        channel="email",
        recipient=email,
        subject=subject,
        message=message,
    )

    try:
        send_mail(
            subject,
            message,
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@karigarinterio.com"),
            [email],
            fail_silently=False,
        )
        notification.status = "sent"
        notification.sent_at = timezone.now()
        notification.save(update_fields=["status", "sent_at"])
    except Exception as exc:
        notification.status = "failed"
        notification.error = str(exc)
        notification.save(update_fields=["status", "error"])

    return notification


def notify_admin_event(event_type, subject, message, order=None):
    recipients = getattr(settings, "ADMIN_NOTIFICATION_EMAILS", [])
    if not recipients:
        return log_notification(
            event_type=event_type,
            order=order,
            channel="email",
            subject=subject,
            message=message,
            status="skipped",
        )

    notification = log_notification(
        event_type=event_type,
        order=order,
        channel="email",
        recipient=", ".join(recipients),
        subject=subject,
        message=message,
    )

    try:
        send_mail(
            subject,
            message,
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@karigarinterio.com"),
            recipients,
            fail_silently=False,
        )
        notification.status = "sent"
        notification.sent_at = timezone.now()
        notification.save(update_fields=["status", "sent_at"])
    except Exception as exc:
        notification.status = "failed"
        notification.error = str(exc)
        notification.save(update_fields=["status", "error"])

    return notification
