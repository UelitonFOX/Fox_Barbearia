from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Schema para criação de usuário
# ... existing code ...

# Schema para atualização de usuário (dados gerais)
# ... existing code ...

# Schema para resposta da API (dados do usuário)
# ... existing code ...

# Novo Schema para atualização de senha
class UserPasswordUpdate(BaseModel):
    current_password: str = Field(..., description="Senha atual do usuário")
    new_password: str = Field(..., min_length=8, description="Nova senha (mínimo 8 caracteres)") 