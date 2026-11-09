from database.db_setup import engine, Base
from database.models import AuditJob

try:
    Base.metadata.create_all(bind=engine)

    print("Database connection successful!")
    print("AuditJob table created successfully!")

except Exception as e:
    print("Database operation failed!")
    print("Error:", e)