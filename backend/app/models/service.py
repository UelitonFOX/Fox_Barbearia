from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from pydantic import BaseModel

from backend.app.db.database import Base

# Modelo SQLAlchemy para o banco de dados
class ServiceModel(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    package_price = Column(Float, nullable=True)
    package_quantity = Column(Integer, nullable=True)
    package_days = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Schema Pydantic para validação e serialização
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    package_price: Optional[float] = None
    package_quantity: Optional[int] = None
    package_days: Optional[int] = None
    duration_minutes: Optional[int] = 30
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    name: Optional[str] = None
    price: Optional[float] = None

class Service(ServiceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Lista de serviços padrão para inicialização
default_services = [
    {
        "name": "Cabelo",
        "price": 35.00,
        "package_price": 50.00,
        "package_quantity": 2,
        "package_days": 15,
        "duration_minutes": 30
    },
    {
        "name": "Barba",
        "price": 35.00,
        "package_price": 50.00,
        "package_quantity": 2,
        "package_days": 15,
        "duration_minutes": 30
    },
    {
        "name": "Cabelo + Barba",
        "price": 60.00,
        "package_price": 100.00,
        "package_quantity": 2,
        "package_days": 15,
        "duration_minutes": 45
    },
    {
        "name": "Sobrancelha",
        "price": 20.00,
        "package_price": 30.00,
        "package_quantity": 2,
        "package_days": 15,
        "duration_minutes": 15
    },
    {
        "name": "Completo",
        "description": "Cabelo + Barba + Sobrancelha",
        "price": 70.00,
        "package_price": 120.00,
        "package_quantity": 2,
        "package_days": 15,
        "duration_minutes": 60
    }
]

# Exemplo de uso:
"""
# Serviço normal
cabelo = Service(
    name="Cabelo",
    price=35.00,
    package_price=50.00,
    package_quantity=2,
    package_days=15
)

# Serviço completo
completo = Service(
    name="Completo",
    description="Cabelo + Barba + Sobrancelha",
    price=70.00,
    package_price=120.00,
    package_quantity=2,
    package_days=15,
    duration_minutes=60
)
""" 