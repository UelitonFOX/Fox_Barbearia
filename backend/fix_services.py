from app.db.database import engine, Base, get_db
from app.models.service import ServiceModel, default_services
from sqlalchemy.orm import Session

def init_db():
    # Criar tabelas
    print("Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas!")
    
    # Adicionar serviços padrão
    print("Adicionando serviços padrão...")
    db = next(get_db())
    try:
        for service_data in default_services:
            if not db.query(ServiceModel).filter(ServiceModel.name == service_data["name"]).first():
                db_service = ServiceModel(**service_data)
                db.add(db_service)
        db.commit()
        print("Serviços adicionados com sucesso!")
    except Exception as e:
        db.rollback()
        print(f"Erro ao adicionar serviços: {e}")
    
    # Verificar serviços
    print("\nServiços disponíveis:")
    services = db.query(ServiceModel).all()
    for service in services:
        print(f"- {service.id}: {service.name} - R$ {service.price:.2f}")

if __name__ == "__main__":
    init_db() 