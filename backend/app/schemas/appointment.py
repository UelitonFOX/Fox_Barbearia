from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Esquema base para agendamento
class AppointmentBase(BaseModel):
    client_name: Optional[str] = None
    user_id: int
    service_id: int
    scheduled_datetime: datetime
    status: str = Field("agendado", pattern="^(agendado|concluido|cancelado)$")

# Esquema para criação de agendamento
class AppointmentCreate(AppointmentBase):
    pass

# Esquema para atualização de agendamento
class AppointmentUpdate(BaseModel):
    client_name: Optional[str] = None
    user_id: Optional[int] = None
    service_id: Optional[int] = None
    scheduled_datetime: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(agendado|concluido|cancelado)$")

# Esquema para resposta de agendamento
class AppointmentResponse(AppointmentBase):
    id: int
    
    class Config:
        from_attributes = True 