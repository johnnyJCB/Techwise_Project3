# Imports
# -Django Imports-
from django.core.management.base import BaseCommand, CommandError
from vibechecker.models import Sentiment140Item as Item

# -Regular Imports-
from dateutil import parser
from dateutil import tz
import csv

# Constants
DATE_FORMAT = "%a %b %d %X %Z %Y"
# Correlates PDT with the timezone America/Los_Angeles
PACIFIC_TZ = {"PDT": tz.gettz("America/Los_Angeles")}

# Classes
class Command(BaseCommand):
    """
        Utilizes Django's built-in command to add a CSV import to manage.py

        Documentation: https://docs.djangoproject.com/en/5.2/howto/custom-management-commands/
    """
    help = "Imports a CSV according to the vibechecker.models."

    def add_arguments(self, parser):
        # Required arguments
        parser.add_argument("file_path", nargs=1, type=str)

        # Optional arguments
        parser.add_argument(
            "--count",
            help="Read a specified amount of lines from CSV. Using 0 or lower will read all lines from CSV. 0 is default.",
            default=0,
        )

    def handle(self, *args, **options):
        # Records the specified count from argument list.
        count = int(options.get("count", 0))

        # Takes the file_path argument to parse as csv.
        with open(options["file_path"][0]) as csv_file:
            csv_reader = csv.reader(csv_file)
            csv_list = list(csv_reader)

            # If count is greater than CSV lines, raise an error.
            if count > len(csv_list):
                raise ValueError(str(count) + " is greater than CSV line count.")
            # Otherwise if count is 0 or below, read the entire CSV file.
            elif count < 1:
                count = len(csv_list)

            # Keep a record to bulk create the items.
            records = []
            
            # Uses get_or_create to import items based on Sentiment140Item model.
            for row in csv_list[:count]:
                # Parses datetime from row using dateutil.parser, then
                # changes it into the correct aware timezone using dateutil.tz
                unaware_date = parser.parse(row[2], tzinfos=PACIFIC_TZ)

                # Creates an object from the row.
                records.append(Item(
                    target=row[0],
                    tweet_id=row[1],
                    date=unaware_date,
                    flag=row[3],
                    user=row[4],
                    text=row[5]
                ))

            # Finally bulk create the records, without overwriting them.
            Item.objects.bulk_create(records)



