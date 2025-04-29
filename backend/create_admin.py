"""
Script para criar um usuário administrador no sistema Fox Barbearia
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração da criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Conectar ao banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Erro: DATABASE_URL não configurada no arquivo .env")
    sys.exit(1)

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    # Credenciais do administrador
    admin_name = "Admin Fox"
    admin_email = "admin@foxbarbearia.com"
    admin_password = "admin123"  # Senha inicial que pode ser alterada depois
    
    # Hash da senha
    hashed_password = pwd_context.hash(admin_password)
    
    # Inserir diretamente no banco de dados
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
    
    session.commit()
    print(f"✅ Usuário admin criado com sucesso!")
    print(f"📧 Email: {admin_email}")
    print(f"🔑 Senha: {admin_password}")
    
except Exception as e:
    print(f"❌ Erro ao criar usuário admin: {e}")
    sys.exit(1)
finally:
    session.close() 