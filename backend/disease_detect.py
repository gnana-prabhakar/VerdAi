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

    # 1. Check for Classification Model (uses result[0].probs)
    if hasattr(result[0], 'probs') and result[0].probs is not None:
        probs = result[0].probs
        class_id = int(probs.top1)
        confidence = float(probs.top1conf)
        disease = model.names[class_id]
        return disease, confidence

    # 2. Check for Detection Model (uses result[0].boxes)
    if hasattr(result[0], 'boxes') and result[0].boxes is not None and len(result[0].boxes) > 0:
        boxes = result[0].boxes
        # Select the box with the highest confidence score
        best_idx = int(boxes.conf.argmax())
        class_id = int(boxes.cls[best_idx])
        confidence = float(boxes.conf[best_idx])
        disease = model.names[class_id]
        return disease, confidence

    # 3. Fallback if no classes/boxes were detected
    default_disease = model.names[0] if (hasattr(model, 'names') and model.names) else "Healthy"
    return default_disease, 0.0