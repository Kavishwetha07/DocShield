from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Document, Folder, User
from app.schemas import (
    DocumentCreate,
    DocumentMetadataOut,
    DocumentOut,
    SealedPayloadOut,
)

router = APIRouter(prefix="/documents", tags=["documents"])


def _human_size(n: int) -> str:
    if n < 1024:
        return f"{n} B"
    for unit in ("KB", "MB", "GB"):
        n /= 1024
        if n < 1024:
            return f"{n:.1f} {unit}"
    return f"{n:.1f} GB"


def to_document_out(doc: Document) -> DocumentOut:
    return DocumentOut(
        id=doc.id,
        folderId=doc.folder_id,
        metadata=DocumentMetadataOut(
            fileName=doc.file_name,
            extension=doc.extension,
            category=doc.category,
            mimeType=doc.mime_type,
            sizeLabel=_human_size(doc.size_bytes),
            tags=doc.tags or [],
            indexedAt=doc.indexed_at,
        ),
        sealedPayload=SealedPayloadOut(
            ciphertext=doc.ciphertext,
            salt=doc.salt,
            iv=doc.iv,
            iterations=doc.iterations,
            contentHash=doc.content_hash,
        ),
    )


@router.post("", response_model=DocumentOut, status_code=201)
def upload_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # The server only ever sees what's in this payload: ciphertext + salt +
    # iv + a content hash, plus non-secret metadata. It never receives the
    # plaintext file or the passphrase that encrypted it.
    if payload.folderId:
        folder = db.get(Folder, payload.folderId)
        if not folder or folder.owner_id != current_user.id:
            raise HTTPException(status_code=404, detail="Folder not found")

    existing = db.get(Document, payload.id)
    if existing and existing.owner_id != current_user.id:
        raise HTTPException(status_code=409, detail="Document id collision")

    doc = existing or Document(id=payload.id, owner_id=current_user.id)
    doc.folder_id = payload.folderId
    doc.ciphertext = payload.sealedPayload.ciphertext
    doc.salt = payload.sealedPayload.salt
    doc.iv = payload.sealedPayload.iv
    doc.iterations = payload.sealedPayload.iterations
    doc.content_hash = payload.sealedPayload.contentHash
    doc.size_bytes = payload.sealedPayload.sizeBytes
    doc.file_name = payload.metadata.fileName
    doc.extension = payload.metadata.extension
    doc.category = payload.metadata.category
    doc.mime_type = payload.metadata.mimeType
    doc.tags = payload.metadata.tags

    db.add(doc)
    db.commit()
    db.refresh(doc)
    return to_document_out(doc)


@router.get("", response_model=list[DocumentOut])
def list_documents(
    folder_id: str | None = Query(default=None),
    q: str | None = Query(default=None, description="Search by filename"),
    tag: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Document).filter(Document.owner_id == current_user.id)
    if folder_id:
        query = query.filter(Document.folder_id == folder_id)
    if q:
        query = query.filter(Document.file_name.ilike(f"%{q}%"))
    docs = query.order_by(Document.indexed_at.desc()).all()
    if tag:
        docs = [d for d in docs if tag in (d.tags or [])]
    return [to_document_out(d) for d in docs]


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.get(Document, document_id)
    if not doc or doc.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    return to_document_out(doc)


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.get(Document, document_id)
    if not doc or doc.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
