# Imports
# -Django and REST Framework Imports-
from django.http import Http404
from django.contrib.auth.models import User, Group
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, generics

# -App Imports-
from vibechecker.models import Sentiment140Item
from vibechecker.serializers import Sentiment140ItemSerializer, UserSerializer, GroupSerializer
from vibechecker.permissions import IsOwnerOrReadOnly

class Sentiment140ItemList(APIView):

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    """Returns all items in the Sentiment 140 database, or creates and saves a new entry."""
    def get(self, request, format=None) -> Response:
        """GET all items from the database."""
        items = Sentiment140Item.objects.all()
        serializer = Sentiment140ItemSerializer(items, many=True)

        # Return GET info.
        return Response(serializer.data)

    def post(self, request, format=None) -> Response:
        """POST a new item to the database."""
        serializer = Sentiment140ItemSerializer(data=request.data)

        # Checks if serializer comes back valid. If so, save it to the database.
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        """Save the owner information before saving the serializer."""
        serializer.save(owner=self.request.user)

class Sentiment140DetailList(APIView):

    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    """Returns an individual item from the Sentiment 140 database; updates the item; or deletes the entry entirely."""
    def get_object(self, id) -> Sentiment140Item:
        """Obtains a single item from the dataset, otherwise raises an Http404 error."""
        try:
            return Sentiment140Item.objects.get(id=id)
        # If it does not exist in database, raise a specific error.
        except Sentiment140Item.DoesNotExist:
            raise Http404

    def get(self, request, id, format=None) -> Response:
        """GET an item from the database with a given ID."""
        item = self.get_object(id)
        serializer = Sentiment140ItemSerializer(item)
        return Response(serializer.data)

    def put(self, request, id, format=None) -> Response:
        """
            PUT and update an item into the database with given body and ID.
            If valid, it returns the new data as confirmation.
            Otherwise it returns the error logs.
        """
        item = self.get_object(id)
        serializer = Sentiment140ItemSerializer(item, data=request.data)

        # Checks if serializer comes back valid. If so, save it to the database.
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, format=None) -> Response:
        """DELETE an item from the database with a given ID."""
        item = self.get_object(id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserViewSet(viewsets.ModelViewSet):

    """ API endpoint for managing users."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):

    """ API endpoint for managing user groups."""

    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]