import os
MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "best.pt")
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
CONFIDENCE_THRESHOLD = 0.5