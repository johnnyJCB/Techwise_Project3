# Imports
from rest_framework.urlpatterns import format_suffix_patterns
from django.urls import path
from vibechecker import views

# URL Patterns
urlpatterns = [
    path("api/v1.0/sentiment_140/", views.Sentiment140ItemList.as_view()),
    path("api/v1.0/sentiment_140/<int:id>/", views.Sentiment104DetailList.as_view()),
]

# Allows the user to change format (.json) within views.py
urlpatterns = format_suffix_patterns(urlpatterns)