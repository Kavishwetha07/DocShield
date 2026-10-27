from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, documents, folders

# In production, prefer Alembic migrations over create_all(). This is kept
# for quick local/dev bring-up.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZK Locker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(folders.router)
app.include_router(documents.router)


@app.get("/health")
def health():
    return {"status": "ok"}
