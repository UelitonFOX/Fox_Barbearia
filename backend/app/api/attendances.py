from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.orm import joinedload

from backend.app.db.database import get_db
from backend.app.models.attendance import Attendance
from backend.app.models.user import User
from backend.app.schemas.attendance import AttendanceCreate, AttendanceResponse, AttendanceUpdate
from backend.app.core.deps import get_admin_user, get_current_user

router = APIRouter(tags=["Atendimentos"])

@router.post("/", response_model=AttendanceResponse, status_code=201)
def create_attendance(
    attendance_in: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar novo atendimento
    """
    # Usar o ID do usuário logado se não for admin
    if current_user.user_type != "admin":
        attendance_in.user_id = current_user.id
    
    # Criar atendimento
    db_attendance = Attendance(
        user_id=attendance_in.user_id,
        service_id=attendance_in.service_id,
        original_value=attendance_in.original_value,
        discount_amount=attendance_in.discount_amount,
        final_value=attendance_in.final_value,
        payment_method=attendance_in.payment_method,
        date_time=attendance_in.date_time or datetime.now()
    )
    
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    return db_attendance

@router.get("/", response_model=List[AttendanceResponse])
def get_attendances(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar atendimentos com filtros
    """
    query = db.query(Attendance).options(
        joinedload(Attendance.user),
        joinedload(Attendance.service)
    )
    
    # Filtrar por data
    if start_date:
        query = query.filter(func.date(Attendance.date_time) >= start_date)
    if end_date:
        query = query.filter(func.date(Attendance.date_time) <= end_date)
    
    # Filtrar por barbeiro
    if user_id and current_user.user_type == "admin":
        query = query.filter(Attendance.user_id == user_id)
    elif current_user.user_type != "admin":
        # Se não for admin, só vê seus próprios atendimentos
        query = query.filter(Attendance.user_id == current_user.id)
    
    # Ordenar por data (mais recente primeiro)
    query = query.order_by(Attendance.date_time.desc())
    
    attendances = query.offset(skip).limit(limit).all()
    return attendances

@router.get("/{attendance_id}", response_model=AttendanceResponse)
def get_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obter atendimento pelo ID
    """
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atendimento não encontrado"
        )
    
    # Verificar permissão
    if current_user.user_type != "admin" and attendance.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este atendimento"
        )
    
    return attendance

@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: int,
    attendance_in: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Apenas admins
):
    """
    Atualizar atendimento (apenas admin)
    """
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atendimento não encontrado"
        )
    
    # Atualizar dados
    for field, value in attendance_in.model_dump(exclude_unset=True).items():
        setattr(attendance, field, value)
    
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    
    return attendance

@router.delete("/{attendance_id}", status_code=204)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Apenas admins
):
    """
    Excluir atendimento (apenas admin)
    """
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atendimento não encontrado"
        )
    
    db.delete(attendance)
    db.commit()
    
    return None

# --- ROTA DE LIMPEZA (APENAS PARA DESENVOLVIMENTO/SETUP) ---
@router.delete("/clear-all", status_code=204)
def delete_all_attendances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user) # Somente admin
):
    """
    [ADMIN] Exclui TODOS os registros de atendimento da tabela.
    Use com extremo cuidado!
    """
    try:
        num_deleted = db.query(Attendance).delete()
        db.commit()
        print(f"Todos os {num_deleted} atendimentos foram excluídos por {current_user.email}.")
        return None
    except Exception as e:
        db.rollback()
        print(f"Erro ao excluir todos os atendimentos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao tentar limpar os atendimentos"
        ) 