from app.domain.database import SessionLocal
from app.repositories.mysql_repo import ExperimentRepository

db = SessionLocal()
repo = ExperimentRepository(db)
exps = repo.list_all()
count = 0
for e in exps:
    if e.trang_thai == 'running':
        repo.update_status(e.id, 'failed')
        count += 1
db.close()
print(f"Updated {count} stuck experiments.")
