from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, datetime, timedelta
from typing import Optional, List, Dict, Any
from enum import Enum
from contextlib import asynccontextmanager

# --- Remover Teste de Importações Problemáticas --- #
# try:
#    ...
# except Exception as e:
#    ...
# --- Fim Teste de Importações --- #

# Padronizar importações para usar 'backend.app.' para core e db, 'backend.app.api' para api
from backend.app.core.config import settings # Caminho corrigido
from backend.app.api import auth, users, services, appointments, attendances, summary, dashboard # Caminho corrigido
from backend.app.db.database import engine, Base, get_db # Caminho corrigido
from backend.app.models.attendance import Attendance # Caminho corrigido
from backend.app.models.user import User # Caminho corrigido
from backend.app.models.appointment import Appointment # Caminho corrigido
from backend.app.models.service import ServiceModel # Caminho corrigido
from backend.app.schemas.appointment import AppointmentResponse # Caminho corrigido
from backend.app.schemas.user import BarberAttendanceSummary, UserResponse # Caminho corrigido
from backend.app.core.deps import get_current_user, get_admin_user # Caminho corrigido

# Criar as tabelas do banco de dados
# Base.metadata.create_all(bind=engine) # Movido para dentro do lifespan

# Importando os routers (Já corrigido acima, remover duplicação se houver)
# from backend.api import auth, services, appointments, attendances, summary, users, dashboard

# Importar o modelo User para verificar a tabela (Já corrigido acima)
# from backend.models.user import User

# Criar tabelas no banco de dados (se não existirem)
def create_tables():
    print("Verificando e criando tabelas, se necessário...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tabelas verificadas/criadas com sucesso.")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")

# Executar a criação das tabelas na inicialização
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando a aplicação...")
    create_tables()
    yield
    print("Encerrando a aplicação...")

app = FastAPI(
    title="Fox Barbearia API",
    description="API para o sistema de gerenciamento da Fox Barbearia",
    version="0.1.0",
    lifespan=lifespan # Adiciona o gerenciador de ciclo de vida
)

# Configuração de CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Incluir OPTIONS
    allow_headers=["*"],
)

# Rota raiz
@app.get("/")
async def root():
    return {"message": "Bem-vindo à API da Fox Barbearia"}

