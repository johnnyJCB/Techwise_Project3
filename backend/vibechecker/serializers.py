# Imports
# -Django and REST Framework Imports-
from rest_framework import serializers
from vibechecker.models import Sentiment140Item

# Classes
class Sentiment140ItemSerializer(serializers.ModelSerializer):
    """A Django REST framework Model Serializer, which generates upon the 'Sentiment140Item' model."""
    class Meta:
        """Defines the metadata and what fields the Model Serializer should create."""
        model = Sentiment140Item
        fields = ["target", "tweet_id", "date", "flag", "user", "text"]
