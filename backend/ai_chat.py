# backend/ai_chat.py
import json
from typing import Dict, Optional
from dummy_data import doctors, symptom_to_specialty

def calculate_match_score(doctor: Dict, symptoms: str, filters: Dict = None) -> float:
    score = 0.0
    symptoms_lower = symptoms.lower()
    
    symptom_matches = 0
    for treat in doctor.get("treats", []):
        if treat.lower() in symptoms_lower:
            symptom_matches += 1
    symptom_score = min(symptom_matches / max(len(doctor.get("treats", [1])), 1), 1.0)
    score += symptom_score * 50
    
    exp_score = min(doctor.get("experience_years", 0) / 30, 1.0)
    score += exp_score * 20
    
    rating_score = (doctor.get("rating", 0) - 3.5) / 1.5
    rating_score = max(0, min(rating_score, 1.0))
    score += rating_score * 20
    
    if doctor.get("available", False):
        score += 10
    
    if filters:
        if filters.get("city") and doctor.get("city") != filters.get("city"):
            score *= 0.5
        if filters.get("min_experience") and doctor.get("experience_years", 0) < filters["min_experience"]:
            score *= 0.3
        if filters.get("max_fee") and doctor.get("fee", 0) > filters["max_fee"]:
            score *= 0.5
        if filters.get("min_rating") and doctor.get("rating", 0) < filters["min_rating"]:
            score *= 0.4
    
    return round(score, 2)

def quick_specialty_match(symptoms: str) -> Optional[str]:
    symptoms_lower = symptoms.lower()
    for symptom, specialty in symptom_to_specialty.items():
        if symptom in symptoms_lower:
            return specialty
    return None

def suggest_doctor_with_scoring(user_symptoms: str, filters: Dict = None) -> Dict:
    suggested_specialty = quick_specialty_match(user_symptoms)
    
    scored_doctors = []
    for doctor in doctors:
        score = calculate_match_score(doctor, user_symptoms, filters)
        if suggested_specialty and doctor["specialty"] == suggested_specialty:
            score += 20
        scored_doctors.append({**doctor, "match_score": score, "match_percentage": f"{int(score)}%"})
    
    scored_doctors.sort(key=lambda x: x["match_score"], reverse=True)
    top_recommendations = scored_doctors[:3]
    best_match = top_recommendations[0] if top_recommendations else None
    
    if best_match:
        doc = best_match
        ai_response = f"""
🏥 BEST MATCH FOR YOUR SYMPTOMS
• Doctor: {doc['name']} ({doc['specialty']})
• Match Score: {int(doc['match_score'])}%
• Why this doctor: Based on your symptoms, this doctor specializes in {', '.join(doc['treats'][:3])} with {doc['experience_years']} years of experience.
• Experience: {doc['experience_years']} years
• Fee: Rs. {doc['fee']}
• Rating: {doc['rating']}/5 ({doc.get('total_reviews', 0)} reviews)
• Hospital: {doc['hospital']}
• Location: {doc['city']}

📋 OTHER GOOD OPTIONS
{chr(10).join([f"{i+1}. {d['name']} - {d['specialty']} ({int(d['match_score'])}% match)" for i, d in enumerate(top_recommendations[1:3])]) if len(top_recommendations) > 1 else 'No other options'}

💡 WHAT TO EXPECT
• Bring your medical history and ID
• Arrive 15 minutes before appointment time
"""
    else:
        ai_response = "No matching doctors found. Please try different symptoms."
    
    return {
        "success": True,
        "best_match": best_match,
        "all_matches": scored_doctors,
        "ai_recommendation": ai_response,
        "suggested_specialty": suggested_specialty
    }

def suggest_doctor(user_symptoms: str) -> str:
    result = suggest_doctor_with_scoring(user_symptoms)
    return result["ai_recommendation"]