# Imports
# -Django and REST Framework Imports-
from rest_framework import serializers
from vibechecker.models import Sentiment140Item, SentimentResponseItem
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from rest_framework import serializers

# Init
User = get_user_model()

# Classes
class Sentiment140ItemSerializer(serializers.ModelSerializer):
    """A Django REST framework Model Serializer, which generates upon the 'Sentiment140Item' model."""
    class Meta:
        """Defines the metadata and what fields the Model Serializer should create."""
        model = Sentiment140Item
        fields = ["target", "tweet_id", "date", "flag", "user", "text"]

class SentimentResponseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SentimentResponseItem
        fields = ["query", "message", "sentiment", "certainty"]

class UserSerializer(serializers.ModelSerializer):
    # Creates a string related field to initialize in json.
    responses = SentimentResponseItemSerializer(many=True)

    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups', 'responses']

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']