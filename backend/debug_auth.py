"""
Script para depurar o processo de autenticação
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações
DATABASE_URL = os.getenv("DATABASE_URL")
admin_email = "admin@foxbarbearia.com"
admin_password = "admin123"

# Configuração da criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt", "sha256_crypt"], deprecated="auto")

print("=== Depuração de Autenticação ===")

# Criar conexão com o banco de dados
print(f"Conectando ao banco de dados: {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

try:
    # 1. Verificar se o usuário existe
    print(f"\n1. Verificando se o usuário {admin_email} existe...")
    result = session.execute(
        text("SELECT id, email, hashed_password, user_type FROM users WHERE email = :email"),
        {"email": admin_email}
    ).fetchone()
    
    if not result:
        print(f"❌ Usuário {admin_email} não encontrado no banco de dados!")
        sys.exit(1)
    
    user_id, email, hashed_password, user_type = result
    print(f"✅ Usuário encontrado: ID={user_id}, Email={email}, Tipo={user_type}")
    print(f"Hash da senha armazenado: {hashed_password[:20]}...")
    
    # 2. Testar a verificação de senha
    print("\n2. Testando verificação de senha...")
    is_valid = pwd_context.verify(admin_password, hashed_password)
    print(f"Resultado da verificação: {'✅ Senha válida' if is_valid else '❌ Senha inválida'}")
    
    if not is_valid:
        # Tentar identificar o tipo de hash
        print("\n3. Tentando identificar o tipo de hash...")
        try:
            hash_type = pwd_context.identify(hashed_password)
            print(f"Tipo de hash identificado: {hash_type or 'Não identificado'}")
        except Exception as e:
            print(f"Erro ao identificar hash: {e}")
        
        # Gerar novo hash para comparação
        print("\n4. Gerando novo hash com a senha informada...")
        new_hash = pwd_context.hash(admin_password)
        print(f"Novo hash gerado: {new_hash[:20]}...")
        
        # Atualizar senha no banco para teste
        print("\n5. Atualizando senha no banco de dados...")
        session.execute(
            text("UPDATE users SET hashed_password = :hashed_password WHERE id = :user_id"),
            {"hashed_password": new_hash, "user_id": user_id}
        )
        session.commit()
        print("✅ Senha atualizada com sucesso!")
        
        # Verificar novamente
        print("\n6. Testando novamente a verificação com a nova senha...")
        result = session.execute(
            text("SELECT hashed_password FROM users WHERE id = :user_id"),
            {"user_id": user_id}
        ).fetchone()
        updated_hash = result[0]
        is_valid_after_update = pwd_context.verify(admin_password, updated_hash)
        print(f"Resultado após atualização: {'✅ Senha válida' if is_valid_after_update else '❌ Senha ainda inválida'}")
    
except Exception as e:
    print(f"❌ Erro durante a depuração: {str(e)}")
finally:
    session.close()

print("\n=== Depuração concluída ===") 