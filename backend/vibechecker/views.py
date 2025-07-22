# Imports
# -Django and REST Framework Imports-
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser

# -App Imports-
from vibechecker.models import Sentiment140Item
from vibechecker.serializers import Sentiment140ItemSerializer

# Views
@csrf_exempt
def sentiment_140_item_list(request):
    """Handle requests that have no slugs. Like POST requests.
    Important Note: This is currently CSRF Exempt for testing purposes! Be wary.
    
    :param request: The request to interact with."""
    # Gets all items in the Dataset and returns a JSON serialized file back.
    # May be a bit much, considering we have 1,600,000 items. So be careful.
    if request.method == "GET":
        items = Sentiment140Item.objects.all()
        serializer = Sentiment140ItemSerializer(items, many=True)

        # Return GET info.
        return JsonResponse(serializer.data, safe=False)

    # Does a new POST request with the given body. Inserts this into the database.
    elif request.method == "POST":
        data = JSONParser().parse(request)
        serializer = Sentiment140ItemSerializer(data=data)

        # Checks if serializer comes back valid. If so, save it to the database.
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def sentiment_140_item_detail(request, id):
    """Handle requests that interact with only one item in the Database. Requires an ID.
    Important Note: This is currently CSRF Exempt for testing purposes! Be wary.
    
    :param request: The request to interact with.
    :param id: Int slug that indicates the id field in database."""
    # Obtains a single item from the dataset, otherwise returns a 404.
    try:
        item = Sentiment140Item.objects.get(id=id)
    except Sentiment140Item.DoesNotExist:
        return HttpResponse(status=404)

    # Handles GET requests. Returns a serialized item.
    if request.method == "GET":
        serializer = Sentiment140ItemSerializer(item)
        return JsonResponse(serializer.data)

    # Handles PUT requests. If valid, it returns the new data as confirmation. Otherwise it returns the error logs.
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = Sentiment140ItemSerializer(item, data=data)

        # Checks if serializer comes back valid. If so, save it to the database.
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=404)

    # Handles DELETE requests. Deletes the item from the database.
    elif request.method == "DELETE":
        item.delete()
        return HttpResponse(status=204)

    