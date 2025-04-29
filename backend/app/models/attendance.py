from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Attendance(Base):
    __tablename__ = "attendances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    original_value = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    final_value = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)  # "pix", "card", "cash"
    date_time = Column(DateTime, default=datetime.now)
    
    # Relacionamentos
    user = relationship("User", backref="attendances")
    service = relationship("Service", backref="attendances") 