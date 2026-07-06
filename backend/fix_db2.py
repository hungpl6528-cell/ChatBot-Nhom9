from app.domain.database import SessionLocal, engine
from sqlalchemy import text
db = SessionLocal()
db.execute(text("UPDATE experiments SET trang_thai='failed' WHERE trang_thai='running'"))
db.commit()
db.close()
print("Stuck experiments stopped.")
