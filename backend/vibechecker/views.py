# Imports
# -Django and REST Framework Imports-
from django.http import Http404, JsonResponse
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status, permissions, viewsets, generics
import json
import re

# -App Imports-
from vibechecker.models import Sentiment140Item, SentimentResponseItem
from vibechecker.serializers import Sentiment140ItemSerializer, SentimentResponseItemSerializer, UserSerializer, GroupSerializer
from vibechecker.permissions import IsStaffOrOwnerOrReadOnly, IsStaffForPOST

# -Normal Imports-
from openai import OpenAI
from .local_settings import API_KEY, GPT_MODEL
import re

# Init
User = get_user_model()

# Constants
QUERY_KEY = "query"

# -Constants for modeling-
MODEL_MOTIVATION = "Do a sentiment analysis of a given message, with these stipulations: "
MODEL_CONSTRAINTS = """
1. Return responses in the specified format: '<Sentiment tone, only using words: Negative, Positive, or Neutral> <Certainty percentage, like 100%, 48%, etc.>. Analysis: <Reasoning for result>. Why: <Reasoning for certainty>.'
"""
MODEL_INSTRUCTIONS = MODEL_MOTIVATION + MODEL_CONSTRAINTS
MODEL_ACCEPTABLE_SENTIMENTS = ["Negative", "Positive", "Neutral"]

# Classes
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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
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

class Sentiment140ModelList(APIView):
    """Returns items from the Sentiment 140 Model."""
    client = OpenAI(api_key=API_KEY)
    permission_classes = [permissions.IsAuthenticated]

    def clean_text(self, text):
        """Clean a piece of text. Originally implemented by TechwiseCapstone_Sentiment_Analysis submodule."""
        text = re.sub(r"http\S+", "", text)
        text = re.sub(r"[^a-zA-Z0-9 .,!?\'\n]", "", text)
        return text.lower().strip()

    def get_prompt(self, query):
        """Get a prompt from ChatGPT."""
        response = self.client.responses.create(
            model=GPT_MODEL,
            instructions=MODEL_INSTRUCTIONS,
            input=query,
        )
        output = response.output_text

        return output

    def add_to_user(self, user, query, message, sentiment, certainty):
        if user.is_authenticated:
            item = SentimentResponseItem(user=user, query=query, message=message, sentiment=sentiment, certainty=certainty)
            item.save()

    def post(self, request, format=None) -> Response:
        """POST a prompt into the model and process its response."""
        model_query = request.data.get(QUERY_KEY, "")

        # If Query is not invalid.
        if model_query:
            # Creates the response.
            model_full_message = self.get_prompt(model_query)

            # Gets the sentiment and its certainty, which should just be the first two words.
            model_sentiment, model_certainty, model_message = model_full_message.split(maxsplit=2)

            # Validates sentiment manually, probably better way to do this due to uncertainty, but will work for now.
            if model_sentiment not in MODEL_ACCEPTABLE_SENTIMENTS:
                model_sentiment = "Other"
            # Validates certainty manually, turning it into an int and removing specified signs.
            try:
                model_certainty = int(model_certainty.replace('%', '').replace(".",''))
            except ValueError:
                model_certainty = None

            model_response = {
                'full_message': model_full_message,
                'message': model_message,
                'sentiment': model_sentiment,
                'certainty': model_certainty,
            }

            self.add_to_user(request.user, model_query, model_message, model_sentiment, model_certainty)
            return Response(model_response)
        # Otherwise return a 400 error.
        else:
            error_response = {
                'message': '❌ ERROR: No query, or an invalid query, was placed in body.',
                'error': True,
                'code': 400
            }
            return Response(error_response, status=status.HTTP_400_BAD_REQUEST)

class SentimentResponseViewSet(viewsets.ReadOnlyModelViewSet):
    """A response item from a model, tied to a user."""
    queryset = SentimentResponseItem.objects.all()
    serializer_class = SentimentResponseItemSerializer
    permission_classes = [IsStaffOrOwnerOrReadOnly]

class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for managing users."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsStaffOrOwnerOrReadOnly, IsStaffForPOST]

class GroupViewSet(viewsets.ModelViewSet):
    """API endpoint for managing user groups."""
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    
def flesch_kincaid(text):
    # This is a basic syllable counter, you might want to use a more robust library
    # like 'syllables' if you need a more accurate result.
    def count_syllables_simple(word):
        word = word.lower()
        if not word:
            return 0
        count = len(re.findall(r'[aeiouy]+', word))
        if word.endswith('e'):
            count -= 1
        if count == 0:
            count += 1
        return count

    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    if not sentences: 
        return 0
    sentences_count = len(sentences)

    words = len(re.findall(r'\b\w+\b', text.lower()))
    if words == 0:
        return 0
    
    syllables = sum(count_syllables_simple(word) for word in re.findall(r'\b\w+\b', text.lower()))

    # FleschKincaid formula
    score = 206.835 - 1.015 * (words / sentences_count) - 84.6 * (syllables / words)
    return round(score)

def get_reading_level(score):
    if score >= 90:
        return "Very easy (Middle School level)"
    if score >= 60:
        return "Plain English (High School level)"
    if score >= 0:
        return "College graduate level"
    return "Extremely difficult/academic"
    
class ReadabilityScoreView(APIView):
    """
    Calculates the Flesch-Kincaid readability score of a given text.
    """
    def post(self, request, format=None):
        try:
            
            text = request.data.get('text', '')
            
            if not text:
                return Response({'error': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            score = flesch_kincaid(text)
            level = get_reading_level(score)
            
            return Response({'score': score, 'level': level}, status=status.HTTP_200_OK)
            
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
