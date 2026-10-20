import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

#paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'DiseaseAndSymptoms.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

#data cleaning 
#strip the whitespace from all string colunms
df = df.apply(lambda col: col.str.strip() if col.dtype == 'object' else col)

#extract disease labels
diseases = df['Disease'].values

#extract all the sympotm columns 
symptom_columns = [col for col in df.columns if col.startswith('Symptom_')]

#build full list of the unique sympomtoms across the dataset
all_symptoms = set()
for col in symptom_columns:
    all_symptoms.update(df[col].dropna().unique())

#remove empty strings
all_symptoms = sorted([s for s in all_symptoms if s.strip() != ''])

print(f"Unique diseases: {len(set(diseases))}")
print(f"Unique symptoms: {len(all_symptoms)}")

#build the binary features vector
print("Building feature vectors...")

def build_feature_vector(row, symptom_list):
    present = set()
    for col in symptom_columns:
        val = row[col]
        if pd.notna(val) and str(val).strip() != '':
            present.add(str(val).strip())
    return [1 if symptom in present else 0 for symptom in symptom_list]

X = np.array([build_feature_vector(row, all_symptoms) for _, row in df.iterrows()])
print(f"Feature matrix shape: {X.shape}")

#encode the disease labels
print("Encoding labels...")
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(diseases)

#training and test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")

#train the rf classifier
print("Training Random Forest...")
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

#evaluate
print("Evaluating...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

#save tjhe model files
print("\nSaving model files...")
joblib.dump(model, os.path.join(MODELS_DIR, 'rf_model.pkl'))
joblib.dump(label_encoder, os.path.join(MODELS_DIR, 'label_encoder.pkl'))
joblib.dump(all_symptoms, os.path.join(MODELS_DIR, 'symptom_list.pkl'))
print("Saved: rf_model.pkl, label_encoder.pkl, symptom_list.pkl")
print("\nTraining complete.")