from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    scheduled_datetime = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="agendado")  # "agendado", "concluido", "cancelado"
    
    # Relacionamentos
    user = relationship("User", backref="appointments")
    service = relationship("Service", backref="appointments") 