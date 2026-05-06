# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
from dummy_data import doctors, specialties_list
from ai_chat import suggest_doctor_with_scoring

app = FastAPI(title="AI Doctor Finder API", version="2.0.0")

import os

# Allow configuring front-end origins via environment variable for deployment
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_list = [o.strip() for o in allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SymptomRequest(BaseModel):
    symptoms: str
    city: Optional[str] = None
    min_experience: Optional[int] = None
    max_fee: Optional[int] = None
    min_rating: Optional[float] = None

class BookingRequest(BaseModel):
    doctor_id: int
    patient_name: str
    patient_email: str
    patient_phone: str
    appointment_date: str
    appointment_time: str
    symptoms: str

@app.get("/")
def home():
    return {"message": "AI Doctor Finder API", "version": "2.0.0"}

@app.get("/doctors")
def get_all_doctors(
    specialty: Optional[str] = None,
    city: Optional[str] = None,
    min_experience: Optional[int] = None,
    max_fee: Optional[int] = None,
    min_rating: Optional[float] = None,
):
    filtered = doctors.copy()
    if specialty:
        filtered = [d for d in filtered if d["specialty"].lower() == specialty.lower()]
    if city:
        filtered = [d for d in filtered if d["city"].lower() == city.lower()]
    if min_experience:
        filtered = [d for d in filtered if d["experience_years"] >= min_experience]
    if max_fee:
        filtered = [d for d in filtered if d["fee"] <= max_fee]
    if min_rating:
        filtered = [d for d in filtered if d["rating"] >= min_rating]
    return {"doctors": filtered, "total": len(filtered)}

@app.get("/doctors/{doctor_id}")
def get_doctor(doctor_id: int):
    for doctor in doctors:
        if doctor["id"] == doctor_id:
            return doctor
    raise HTTPException(status_code=404, detail="Doctor not found")

@app.get("/specialties")
def get_specialties():
    return {"specialties": specialties_list}

@app.post("/suggest-doctor")
def suggest_doctor(request: SymptomRequest):
    filters = {k: v for k, v in {
        "city": request.city,
        "min_experience": request.min_experience,
        "max_fee": request.max_fee,
        "min_rating": request.min_rating
    }.items() if v is not None}
    return suggest_doctor_with_scoring(request.symptoms, filters)

@app.post("/agent/book-appointment")
def book_appointment(request: BookingRequest):
    doctor = None
    for d in doctors:
        if d["id"] == request.doctor_id:
            doctor = d
            break
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    booking_id = str(uuid.uuid4())[:8].upper()
    
    print(f"\n📧 EMAIL SENT TO: {request.patient_email}")
    print(f"Subject: Appointment Confirmed - Dr. {doctor['name']}")
    print(f"Body: Dear {request.patient_name}, your appointment is confirmed for {request.appointment_date} at {request.appointment_time}")
    
    print(f"\n📱 SMS SENT TO: {request.patient_phone}")
    print(f"Message: Appointment confirmed with Dr. {doctor['name']} on {request.appointment_date}")
    
    return {
        "success": True,
        "booking_id": booking_id,
        "appointment_details": {
            "booking_id": booking_id,
            "doctor_name": doctor["name"],
            "doctor_specialty": doctor["specialty"],
            "hospital": doctor["hospital"],
            "appointment_date": request.appointment_date,
            "appointment_time": request.appointment_time,
            "fee": doctor["fee"],
            "patient_name": request.patient_name
        }
    }