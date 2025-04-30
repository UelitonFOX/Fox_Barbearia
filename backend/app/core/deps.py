from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
import logging
from sqlalchemy import func

from backend.app.db.database import get_db
from backend.app.core.config import settings
from backend.app.core.security import verify_password
from backend.app.models.user import User
from backend.app.schemas.user import TokenData

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuração do OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Obter usuário atual
async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Validar token e retornar usuário atual
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verificar validade do token
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: Optional[int] = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
        
    # Buscar usuário no banco
    user = db.query(User).filter(User.id == token_data.user_id).first()
    
    if not user:
        raise credentials_exception
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    return user

# Verificar se é admin
def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verificar se o usuário atual é um administrador
    """
    if current_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão negada. Necessário ser administrador."
        )
    return current_user

# Verificar senha para autenticação
def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Verificar credenciais do usuário (case-insensitive email)
    """
    try:
        email_lower = email.lower() # Converter email para minúsculas
        logger.info(f"Attempting to authenticate user (case-insensitive): {email_lower}")
        
        # Buscar usuário pelo email (case-insensitive)
        user = db.query(User).filter(func.lower(User.email) == email_lower).first()
        
        if not user:
            logger.warning(f"User not found (case-insensitive): {email_lower}")
            return None
        
        logger.info(f"Usuário encontrado: ID={user.id}, Email={user.email}")
        
        # Verificar senha
        try:
            logger.info("Verificando senha...")
            is_valid = verify_password(password, user.hashed_password)
            
            if not is_valid:
                logger.warning("Senha inválida")
                return None
            
            logger.info("Autenticação bem-sucedida!")
            return user
            
        except Exception as e:
            logger.error(f"Erro ao verificar senha: {str(e)}")
            # Retornar None em vez de propagar a exceção
            return None
            
    except Exception as e:
        logger.error(f"Erro durante autenticação: {str(e)}")
        # Retornar None em vez de propagar a exceção
        return None 