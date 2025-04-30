from datetime import datetime, timedelta
from typing import Any, Union, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from jose import jwt  # Garantindo que estamos usando jose.jwt, não pyjwt
from passlib.context import CryptContext

from backend.app.core.config import settings
from backend.app.db.database import get_db
from backend.app.models.user import User

# Contexto de hashing de senha - adicionando sha256_crypt como alternativa a bcrypt
pwd_context = CryptContext(schemes=["bcrypt", "sha256_crypt"], deprecated="auto")

# Funções para segurança
def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Criar um token JWT para autenticação
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    try:
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    except Exception as e:
        print(f"Erro ao gerar token JWT: {e}")
        raise e

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verificar se a senha em texto corresponde ao hash
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # Registrar o erro, mas não deixá-lo propagar
        print(f"Erro ao verificar senha: {e}")
        return False

def get_password_hash(password: str) -> str:
    """
    Gerar hash da senha
    """
    try: 
        return pwd_context.hash(password)
    except Exception as e:
        # Fallback para sha256_crypt em caso de erro com bcrypt
        print(f"Erro ao gerar hash com bcrypt: {e}, usando sha256_crypt")
        return pwd_context.using(scheme="sha256_crypt").hash(password)

# Adicionar função que está faltando
async def get_current_active_user(
    db: Session = Depends(get_db),
    token: str = Depends(lambda: None)  # Este é um placeholder, a função real está em deps.py
) -> User:
    """
    Esta função é um atalho para deps.get_current_user().
    Na verdade, a implementação completa está em deps.py para evitar referência circular.
    """
    from backend.app.core.deps import get_current_user
    user = await get_current_user(db=db, token=token)
    return user 