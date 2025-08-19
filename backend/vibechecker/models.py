# Imports
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser

# Classes
class RegisteredUser(AbstractUser):
    """A custom user model for Django. Used to add fields."""
    test_field = models.CharField(max_length=10)

class Sentiment140Item(models.Model):
    """
        Kaggle Dataset "Sentiment140 dataset with 1.6 million tweets": https://www.kaggle.com/datasets/kazanova/sentiment140?resource=download
        
        Members named and ordered according to the original dataset, with the exception of id (it conflicts with Django field creation). 
        db_comment field is from db's Kaggle page, which is currently commented out due to SQLite restrictions.
    """
    # Enum Classes
    class Target(models.IntegerChoices):
        """Integer choice enum class for Sentiment140Item's 'target' member."""
        NEGATIVE = 0, _("negative")
        NEUTRAL = 2, _("neutral")
        POSITIVE = 4, _("positive")

    # Members
    """owner = models.ForeignKey(
        'auth.User', related_name='sentiment_items', on_delete=models.CASCADE,
        #db_comment="user that created the sentiment item"
    )"""

    target = models.IntegerField(
        choices=Target,
        #db_comment="the polarity of the tweet (0 = negative, 2 = neutral, 4 = positive)"
    )
    tweet_id = models.IntegerField(
        #unique=True,
        #db_comment="The id of the tweet ( 2087)"
    )
    date = models.DateTimeField(
        #db_comment="the date of the tweet (Sat May 16 23:58:44 UTC 2009)"
    )
    flag = models.CharField(
        max_length=10,
        #db_comment="The query (lyx). If there is no query, then this value is NO_QUERY."
    )
    user = models.CharField(
        max_length=15,
        #db_comment="the user that tweeted (robotickilldozr)"
    )
    text = models.TextField(
        max_length=280,
        #db_comment="the text of the tweet (Lyx is cool). Important Note: Max Length according to normal users, not including Twitter Blue users."
    )

    def __str__(self):
        return f'User "{self.user}" said "{self.text}" on {self.date}."'

class SentimentResponseItem:
    """Any response sent from a given model (ChatGPT, Sentiment140 Model, etc.)."""

    