import os
from ultralytics import YOLO
from config import MODEL_PATH

if os.path.exists(MODEL_PATH):
    model = YOLO(MODEL_PATH)
else:
    print(f"Warning: Model weights not found at {MODEL_PATH}. Falling back to default 'yolov8n.pt'.")
    model = YOLO("yolov8n.pt")

def predict_disease(image_path):

    result = model.predict(
        source=image_path,
        imgsz=224,
        verbose=False
    )

    probs = result[0].probs

    class_id = int(probs.top1)

    confidence = float(
        probs.top1conf
    )

    disease = model.names[class_id]

    return disease, confidence