import numpy as np
import joblib
import os

#paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

#load saved model files
print("Loading model files...")
model = joblib.load(os.path.join(MODELS_DIR, 'rf_model.pkl'))
label_encoder = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.pkl'))
symptom_list = joblib.load(os.path.join(MODELS_DIR, 'symptom_list.pkl'))
print(f"Model loaded. Knows {len(symptom_list)} symptoms and {len(label_encoder.classes_)} diseases.")

#convert list of canoncial terms to binary feature vector (1,0)
def build_feature_vector(symptoms: list) -> np.ndarray:
    return np.array([1 if symptom in symptoms else 0 for symptom in symptom_list]).reshape(1, -1)
#take the canopncial terms and return the top N predicted diseased with confidence scores
def predict_diseases(symptoms: list, top_n: int = 3) -> list:

    if not symptoms:
        return []

    #build feature vecotr
    feature_vector = build_feature_vector(symptoms)

    #get probablilty across 41 diseases
    probabilities = model.predict_proba(feature_vector)[0]

    #get indices of top N diseas sort by probability 
    top_indices = np.argsort(probabilities)[::-1][:top_n]

    predictions = []
    for rank, idx in enumerate(top_indices, 1):
        disease_name = label_encoder.inverse_transform([idx])[0]
        confidence = round(float(probabilities[idx]), 4)

        #only include predictions with meaningul confidence
        if confidence > 0.1:
            predictions.append({
                'condition_name': disease_name,
                'confidence': confidence,
                'rank': rank,
                'matched_symptoms': [s for s in symptoms if s in symptom_list],
            })

    return predictions