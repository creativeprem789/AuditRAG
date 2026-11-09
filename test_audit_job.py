import uuid

from database.db_setup import SessionLocal
from database.models import AuditJob


db = SessionLocal()

job_id = str(uuid.uuid4())

sample_report = {
    "summary": "Sample audit completed successfully",
    "total_discrepancies": 2,
    "findings": [
        {
            "issue": "Missing signature",
            "page": 3
        },
        {
            "issue": "Incorrect date",
            "page": 5
        }
    ]
}

try:
    # 1. Insert a sample audit job
    new_job = AuditJob(
        job_id=job_id,
        filename="sample.pdf",
        status="complete",
        final_report=sample_report
    )

    db.add(new_job)
    db.commit()

    print("1. Audit job inserted successfully!")

    # 2. Retrieve the audit job
    saved_job = db.query(AuditJob).filter(
        AuditJob.job_id == job_id
    ).first()

    print("2. Audit job retrieved successfully!")

    # 3. Verify stored data
    print("\n--- RETRIEVED DATA ---")
    print("Job ID:", saved_job.job_id)
    print("Filename:", saved_job.filename)
    print("Status:", saved_job.status)
    print("Final Report:", saved_job.final_report)
    print("Created At:", saved_job.created_at)

    assert saved_job.final_report == sample_report

    print("\n3. JSON verification successful!")

    # 4. Delete the temporary test record
    db.delete(saved_job)
    db.commit()

    print("4. Temporary test record deleted!")

except Exception as e:
    db.rollback()
    print("Database test failed:", e)

finally:
    db.close()