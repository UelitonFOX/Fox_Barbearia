"""
Script para inserir múltiplos registros de atendimentos em datas diferentes
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
from dotenv import load_dotenv
import random

# Carregar variáveis de ambiente
load_dotenv()

# Obter a URL do banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Erro: a variável DATABASE_URL não está definida no arquivo .env")
    sys.exit(1)

print("=== Inserindo múltiplos registros de atendimentos ===")
print(f"URL do banco de dados (parcial): {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")

try:
    # Criar engine de conexão
    print("\n1. Criando engine de conexão...")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    # Criar uma sessão
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
    
    # Buscar todos os serviços disponíveis
    print("\n4. Buscando serviços disponíveis...")
    services_query = session.execute(text("SELECT id, name, price FROM services WHERE is_active = TRUE"))
    services = services_query.fetchall()
    
    if not services:
        print("❌ Nenhum serviço disponível encontrado!")
        sys.exit(1)
    
    print(f"✅ {len(services)} serviços encontrados!")
    for service in services:
        print(f"- {service[1]} (ID: {service[0]}, Preço: R$ {service[2]})")
    
    # Formas de pagamento
    payment_methods = ["pix", "card", "cash"]
    
    # Inserir 5 atendimentos em datas diferentes
    print("\n5. Inserindo atendimentos...")
    
    # Data atual
    today = datetime.now()
    
    # Datas para os atendimentos
    dates = [
        today - timedelta(days=5),
        today - timedelta(days=4),
        today - timedelta(days=3),
        today - timedelta(days=2),
        today - timedelta(days=1)
    ]
    
    for i, date in enumerate(dates):
        try:
            # Selecionar serviço aleatório
            service = random.choice(services)
            service_id = service[0]
            service_name = service[1]
            service_price = service[2]
            
            # Definir desconto (entre 0 e 10 reais)
            discount_amount = round(random.uniform(0, 10), 2)
            
            # Calcular valor final
            final_value = service_price - discount_amount
            
            # Selecionar forma de pagamento aleatória
            payment_method = random.choice(payment_methods)
            
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
                "original_value": service_price,
                "discount_amount": discount_amount,
                "final_value": final_value,
                "payment_method": payment_method,
                "date_time": date
            })
            
            # Obter o ID do atendimento inserido
            attendance_id = result.fetchone()[0]
            
            # Confirmar inserção
            session.commit()
            
            print(f"✅ Atendimento {i+1} inserido com sucesso! ID: {attendance_id}")
            print(f"   Serviço: {service_name}")
            print(f"   Valor: R$ {service_price} - Desconto: R$ {discount_amount} = Final: R$ {final_value}")
            print(f"   Forma de pagamento: {payment_method}")
            print(f"   Data: {date.strftime('%d/%m/%Y')}")
            print()
            
        except Exception as e:
            session.rollback()
            print(f"❌ Erro ao inserir atendimento {i+1}: {str(e)}")
    
    # Fechar sessão
    session.close()
    print("✅ Atendimentos inseridos com sucesso!")
    
except SQLAlchemyError as e:
    print(f"❌ Erro ao conectar ao banco de dados: {str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro não esperado: {str(e)}")
    sys.exit(1)

print("\n=== Operação concluída ===") 