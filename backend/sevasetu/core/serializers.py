from django.db.models import Avg
from rest_framework import serializers

from .models import AppUser, Offer, ProviderProfile, Rating, Request
from .utils import haversine_km


class AppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = [
            "id",
            "name",
            "phone",
            "role",
            "location",
            "latitude",
            "longitude",
            "rating",
            "created_at",
        ]
        read_only_fields = ["id", "rating", "created_at"]


class ProviderProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = ProviderProfile
        fields = [
            "id",
            "user",
            "user_name",
            "provider_type",
            "service_type",
            "location",
            "latitude",
            "longitude",
            "rating",
            "max_service_km",
            "is_active",
        ]
        read_only_fields = ["id", "rating"]


class RequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Request
        fields = [
            "id",
            "user",
            "user_name",
            "category",
            "service_type",
            "product_name",
            "quantity",
            "description",
            "prescription_image",
            "location",
            "latitude",
            "longitude",
            "preferred_time",
            "status",
            "selected_offer",
            "created_at",
        ]
        read_only_fields = ["id", "status", "selected_offer", "created_at"]


class OfferSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.user.name", read_only=True)
    provider_rating = serializers.FloatField(source="provider.rating", read_only=True)

    class Meta:
        model = Offer
        fields = [
            "id",
            "request",
            "provider",
            "provider_name",
            "provider_rating",
            "price",
            "availability",
            "eta",
            "eta_minutes",
            "delivery_time",
            "delivery_option",
            "distance_km",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "distance_km", "status", "created_at"]

    def validate(self, attrs):
        request_obj = attrs["request"]
        provider = attrs["provider"]
        if request_obj.status != Request.STATUS_OPEN:
            raise serializers.ValidationError("Offers can only be created for open requests.")
        if request_obj.category == Request.CAT_SERVICE and request_obj.service_type != provider.service_type:
            raise serializers.ValidationError("Provider service type does not match request.")
        if request_obj.category == Request.CAT_MEDICINE and provider.provider_type != ProviderProfile.TYPE_PHARMACY:
            raise serializers.ValidationError("Only pharmacies can respond to medicine requests.")
        if request_obj.category == Request.CAT_FARM and provider.provider_type != ProviderProfile.TYPE_AGRO_STORE:
            raise serializers.ValidationError("Only agro stores can respond to farm requests.")

        dist = haversine_km(
            request_obj.latitude,
            request_obj.longitude,
            provider.latitude,
            provider.longitude,
        )
        if dist is not None and dist > provider.max_service_km:
            raise serializers.ValidationError("Provider is outside supported range.")
        attrs["distance_km"] = round(dist or 0, 2)
        return attrs


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ["id", "request", "user", "provider", "rating", "review", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        rating_obj = super().create(validated_data)
        provider = rating_obj.provider
        avg_rating = provider.received_ratings.aggregate(value=Avg("rating")).get("value") or 0
        provider.rating = round(avg_rating, 2)
        provider.save(update_fields=["rating"])

        app_user = provider.user
        app_user.rating = provider.rating
        app_user.save(update_fields=["rating"])
        return rating_obj
