import hashlib
import hmac
import json
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from products.models import Category, Product
from users.models import User

from .models import Cart, CartItem, Order, OrderItem, RazorpayWebhookEvent


RAZORPAY_SETTINGS = {
    "RAZORPAY_KEY_ID": "rzp_test_key",
    "RAZORPAY_KEY_SECRET": "test_secret",
    "RAZORPAY_WEBHOOK_SECRET": "webhook_secret",
    "RAZORPAY_CURRENCY": "INR",
}


def payment_signature(order_id, payment_id, secret="test_secret"):
    message = f"{order_id}|{payment_id}".encode("utf-8")
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def webhook_signature(raw_body, secret="webhook_secret"):
    return hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()


class RazorpayCheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(phone="9999999999", password="pass12345")
        self.client.force_authenticate(self.user)
        self.category = Category.objects.create(name="Chairs")
        self.product = Product.objects.create(
            category=self.category,
            name="Teak Lounge Chair",
            sku="TLC-001",
            description="Solid teak lounge chair",
            price=Decimal("12000.00"),
            stock=5,
            is_active=True,
        )
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        self.checkout_payload = {
            "shipping_full_name": "Himanshu Chawla",
            "shipping_phone": "9999999999",
            "shipping_address_line": "12 Studio Road",
            "shipping_city": "Delhi",
            "shipping_state": "Delhi",
            "shipping_pincode": "110001",
        }

    def post_checkout(self, payment_method):
        return self.client.post(
            reverse("checkout-create-order"),
            {**self.checkout_payload, "payment_method": payment_method},
            format="json",
        )

    def make_online_order(self):
        order = Order.objects.create(
            user=self.user,
            payment_method="online",
            payment_status="pending",
            checkout_type="cart",
            subtotal=Decimal("24000.00"),
            shipping_charge=Decimal("0.00"),
            total=Decimal("24000.00"),
            razorpay_order_id="order_test_123",
            **self.checkout_payload,
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            product_sku=self.product.sku,
            unit_price=self.product.price,
            quantity=2,
            line_total=Decimal("24000.00"),
        )
        return order

    def test_cod_checkout_decrements_stock_and_clears_cart(self):
        response = self.post_checkout("cod")

        self.assertEqual(response.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        self.assertFalse(self.cart.items.exists())
        self.assertEqual(response.data["order"]["payment_status"], "pending")

    @override_settings(**RAZORPAY_SETTINGS)
    @patch("orders.views.create_razorpay_order")
    def test_online_checkout_creates_razorpay_order_without_decrementing_stock(self, mock_create):
        mock_create.return_value = {"id": "order_test_123", "status": "created"}

        response = self.post_checkout("online")

        self.assertEqual(response.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)
        self.assertTrue(self.cart.items.exists())
        self.assertEqual(response.data["razorpay"]["order_id"], "order_test_123")
        self.assertEqual(response.data["order"]["payment_status"], "pending")

    @override_settings(**RAZORPAY_SETTINGS)
    def test_valid_payment_verification_marks_paid_decrements_stock_and_clears_cart(self):
        order = self.make_online_order()
        payment_id = "pay_test_123"

        response = self.client.post(
            reverse("razorpay-verify-payment"),
            {
                "order_number": order.order_number,
                "razorpay_order_id": order.razorpay_order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": payment_signature(order.razorpay_order_id, payment_id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(order.payment_status, "paid")
        self.assertEqual(order.status, "confirmed")
        self.assertEqual(order.razorpay_payment_id, payment_id)
        self.assertEqual(self.product.stock, 3)
        self.assertFalse(self.cart.items.exists())

    @override_settings(**RAZORPAY_SETTINGS)
    def test_invalid_payment_signature_marks_failed_without_decrementing_stock(self):
        order = self.make_online_order()

        response = self.client.post(
            reverse("razorpay-verify-payment"),
            {
                "order_number": order.order_number,
                "razorpay_order_id": order.razorpay_order_id,
                "razorpay_payment_id": "pay_test_123",
                "razorpay_signature": "bad-signature",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(order.payment_status, "failed")
        self.assertEqual(order.payment_error_code, "invalid_signature")
        self.assertEqual(self.product.stock, 5)

    @override_settings(**RAZORPAY_SETTINGS)
    def test_webhook_rejects_invalid_signature(self):
        raw_body = json.dumps({"event": "payment.captured"}).encode("utf-8")

        response = self.client.post(
            reverse("razorpay-webhook"),
            data=raw_body,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE="bad-signature",
            HTTP_X_RAZORPAY_EVENT_ID="evt_1",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(RazorpayWebhookEvent.objects.exists())

    @override_settings(**RAZORPAY_SETTINGS)
    def test_duplicate_webhook_event_is_ignored(self):
        order = self.make_online_order()
        payload = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_webhook_123",
                        "order_id": order.razorpay_order_id,
                        "status": "captured",
                    }
                }
            },
        }
        raw_body = json.dumps(payload).encode("utf-8")
        signature = webhook_signature(raw_body)

        first = self.client.post(
            reverse("razorpay-webhook"),
            data=raw_body,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE=signature,
            HTTP_X_RAZORPAY_EVENT_ID="evt_duplicate",
        )
        second = self.client.post(
            reverse("razorpay-webhook"),
            data=raw_body,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE=signature,
            HTTP_X_RAZORPAY_EVENT_ID="evt_duplicate",
        )

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        self.assertEqual(RazorpayWebhookEvent.objects.count(), 1)

    @override_settings(**RAZORPAY_SETTINGS)
    def test_out_of_stock_verification_fails_without_marking_paid(self):
        order = self.make_online_order()
        self.product.stock = 1
        self.product.save(update_fields=["stock"])
        payment_id = "pay_test_123"

        response = self.client.post(
            reverse("razorpay-verify-payment"),
            {
                "order_number": order.order_number,
                "razorpay_order_id": order.razorpay_order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": payment_signature(order.razorpay_order_id, payment_id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 409)
        order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(order.payment_status, "failed")
        self.assertEqual(order.payment_error_code, "stock_unavailable")
        self.assertEqual(self.product.stock, 1)
