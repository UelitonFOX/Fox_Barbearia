from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import logging
from jose import jwt
import traceback

from backend.app.core.config import settings
from backend.app.core.security import create_access_token
from backend.app.core.deps import authenticate_user, get_db
from backend.app.schemas.user import TokenWithUserData, UserLogin

# Configurar logging
logging.basicConfig(level=logging.DEBUG)  # Aumentando nível para DEBUG
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Autenticação"])

@router.post("/login", response_model=TokenWithUserData)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login para obter token de acesso
    """
    try:
        logger.info(f"Tentativa de login: {form_data.username}")
        
        # Autenticar usuário
        user = authenticate_user(db, form_data.username, form_data.password)
        
        if not user:
            logger.warning(f"Falha na autenticação para: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Usuário autenticado: {user.email} (ID: {user.id})")
        
        # Criar token de acesso para sessão
        logger.debug(f"Criando token com expiração de {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutos")
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        try:
            logger.debug(f"SECRET_KEY: {settings.SECRET_KEY[:3]}...{settings.SECRET_KEY[-3:]}")
            logger.debug(f"ALGORITHM: {settings.ALGORITHM}")
            access_token = create_access_token(
                subject=user.id,
                expires_delta=access_token_expires
            )
            logger.debug("Token criado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao criar token: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao gerar token: {str(e)}"
            )
        
        # Log da geração de token (para debug)
        logger.info(f"Token gerado para o usuário: {user.email}")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "name": user.name,
                "email": user.email,
                "user_type": user.user_type
            }
        }
    
    except HTTPException:
        # Propagar exceções HTTP explícitas
        raise
    except Exception as e:
        # Capturar outras exceções não tratadas
        logger.error(f"Erro não tratado no login: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno no servidor durante o processo de login"
        ) 