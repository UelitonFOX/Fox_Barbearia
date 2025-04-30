"""
Script para atualizar a senha do admin diretamente no banco de dados
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações
DATABASE_URL = os.getenv("DATABASE_URL")
admin_email = "admin@foxbarbearia.com"
admin_password_hash = "$2b$12$Z3KgxFjHzLn.y0tV.8XRw.KSum5s5SIGu8BlCJ6n9Zghm.ykN.mb6"  # bcrypt hash de 'admin123'

print("=== Atualizando senha do admin diretamente no banco ===")
print(f"URL do banco de dados (parcial): {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")

# Criar engine e sessão
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

try:
    # Buscar ID do usuário admin
    result = session.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": admin_email}
    ).fetchone()
    
    if not result:
        print(f"❌ Usuário {admin_email} não encontrado!")
        exit(1)
    
    admin_id = result[0]
    print(f"✅ Usuário admin encontrado com ID: {admin_id}")
    
    # Atualizar senha diretamente
    session.execute(
        text("UPDATE users SET hashed_password = :hashed_password WHERE id = :id"),
        {"hashed_password": admin_password_hash, "id": admin_id}
    )
    session.commit()
    
    print(f"✅ Senha atualizada com sucesso!")
    print(f"Email: {admin_email}")
    print(f"Novo hash da senha: {admin_password_hash[:20]}...")
    
except Exception as e:
    session.rollback()
    print(f"❌ Erro: {str(e)}")
finally:
    session.close()
    
print("\n=== Atualização concluída ===") 