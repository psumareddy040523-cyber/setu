from django.core.management.base import BaseCommand

from core.models import AppUser, Offer, ProviderProfile, Rating, Request


class Command(BaseCommand):
    help = "Remove all data from the database (users, providers, requests, offers, ratings). Tables and schema are kept."

    def handle(self, *args, **options):
        # Delete in order to respect foreign keys
        Rating.objects.all().delete()
        self.stdout.write("Deleted all ratings.")

        Offer.objects.all().delete()
        self.stdout.write("Deleted all offers.")

        Request.objects.all().delete()
        self.stdout.write("Deleted all requests.")

        ProviderProfile.objects.all().delete()
        self.stdout.write("Deleted all provider profiles.")

        AppUser.objects.all().delete()
        self.stdout.write("Deleted all users.")

        self.stdout.write(self.style.SUCCESS("All data cleared. Run 'python manage.py seed_demo' to add demo data again."))
