from pydantic import BaseModel
class PredictionResponse(BaseModel):
    disease: str
    confidence: float
    cause:str
    treatment:str