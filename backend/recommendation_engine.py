RECOMMENDATIONS = {

    "Potato___Early_blight": {
        "cause": "Alternaria fungus",
        "treatment": "Apply Mancozeb fungicide and remove infected leaves."
    },

    "Potato___Late_blight": {
        "cause": "Phytophthora infestans",
        "treatment": "Apply copper fungicide and avoid overhead irrigation."
    },

    "Potato___Healthy": {
        "cause": "No disease detected",
        "treatment": "Maintain regular crop management."
    },

    "Tomato___Early_blight": {
        "cause": "Alternaria fungus",
        "treatment": "Remove infected leaves and apply fungicide."
    },

    "Tomato___Late_blight": {
        "cause": "Water mold infection",
        "treatment": "Apply copper fungicide immediately."
    },

    "Tomato___Healthy": {
        "cause": "Healthy Plant",
        "treatment": "Continue regular monitoring."
    },

    "Tomato___Leaf_Mold": {
        "cause": "Fungal pathogen",
        "treatment": "Improve ventilation and apply fungicide."
    },

    "Tomato___Spider_mites": {
        "cause": "Mite infestation",
        "treatment": "Use neem oil or miticide."
    },

    "Tomato___Mosaic_Virus": {
        "cause": "Viral infection",
        "treatment": "Remove infected plants and sanitize tools."
    },

    "Tomato___Yellow_Leaf_Curl_Virus": {
        "cause": "Whitefly transmitted virus",
        "treatment": "Control whiteflies and remove infected plants."
    }
}

def get_recommendation(disease):
    return RECOMMENDATIONS.get(
        disease,
        {
            "cause": "Unknown",
            "treatment": "Consult agricultural expert."
        }
    )