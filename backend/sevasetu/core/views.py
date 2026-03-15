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
    queryset = Request.objects.select_related("user", "selected_offer").all().order_by("-created_at")
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
        return Response({"message": "Request marked as completed."}, status=status.HTTP_200_OK)

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
    queryset = Offer.objects.select_related("request", "provider", "provider__user").all().order_by("price")
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
            offer = Offer.objects.select_for_update().select_related("request").get(pk=pk)
            request_obj = offer.request

            if request_obj.status != Request.STATUS_OPEN:
                return Response(
                    {"error": "Request is not open for acceptance."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            offer.status = Offer.STATUS_ACCEPTED
            offer.save(update_fields=["status"])

            Offer.objects.filter(request=request_obj).exclude(id=offer.id).update(status=Offer.STATUS_REJECTED)

            request_obj.status = Request.STATUS_ASSIGNED
            request_obj.selected_offer = offer
            request_obj.save(update_fields=["status", "selected_offer"])

        return Response({"message": "Offer accepted successfully."}, status=status.HTTP_200_OK)


class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.select_related("provider", "user", "request").all().order_by("-created_at")
    serializer_class = RatingSerializer


class MarketplaceDashboardAPIView(APIView):
    def get(self, request):
        open_requests = Request.objects.filter(status=Request.STATUS_OPEN).count()
        active_providers = ProviderProfile.objects.filter(is_active=True).count()
        accepted_offers = Offer.objects.filter(status=Offer.STATUS_ACCEPTED).count()
        completed_requests = Request.objects.filter(status=Request.STATUS_COMPLETED).count()

        response_data = {
            "open_requests": open_requests,
            "active_providers": active_providers,
            "accepted_offers": accepted_offers,
            "completed_requests": completed_requests,
        }
        return Response(response_data)


class ProviderInboxAPIView(APIView):
    def get(self, request):
        provider_id = request.query_params.get("provider_id")
        if not provider_id:
            return Response({"error": "provider_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            provider = ProviderProfile.objects.get(id=provider_id)
        except ProviderProfile.DoesNotExist:
            return Response({"error": "Provider not found"}, status=status.HTTP_404_NOT_FOUND)

        request_candidates = Request.objects.filter(status=Request.STATUS_OPEN).exclude(
            offers__provider_id=provider_id
        )

        matching_request_ids = []
        for req in request_candidates:
            if not provider_matches_request(provider, req):
                continue
            distance = haversine_km(req.latitude, req.longitude, provider.latitude, provider.longitude)
            if distance is not None and distance <= provider.max_service_km:
                matching_request_ids.append(req.id)

        matched_requests = Request.objects.filter(id__in=matching_request_ids).select_related("user")
        serializer = RequestSerializer(matched_requests, many=True)
        return Response(serializer.data)
