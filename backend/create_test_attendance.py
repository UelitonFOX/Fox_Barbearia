"""
Script para inserir um registro de teste na tabela de atendimentos
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Obter a URL do banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Erro: a variável DATABASE_URL não está definida no arquivo .env")
    sys.exit(1)

print("=== Inserindo registro de teste na tabela attendances ===")
print(f"URL do banco de dados (parcial): {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")

try:
    # Criar engine de conexão
    print("\n1. Criando engine de conexão...")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    # Criar uma sessão em vez de conexão direta
    print("2. Criando sessão...")
    Session = sessionmaker(bind=engine)
    session = Session()
    print("✅ Sessão criada com sucesso!")
    
    # Verificar usuário admin
    print("\n3. Buscando usuário admin...")
    admin_query = session.execute(text("SELECT id FROM users WHERE email = 'admin@foxbarbearia.com'"))
    admin_user = admin_query.fetchone()
    
    if not admin_user:
        print("❌ Usuário admin não encontrado!")
        sys.exit(1)
    
    user_id = admin_user[0]
    print(f"✅ Usuário admin encontrado! ID: {user_id}")
    
    # Verificar serviço disponível
    print("\n4. Buscando serviço disponível...")
    service_query = session.execute(text("SELECT id, name, price FROM services WHERE is_active = TRUE LIMIT 1"))
    service = service_query.fetchone()
    
    if not service:
        print("❌ Nenhum serviço disponível encontrado!")
        sys.exit(1)
    
    service_id = service[0]
    service_name = service[1]
    service_price = service[2]
    print(f"✅ Serviço encontrado: {service_name} (ID: {service_id}, Preço: R$ {service_price})")
    
    # Inserir atendimento
    print("\n5. Inserindo atendimento de teste...")
    
    try:
        # Data e hora atual
        now = datetime.now()
        
        # Dados do atendimento
        original_value = service_price
        discount_amount = 5.00
        final_value = original_value - discount_amount
        payment_method = "pix"
        
        # SQL para inserção
        insert_sql = text("""
        INSERT INTO attendances 
        (user_id, service_id, original_value, discount_amount, final_value, payment_method, date_time) 
        VALUES (:user_id, :service_id, :original_value, :discount_amount, :final_value, :payment_method, :date_time)
        RETURNING id
        """)
        
        # Executar inserção
        result = session.execute(insert_sql, {
            "user_id": user_id,
            "service_id": service_id,
            "original_value": original_value,
            "discount_amount": discount_amount,
            "final_value": final_value,
            "payment_method": payment_method,
            "date_time": now
        })
        
        # Obter o ID do atendimento inserido
        attendance_id = result.fetchone()[0]
        
        # Confirmar transação
        session.commit()
        
        print(f"✅ Atendimento inserido com sucesso! ID: {attendance_id}")
        print(f"Detalhes:")
        print(f"- Serviço: {service_name}")
        print(f"- Valor original: R$ {original_value}")
        print(f"- Desconto: R$ {discount_amount}")
        print(f"- Valor final: R$ {final_value}")
        print(f"- Forma de pagamento: {payment_method}")
        print(f"- Data/hora: {now}")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Erro ao inserir atendimento: {str(e)}")
    
    # Fechar sessão
    session.close()
    
except SQLAlchemyError as e:
    print(f"❌ Erro ao conectar ao banco de dados: {str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro não esperado: {str(e)}")
    sys.exit(1)

print("\n=== Operação concluída ===") 