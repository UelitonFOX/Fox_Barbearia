import os
import sys
from dotenv import load_dotenv

# Adicionar o diretório raiz do projeto ao sys.path
# Isso garante que os imports de 'backend.' funcionem corretamente
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Carregar variáveis de ambiente do arquivo .env
dotenv_path = os.path.join(project_root, '.env')
load_dotenv(dotenv_path=dotenv_path)

from backend.db.session import SessionLocal # Usar SessionLocal de db.session
from backend.models.user import User
from backend.core.security import get_password_hash # Usar a função correta de core.security

# Seus dados
ADMIN_NAME = "Ueliton Rodrigo da Silva Fermino"
ADMIN_EMAIL = "Uel.rod@gmail.com"
ADMIN_USERNAME = "Fox"
ADMIN_PASSWORD = "@Dev.Fox@1989" # CORRIGIDO: Senha correta
ADMIN_USER_TYPE = "admin"

def create_or_update_admin_user():
    """Conecta ao banco, verifica/cria o usuário admin e garante que a senha esteja atualizada."""
    print(f"Attempting to create/update admin user: {ADMIN_EMAIL}")
    db = None # Inicializa db como None
    try:
        db = SessionLocal() # Cria uma nova sessão

        # 1. Verificar se o usuário já existe
        existing_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()

        hashed_password = get_password_hash(ADMIN_PASSWORD)

        if existing_user:
            print(f"User with email {ADMIN_EMAIL} already exists. Updating...")
            existing_user.name = ADMIN_NAME # Garante que o nome esteja atualizado
            existing_user.username = ADMIN_USERNAME # Garante que o username esteja atualizado
            existing_user.hashed_password = hashed_password # ATUALIZA a senha
            existing_user.user_type = ADMIN_USER_TYPE # Garante que é admin
            # existing_user.is_active = True # O modelo atual não tem 'is_active'

            db.commit()
            print("Existing user updated successfully with the correct password.")
        else:
            # 2. Se não existe, criar o novo usuário
            print(f"User {ADMIN_EMAIL} not found. Creating new admin user...")

            new_admin = User(
                name=ADMIN_NAME,
                email=ADMIN_EMAIL,
                username=ADMIN_USERNAME,
                hashed_password=hashed_password,
                user_type=ADMIN_USER_TYPE
                # is_active=True # O modelo atual não tem 'is_active'
            )

            db.add(new_admin)
            db.commit()
            print(f"Admin user {ADMIN_EMAIL} created successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")
        if db:
            db.rollback() # Desfaz alterações em caso de erro
    finally:
        if db:
            db.close() # Garante que a sessão seja fechada
            print("Database session closed.")

if __name__ == "__main__":
    create_or_update_admin_user() # Renomeado para refletir a ação 