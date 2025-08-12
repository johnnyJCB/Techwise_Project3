# Imports
# -Django and REST Framework Imports-
from rest_framework import serializers
from vibechecker.models import Sentiment140Item
from django.contrib.auth.models import Group, User
from rest_framework import serializers

# Classes
class Sentiment140ItemSerializer(serializers.ModelSerializer):
    """A Django REST framework Model Serializer, which generates upon the 'Sentiment140Item' model."""
    class Meta:
        """Defines the metadata and what fields the Model Serializer should create."""
        model = Sentiment140Item
        fields = ["target", "tweet_id", "date", "flag", "user", "text"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups', 'sentiment_items']

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']