# Imports
# -Django Imports-
from django.core.management.base import BaseCommand, CommandError
from vibechecker.models import Sentiment140Item as Item

# -Scikit Learn Imports-
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# -Other Imports-
from pathlib import Path
import pandas as pd
import re
import textstat
import joblib

# Constants
WRITE_DIRECTORY = Path("./TechwiseCapstone_Sentiment_Analysis").resolve()

# Functions (Implemented from TechwiseCapstone_Sentiment_Analysis submodule)
def advanced_professionalism_score(text):
    """Returns a professionalism score. Originally implemented by TechwiseCapstone_Sentiment_Analysis submodule."""
    text = text.lower()
    score = 0
    if re.search(r"\b(yo|dude|bro|u|lmao|lol|wtf|gonna|wanna|thx|btw)\b", text):
        score -= 2
    if re.search(r"(regards|sincerely|kindly|thank you|attached|please find|i hope this email|looking forward to working)", text):
        score += 3  # Stronger reward for formal phrases
    if "'" in text or re.search(r"\b(can't|won't|i'm|it's|don't)\b", text):
        score -= 1
    try:
        grade = textstat.flesch_kincaid_grade(text)
        if grade > 10: score += 1
        elif grade < 6: score -= 1
        avg_len = textstat.avg_sentence_length(text)
        if avg_len > 15: score += 1
        elif avg_len < 8: score -= 1
    except:
        pass
    return 0 if score <= -1 else 1 if score <= 1 else 2

def clean(text):
    """Clean a piece of text. Originally implemented by TechwiseCapstone_Sentiment_Analysis submodule."""
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z ]", "", text)
    return text.lower()

# Classes
class Command(BaseCommand):
    """
        Utilizes Django's built-in command to add a model import to manage.py

        Documentation: https://docs.djangoproject.com/en/5.2/howto/custom-management-commands/
    """
    help = "Imports a model from the submodule 'TechwiseCapstone_Sentiment_Analysis'"

    def add_arguments(self, parser):
        # Required arguments
        parser.add_argument("file_path", nargs=1, type=str)

    def handle(self, *args, **options):
        # Checks to ensure submodule was downloaded.
        if not WRITE_DIRECTORY.is_dir():
            print(f"Submodule/Write Directory does not exist! Please ensure you have done 'git clone <repo> --recursive' or specified a valid write directory.")
            return

        # Note: Mostly from Jared's collab file, may not be able to use the submodule right now.
        # Creates the dataframe from options
        df = pd.read_csv(options["file_path"][0], encoding='latin-1', header=None)
        
        # Modifies and samples df by Jared.
        df = df[[0, 5]]
        df.columns = ['label', 'text']
        df = df.sample(5000).reset_index(drop=True)

        # Cleans and applies label.
        df['label'] = df['text'].apply(advanced_professionalism_score)
        df['text_clean'] = df['text'].apply(clean)

        # Vectorizes and train-test-splits data.
        vectorizer = TfidfVectorizer(max_features=5000)
        X = vectorizer.fit_transform(df['text_clean'])
        y = df['label']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)

        # Applies dataframe to model.
        clf = LogisticRegression(max_iter=1000)
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        print(classification_report(y_test, y_pred))

        # Dumps them into model files.
        joblib.dump(clf, str(WRITE_DIRECTORY) + "\\model.pkl")
        joblib.dump(vectorizer, str(WRITE_DIRECTORY) + "\\vectorizer.pkl")

