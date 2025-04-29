from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.service import Service
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.core.deps import get_admin_user, get_current_user

router = APIRouter(prefix="/services", tags=["Serviços"])

@router.post("/", response_model=ServiceResponse, status_code=201)
def create_service(
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Apenas admins
):
    """
    Criar um novo serviço (apenas admin)
    """
    # Verificar se já existe serviço com este nome
    existing_service = db.query(Service).filter(Service.name == service_in.name).first()
    if existing_service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um serviço com este nome"
        )
    
    # Criar serviço
    db_service = Service(
        name=service_in.name,
        default_price=service_in.default_price
    )
    
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    
    return db_service

@router.get("/", response_model=List[ServiceResponse])
def get_services(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Qualquer usuário logado
):
    """
    Listar todos os serviços
    """
    services = db.query(Service).offset(skip).limit(limit).all()
    return services

@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Qualquer usuário logado
):
    """
    Obter serviço pelo ID
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    return service

@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_in: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Apenas admins
):
    """
    Atualizar serviço (apenas admin)
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    # Atualizar dados
    for field, value in service_in.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service

@router.delete("/{service_id}", status_code=204)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Apenas admins
):
    """
    Excluir serviço (apenas admin)
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    db.delete(service)
    db.commit()
    
    return None 