# Imports
from django.urls import path
from vibechecker import views

# URL Patterns
urlpatterns = [
    path("api/v1.0/sentiment_140/", views.sentiment_140_item_list),
    path("api/v1.0/sentiment_140/<int:id>/", views.sentiment_140_item_detail),
]