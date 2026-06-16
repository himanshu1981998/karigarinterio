from rest_framework import generics, permissions
from .models import ServiceEnquiry
from .serializers import ServiceEnquirySerializer


class ServiceEnquiryCreateView(generics.CreateAPIView):
    queryset = ServiceEnquiry.objects.all()
    serializer_class = ServiceEnquirySerializer
    permission_classes = [permissions.AllowAny]