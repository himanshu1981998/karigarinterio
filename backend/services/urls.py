from django.urls import path
from .views import ServiceEnquiryCreateView

urlpatterns = [
    path("service-enquiries/", ServiceEnquiryCreateView.as_view(), name="service-enquiry-create"),
]