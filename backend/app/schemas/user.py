from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# Esquema base para usuário
class UserBase(BaseModel):
    username: Optional[str] = None
    name: str
    email: Optional[EmailStr] = None
    user_type: str = Field(..., pattern="^(admin|barber)$")
    active: bool = True

# Esquema para criação de usuário
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Esquema para atualização de usuário
class UserUpdate(BaseModel):
    username: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    active: Optional[bool] = None

# Esquema para resposta de usuário
class UserResponse(BaseModel):
    id: int
    username: Optional[str] = None
    name: str
    email: Optional[EmailStr] = None
    user_type: str
    active: bool

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

# ---- Adicionar Schemas para Resposta do Login ----

# Schema para os dados do usuário retornados no login
class UserLoginResponseData(BaseModel):
    id: int
    username: Optional[str] = None
    name: str
    email: EmailStr
    user_type: str

    class Config:
        from_attributes = True

# Schema completo para a resposta do login
class TokenWithUserData(Token): # Herda de Token (access_token, token_type)
    user: UserLoginResponseData

# ---- Adicionar Schemas para Resumo do Dashboard por Barbeiro ----
class BarberAttendanceSummary(BaseModel):
    user_id: int
    user_name: str
    total_attendances: int
    total_final_value: float
    # Poderíamos adicionar top serviços aqui se necessário

    class Config:
        from_attributes = True # Para mapear de tuples da query

# Esquema para atualização de senha pelo próprio usuário
class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6) 