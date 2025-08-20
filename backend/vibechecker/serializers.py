# Imports
# -Django and REST Framework Imports-
from vibechecker.models import Sentiment140Item, SentimentResponseItem
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.contrib.auth import password_validation
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
    """A serializer that generates fields for the User class."""
    responses = SentimentResponseItemSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['url', 'username', 'password', 'email', 'groups', 'responses']
        extra_kwargs = {'password': {'required': True, 'write_only': True}, 'email': {'required': True}}

    def validate_password(self, value):
        password_validation.validate_password(password=value)
        return value

    def create(self, validated_data):
        # Creates the initial user object.
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email']
        )

        # Sets the password by hash and saves user to database.
        user.set_password(validated_data['password'])
        user.save()
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        password = validated_data.get('password', '')
        if password:
            instance.set_password(password)

        instance.save()

        return instance

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']