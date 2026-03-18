from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AppUser, Offer, ProviderProfile, Rating, Request
from .serializers import (
    AppUserSerializer,
    OfferSerializer,
    ProviderProfileSerializer,
    RatingSerializer,
    RequestSerializer,
)
from .utils import haversine_km


class AuthLoginAPIView(APIView):
    def post(self, request):
        phone = request.data.get("phone")
        pin = request.data.get("pin")

        if not phone or not pin:
            return Response(
                {"error": "Phone and PIN required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if phone == "admin" and pin == "123456":
            return Response(
                {
                    "user": {"phone": "admin", "role": "admin", "name": "Admin"},
                    "token": "admin-token",
                }
            )

        try:
            user = AppUser.objects.get(phone=phone)
        except AppUser.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        if pin != user.pin:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(
            {
                "user": {
                    "id": user.id,
                    "phone": user.phone,
                    "role": user.role,
                    "name": user.name,
                    "location": user.location,
                },
                "token": f"user-{user.id}-{user.phone}",
            }
        )


class AuthRegisterAPIView(APIView):
    def post(self, request):
        name = request.data.get("name")
        phone = request.data.get("phone")
        pin = request.data.get("pin")
        role = request.data.get("role", "customer")
        location = request.data.get("location", "")
        service_type = request.data.get("service_type")

        if not name or not phone or not pin:
            return Response(
                {"error": "Name, phone and PIN are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(pin) != 6:
            return Response(
                {"error": "PIN must be 6 digits"}, status=status.HTTP_400_BAD_REQUEST
            )

        if AppUser.objects.filter(phone=phone).exists():
            return Response(
                {"error": "Phone number already registered"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user = AppUser.objects.create(
                name=name,
                phone=phone,
                role=role,
                location=location,
            )

            if role == "provider" and service_type:
                provider_type = ProviderProfile.TYPE_LOCAL_SERVICE
                if service_type in ["medicines"]:
                    provider_type = ProviderProfile.TYPE_PHARMACY
                elif service_type in ["fertilizers", "seeds", "pesticides", "tools"]:
                    provider_type = ProviderProfile.TYPE_AGRO_STORE

                ProviderProfile.objects.create(
                    user=user,
                    provider_type=provider_type,
                    service_type=service_type,
                    location=location,
                )

        return Response(
            {
                "message": "Registration successful",
                "user": {
                    "id": user.id,
                    "phone": user.phone,
                    "role": user.role,
                    "name": user.name,
                    "location": user.location,
                },
            },
            status=status.HTTP_201_CREATED,
        )


def provider_matches_request(provider, request_obj):
    if not provider.is_active:
        return False

    if request_obj.category == Request.CAT_SERVICE:
        return provider.service_type == request_obj.service_type
    if request_obj.category == Request.CAT_MEDICINE:
        return provider.provider_type == ProviderProfile.TYPE_PHARMACY
    if request_obj.category == Request.CAT_FARM:
        return provider.provider_type == ProviderProfile.TYPE_AGRO_STORE
    return False


class AppUserViewSet(viewsets.ModelViewSet):
    queryset = AppUser.objects.all().order_by("name")
    serializer_class = AppUserSerializer


class ProviderProfileViewSet(viewsets.ModelViewSet):
    queryset = ProviderProfile.objects.select_related("user").all().order_by("id")
    serializer_class = ProviderProfileSerializer


class RequestViewSet(viewsets.ModelViewSet):
    queryset = (
        Request.objects.select_related("user", "selected_offer")
        .all()
        .order_by("-created_at")
    )
    serializer_class = RequestSerializer

    @action(detail=True, methods=["get"], url_path="offers")
    def offers(self, request, pk=None):
        request_obj = self.get_object()
        offers = request_obj.offers.select_related("provider", "provider__user").all()
        serializer = OfferSerializer(offers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        request_obj = self.get_object()
        request_obj.status = Request.STATUS_COMPLETED
        request_obj.save(update_fields=["status"])
        return Response(
            {"message": "Request marked as completed."}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["get"], url_path="nearby-providers")
    def nearby_providers(self, request, pk=None):
        request_obj = self.get_object()
        providers = ProviderProfile.objects.select_related("user").all()
        data = []

        for provider in providers:
            if not provider_matches_request(provider, request_obj):
                continue
            dist = haversine_km(
                request_obj.latitude,
                request_obj.longitude,
                provider.latitude,
                provider.longitude,
            )
            if dist is not None and dist <= 10:
                data.append(
                    {
                        "provider_id": provider.id,
                        "provider_name": provider.user.name,
                        "service_type": provider.service_type,
                        "provider_type": provider.provider_type,
                        "distance_km": round(dist, 2),
                        "rating": provider.rating,
                    }
                )

        data.sort(key=lambda item: (item["distance_km"], -item["rating"]))
        return Response(data)


class OfferViewSet(viewsets.ModelViewSet):
    queryset = (
        Offer.objects.select_related("request", "provider", "provider__user")
        .all()
        .order_by("price")
    )
    serializer_class = OfferSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        request_id = self.request.query_params.get("request_id")
        provider_id = self.request.query_params.get("provider_id")

        if request_id:
            queryset = queryset.filter(request_id=request_id)
        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)
        return queryset

    @action(detail=True, methods=["post"], url_path="accept")
    def accept(self, request, pk=None):
        with transaction.atomic():
            offer = (
                Offer.objects.select_for_update().select_related("request").get(pk=pk)
            )
            request_obj = offer.request

            if request_obj.status != Request.STATUS_OPEN:
                return Response(
                    {"error": "Request is not open for acceptance."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            offer.status = Offer.STATUS_ACCEPTED
            offer.save(update_fields=["status"])

            Offer.objects.filter(request=request_obj).exclude(id=offer.id).update(
                status=Offer.STATUS_REJECTED
            )

            request_obj.status = Request.STATUS_ASSIGNED
            request_obj.selected_offer = offer
            request_obj.save(update_fields=["status", "selected_offer"])

        return Response(
            {"message": "Offer accepted successfully."}, status=status.HTTP_200_OK
        )


class RatingViewSet(viewsets.ModelViewSet):
    queryset = (
        Rating.objects.select_related("provider", "user", "request")
        .all()
        .order_by("-created_at")
    )
    serializer_class = RatingSerializer


class MarketplaceDashboardAPIView(APIView):
    def get(self, request):
        role = request.query_params.get("role")
        user_id = request.query_params.get("user_id")

        # If role and user_id provided, return role-specific dashboard
        if role and user_id:
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                user_id = None

            if role == "customer" and user_id:
                return self.get_customer_dashboard(user_id)
            elif role == "provider" and user_id:
                return self.get_provider_dashboard(user_id)
            elif role == "admin":
                return self.get_admin_dashboard()

        # Default: return overall dashboard
        open_requests = Request.objects.filter(status=Request.STATUS_OPEN).count()
        active_providers = ProviderProfile.objects.filter(is_active=True).count()
        accepted_offers = Offer.objects.filter(status=Offer.STATUS_ACCEPTED).count()
        completed_requests = Request.objects.filter(
            status=Request.STATUS_COMPLETED
        ).count()

        response_data = {
            "open_requests": open_requests,
            "active_providers": active_providers,
            "accepted_offers": accepted_offers,
            "completed_requests": completed_requests,
        }
        return Response(response_data)

    def get_customer_dashboard(self, user_id):
        # Get customer's requests
        user_requests = Request.objects.filter(user_id=user_id)
        total_requests = user_requests.count()
        open_requests = user_requests.filter(status=Request.STATUS_OPEN).count()
        assigned_requests = user_requests.filter(status=Request.STATUS_ASSIGNED).count()
        completed_requests = user_requests.filter(
            status=Request.STATUS_COMPLETED
        ).count()
        cancelled_requests = user_requests.filter(
            status=Request.STATUS_CANCELLED
        ).count()

        # Get offers for customer's requests
        customer_request_ids = user_requests.values_list("id", flat=True)
        total_offers = Offer.objects.filter(request_id__in=customer_request_ids).count()
        accepted_offers = Offer.objects.filter(
            request_id__in=customer_request_ids, status=Offer.STATUS_ACCEPTED
        ).count()
        pending_offers = Offer.objects.filter(
            request_id__in=customer_request_ids, status=Offer.STATUS_PENDING
        ).count()
        rejected_offers = Offer.objects.filter(
            request_id__in=customer_request_ids, status=Offer.STATUS_REJECTED
        ).count()

        return Response(
            {
                "role": "customer",
                "total_requests": total_requests,
                "open_requests": open_requests,
                "assigned_requests": assigned_requests,
                "completed_requests": completed_requests,
                "cancelled_requests": cancelled_requests,
                "total_offers": total_offers,
                "accepted_offers": accepted_offers,
                "pending_offers": pending_offers,
                "rejected_offers": rejected_offers,
            }
        )

    def get_provider_dashboard(self, user_id):
        # Get provider profiles for this user
        try:
            user = AppUser.objects.get(id=user_id)
            provider_profiles = ProviderProfile.objects.filter(user=user)
        except AppUser.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        total_providers = provider_profiles.count()
        active_providers = provider_profiles.filter(is_active=True).count()

        # Get offers from these providers
        provider_ids = provider_profiles.values_list("id", flat=True)
        total_offers = Offer.objects.filter(provider_id__in=provider_ids).count()
        accepted_offers = Offer.objects.filter(
            provider_id__in=provider_ids, status=Offer.STATUS_ACCEPTED
        ).count()
        pending_offers = Offer.objects.filter(
            provider_id__in=provider_ids, status=Offer.STATUS_PENDING
        ).count()
        rejected_offers = Offer.objects.filter(
            provider_id__in=provider_ids, status=Offer.STATUS_REJECTED
        ).count()
        withdrawn_offers = Offer.objects.filter(
            provider_id__in=provider_ids, status=Offer.STATUS_WITHDRAWN
        ).count()

        # Get requests in provider inbox (matching their service types)
        inbox_count = 0
        for profile in provider_profiles:
            request_candidates = Request.objects.filter(
                status=Request.STATUS_OPEN
            ).exclude(offers__provider_id=profile.id)
            for req in request_candidates:
                if provider_matches_request(profile, req):
                    distance = haversine_km(
                        req.latitude, req.longitude, profile.latitude, profile.longitude
                    )
                    if distance is not None and distance <= profile.max_service_km:
                        inbox_count += 1

        return Response(
            {
                "role": "provider",
                "total_profiles": total_providers,
                "active_providers": active_providers,
                "total_offers": total_offers,
                "accepted_offers": accepted_offers,
                "pending_offers": pending_offers,
                "rejected_offers": rejected_offers,
                "withdrawn_offers": withdrawn_offers,
                "inbox_count": inbox_count,
            }
        )

    def get_admin_dashboard(self):
        # Overall statistics
        total_users = AppUser.objects.count()
        total_customers = AppUser.objects.filter(role=AppUser.ROLE_CUSTOMER).count()
        total_service_providers = AppUser.objects.filter(
            role=AppUser.ROLE_PROVIDER
        ).count()

        total_requests = Request.objects.count()
        open_requests = Request.objects.filter(status=Request.STATUS_OPEN).count()
        assigned_requests = Request.objects.filter(
            status=Request.STATUS_ASSIGNED
        ).count()
        completed_requests = Request.objects.filter(
            status=Request.STATUS_COMPLETED
        ).count()
        cancelled_requests = Request.objects.filter(
            status=Request.STATUS_CANCELLED
        ).count()

        total_providers = ProviderProfile.objects.count()
        active_providers = ProviderProfile.objects.filter(is_active=True).count()

        total_offers = Offer.objects.count()
        accepted_offers = Offer.objects.filter(status=Offer.STATUS_ACCEPTED).count()
        pending_offers = Offer.objects.filter(status=Offer.STATUS_PENDING).count()
        rejected_offers = Offer.objects.filter(status=Offer.STATUS_REJECTED).count()

        return Response(
            {
                "role": "admin",
                "total_users": total_users,
                "total_customers": total_customers,
                "total_service_providers": total_service_providers,
                "total_requests": total_requests,
                "open_requests": open_requests,
                "assigned_requests": assigned_requests,
                "completed_requests": completed_requests,
                "cancelled_requests": cancelled_requests,
                "total_providers": total_providers,
                "active_providers": active_providers,
                "total_offers": total_offers,
                "accepted_offers": accepted_offers,
                "pending_offers": pending_offers,
                "rejected_offers": rejected_offers,
            }
        )


class ProviderInboxAPIView(APIView):
    def get(self, request):
        provider_id = request.query_params.get("provider_id")
        if not provider_id:
            return Response(
                {"error": "provider_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            provider = ProviderProfile.objects.get(id=provider_id)
        except ProviderProfile.DoesNotExist:
            return Response(
                {"error": "Provider not found"}, status=status.HTTP_404_NOT_FOUND
            )

        request_candidates = Request.objects.filter(status=Request.STATUS_OPEN).exclude(
            offers__provider_id=provider_id
        )

        matching_request_ids = []
        for req in request_candidates:
            if not provider_matches_request(provider, req):
                continue
            distance = haversine_km(
                req.latitude, req.longitude, provider.latitude, provider.longitude
            )
            if distance is not None and distance <= provider.max_service_km:
                matching_request_ids.append(req.id)

        matched_requests = Request.objects.filter(
            id__in=matching_request_ids
        ).select_related("user")
        serializer = RequestSerializer(matched_requests, many=True)
        return Response(serializer.data)


class MyRequestsAPIView(APIView):
    def get(self, request):
        user_id = request.query_params.get("user_id")
        user_role = request.query_params.get("user_role")

        if not user_id or not user_role:
            return Response(
                {"error": "user_id and user_role required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user_role == "customer":
            requests = (
                Request.objects.filter(user_id=user_id)
                .select_related("user")
                .order_by("-created_at")
            )
        elif user_role == "provider":
            try:
                provider = ProviderProfile.objects.get(user_id=user_id)
                offers = Offer.objects.filter(provider=provider).select_related(
                    "request", "request__user"
                )
                request_ids = [o.request_id for o in offers]
                requests = (
                    Request.objects.filter(id__in=request_ids)
                    .select_related("user")
                    .order_by("-created_at")
                )
            except ProviderProfile.DoesNotExist:
                requests = Request.objects.none()
        else:
            requests = Request.objects.none()

        serializer = RequestSerializer(requests, many=True)
        return Response(serializer.data)


class MyOffersAPIView(APIView):
    def get(self, request):
        user_id = request.query_params.get("user_id")

        if not user_id:
            return Response(
                {"error": "user_id required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            provider = ProviderProfile.objects.get(user_id=user_id)
        except ProviderProfile.DoesNotExist:
            return Response({"offers": []})

        offers = (
            Offer.objects.filter(provider=provider)
            .select_related("request", "provider", "provider__user")
            .order_by("-created_at")
        )
        serializer = OfferSerializer(offers, many=True)
        return Response(serializer.data)
