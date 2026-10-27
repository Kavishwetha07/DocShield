from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------

class UserCreate(BaseModel):
    display_name: str
    email: EmailStr
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: str
    display_name: str
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Folders ----------

class FolderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class FolderOut(BaseModel):
    id: str
    name: str
    created_at: datetime
    document_count: int = 0

    class Config:
        from_attributes = True


# ---------- Documents ----------
# These mirror the shapes produced by the frontend:
#   encryptFile()   -> ciphertext, salt, iv, iterations, contentHash, sizeBytes
#   extractMetadata() -> fileName, extension, category, mimeType, sizeLabel, tags, indexedAt

class SealedPayloadIn(BaseModel):
    ciphertext: str
    salt: str
    iv: str
    iterations: int
    contentHash: str
    sizeBytes: int


class DocumentMetadataIn(BaseModel):
    fileName: str
    extension: str | None = None
    category: str | None = None
    mimeType: str | None = None
    tags: list[str] = []


class DocumentCreate(BaseModel):
    id: str
    folderId: str | None = None
    sealedPayload: SealedPayloadIn
    metadata: DocumentMetadataIn


class SealedPayloadOut(BaseModel):
    ciphertext: str
    salt: str
    iv: str
    iterations: int
    contentHash: str = Field(serialization_alias="contentHash")

    class Config:
        populate_by_name = True


class DocumentMetadataOut(BaseModel):
    fileName: str
    extension: str | None
    category: str | None
    mimeType: str | None
    sizeLabel: str
    tags: list[str]
    indexedAt: datetime


class DocumentOut(BaseModel):
    id: str
    folderId: str | None
    metadata: DocumentMetadataOut
    sealedPayload: SealedPayloadOut

    class Config:
        from_attributes = True
