from sqlalchemy import Column, String, Enum, JSON, DateTime, func
from database.db_setup import Base


class AuditJob(Base):
    __tablename__ = "audit_jobs"

    job_id = Column(String(36), primary_key=True, index=True)

    filename = Column(String(255), nullable=False)

    status = Column(
        Enum(
            "processing",
            "complete",
            "failed",
            name="audit_job_status"
        ),
        nullable=False,
        default="processing"
    )

    final_report = Column(JSON, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )