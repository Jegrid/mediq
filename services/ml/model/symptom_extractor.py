import re
import joblib
import os

#paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

#load symptom list
symptom_list = joblib.load(os.path.join(MODELS_DIR, 'symptom_list.pkl'))


#buidl keyword lookip, map phrase to canonical term
#split/join collapses double spaces, some dataset names have stray spaces e.g. "dischromic _patches"
KEYWORD_MAP = {' '.join(symptom.replace('_', ' ').lower().split()): symptom for symptom in symptom_list}

def extract_symptoms_from_text(text: str) -> list:
    if not text:
        return []

    #to lower and strip punct
    cleaned = text.lower()
    cleaned = re.sub(r'[^a-z\s]', '', cleaned)
    cleaned = ' '.join(cleaned.split())

    matched = []
    for phrase, canonical in KEYWORD_MAP.items():
        if phrase in cleaned:
            matched.append(canonical)

    return matched
    #combine symptoms from free text and strucutred, remove dupes and filter ot known symptoms
def combine_symptoms(free_text_symptoms: list, structured_symptoms: list) -> list:

    combined = set(free_text_symptoms + structured_symptoms)

    #filter only known symptoms 
    known = [s for s in combined if s in symptom_list]

    return known