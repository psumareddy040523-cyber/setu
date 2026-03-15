from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AppUserViewSet,
    MarketplaceDashboardAPIView,
    OfferViewSet,
    ProviderInboxAPIView,
    ProviderProfileViewSet,
    RatingViewSet,
    RequestViewSet,
)

router = DefaultRouter()
router.register(r"users", AppUserViewSet, basename="users")
router.register(r"providers", ProviderProfileViewSet, basename="providers")
router.register(r"requests", RequestViewSet, basename="requests")
router.register(r"offers", OfferViewSet, basename="offers")
router.register(r"ratings", RatingViewSet, basename="ratings")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", MarketplaceDashboardAPIView.as_view(), name="dashboard"),
    path("provider-inbox/", ProviderInboxAPIView.as_view(), name="provider-inbox"),
]
