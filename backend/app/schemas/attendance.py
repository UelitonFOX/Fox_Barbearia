from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# --- Schemas Aninhados para Resposta ---
class UserNested(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class ServiceNested(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

# --- Schemas Principais ---

# Esquema base para atendimento
class AttendanceBase(BaseModel):
    user_id: int
    service_id: int
    original_value: float = Field(..., gt=0)
    discount_amount: float = Field(0.0, ge=0)
    final_value: float = Field(..., gt=0)
    payment_method: str = Field(..., pattern="^(pix|card|cash)$")
    date_time: Optional[datetime] = None

# Esquema para criação de atendimento
class AttendanceCreate(AttendanceBase):
    pass

# Esquema para atualização de atendimento
class AttendanceUpdate(BaseModel):
    service_id: Optional[int] = None
    original_value: Optional[float] = Field(None, gt=0)
    discount_amount: Optional[float] = Field(None, ge=0)
    final_value: Optional[float] = Field(None, gt=0)
    payment_method: Optional[str] = Field(None, pattern="^(pix|card|cash)$")

# Esquema para resposta de atendimento
class AttendanceResponse(AttendanceBase):
    id: int
    user: UserNested
    service: ServiceNested
    
    class Config:
        from_attributes = True 