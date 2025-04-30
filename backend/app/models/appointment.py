from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.db.database import Base
from datetime import datetime

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    client_name = Column(String, nullable=False)
    contact = Column(String, nullable=True)
    date_time = Column(DateTime, nullable=False)
    notes = Column(String, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos (opcional)
    user = relationship("User", backref="appointments")
    service = relationship("ServiceModel", backref="appointments") 