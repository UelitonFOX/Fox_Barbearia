import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Corrigir caminhos de importação
from backend.app.db.database import get_db
from backend.app.schemas.user import UserCreate, UserUpdate, UserResponse, UserPasswordUpdate
from backend.app.models.user import User
from backend.app.core.security import get_current_active_user, pwd_context, verify_password

# Voltar para o nome original do router
router = APIRouter()

# Helper function to get user or raise 404
def get_user_or_404(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Rotas CRUD para Usuários (geralmente acessíveis por admin)
# ... (create_user_route, get_user_route, get_users_route, update_user_route, delete_user_route)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_route(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user) # Temporariamente removido para permitir criação inicial
):
    # TODO: Reativar autenticação após criação do primeiro admin
    # if current_user.user_type != "admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Not authorized to create users",
    #     )

    db_user_email = db.query(User).filter(User.email == user_data.email).first()
    if db_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    db_user_username = db.query(User).filter(User.username == user_data.username).first()
    if db_user_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    hashed_password = pwd_context.hash(user_data.password)
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        user_type=user_data.user_type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user_route(user_id: int, db: Session = Depends(get_db)):
    db_user = get_user_or_404(db, user_id)
    return db_user

@router.get("/list", response_model=List[UserResponse])
def get_users_route(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Segurança Reativada
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to list users")
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.put("/{user_id}", response_model=UserResponse)
def update_user_route(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db_user = get_user_or_404(db, user_id)

    # Verifica permissões (apenas admin ou o próprio usuário podem atualizar)
    if current_user.user_type != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user",
        )

    update_data = user_update.model_dump(exclude_unset=True)

    # Verifica se o email já existe (se estiver sendo alterado)
    if "email" in update_data and update_data["email"] != db_user.email:
        existing_user = db.query(User).filter(User.email == update_data["email"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # Verifica se o username já existe (se estiver sendo alterado)
    if "username" in update_data and update_data["username"] != db_user.username:
        existing_user = db.query(User).filter(User.username == update_data["username"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )

    # Hashear a senha se ela for fornecida na atualização
    if "password" in update_data and update_data["password"]:
        hashed_password = pwd_context.hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"] # Remove a senha original do dicionário
    elif "password" in update_data: # Caso a senha seja "" ou None, remove para não atualizar
         del update_data["password"]

    # Atualiza os campos do usuário
    for key, value in update_data.items():
        # Protege contra a atualização direta da senha hasheada sem o hashing
        if key == "password":
            continue
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_route(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Apenas admin pode deletar usuários
    if current_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete users",
        )

    db_user = get_user_or_404(db, user_id)
    db.delete(db_user)
    db.commit()
    return

# --- Rota para o próprio usuário atualizar a senha --- #

@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_own_password(
    password_update: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Permite que o usuário autenticado atualize sua própria senha."""

    # Verificar se a senha atual fornecida está correta
    if not verify_password(password_update.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta",
        )

    # Hashear a nova senha
    hashed_new_password = pwd_context.hash(password_update.new_password)

    # Atualizar a senha no banco de dados
    current_user.hashed_password = hashed_new_password
    db.add(current_user)
    db.commit()

    # Não há conteúdo para retornar em um PUT/PATCH de sucesso sem corpo
    return
