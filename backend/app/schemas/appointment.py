from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# Esquema base para agendamento
class AppointmentBase(BaseModel):
    client_name: Optional[str] = None
    user_id: int
    service_id: int
    date_time: datetime  # Alterado para date_time
    status: str = Field("scheduled", pattern="^(scheduled|completed|canceled)$")
    contact: Optional[str] = None
    notes: Optional[str] = None
    
    # Config para pydantic v2
    model_config = ConfigDict(from_attributes=True)

# Esquema para criação de agendamento
class AppointmentCreate(AppointmentBase):
    pass

# Esquema para atualização de agendamento
class AppointmentUpdate(BaseModel):
    client_name: Optional[str] = None
    user_id: Optional[int] = None
    service_id: Optional[int] = None
    date_time: Optional[datetime] = None  # Alterado para date_time
    status: Optional[str] = Field(None, pattern="^(scheduled|completed|canceled)$")
    contact: Optional[str] = None
    notes: Optional[str] = None
    
    # Config para pydantic v2
    model_config = ConfigDict(from_attributes=True)

# Esquema para resposta de agendamento
class AppointmentResponse(AppointmentBase):
    id: int
    
    # Config para pydantic v2
    model_config = ConfigDict(from_attributes=True) 