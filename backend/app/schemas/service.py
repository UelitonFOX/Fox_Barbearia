from pydantic import BaseModel, Field
from typing import Optional

# Esquema base para serviço
class ServiceBase(BaseModel):
    name: str
    default_price: float = Field(..., gt=0)

# Esquema para criação de serviço
class ServiceCreate(ServiceBase):
    pass

# Esquema para atualização de serviço
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    default_price: Optional[float] = Field(None, gt=0)

# Esquema para resposta de serviço
class ServiceResponse(ServiceBase):
    id: int
    
    class Config:
        from_attributes = True 