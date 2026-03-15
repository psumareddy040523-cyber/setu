from decimal import Decimal

from django.core.management.base import BaseCommand

from core.models import AppUser, ProviderProfile


class Command(BaseCommand):
    help = "Seed demo users and providers for SevaSetu hackathon scenarios"

    def handle(self, *args, **options):
        users = [
            {
                "name": "Ravi Farmer",
                "phone": "9000000001",
                "role": AppUser.ROLE_CUSTOMER,
                "location": "Chilakaluripet",
                "latitude": 16.0898,
                "longitude": 80.167,
            },
            {
                "name": "Lakshmi Village",
                "phone": "9000000002",
                "role": AppUser.ROLE_CUSTOMER,
                "location": "Chilakaluripet",
                "latitude": 16.092,
                "longitude": 80.169,
            },
            {
                "name": "Suresh Electric Works",
                "phone": "9000000003",
                "role": AppUser.ROLE_PROVIDER,
                "location": "Chilakaluripet",
                "latitude": 16.097,
                "longitude": 80.173,
                "rating": Decimal("4.8"),
            },
            {
                "name": "Mohan Repair Center",
                "phone": "9000000004",
                "role": AppUser.ROLE_PROVIDER,
                "location": "Chilakaluripet",
                "latitude": 16.074,
                "longitude": 80.14,
                "rating": Decimal("4.2"),
            },
            {
                "name": "Sai Pharmacy",
                "phone": "9000000005",
                "role": AppUser.ROLE_PROVIDER,
                "location": "Chilakaluripet",
                "latitude": 16.091,
                "longitude": 80.175,
                "rating": Decimal("4.6"),
            },
            {
                "name": "Green Agro Store",
                "phone": "9000000006",
                "role": AppUser.ROLE_PROVIDER,
                "location": "Chilakaluripet",
                "latitude": 16.084,
                "longitude": 80.16,
                "rating": Decimal("4.4"),
            },
        ]

        created_users = {}
        for user_data in users:
            defaults = user_data.copy()
            phone = defaults.pop("phone")
            user, _ = AppUser.objects.update_or_create(phone=phone, defaults=defaults)
            created_users[user.name] = user

        providers = [
            {
                "user": created_users["Suresh Electric Works"],
                "provider_type": ProviderProfile.TYPE_LOCAL_SERVICE,
                "service_type": ProviderProfile.SERVICE_ELECTRICIAN,
                "location": "Chilakaluripet",
                "latitude": 16.097,
                "longitude": 80.173,
                "rating": 4.8,
            },
            {
                "user": created_users["Mohan Repair Center"],
                "provider_type": ProviderProfile.TYPE_LOCAL_SERVICE,
                "service_type": ProviderProfile.SERVICE_MECHANIC,
                "location": "Chilakaluripet",
                "latitude": 16.074,
                "longitude": 80.14,
                "rating": 4.2,
            },
            {
                "user": created_users["Sai Pharmacy"],
                "provider_type": ProviderProfile.TYPE_PHARMACY,
                "service_type": ProviderProfile.SERVICE_MEDICINES,
                "location": "Chilakaluripet",
                "latitude": 16.091,
                "longitude": 80.175,
                "rating": 4.6,
            },
            {
                "user": created_users["Green Agro Store"],
                "provider_type": ProviderProfile.TYPE_AGRO_STORE,
                "service_type": ProviderProfile.SERVICE_FERTILIZERS,
                "location": "Chilakaluripet",
                "latitude": 16.084,
                "longitude": 80.16,
                "rating": 4.4,
            },
        ]

        for provider_data in providers:
            user = provider_data["user"]
            defaults = provider_data.copy()
            defaults.pop("user")
            ProviderProfile.objects.update_or_create(user=user, service_type=defaults["service_type"], defaults=defaults)

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
