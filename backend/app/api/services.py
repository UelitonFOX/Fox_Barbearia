from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from backend.app.db.database import get_db
from backend.app.models.service import ServiceModel, default_services
from backend.app.models.service import Service as ServiceSchema
from backend.app.models.service import ServiceCreate, ServiceUpdate
from backend.app.core.deps import get_admin_user, get_current_user
from backend.app.models.user import User

router = APIRouter(
    tags=["Serviços"]
)

@router.get("/", response_model=List[ServiceSchema])
def read_services(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Recuperar todos os serviços
    """
    try:
        services = db.query(ServiceModel).offset(skip).limit(limit).all()
        return services
    except SQLAlchemyError as e:
        print(f"Erro ao buscar serviços: {e}")
        # Retorna uma lista vazia em caso de erro
        return []

@router.post("/", response_model=ServiceSchema)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo serviço.
    Apenas administradores podem criar serviços.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem criar serviços"
        )
    
    try:
        db_service = ServiceModel(**service.model_dump())
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        return db_service
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um serviço com este nome"
        )

@router.get("/{service_id}", response_model=ServiceSchema)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna os detalhes de um serviço específico.
    Qualquer usuário autenticado pode ver os detalhes.
    """
    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    return service

@router.put("/{service_id}", response_model=ServiceSchema)
def update_service(
    service_id: int,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza um serviço existente.
    Apenas administradores podem atualizar serviços.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar serviços"
        )

    db_service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    try:
        update_data = service_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_service, field, value)
        
        db.commit()
        db.refresh(db_service)
        return db_service
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um serviço com este nome"
        )

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove um serviço.
    Apenas administradores podem remover serviços.
    Na prática, apenas marca como inativo para manter histórico.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem remover serviços"
        )

    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    service.is_active = False
    db.commit()

@router.post("/initialize", status_code=status.HTTP_201_CREATED)
def initialize_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Inicializa a tabela de serviços com os valores padrão.
    Apenas administradores podem inicializar os serviços.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem inicializar serviços"
        )
    
    try:
        for service_data in default_services:
            if not db.query(ServiceModel).filter(ServiceModel.name == service_data["name"]).first():
                db_service = ServiceModel(**service_data)
                db.add(db_service)
        db.commit()
        return {"message": "Serviços inicializados com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao inicializar serviços: {str(e)}"
        ) 