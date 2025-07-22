# Imports
from rest_framework.urlpatterns import format_suffix_patterns
from django.urls import path
from vibechecker import views

# URL Patterns
urlpatterns = [
    path("api/v1.0/sentiment_140/", views.sentiment_140_item_list),
    path("api/v1.0/sentiment_140/<int:id>/", views.sentiment_140_item_detail),
]

# Allows the user to change format (.json) within views.py
urlpatterns = format_suffix_patterns(urlpatterns)