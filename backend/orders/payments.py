import hmac
import json
from decimal import Decimal, ROUND_HALF_UP
from hashlib import sha256

from django.conf import settings


class RazorpayConfigurationError(RuntimeError):
    pass


def amount_to_paise(amount):
    decimal_amount = Decimal(str(amount))
    return int((decimal_amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def ensure_razorpay_configured():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise RazorpayConfigurationError("Razorpay keys are not configured.")


def get_razorpay_client():
    ensure_razorpay_configured()

    try:
        import razorpay
    except ImportError as exc:
        raise RazorpayConfigurationError(
            "Razorpay Python SDK is not installed. Install backend requirements."
        ) from exc

    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_razorpay_order(order):
    client = get_razorpay_client()
    data = {
        "amount": amount_to_paise(order.total),
        "currency": settings.RAZORPAY_CURRENCY,
        "receipt": order.order_number,
        "notes": {
            "internal_order_id": str(order.id),
            "order_number": order.order_number,
            "checkout_type": order.checkout_type,
        },
    }
    return client.order.create(data=data)


def create_razorpay_refund(order, amount=None, notes=None):
    if not order.razorpay_payment_id:
        raise RazorpayConfigurationError("Order does not have a Razorpay payment id.")

    client = get_razorpay_client()
    data = {
        "notes": {
            "order_number": order.order_number,
            **(notes or {}),
        },
    }

    if amount is not None:
        data["amount"] = amount_to_paise(amount)

    return client.payment.refund(order.razorpay_payment_id, data=data)


def build_checkout_payload(order):
    return {
        "key_id": settings.RAZORPAY_KEY_ID,
        "order_id": order.razorpay_order_id,
        "amount": amount_to_paise(order.total),
        "currency": settings.RAZORPAY_CURRENCY,
        "name": "Karigar Interio",
        "description": f"Order {order.order_number}",
        "prefill": {
            "name": order.shipping_full_name,
            "contact": order.shipping_phone,
        },
        "notes": {
            "order_number": order.order_number,
        },
        "theme": {
            "color": "#8B5E3C",
        },
    }


def verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    ensure_razorpay_configured()
    message = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        message,
        sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, razorpay_signature or "")


def verify_webhook_signature(raw_body, received_signature):
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise RazorpayConfigurationError("Razorpay webhook secret is not configured.")

    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, received_signature or "")


def parse_webhook_body(raw_body):
    if not raw_body:
        return {}
    return json.loads(raw_body.decode("utf-8"))
