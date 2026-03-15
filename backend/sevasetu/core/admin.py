from django.contrib import admin
from .models import AppUser, ProviderProfile, Request, Offer, Rating

admin.site.register(AppUser)
admin.site.register(ProviderProfile)
admin.site.register(Request)
admin.site.register(Offer)
admin.site.register(Rating)
