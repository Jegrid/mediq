import pandas as pd
import numpy as np
import random
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score
import joblib
import os

#evaluates the saved model, does not retrain or overwrite anything

#paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'DiseaseAndSymptoms.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

print("Loading dataset and saved model...")
df = pd.read_csv(DATA_PATH)
df = df.apply(lambda col: col.str.strip() if col.dtype == 'object' else col)

model = joblib.load(os.path.join(MODELS_DIR, 'rf_model.pkl'))
label_encoder = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.pkl'))
symptom_list = joblib.load(os.path.join(MODELS_DIR, 'symptom_list.pkl'))

symptom_columns = [col for col in df.columns if col.startswith('Symptom_')]

#list of symptoms for each row
cases = []
for _, row in df.iterrows():
    symptoms = [row[col] for col in symptom_columns if pd.notna(row[col]) and row[col] != '']
    cases.append((row['Disease'], symptoms))

def to_vector(symptoms):
    return [1 if s in symptoms else 0 for s in symptom_list]

X = np.array([to_vector(set(symptoms)) for _, symptoms in cases])
y = label_encoder.transform(df['Disease'].values)

#test 1, the same 80/20 split as train.py
print("\nTest 1: same 80/20 split as train.py")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
accuracy = accuracy_score(y_test, model.predict(X_test))
train_rows = {tuple(r) for r in X_train}
seen = sum(tuple(r) in train_rows for r in X_test)
print(f"Accuracy: {accuracy * 100:.2f}%")
print(f"Test rows that also appear in the training data: {seen}/{len(X_test)}")

#test 2, remove duplicate rows then cross validate so every test row is unseen
unique_X, unique_idx = np.unique(X, axis=0, return_index=True)
unique_y = y[unique_idx]
print(f"\nTest 2: {len(X)} rows but only {len(unique_X)} unique, 5 fold cross validation on the unique rows")
rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
folds = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(rf, unique_X, unique_y, cv=folds)
print(f"Accuracy: {scores.mean() * 100:.2f}%")

#test 3, only give the model a few symptoms from a case like a real patient might
print("\nTest 3: partial symptoms (3000 random cases each)")
rng = random.Random(42)
for k in (2, 3, 4):
    top1 = top3 = total = 0
    for _ in range(3000):
        disease, symptoms = rng.choice(cases)
        if len(symptoms) < k:
            continue
        picked = set(rng.sample(symptoms, k))
        probabilities = model.predict_proba([to_vector(picked)])[0]
        top = label_encoder.inverse_transform(np.argsort(probabilities)[::-1][:3])
        total += 1
        top1 += top[0] == disease
        top3 += disease in top
    print(f"{k} symptoms: top prediction correct {top1 / total * 100:.1f}%, correct disease in top 3 {top3 / total * 100:.1f}%")
