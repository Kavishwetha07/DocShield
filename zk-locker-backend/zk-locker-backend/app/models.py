import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    display_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    # Account login password ONLY — this authenticates who you are to the
    # server. It is a completely separate secret from the client-side
    # encryption passphrase used in crypto.js, which the server never
    # receives or stores in any form.
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")


class Folder(Base):
    __tablename__ = "folders"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="folders")
    documents = relationship("Document", back_populates="folder", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    # Primary key is the client-computed content hash prefix — matches the
    # `id` the frontend already generates in VaultContext.jsx (seal()).
    id = Column(String, primary_key=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=True)

    # --- sealed payload (opaque to the server) ---
    ciphertext = Column(Text, nullable=False)       # base64 AES-GCM ciphertext
    salt = Column(String, nullable=False)            # base64, PBKDF2 salt
    iv = Column(String, nullable=False)               # base64, AES-GCM IV
    iterations = Column(Integer, nullable=False)
    content_hash = Column(String, nullable=False, index=True)  # sha256 hex

    # --- indexed metadata (plaintext, non-secret) ---
    file_name = Column(String, nullable=False)
    extension = Column(String, nullable=True)
    category = Column(String, nullable=True)
    mime_type = Column(String, nullable=True)
    size_bytes = Column(Integer, nullable=False)
    tags = Column(JSON, nullable=False, default=list)
    indexed_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="documents")
    folder = relationship("Folder", back_populates="documents")
