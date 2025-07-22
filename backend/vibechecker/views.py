# Imports
# -Django and REST Framework Imports-
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

# -App Imports-
from vibechecker.models import Sentiment140Item
from vibechecker.serializers import Sentiment140ItemSerializer

# Views
@api_view(['GET', 'POST'])
def sentiment_140_item_list(request):
    """List all items in the Sentiment 140 dataset, or create one."""
    # Gets all items in the Dataset and returns a JSON serialized file back.
    # May be a bit much, considering we have 1,600,000 items. So be careful.
    if request.method == "GET":
        items = Sentiment140Item.objects.all()
        serializer = Sentiment140ItemSerializer(items, many=True)

        # Return GET info.
        return Response(serializer.data)

    # Does a new POST request with the given body. Inserts this into the database.
    elif request.method == "POST":
        serializer = Sentiment140ItemSerializer(data=request.data)

        # Checks if serializer comes back valid. If so, save it to the database.
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
def sentiment_140_item_detail(request, id):
    """Handle requests that interact with only one item in the Database. Requires an ID.
    
    :param request: The request to interact with.
    :param id: Int slug that indicates the id field in database."""
    # Obtains a single item from the dataset, otherwise returns a 404.
    try:
        item = Sentiment140Item.objects.get(id=id)
    except Sentiment140Item.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Handles GET requests. Returns a serialized item.
    if request.method == "GET":
        serializer = Sentiment140ItemSerializer(item)
        return Response(serializer.data)

    # Handles PUT requests. If valid, it returns the new data as confirmation. Otherwise it returns the error logs.
    elif request.method == "PUT":
        serializer = Sentiment140ItemSerializer(item, data=request.data)

        # Checks if serializer comes back valid. If so, save it to the database.
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Handles DELETE requests. Deletes the item from the database.
    elif request.method == "DELETE":
        item.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)

    