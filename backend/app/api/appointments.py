from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.appointment import Appointment
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from app.core.deps import get_admin_user, get_current_user

router = APIRouter(prefix="/appointments", tags=["Agendamentos"])

@router.post("/", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    appointment_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar novo agendamento
    """
    # Se não for admin, usa o ID do usuário logado
    if current_user.user_type != "admin":
        appointment_in.user_id = current_user.id
    
    # Verificar se já existe agendamento no mesmo horário para o mesmo barbeiro
    existing = db.query(Appointment).filter(
        Appointment.user_id == appointment_in.user_id,
        Appointment.scheduled_datetime == appointment_in.scheduled_datetime,
        Appointment.status == "agendado"
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um agendamento para este barbeiro neste horário"
        )
    
    # Criar agendamento
    db_appointment = Appointment(
        client_name=appointment_in.client_name,
        user_id=appointment_in.user_id,
        service_id=appointment_in.service_id,
        scheduled_datetime=appointment_in.scheduled_datetime,
        status=appointment_in.status
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    return db_appointment

@router.get("/", response_model=List[AppointmentResponse])
def get_appointments(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar agendamentos com filtros
    """
    query = db.query(Appointment)
    
    # Filtros de data
    today = datetime.now().date()
    if start_date:
        query = query.filter(func.date(Appointment.scheduled_datetime) >= start_date)
    else:
        # Se não informar data inicial, mostra a partir de hoje
        query = query.filter(func.date(Appointment.scheduled_datetime) >= today)
    
    if end_date:
        query = query.filter(func.date(Appointment.scheduled_datetime) <= end_date)
    else:
        # Se não informar data final, mostra até uma semana à frente
        query = query.filter(
            func.date(Appointment.scheduled_datetime) <= today + timedelta(days=7)
        )
    
    # Filtro de usuário (barbeiro)
    if user_id and current_user.user_type == "admin":
        query = query.filter(Appointment.user_id == user_id)
    elif current_user.user_type != "admin":
        # Se não for admin, só vê seus próprios agendamentos
        query = query.filter(Appointment.user_id == current_user.id)
    
    # Filtro de status
    if status:
        query = query.filter(Appointment.status == status)
    
    # Ordenar por data
    query = query.order_by(Appointment.scheduled_datetime.asc())
    
    appointments = query.all()
    return appointments

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obter agendamento pelo ID
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Verificar permissão
    if current_user.user_type != "admin" and appointment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este agendamento"
        )
    
    return appointment

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appointment_in: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar agendamento
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Verificar permissão
    if current_user.user_type != "admin" and appointment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para modificar este agendamento"
        )
    
    # Atualizar dados
    update_data = appointment_in.model_dump(exclude_unset=True)
    
    # Se não for admin e tentar mudar o barbeiro, bloqueia
    if "user_id" in update_data and current_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem alterar o barbeiro de um agendamento"
        )
    
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return appointment

@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancelar agendamento (exclui fisicamente)
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Verificar permissão
    if current_user.user_type != "admin" and appointment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para excluir este agendamento"
        )
    
    db.delete(appointment)
    db.commit()
    
    return None 