import json
import os

FILE = "history.json"


def save_prediction(data):

    if not os.path.exists(FILE):

        with open(FILE, "w") as f:
            json.dump([], f)

    with open(FILE, "r") as f:
        history = json.load(f)

    history.append(data)

    with open(FILE, "w") as f:
        json.dump(history, f, indent=4)


def get_history():

    if not os.path.exists(FILE):
        return []

    with open(FILE, "r") as f:
        return json.load(f)