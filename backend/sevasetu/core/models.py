from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class AppUser(models.Model):
    ROLE_CUSTOMER = "customer"
    ROLE_PROVIDER = "provider"
    ROLE_CHOICES = [
        (ROLE_CUSTOMER, "Customer"),
        (ROLE_PROVIDER, "Provider"),
    ]

    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    rating = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"


class ProviderProfile(models.Model):
    TYPE_LOCAL_SERVICE = "local_service"
    TYPE_PHARMACY = "pharmacy"
    TYPE_AGRO_STORE = "agro_store"
    PROVIDER_TYPE_CHOICES = [
        (TYPE_LOCAL_SERVICE, "Local Service"),
        (TYPE_PHARMACY, "Pharmacy"),
        (TYPE_AGRO_STORE, "Agro Store"),
    ]

    SERVICE_ELECTRICIAN = "electrician"
    SERVICE_PLUMBER = "plumber"
    SERVICE_MECHANIC = "mechanic"
    SERVICE_TRACTOR_RENTAL = "tractor_rental"
    SERVICE_PUMP_REPAIR = "pump_repair"
    SERVICE_MEDICINES = "medicines"
    SERVICE_FERTILIZERS = "fertilizers"
    SERVICE_SEEDS = "seeds"
    SERVICE_PESTICIDES = "pesticides"
    SERVICE_TOOLS = "tools"

    SERVICE_TYPE_CHOICES = [
        (SERVICE_ELECTRICIAN, "Electrician"),
        (SERVICE_PLUMBER, "Plumber"),
        (SERVICE_MECHANIC, "Mechanic"),
        (SERVICE_TRACTOR_RENTAL, "Tractor Rental"),
        (SERVICE_PUMP_REPAIR, "Pump Repair"),
        (SERVICE_MEDICINES, "Medicines"),
        (SERVICE_FERTILIZERS, "Fertilizers"),
        (SERVICE_SEEDS, "Seeds"),
        (SERVICE_PESTICIDES, "Pesticides"),
        (SERVICE_TOOLS, "Tools"),
    ]

    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="provider_profiles")
    provider_type = models.CharField(max_length=30, choices=PROVIDER_TYPE_CHOICES)
    service_type = models.CharField(max_length=40, choices=SERVICE_TYPE_CHOICES)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    rating = models.FloatField(default=0)
    max_service_km = models.FloatField(default=10)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.name} - {self.service_type}"


class Request(models.Model):
    CAT_SERVICE = "service"
    CAT_MEDICINE = "medicine"
    CAT_FARM = "farm"
    CATEGORY_CHOICES = [
        (CAT_SERVICE, "Service"),
        (CAT_MEDICINE, "Medicine"),
        (CAT_FARM, "Farm"),
    ]

    STATUS_OPEN = "open"
    STATUS_ASSIGNED = "assigned"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_OPEN, "Open"),
        (STATUS_ASSIGNED, "Assigned"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="requests")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    service_type = models.CharField(max_length=40, blank=True)
    product_name = models.CharField(max_length=120, blank=True)
    quantity = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True)
    prescription_image = models.URLField(blank=True)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    preferred_time = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN)
    selected_offer = models.OneToOneField(
        "Offer",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="selected_for_request",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request #{self.id} ({self.category})"


class Offer(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_REJECTED = "rejected"
    STATUS_WITHDRAWN = "withdrawn"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_WITHDRAWN, "Withdrawn"),
    ]

    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="offers")
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name="offers")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    availability = models.CharField(max_length=200)
    eta = models.CharField(max_length=80, blank=True)
    eta_minutes = models.PositiveIntegerField(default=0)
    delivery_time = models.CharField(max_length=80, blank=True)
    delivery_option = models.CharField(max_length=80, blank=True)
    distance_km = models.FloatField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["price", "distance_km", "-provider__rating"]

    def __str__(self):
        return f"Offer #{self.id} for Request #{self.request_id}"


class Rating(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="given_ratings")
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name="received_ratings")
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("request", "user", "provider")

    def __str__(self):
        return f"Rating {self.rating} for provider {self.provider_id}"
