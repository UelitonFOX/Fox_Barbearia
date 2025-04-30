"""
Script para criar um usuário administrador no sistema Fox Barbearia
com tratamento de exceções para problemas comuns
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError, ProgrammingError
from passlib.context import CryptContext
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração da criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt", "sha256_crypt"], deprecated="auto")

# Configuração da conexão com o banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ Erro: a variável DATABASE_URL não está definida no arquivo .env")
    sys.exit(1)

# Imprimir parte da URL para depuração (ocultando a senha)
print(f"URL do banco de dados (parcial): {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")

# Criar engine e sessão
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

def create_admin_user():
    """
    Criar usuário administrador diretamente via SQL
    sem usar os modelos SQLAlchemy
    """
    print("=== Criando usuário administrador ===")
    
    # Configurações do usuário admin
    admin_name = "Administrador"
    admin_email = "admin@foxbarbearia.com"
    admin_password = "admin123"
    admin_type = "admin"
    hashed_password = pwd_context.hash(admin_password)
    
    try:
        # Verificar se usuário já existe
        result = session.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": admin_email}
        ).fetchone()
        
        if result:
            # Atualizar a senha do usuário existente
            admin_id = result[0]
            print(f"✅ Usuário admin já existe (ID: {admin_id}). Atualizando senha...")
            
            session.execute(
                text("UPDATE users SET hashed_password = :hashed_password WHERE id = :id"),
                {"hashed_password": hashed_password, "id": admin_id}
            )
            session.commit()
            
            print(f"✅ Senha do usuário admin atualizada com sucesso.")
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Senha: {admin_password}")
            return
        
        # Criar novo usuário
        print(f"Criando novo usuário admin: {admin_email}")
        
        # Verificando as colunas disponíveis na tabela users primeiro
        columns = session.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
        ).fetchall()
        column_names = [col[0] for col in columns]
        
        # Verificar se a tabela tem a estrutura esperada
        required_columns = ['name', 'email', 'hashed_password', 'user_type', 'active']
        missing_columns = [col for col in required_columns if col not in column_names]
        
        if missing_columns:
            print(f"❌ Erro: Colunas necessárias ausentes na tabela users: {missing_columns}")
            sys.exit(1)
        
        # Inserir usuário admin usando apenas as colunas obrigatórias
        session.execute(
            text("""
                INSERT INTO users (name, email, hashed_password, user_type, active)
                VALUES (:name, :email, :hashed_password, :user_type, :active)
            """),
            {
                "name": admin_name,
                "email": admin_email,
                "hashed_password": hashed_password,
                "user_type": admin_type,
                "active": True
            }
        )
        session.commit()
        
        print("✅ Usuário admin criado com sucesso!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Senha: {admin_password}")
        
    except ProgrammingError as e:
        session.rollback()
        print(f"❌ Erro de SQL: {str(e)}")
        print("\nDicas para correção:")
        print("1. Verifique se a estrutura da tabela 'users' está correta")
        print("2. Execute o script fix_database.py para corrigir a estrutura")
        print("3. Use test_db_connection.py para verificar a conexão e estrutura")
        sys.exit(1)
    except SQLAlchemyError as e:
        session.rollback()
        print(f"❌ Erro no banco de dados: {str(e)}")
        sys.exit(1)
    except Exception as e:
        session.rollback()
        print(f"❌ Erro não esperado: {str(e)}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    create_admin_user()
    print("\n=== Operação concluída! ===") 