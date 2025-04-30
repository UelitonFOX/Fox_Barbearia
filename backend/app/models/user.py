from sqlalchemy import Column, Integer, String, Boolean
from backend.app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    user_type = Column(String, default='barber')  # "admin" ou "barber"
    active = Column(Boolean, default=True)
    # Coluna phone removida temporariamente - adicionar posteriormente:
    # phone = Column(String, nullable=True) 