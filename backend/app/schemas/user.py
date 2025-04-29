from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# Esquema base para usuário
class UserBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    user_type: str = Field(..., pattern="^(admin|barbeiro)$")
    active: bool = True

# Esquema para criação de usuário
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Esquema para atualização de usuário
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    active: Optional[bool] = None

# Esquema para resposta de usuário
class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquema para autenticação
class UserLogin(BaseModel):
    email: str
    password: str

# Esquema para token de acesso
class Token(BaseModel):
    access_token: str
    token_type: str

# Esquema para conteúdo do token
class TokenData(BaseModel):
    user_id: Optional[int] = None 