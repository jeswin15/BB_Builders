from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String(255), primary_key=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    role = Column(String(50))
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)

class Client(Base):
    __tablename__ = "clients"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)

class Document(Base):
    __tablename__ = "documents"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)

class FinanceTransaction(Base):
    __tablename__ = "finance_transactions"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)

class Material(Base):
    __tablename__ = "materials"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)

class Site(Base):
    __tablename__ = "sites"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)

class Worker(Base):
    __tablename__ = "workers"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String(255), primary_key=True)
    data = Column(JSON)
