from django.conf import settings
from django.db.models import F, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from products.pagination import ProductPagination

from products.models import Category,Product
from products.serializers import(
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)

from users.models import Profile, Address
from users.serializers import (
    OTPSendSerializer,
    OTPVerifySerializer,
    ProfileSerializer,
    AddressSerializer,
)


class SendOTPView(generics.GenericAPIView):
    serializer_class = OTPSendSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "otp_send"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.save()

        response_data = {
            "message": "OTP sent successfully.",
            "phone": otp.phone,
        }

        # only for local development
        if settings.DEBUG:
            response_data["otp"] = otp.code

        return Response(response_data, status=status.HTTP_200_OK)


class VerifyOTPView(generics.GenericAPIView):
    serializer_class = OTPVerifySerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "otp_verify"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result= serializer.save()
        
        user=result["user"]
        is_new_user=result["is_new_user"]
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "OTP verified successfully.",
                "user": {
                    "id": user.id,
                    "phone": user.phone,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                },
                "is_new_user": is_new_user,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_200_OK,
        )

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(
            user=self.request.user,
            defaults={
                "first_name": "",
                "last_name":"",
                "contact_number": self.request.user.phone,
            },
        )
        return profile


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by("-is_default", "-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    





class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductListView(generics.ListAPIView):
   serializer_class = ProductListSerializer
   permission_classes = [permissions.AllowAny]
   pagination_class= ProductPagination

   def get_queryset(self):
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")

    # Query params
    category_slug = self.request.query_params.get("category")
    featured = self.request.query_params.get("featured")
    sale = self.request.query_params.get("sale")
    search = self.request.query_params.get("search")

    min_price = self.request.query_params.get("min_price")
    max_price = self.request.query_params.get("max_price")
    sort = self.request.query_params.get("sort")
    limit = self.request.query_params.get("limit")

    # Category filter
    if category_slug:
        queryset = queryset.filter(category__slug=category_slug)

    #  Featured filter
    if featured == "true":
        queryset = queryset.filter(is_featured=True)

    if sale == "true":
        queryset = queryset.filter(original_price__gt=F("price"))

    #  Search filter
    if search:
        search_term = search.strip()
        queryset = queryset.filter(
            Q(name__icontains=search_term)
            | Q(sku__icontains=search_term)
            | Q(short_description__icontains=search_term)
            | Q(description__icontains=search_term)
            | Q(material_summary__icontains=search_term)
            | Q(finish__icontains=search_term)
            | Q(category__name__icontains=search_term)
        ).distinct()

    #  Price filters
    if min_price:
        queryset = queryset.filter(price__gte=min_price)

    if max_price:
        queryset = queryset.filter(price__lte=max_price)

    #  Sorting
    if sort == "price_asc":
        queryset = queryset.order_by("price")

    elif sort == "price_desc":
        queryset = queryset.order_by("-price")

    elif sort == "newest":
        queryset = queryset.order_by("-created_at")

    elif sort == "oldest":
        queryset = queryset.order_by("created_at")

    if limit and limit.isdigit():
        queryset = queryset[:int(limit)]
    

    return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images", "specifications")
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
