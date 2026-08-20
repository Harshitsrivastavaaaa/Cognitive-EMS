from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

from sqlalchemy import event

db_url = settings.get_database_url
is_sqlite = db_url.startswith("sqlite")

if not is_sqlite:
    try:
        test_engine = create_engine(db_url, connect_args={"connect_timeout": 3})
        with test_engine.connect() as conn:
            pass
        test_engine.dispose()
    except Exception as err:
        print(f"[Warning] PostgreSQL server unavailable: {err}. Falling back to SQLite database.")
        db_url = "sqlite:///./employees.db"
        is_sqlite = True

connect_args = {"check_same_thread": False} if is_sqlite else {}
engine_kwargs = {"connect_args": connect_args}

if not is_sqlite:
    # PostgreSQL connection pool configuration
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    })

engine = create_engine(db_url, **engine_kwargs)

if is_sqlite:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
