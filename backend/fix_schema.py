from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_schema():
    # Conectar ao banco de dados
    engine = create_engine(settings.DATABASE_URL)
    conn = engine.connect()
    
    try:
        # Verificar estrutura atual da tabela de serviços
        print("Verificando estrutura atual da tabela de serviços...")
        result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'services'"))
        columns = {row[0]: row[1] for row in result}
        print("Colunas encontradas:", columns)
        
        # Verificar e adicionar colunas faltantes
        if 'package_price' not in columns:
            print("Adicionando coluna package_price...")
            conn.execute(text("ALTER TABLE services ADD COLUMN package_price DOUBLE PRECISION"))
            conn.commit()
        
        if 'package_quantity' not in columns:
            print("Adicionando coluna package_quantity...")
            conn.execute(text("ALTER TABLE services ADD COLUMN package_quantity INTEGER"))
            conn.commit()
        
        if 'package_days' not in columns:
            print("Adicionando coluna package_days...")
            conn.execute(text("ALTER TABLE services ADD COLUMN package_days INTEGER"))
            conn.commit()
        
        if 'duration_minutes' not in columns:
            print("Adicionando coluna duration_minutes...")
            conn.execute(text("ALTER TABLE services ADD COLUMN duration_minutes INTEGER DEFAULT 30"))
            conn.commit()
        
        if 'is_active' not in columns:
            print("Adicionando coluna is_active...")
            conn.execute(text("ALTER TABLE services ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
            conn.commit()
        
        if 'created_at' not in columns:
            print("Adicionando coluna created_at...")
            conn.execute(text("ALTER TABLE services ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"))
            conn.commit()
        
        if 'updated_at' not in columns:
            print("Adicionando coluna updated_at...")
            conn.execute(text("ALTER TABLE services ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE"))
            conn.commit()
            
        # Verificar novamente após as correções
        result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'services'"))
        columns_after = {row[0]: row[1] for row in result}
        print("\nEstrutura final da tabela:", columns_after)
        
    except Exception as e:
        conn.rollback()
        print(f"Erro durante a correção do esquema: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_schema() 