# Initially from: https://www.django-rest-framework.org/tutorial/quickstart/
# Will rework to fit our needs later on.

# Imports
# - Django and REST Framework Imports -
from django.contrib.auth.models import Group, User
from rest_framework import serializers

# Classes
class UserSerializer(serializers.HyperlinkedModelSerializer):
    """TODO"""
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    """TODO"""
    class Meta:
        model = Group
        fields = ['url', 'name']