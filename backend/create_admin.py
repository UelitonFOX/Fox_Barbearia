"""
Script para criar um usuário administrador no sistema Fox Barbearia
"""
from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import text

def create_admin_user():
    print("=== Criando usuário admin ===")
    
    # Criar sessão com banco de dados
    session = SessionLocal()

    try:
        # Verificar se já existe um usuário com o mesmo email
        admin_email = "admin@foxbarbearia.com"
        admin_password = "admin123"
        
        existing_user = session.query(User).filter(User.email == admin_email).first()
        if existing_user:
            print(f"✅ Usuário admin já existe: {admin_email}")
            
            # Atualizar a senha
            existing_user.hashed_password = get_password_hash(admin_password)
            session.add(existing_user)
            session.commit()
            
            print(f"✅ Senha do usuário admin atualizada.")
            return
        
        # Criar usuário admin
        print(f"Criando novo usuário admin: {admin_email}")
        hashed_password = get_password_hash(admin_password)
        
        admin_user = User(
            name="Administrador",
            email=admin_email,
            hashed_password=hashed_password,
            user_type="admin",
            active=True
        )
        
        # Adicionar à sessão e salvar
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
        
        print("✅ Usuário admin criado com sucesso!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Senha: {admin_password}")
    
    except Exception as e:
        session.rollback()
        print(f"❌ Erro ao criar usuário admin: {str(e)}")
    
    finally:
        session.close()

def check_database_tables():
    print("=== Verificando estrutura do banco de dados ===")
    
    # Criar sessão com banco de dados
    session = SessionLocal()
    
    try:
        # Verificar colunas da tabela users
        result = session.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
        ).fetchall()
        
        print("Colunas na tabela users:")
        for row in result:
            print(f"- {row[0]}")
    
    except Exception as e:
        print(f"❌ Erro ao verificar estrutura do banco de dados: {str(e)}")
    
    finally:
        session.close()

if __name__ == "__main__":
    # Criar todas as tabelas definidas
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas/atualizadas no banco de dados.")
    
    # Verificar estrutura do banco de dados
    check_database_tables()
    
    # Criar usuário admin
    create_admin_user() 