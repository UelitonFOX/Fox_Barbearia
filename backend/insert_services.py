import psycopg2
from app.core.config import settings

def insert_services():
    # Conectar ao banco de dados diretamente
    # Extrair parâmetros da URL do banco de dados
    db_url = settings.DATABASE_URL
    # Vamos assumir um formato como postgresql://user:password@host:port/dbname
    parts = db_url.split('/')
    dbname = parts[-1]
    host_parts = parts[2].split('@')
    host = host_parts[1].split(':')[0] if len(host_parts) > 1 else host_parts[0]
    port = host_parts[1].split(':')[1] if len(host_parts) > 1 and ':' in host_parts[1] else '5432'
    
    auth_parts = host_parts[0].split(':')
    user = auth_parts[0]
    password = auth_parts[1] if len(auth_parts) > 1 else None
    
    print(f"Conectando ao banco de dados: {host}:{port}/{dbname} como {user}")
    
    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )
    
    # Definir os serviços
    services = [
        {
            "name": "Cabelo",
            "price": 35.00,
            "package_price": 50.00,
            "package_quantity": 2,
            "package_days": 15,
            "duration_minutes": 30,
            "is_active": True
        },
        {
            "name": "Barba",
            "price": 35.00,
            "package_price": 50.00,
            "package_quantity": 2,
            "package_days": 15,
            "duration_minutes": 30,
            "is_active": True
        },
        {
            "name": "Cabelo + Barba",
            "price": 60.00,
            "package_price": 100.00,
            "package_quantity": 2,
            "package_days": 15,
            "duration_minutes": 45,
            "is_active": True
        }
    ]
    
    try:
        # Inserir serviços
        cursor = conn.cursor()
        for service in services:
            # Verificar se o serviço já existe
            cursor.execute(
                "SELECT id FROM services WHERE name = %s",
                (service["name"],)
            )
            exists = cursor.fetchone()
            
            if not exists:
                print(f"Inserindo serviço: {service['name']}")
                cursor.execute(
                    """
                    INSERT INTO services 
                    (name, price, package_price, package_quantity, package_days, duration_minutes, is_active, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                    """,
                    (
                        service["name"],
                        service["price"],
                        service["package_price"],
                        service["package_quantity"],
                        service["package_days"],
                        service["duration_minutes"],
                        service["is_active"]
                    )
                )
            else:
                print(f"Serviço {service['name']} já existe")
        
        conn.commit()
        
        # Verificar serviços inseridos
        cursor.execute("SELECT id, name, price FROM services")
        rows = cursor.fetchall()
        print("Serviços encontrados no banco de dados:")
        for row in rows:
            print(f"  - {row[0]}: {row[1]} - R$ {row[2]:.2f}")
            
    except Exception as e:
        conn.rollback()
        print(f"Erro ao inserir serviços: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    insert_services() 