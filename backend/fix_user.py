"""
Script para corrigir o usuário administrador no sistema Fox Barbearia
"""
import os
import sys
from sqlalchemy import create_engine, text, Table, MetaData
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Configuração da criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Conectar ao banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("Erro: DATABASE_URL não configurada no arquivo .env")
    sys.exit(1)

try:
    # Conectar ao banco de dados
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    # Verificar se a tabela users existe
    metadata = MetaData()
    metadata.reflect(bind=engine)
    if 'users' not in metadata.tables:
        logger.error("Tabela 'users' não encontrada no banco de dados")
        sys.exit(1)
    
    # Credenciais do administrador
    admin_name = "Admin Fox"
    admin_email = "admin@foxbarbearia.com"
    admin_password = "admin123"  # Senha inicial que pode ser alterada depois
    
    # Hash da senha
    hashed_password = pwd_context.hash(admin_password)
    
    # Verificar se o usuário existe e atualizar sua senha
    result = session.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": admin_email}
    ).fetchone()
    
    if result:
        # Atualizar senha do usuário existente
        user_id = result[0]
        session.execute(
            text("UPDATE users SET hashed_password = :hashed_password WHERE id = :user_id"),
            {"hashed_password": hashed_password, "user_id": user_id}
        )
        logger.info(f"✅ Senha do usuário admin atualizada com sucesso!")
    else:
        # Inserir novo usuário admin
        sql = text("""
            INSERT INTO users (name, email, hashed_password, user_type, active) 
            VALUES (:name, :email, :hashed_password, :user_type, :active)
            ON CONFLICT (email) DO NOTHING
        """)
        
        session.execute(sql, {
            "name": admin_name,
            "email": admin_email,
            "hashed_password": hashed_password,
            "user_type": "admin",
            "active": True
        })
        logger.info(f"✅ Usuário admin criado com sucesso!")
    
    session.commit()
    logger.info(f"📧 Email: {admin_email}")
    logger.info(f"🔑 Senha: {admin_password}")
    
except Exception as e:
    logger.error(f"❌ Erro ao atualizar/criar usuário admin: {e}")
    sys.exit(1)
finally:
    session.close() 