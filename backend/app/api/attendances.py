from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.attendance import Attendance
from app.models.user import User
from app.schemas.attendance import AttendanceCreate, AttendanceResponse, AttendanceUpdate
from app.core.deps import get_admin_user, get_current_user

router = APIRouter(prefix="/attendances", tags=["Atendimentos"])

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
    query = db.query(Attendance)
    
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

@router.get("/summary/daily", response_model=dict)
def get_daily_summary(
    date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Resumo diário de atendimentos
    """
    query_date = date or datetime.now().date()
    
    # Base da query
    query = db.query(
        func.count(Attendance.id).label("total_count"),
        func.sum(Attendance.original_value).label("total_original"),
        func.sum(Attendance.discount_amount).label("total_discount"),
        func.sum(Attendance.final_value).label("total_final")
    ).filter(func.date(Attendance.date_time) == query_date)
    
    # Se não for admin, filtra pelos atendimentos do próprio usuário
    if current_user.user_type != "admin":
        query = query.filter(Attendance.user_id == current_user.id)
    
    result = query.first()
    
    # Processamento por forma de pagamento
    payment_query = db.query(
        Attendance.payment_method,
        func.sum(Attendance.final_value).label("total")
    ).filter(func.date(Attendance.date_time) == query_date)
    
    if current_user.user_type != "admin":
        payment_query = payment_query.filter(Attendance.user_id == current_user.id)
    
    payment_totals = payment_query.group_by(Attendance.payment_method).all()
    payment_summary = {method: float(total) for method, total in payment_totals}
    
    return {
        "date": query_date.isoformat(),
        "total_attendances": result.total_count or 0,
        "total_original": float(result.total_original or 0),
        "total_discount": float(result.total_discount or 0),
        "total_final": float(result.total_final or 0),
        "payment_summary": payment_summary
    } 