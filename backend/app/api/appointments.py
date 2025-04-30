from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import traceback
import sys

from backend.app.db.database import get_db
from backend.app.models.appointment import Appointment
from backend.app.models.user import User
from backend.app.schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from backend.app.core.deps import get_admin_user, get_current_user

router = APIRouter(tags=["Agendamentos"])

@router.post("/", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    appointment_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar novo agendamento
    """
    try:
        print(f"DEBUG - Criando agendamento: {appointment_in}")
        
        # Se não for admin, usa o ID do usuário logado
        if current_user.user_type != "admin":
            appointment_in.user_id = current_user.id
        
        # Verificar se já existe agendamento no mesmo horário para o mesmo barbeiro
        existing = db.query(Appointment).filter(
            Appointment.user_id == appointment_in.user_id,
            Appointment.date_time == appointment_in.date_time,
            Appointment.status == "scheduled"
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um agendamento para este barbeiro neste horário"
            )
        
        # Criar agendamento
        print(f"DEBUG - Criando objeto Appointment")
        db_appointment = Appointment(
            client_name=appointment_in.client_name,
            user_id=appointment_in.user_id,
            service_id=appointment_in.service_id,
            date_time=appointment_in.date_time,
            contact=appointment_in.contact,
            notes=appointment_in.notes,
            status="scheduled"
        )
        
        print(f"DEBUG - Adicionando ao banco")
        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        
        print(f"DEBUG - Retornando agendamento criado: {db_appointment}")
        return db_appointment
    except Exception as e:
        print(f"ERRO na criação de agendamento: {str(e)}", file=sys.stderr)
        print(f"Detalhes: {traceback.format_exc()}", file=sys.stderr)
        raise

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
    try:
        print(f"DEBUG - Listando agendamentos")
        query = db.query(Appointment)
        
        # Filtros de data
        today = datetime.now().date()
        if start_date:
            query = query.filter(func.date(Appointment.date_time) >= start_date)
        else:
            # Se não informar data inicial, mostra a partir de hoje
            query = query.filter(func.date(Appointment.date_time) >= today)
        
        if end_date:
            query = query.filter(func.date(Appointment.date_time) <= end_date)
        else:
            # Se não informar data final, mostra até uma semana à frente
            query = query.filter(
                func.date(Appointment.date_time) <= today + timedelta(days=7)
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
        query = query.order_by(Appointment.date_time.asc())
        
        print(f"DEBUG - Executando query SQL")
        appointments = query.all()
        print(f"DEBUG - Retornando {len(appointments)} agendamentos")
        return appointments
    except Exception as e:
        print(f"ERRO ao listar agendamentos: {str(e)}", file=sys.stderr)
        print(f"Detalhes: {traceback.format_exc()}", file=sys.stderr)
        raise

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