from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Document, Folder, User
from app.schemas import FolderCreate, FolderOut

router = APIRouter(prefix="/folders", tags=["folders"])


@router.post("", response_model=FolderOut, status_code=201)
def create_folder(
    payload: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder = Folder(name=payload.name, owner_id=current_user.id)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return FolderOut(id=folder.id, name=folder.name, created_at=folder.created_at, document_count=0)


@router.get("", response_model=list[FolderOut])
def list_folders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(Folder, func.count(Document.id))
        .outerjoin(Document, Document.folder_id == Folder.id)
        .filter(Folder.owner_id == current_user.id)
        .group_by(Folder.id)
        .all()
    )
    return [
        FolderOut(id=f.id, name=f.name, created_at=f.created_at, document_count=count)
        for f, count in rows
    ]


@router.delete("/{folder_id}", status_code=204)
def delete_folder(
    folder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder = db.get(Folder, folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
