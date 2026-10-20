const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  await knex("audit_log").del();
  await knex("journal_entries").del();
  await knex("cases").del();
  await knex("predictions").del();
  await knex("submissions").del();
  await knex("red_flag_rules").del();
  await knex("conditions").del();
  await knex("symptoms").del();
  await knex("clinician_profiles").del();
  await knex("patient_profiles").del();
  await knex("users").del();

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  await knex("users").insert([
    {
      id: "00000000-0000-0000-0000-000000000001",
      email: "supervisor@mediq.dev",
      password_hash: hash("Admin1234!"),
      role: "supervisor",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      email: "clinician1@mediq.dev",
      password_hash: hash("Clinic1234!"),
      role: "clinician",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      email: "clinician2@mediq.dev",
      password_hash: hash("Clinic1234!"),
      role: "clinician",
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      email: "patient1@mediq.dev",
      password_hash: hash("Patient1234!"),
      role: "patient",
    },
    {
      id: "00000000-0000-0000-0000-000000000005",
      email: "patient2@mediq.dev",
      password_hash: hash("Patient1234!"),
      role: "patient",
    },
    {
      id: "00000000-0000-0000-0000-000000000006",
      email: "patient3@mediq.dev",
      password_hash: hash("Patient1234!"),
      role: "patient",
    },
  ]);

  await knex("clinician_profiles").insert([
    {
      user_id: "00000000-0000-0000-0000-000000000002",
      first_name: "Sarah",
      last_name: "Chen",
      specialty: "General Practice",
      license_number: "GMC-001234",
    },
    {
      user_id: "00000000-0000-0000-0000-000000000003",
      first_name: "James",
      last_name: "Okafor",
      specialty: "Internal Medicine",
      license_number: "GMC-005678",
    },
  ]);

  await knex("patient_profiles").insert([
    {
      user_id: "00000000-0000-0000-0000-000000000004",
      first_name: "Emma",
      last_name: "Taylor",
      dob: "1990-03-15",
      sex: "F",
      allergies: "Penicillin",
      existing_conditions: "Asthma",
      medications: "Salbutamol inhaler",
    },
    {
      user_id: "00000000-0000-0000-0000-000000000005",
      first_name: "Marcus",
      last_name: "Webb",
      dob: "1985-07-22",
      sex: "M",
      allergies: "None",
      existing_conditions: "Hypertension",
      medications: "Lisinopril 10mg",
    },
    {
      user_id: "00000000-0000-0000-0000-000000000006",
      first_name: "Priya",
      last_name: "Sharma",
      dob: "2000-11-08",
      sex: "F",
      allergies: "None",
      existing_conditions: "None",
      medications: "None",
    },
  ]);

  await knex("red_flag_rules").insert([
    {
      symptom_keyword: "chest pain",
      message:
        "Chest pain can indicate a serious cardiac event. Call 999 immediately.",
      severity: "emergency",
    },
    {
      symptom_keyword: "heart attack",
      message:
        "If you think you are having a heart attack, call 999 immediately.",
      severity: "emergency",
    },
    {
      symptom_keyword: "can't breathe",
      message:
        "Severe breathing difficulty requires immediate emergency care. Call 999.",
      severity: "emergency",
    },
    {
      symptom_keyword: "cannot breathe",
      message:
        "Severe breathing difficulty requires immediate emergency care. Call 999.",
      severity: "emergency",
    },
    {
      symptom_keyword: "difficulty breathing",
      message:
        "Severe breathing difficulty requires immediate emergency care. Call 999.",
      severity: "emergency",
    },
    {
      symptom_keyword: "shortness of breath",
      message:
        "Severe shortness of breath may require urgent medical attention. Call 999 if severe.",
      severity: "urgent",
    },
    {
      symptom_keyword: "stroke",
      message:
        "Stroke symptoms require immediate emergency care. Call 999 immediately.",
      severity: "emergency",
    },
    {
      symptom_keyword: "slurred speech",
      message: "Slurred speech can be a sign of stroke. Call 999 immediately.",
      severity: "emergency",
    },
    {
      symptom_keyword: "paralysis",
      message: "Sudden paralysis requires immediate emergency care. Call 999.",
      severity: "emergency",
    },
    {
      symptom_keyword: "unconscious",
      message:
        "Loss of consciousness requires immediate emergency care. Call 999.",
      severity: "emergency",
    },
    {
      symptom_keyword: "suicidal",
      message:
        "If you are having thoughts of suicide, please contact the Samaritans on 116 123 or call 999.",
      severity: "urgent",
    },
    {
      symptom_keyword: "end my life",
      message:
        "If you are having thoughts of self-harm, please contact the Samaritans on 116 123 immediately.",
      severity: "urgent",
    },
    {
      symptom_keyword: "coughing blood",
      message:
        "Coughing blood requires urgent medical assessment. Contact your GP or call 111.",
      severity: "urgent",
    },
    {
      symptom_keyword: "blood in stool",
      message:
        "Blood in stool requires urgent medical assessment. Contact your GP or call 111.",
      severity: "urgent",
    },
    {
      symptom_keyword: "severe allergic",
      message:
        "Severe allergic reactions can be life-threatening. Call 999 immediately.",
      severity: "emergency",
    },
    {
      symptom_keyword: "anaphylaxis",
      message: "Anaphylaxis is a medical emergency. Call 999 immediately.",
      severity: "emergency",
    },
  ]);

  await knex("conditions").insert([
    {
      name: "(vertigo) Paroymsal  Positional Vertigo",
      description: "A condition causing brief episodes of dizziness.",
      severity_tier: "moderate",
    },
    {
      name: "AIDS",
      description:
        "Advanced stage of HIV infection affecting the immune system.",
      severity_tier: "critical",
    },
    {
      name: "Acne",
      description: "A skin condition causing pimples and spots.",
      severity_tier: "low",
    },
    {
      name: "Alcoholic hepatitis",
      description:
        "Liver inflammation caused by excessive alcohol consumption.",
      severity_tier: "high",
    },
    {
      name: "Allergy",
      description: "An immune response to a foreign substance.",
      severity_tier: "low",
    },
    {
      name: "Arthritis",
      description: "Inflammation of the joints causing pain and stiffness.",
      severity_tier: "moderate",
    },
    {
      name: "Bronchial Asthma",
      description:
        "A condition causing breathing difficulty due to airway inflammation.",
      severity_tier: "moderate",
    },
    {
      name: "Cervical spondylosis",
      description: "Age-related wear of the spinal disks in the neck.",
      severity_tier: "moderate",
    },
    {
      name: "Chicken pox",
      description: "A viral infection causing an itchy blister-like rash.",
      severity_tier: "low",
    },
    {
      name: "Chronic cholestasis",
      description: "Reduced bile flow from the liver over a long period.",
      severity_tier: "high",
    },
    {
      name: "Common Cold",
      description: "A viral infection of the upper respiratory tract.",
      severity_tier: "low",
    },
    {
      name: "Dengue",
      description:
        "A mosquito-borne viral infection causing severe flu-like illness.",
      severity_tier: "high",
    },
    {
      name: "Diabetes",
      description: "A metabolic disease causing high blood sugar levels.",
      severity_tier: "high",
    },
    {
      name: "Dimorphic hemmorhoids(piles)",
      description: "Swollen veins in the lower rectum or anus.",
      severity_tier: "moderate",
    },
    {
      name: "Drug Reaction",
      description: "An adverse response of the body to a medication.",
      severity_tier: "moderate",
    },
    {
      name: "Fungal infection",
      description: "An infection caused by fungal organisms on or in the body.",
      severity_tier: "low",
    },
    {
      name: "GERD",
      description:
        "Gastroesophageal reflux disease causing acid to back up into the oesophagus.",
      severity_tier: "moderate",
    },
    {
      name: "Gastroenteritis",
      description:
        "Inflammation of the stomach and intestines, typically from infection.",
      severity_tier: "moderate",
    },
    {
      name: "Heart attack",
      description: "Blockage of blood flow to the heart muscle.",
      severity_tier: "critical",
    },
    {
      name: "Hepatitis B",
      description:
        "A viral liver infection spread through blood and bodily fluids.",
      severity_tier: "high",
    },
    {
      name: "Hepatitis C",
      description:
        "A viral liver infection spread mainly through blood contact.",
      severity_tier: "high",
    },
    {
      name: "Hepatitis D",
      description: "A liver infection that only occurs alongside Hepatitis B.",
      severity_tier: "high",
    },
    {
      name: "Hepatitis E",
      description:
        "A liver infection caused by the Hepatitis E virus, spread via water.",
      severity_tier: "moderate",
    },
    {
      name: "Hypertension",
      description: "Persistently elevated blood pressure in the arteries.",
      severity_tier: "high",
    },
    {
      name: "Hyperthyroidism",
      description: "Overproduction of thyroid hormone by the thyroid gland.",
      severity_tier: "moderate",
    },
    {
      name: "Hypoglycemia",
      description: "Abnormally low blood sugar levels.",
      severity_tier: "high",
    },
    {
      name: "Hypothyroidism",
      description: "Underproduction of thyroid hormone by the thyroid gland.",
      severity_tier: "moderate",
    },
    {
      name: "Impetigo",
      description: "A highly contagious bacterial skin infection.",
      severity_tier: "low",
    },
    {
      name: "Jaundice",
      description: "Yellowing of the skin and eyes due to excess bilirubin.",
      severity_tier: "moderate",
    },
    {
      name: "Malaria",
      description: "A mosquito-borne disease caused by Plasmodium parasites.",
      severity_tier: "high",
    },
    {
      name: "Migraine",
      description:
        "A neurological condition causing severe recurring headaches.",
      severity_tier: "moderate",
    },
    {
      name: "Osteoarthristis",
      description: "Degeneration of joint cartilage and underlying bone.",
      severity_tier: "moderate",
    },
    {
      name: "Paralysis (brain hemorrhage)",
      description: "Loss of muscle function due to bleeding in the brain.",
      severity_tier: "critical",
    },
    {
      name: "Peptic ulcer diseae",
      description:
        "Sores that develop on the lining of the stomach or small intestine.",
      severity_tier: "moderate",
    },
    {
      name: "Pneumonia",
      description:
        "Infection causing inflammation of the air sacs in the lungs.",
      severity_tier: "high",
    },
    {
      name: "Psoriasis",
      description: "A skin condition causing red, flaky, crusty patches.",
      severity_tier: "moderate",
    },
    {
      name: "Tuberculosis",
      description: "A bacterial infection primarily affecting the lungs.",
      severity_tier: "high",
    },
    {
      name: "Typhoid",
      description:
        "A bacterial infection spread through contaminated food and water.",
      severity_tier: "high",
    },
    {
      name: "Urinary tract infection",
      description: "An infection in any part of the urinary system.",
      severity_tier: "moderate",
    },
    {
      name: "Varicose veins",
      description: "Enlarged, twisted veins usually appearing in the legs.",
      severity_tier: "low",
    },
    {
      name: "hepatitis A",
      description:
        "A viral liver infection spread through contaminated food or water.",
      severity_tier: "moderate",
    },
  ]);

  await knex("symptoms").insert([
    //skin
    { name: "Itching", canonical_term: "itching", category: "Skin" },
    { name: "Skin rash", canonical_term: "skin_rash", category: "Skin" },
    {
      name: "Nodal skin eruptions",
      canonical_term: "nodal_skin_eruptions",
      category: "Skin",
    },
    {
      name: "Dischromic patches",
      canonical_term: "dischromic _patches",
      category: "Skin",
    },
    { name: "Blackheads", canonical_term: "blackheads", category: "Skin" },
    {
      name: "Pus filled pimples",
      canonical_term: "pus_filled_pimples",
      category: "Skin",
    },
    { name: "Scurring", canonical_term: "scurring", category: "Skin" },
    { name: "Skin peeling", canonical_term: "skin_peeling", category: "Skin" },
    {
      name: "Silver like dusting",
      canonical_term: "silver_like_dusting",
      category: "Skin",
    },
    {
      name: "Small dents in nails",
      canonical_term: "small_dents_in_nails",
      category: "Skin",
    },
    {
      name: "Inflammatory nails",
      canonical_term: "inflammatory_nails",
      category: "Skin",
    },
    { name: "Blister", canonical_term: "blister", category: "Skin" },
    {
      name: "Red sore around nose",
      canonical_term: "red_sore_around_nose",
      category: "Skin",
    },
    {
      name: "Yellow crust ooze",
      canonical_term: "yellow_crust_ooze",
      category: "Skin",
    },
    {
      name: "Brittle nails",
      canonical_term: "brittle_nails",
      category: "Skin",
    },
    {
      name: "Yellowish skin",
      canonical_term: "yellowish_skin",
      category: "Skin",
    },
    { name: "Bruising", canonical_term: "bruising", category: "Skin" },
    {
      name: "Red spots over body",
      canonical_term: "red_spots_over_body",
      category: "Skin",
    },

    //digestive
    { name: "Nausea", canonical_term: "nausea", category: "Digestive" },
    { name: "Vomiting", canonical_term: "vomiting", category: "Digestive" },
    { name: "Diarrhoea", canonical_term: "diarrhoea", category: "Digestive" },
    {
      name: "Constipation",
      canonical_term: "constipation",
      category: "Digestive",
    },
    { name: "Acidity", canonical_term: "acidity", category: "Digestive" },
    {
      name: "Indigestion",
      canonical_term: "indigestion",
      category: "Digestive",
    },
    {
      name: "Stomach pain",
      canonical_term: "stomach_pain",
      category: "Digestive",
    },
    {
      name: "Abdominal pain",
      canonical_term: "abdominal_pain",
      category: "Digestive",
    },
    { name: "Belly pain", canonical_term: "belly_pain", category: "Digestive" },
    {
      name: "Distention of abdomen",
      canonical_term: "distention_of_abdomen",
      category: "Digestive",
    },
    {
      name: "Swelling of stomach",
      canonical_term: "swelling_of_stomach",
      category: "Digestive",
    },
    {
      name: "Stomach bleeding",
      canonical_term: "stomach_bleeding",
      category: "Digestive",
    },
    {
      name: "Bloody stool",
      canonical_term: "bloody_stool",
      category: "Digestive",
    },
    {
      name: "Passage of gases",
      canonical_term: "passage_of_gases",
      category: "Digestive",
    },
    {
      name: "Loss of appetite",
      canonical_term: "loss_of_appetite",
      category: "Digestive",
    },
    {
      name: "Ulcers on tongue",
      canonical_term: "ulcers_on_tongue",
      category: "Digestive",
    },
    {
      name: "Pain during bowel movements",
      canonical_term: "pain_during_bowel_movements",
      category: "Digestive",
    },
    {
      name: "Pain in anal region",
      canonical_term: "pain_in_anal_region",
      category: "Digestive",
    },
    {
      name: "Irritation in anus",
      canonical_term: "irritation_in_anus",
      category: "Digestive",
    },
    {
      name: "Difficulty swallowing",
      canonical_term: "dysphagia",
      category: "Digestive",
    },

    //respiratory
    { name: "Cough", canonical_term: "cough", category: "Respiratory" },
    {
      name: "Breathlessness",
      canonical_term: "breathlessness",
      category: "Respiratory",
    },
    { name: "Phlegm", canonical_term: "phlegm", category: "Respiratory" },
    {
      name: "Mucoid sputum",
      canonical_term: "mucoid_sputum",
      category: "Respiratory",
    },
    {
      name: "Rusty sputum",
      canonical_term: "rusty_sputum",
      category: "Respiratory",
    },
    {
      name: "Blood in sputum",
      canonical_term: "blood_in_sputum",
      category: "Respiratory",
    },
    {
      name: "Congestion",
      canonical_term: "congestion",
      category: "Respiratory",
    },
    {
      name: "Sinus pressure",
      canonical_term: "sinus_pressure",
      category: "Respiratory",
    },
    {
      name: "Runny nose",
      canonical_term: "runny_nose",
      category: "Respiratory",
    },
    {
      name: "Continuous sneezing",
      canonical_term: "continuous_sneezing",
      category: "Respiratory",
    },
    {
      name: "Patches in throat",
      canonical_term: "patches_in_throat",
      category: "Respiratory",
    },
    {
      name: "Throat irritation",
      canonical_term: "throat_irritation",
      category: "Respiratory",
    },

    //neurological
    { name: "Headache", canonical_term: "headache", category: "Neurological" },
    {
      name: "Dizziness",
      canonical_term: "dizziness",
      category: "Neurological",
    },
    {
      name: "Loss of balance",
      canonical_term: "loss_of_balance",
      category: "Neurological",
    },
    {
      name: "Unsteadiness",
      canonical_term: "unsteadiness",
      category: "Neurological",
    },
    {
      name: "Altered sensorium",
      canonical_term: "altered_sensorium",
      category: "Neurological",
    },
    {
      name: "Slurred speech",
      canonical_term: "slurred_speech",
      category: "Neurological",
    },
    {
      name: "Spinning movements",
      canonical_term: "spinning_movements",
      category: "Neurological",
    },
    {
      name: "Loss of smell",
      canonical_term: "loss_of_smell",
      category: "Neurological",
    },
    {
      name: "Lack of concentration",
      canonical_term: "lack_of_concentration",
      category: "Neurological",
    },
    {
      name: "Visual disturbances",
      canonical_term: "visual_disturbances",
      category: "Neurological",
    },
    {
      name: "Weakness of one body side",
      canonical_term: "weakness_of_one_body_side",
      category: "Neurological",
    },
    { name: "Coma", canonical_term: "coma", category: "Neurological" },

    //musculoskeletal
    {
      name: "Joint pain",
      canonical_term: "joint_pain",
      category: "Musculoskeletal",
    },
    {
      name: "Muscle pain",
      canonical_term: "muscle_pain",
      category: "Musculoskeletal",
    },
    {
      name: "Back pain",
      canonical_term: "back_pain",
      category: "Musculoskeletal",
    },
    {
      name: "Neck pain",
      canonical_term: "neck_pain",
      category: "Musculoskeletal",
    },
    {
      name: "Knee pain",
      canonical_term: "knee_pain",
      category: "Musculoskeletal",
    },
    {
      name: "Hip joint pain",
      canonical_term: "hip_joint_pain",
      category: "Musculoskeletal",
    },
    {
      name: "Swelling joints",
      canonical_term: "swelling_joints",
      category: "Musculoskeletal",
    },
    {
      name: "Painful walking",
      canonical_term: "painful_walking",
      category: "Musculoskeletal",
    },
    {
      name: "Movement stiffness",
      canonical_term: "movement_stiffness",
      category: "Musculoskeletal",
    },
    {
      name: "Muscle wasting",
      canonical_term: "muscle_wasting",
      category: "Musculoskeletal",
    },
    {
      name: "Muscle weakness",
      canonical_term: "muscle_weakness",
      category: "Musculoskeletal",
    },
    {
      name: "Weakness in limbs",
      canonical_term: "weakness_in_limbs",
      category: "Musculoskeletal",
    },
    {
      name: "Stiff neck",
      canonical_term: "stiff_neck",
      category: "Musculoskeletal",
    },
    { name: "Cramps", canonical_term: "cramps", category: "Musculoskeletal" },

    //cardiovascular
    {
      name: "Chest pain",
      canonical_term: "chest_pain",
      category: "Cardiovascular",
    },
    {
      name: "Palpitations",
      canonical_term: "palpitations",
      category: "Cardiovascular",
    },
    {
      name: "Fast heart rate",
      canonical_term: "fast_heart_rate",
      category: "Cardiovascular",
    },
    {
      name: "Prominent veins on calf",
      canonical_term: "prominent_veins_on_calf",
      category: "Cardiovascular",
    },
    {
      name: "Swollen blood vessels",
      canonical_term: "swollen_blood_vessels",
      category: "Cardiovascular",
    },
    {
      name: "Cold hands and feet",
      canonical_term: "cold_hands_and_feets",
      category: "Cardiovascular",
    },
    {
      name: "Swollen legs",
      canonical_term: "swollen_legs",
      category: "Cardiovascular",
    },
    {
      name: "Swollen extremities",
      canonical_term: "swollen_extremeties",
      category: "Cardiovascular",
    },

    //urinary
    {
      name: "Burning micturition",
      canonical_term: "burning_micturition",
      category: "Urinary",
    },
    {
      name: "Continuous feel of urine",
      canonical_term: "continuous_feel_of_urine",
      category: "Urinary",
    },
    {
      name: "Spotting urination",
      canonical_term: "spotting_ urination",
      category: "Urinary",
    },
    { name: "Dark urine", canonical_term: "dark_urine", category: "Urinary" },
    {
      name: "Yellow urine",
      canonical_term: "yellow_urine",
      category: "Urinary",
    },
    {
      name: "Foul smell of urine",
      canonical_term: "foul_smell_of urine",
      category: "Urinary",
    },
    {
      name: "Bladder discomfort",
      canonical_term: "bladder_discomfort",
      category: "Urinary",
    },
    { name: "Polyuria", canonical_term: "polyuria", category: "Urinary" },

    //general, systemic
    { name: "Fever", canonical_term: "fever", category: "General & Systemic" },
    {
      name: "High fever",
      canonical_term: "high_fever",
      category: "General & Systemic",
    },
    {
      name: "Mild fever",
      canonical_term: "mild_fever",
      category: "General & Systemic",
    },
    {
      name: "Fatigue",
      canonical_term: "fatigue",
      category: "General & Systemic",
    },
    {
      name: "Lethargy",
      canonical_term: "lethargy",
      category: "General & Systemic",
    },
    {
      name: "Malaise",
      canonical_term: "malaise",
      category: "General & Systemic",
    },
    {
      name: "Chills",
      canonical_term: "chills",
      category: "General & Systemic",
    },
    {
      name: "Shivering",
      canonical_term: "shivering",
      category: "General & Systemic",
    },
    {
      name: "Sweating",
      canonical_term: "sweating",
      category: "General & Systemic",
    },
    {
      name: "Night sweats",
      canonical_term: "night_sweats",
      category: "General & Systemic",
    },
    {
      name: "Weight loss",
      canonical_term: "weight_loss",
      category: "General & Systemic",
    },
    {
      name: "Weight gain",
      canonical_term: "weight_gain",
      category: "General & Systemic",
    },
    {
      name: "Dehydration",
      canonical_term: "dehydration",
      category: "General & Systemic",
    },
    {
      name: "Swelled lymph nodes",
      canonical_term: "swelled_lymph_nodes",
      category: "General & Systemic",
    },
    {
      name: "Fluid overload",
      canonical_term: "fluid_overload",
      category: "General & Systemic",
    },
    {
      name: "Toxic look (typhos)",
      canonical_term: "toxic_look_(typhos)",
      category: "General & Systemic",
    },
    {
      name: "Sunken eyes",
      canonical_term: "sunken_eyes",
      category: "General & Systemic",
    },
    {
      name: "Drying and tingling lips",
      canonical_term: "drying_and_tingling_lips",
      category: "General & Systemic",
    },

    //eyes
    {
      name: "Redness of eyes",
      canonical_term: "redness_of_eyes",
      category: "Eyes",
    },
    {
      name: "Watering from eyes",
      canonical_term: "watering_from_eyes",
      category: "Eyes",
    },
    {
      name: "Blurred and distorted vision",
      canonical_term: "blurred_and_distorted_vision",
      category: "Eyes",
    },
    {
      name: "Yellowing of eyes",
      canonical_term: "yellowing_of_eyes",
      category: "Eyes",
    },
    {
      name: "Pain behind the eyes",
      canonical_term: "pain_behind_the_eyes",
      category: "Eyes",
    },
    {
      name: "Puffy face and eyes",
      canonical_term: "puffy_face_and_eyes",
      category: "Eyes",
    },

    //mental health
    { name: "Anxiety", canonical_term: "anxiety", category: "Mental Health" },
    {
      name: "Depression",
      canonical_term: "depression",
      category: "Mental Health",
    },
    {
      name: "Irritability",
      canonical_term: "irritability",
      category: "Mental Health",
    },
    {
      name: "Mood swings",
      canonical_term: "mood_swings",
      category: "Mental Health",
    },
    {
      name: "Restlessness",
      canonical_term: "restlessness",
      category: "Mental Health",
    },

    //metabolic + rndocrine
    {
      name: "Excessive hunger",
      canonical_term: "excessive_hunger",
      category: "Metabolic & Endocrine",
    },
    {
      name: "Increased appetite",
      canonical_term: "increased_appetite",
      category: "Metabolic & Endocrine",
    },
    {
      name: "Obesity",
      canonical_term: "obesity",
      category: "Metabolic & Endocrine",
    },
    {
      name: "Irregular sugar level",
      canonical_term: "irregular_sugar_level",
      category: "Metabolic & Endocrine",
    },
    {
      name: "Enlarged thyroid",
      canonical_term: "enlarged_thyroid",
      category: "Metabolic & Endocrine",
    },

    //liver
    { name: "Jaundice", canonical_term: "jaundice", category: "Liver" },
    {
      name: "Acute liver failure",
      canonical_term: "acute_liver_failure",
      category: "Liver",
    },
    {
      name: "Internal itching",
      canonical_term: "internal_itching",
      category: "Liver",
    },

    //riskfactors
    {
      name: "Extra marital contacts",
      canonical_term: "extra_marital_contacts",
      category: "Risk Factors",
    },
    {
      name: "Family history",
      canonical_term: "family_history",
      category: "Risk Factors",
    },
    {
      name: "History of alcohol consumption",
      canonical_term: "history_of_alcohol_consumption",
      category: "Risk Factors",
    },
    {
      name: "Receiving blood transfusion",
      canonical_term: "receiving_blood_transfusion",
      category: "Risk Factors",
    },
    {
      name: "Receiving unsterile injections",
      canonical_term: "receiving_unsterile_injections",
      category: "Risk Factors",
    },
    { name: "Obesity", canonical_term: "obesity", category: "Risk Factors" },
  ]);
};