# Endpoint específico para o dashboard - resumo diário
@app.get("/api/v1/dashboard/summary", response_model=dict)
def get_daily_summary(
    date_param: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Resumo diário para o dashboard
    """
    query_date = date_param or datetime.now().date()
    
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

# Endpoint para resumo por barbeiro (apenas admin)
@app.get("/api/v1/dashboard/barber-summary", response_model=List[BarberAttendanceSummary])
def get_barber_summary(
    date_param: Optional[date] = None, # Filtrar por data (opcional, padrão hoje)
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user) # Apenas admin
):
    """
    Retorna um resumo de atendimentos e faturamento agrupado por barbeiro.
    """
    query_date = date_param or datetime.now().date()
    
    summary_query = db.query(
        User.id.label('user_id'),
        User.name.label('user_name'),
        func.count(Attendance.id).label('total_attendances'),
        func.sum(Attendance.final_value).label('total_final_value')
    ).join(
        Attendance, User.id == Attendance.user_id
    ).filter(
        User.user_type.in_(['barber', 'admin']), # Considerar admins como barbeiros aqui?
        func.date(Attendance.date_time) == query_date
    ).group_by(
        User.id,
        User.name
    ).order_by(
        User.name
    )
    
    results = summary_query.all()
    
    # Se não houver resultados, retornar lista vazia
    if not results:
        return []
        
    # Pydantic pode mapear diretamente dos resultados nomeados da query
    # se from_attributes = True estiver no Config do schema
    return results

# Registrar os routers (Users primeiro)
# print("--- Incluindo users.router (renomeado) ---") # Remover prints de depuração antigos
app.include_router(users.router, prefix="/api/v1/users", tags=["Usuários"])
# print("--- users.router (renomeado) incluído (?) ---") # Remover prints de depuração antigos
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticação"])
app.include_router(services.router, prefix="/api/v1/services", tags=["Serviços"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Agendamentos"])
app.include_router(attendances.router, prefix="/api/v1/attendances", tags=["Atendimentos"])
app.include_router(summary.router, prefix="/api/v1/summary", tags=["Resumos"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])

# --- DEBUG: Imprimir rotas registradas --- #
print("\n--- Rotas Registradas pelo FastAPI ---")
for route in app.routes:
    # Tentar acessar atributos específicos de rotas API
    if hasattr(route, "path") and hasattr(route, "methods") :
        print(f"Path: {route.path}, Métodos: {route.methods}")
    # Lidar com outros tipos de rotas (como montagens estáticas, etc.)
    elif hasattr(route, "path"):
         print(f"Path: {route.path} (Tipo: {type(route).__name__})")
    else:
         print(f"Rota desconhecida: {route} (Tipo: {type(route).__name__})")
print("--- Fim das Rotas Registradas ---\n")

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "message": "API funcionando normalmente"}

# Enumerador para tipo de período
class PeriodType(str, Enum):
    day = "day"
    week = "week" 
    month = "month"

# Endpoint para relatórios detalhados por período
@app.get("/api/v1/reports/period", response_model=Dict[str, Any])
def get_period_report(
    period_type: PeriodType = Query(..., description="Tipo de período (day, week, month)"),
    start_date: date = Query(..., description="Data inicial do período"),
    end_date: Optional[date] = Query(None, description="Data final do período (opcional)"),
    user_id: Optional[int] = Query(None, description="ID do barbeiro (opcional, apenas para admin)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gera relatório detalhado por período (dia, semana, mês)
    """
    # Se não for admin e tentar ver dados de outro usuário, bloqueia
    if current_user.user_type != "admin" and user_id is not None and user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para visualizar relatórios de outros barbeiros"
        )
    
    # Calcula data final se não informada
    if not end_date:
        if period_type == PeriodType.day:
            end_date = start_date
        elif period_type == PeriodType.week:
            end_date = start_date + timedelta(days=6)  # 7 dias a partir da data inicial
        elif period_type == PeriodType.month:
            # Último dia do mês
            next_month = start_date.replace(day=28) + timedelta(days=4)
            end_date = next_month - timedelta(days=next_month.day)
    
    # Base da query para atendimentos
    query = db.query(
        func.count(Attendance.id).label("total_count"),
        func.sum(Attendance.original_value).label("total_original"),
        func.sum(Attendance.discount_amount).label("total_discount"),
        func.sum(Attendance.final_value).label("total_final")
    ).filter(
        func.date(Attendance.date_time) >= start_date,
        func.date(Attendance.date_time) <= end_date
    )
    
    # Filtro por barbeiro específico (se informado) ou pelo usuário atual se não for admin
    if user_id:
        query = query.filter(Attendance.user_id == user_id)
    elif current_user.user_type != "admin":
        query = query.filter(Attendance.user_id == current_user.id)
    
    result = query.first()
    
    # Processamento por forma de pagamento
    payment_query = db.query(
        Attendance.payment_method,
        func.sum(Attendance.final_value).label("total")
    ).filter(
        func.date(Attendance.date_time) >= start_date,
        func.date(Attendance.date_time) <= end_date
    )
    
    if user_id:
        payment_query = payment_query.filter(Attendance.user_id == user_id)
    elif current_user.user_type != "admin":
        payment_query = payment_query.filter(Attendance.user_id == current_user.id)
    
    payment_totals = payment_query.group_by(Attendance.payment_method).all()
    payment_summary = {method: float(total) for method, total in payment_totals}
    
    # Processamento por dia (gráfico de evolução)
    daily_query = db.query(
        func.date(Attendance.date_time).label("date"),
        func.count(Attendance.id).label("count"),
        func.sum(Attendance.final_value).label("total")
    ).filter(
        func.date(Attendance.date_time) >= start_date,
        func.date(Attendance.date_time) <= end_date
    )
    
    if user_id:
        daily_query = daily_query.filter(Attendance.user_id == user_id)
    elif current_user.user_type != "admin":
        daily_query = daily_query.filter(Attendance.user_id == current_user.id)
    
    daily_data = daily_query.group_by(func.date(Attendance.date_time)).all()
    
    # Processar dados por dia
    date_series = []
    current_date = start_date
    while current_date <= end_date:
        # Procurar o dia nos resultados
        day_data = next((d for d in daily_data if d.date == current_date), None)
        
        date_series.append({
            "date": current_date.isoformat(),
            "count": day_data.count if day_data else 0,
            "total": float(day_data.total) if day_data and day_data.total else 0
        })
        
        current_date += timedelta(days=1)
    
    # Se for mês, adicionar dados por semana também
    week_series = []
    if period_type == PeriodType.month:
        week_query = db.query(
            extract('week', Attendance.date_time).label("week"),
            func.count(Attendance.id).label("count"),
            func.sum(Attendance.final_value).label("total")
        ).filter(
            func.date(Attendance.date_time) >= start_date,
            func.date(Attendance.date_time) <= end_date
        )
        
        if user_id:
            week_query = week_query.filter(Attendance.user_id == user_id)
        elif current_user.user_type != "admin":
            week_query = week_query.filter(Attendance.user_id == current_user.id)
        
        week_data = week_query.group_by(extract('week', Attendance.date_time)).all()
        
        for week in week_data:
            week_series.append({
                "week": int(week.week),
                "count": week.count,
                "total": float(week.total) if week.total else 0
            })
    
    # Obter o top 5 serviços mais realizados
    services_query = db.query(
        Attendance.service_id,
        func.count(Attendance.id).label("count"),
        func.sum(Attendance.final_value).label("total")
    ).join(
        ServiceModel, ServiceModel.id == Attendance.service_id
    ).filter(
        func.date(Attendance.date_time) >= start_date,
        func.date(Attendance.date_time) <= end_date
    )
    
    if user_id:
        services_query = services_query.filter(Attendance.user_id == user_id)
    elif current_user.user_type != "admin":
        services_query = services_query.filter(Attendance.user_id == current_user.id)
    
    top_services_data = services_query.group_by(
        Attendance.service_id
    ).order_by(
        func.count(Attendance.id).desc()
    ).limit(5).all()
    
    # Buscar os nomes dos serviços
    top_services = []
    for service_data in top_services_data:
        service = db.query(ServiceModel).filter(ServiceModel.id == service_data.service_id).first()
        if service:
            top_services.append({
                "id": service.id,
                "name": service.name,
                "count": service_data.count,
                "total": float(service_data.total) if service_data.total else 0
            })
    
    # Dados para o relatório completo
    report_data = {
        "period_type": period_type,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "summary": {
            "total_attendances": result.total_count or 0,
            "total_original": float(result.total_original or 0),
            "total_discount": float(result.total_discount or 0),
            "total_final": float(result.total_final or 0),
        },
        "payment_summary": payment_summary,
        "daily_data": date_series,
        "top_services": top_services
    }
    
    # Adicionar dados semanais se for relatório mensal
    if period_type == PeriodType.month:
        report_data["weekly_data"] = week_series
    
    return report_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True) 