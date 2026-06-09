from database import SessionLocal
from models.schema import Worker
import time

def verify():
    db = SessionLocal()
    try:
        print("Testing TiDB Connection...")
        # Test Insert
        wid = f"TEST-{int(time.time())}"
        test_worker = Worker(id=wid, data={"name": "Test Worker", "skill": "Verification"})
        db.add(test_worker)
        db.commit()
        print("[SUCCESS] Inserted test worker")
        
        # Test Read
        result = db.query(Worker).filter(Worker.id == wid).first()
        if result:
            print(f"[SUCCESS] Read test worker: {result.data['name']}")
        else:
            print("[FAILED] Could not read test worker")
        
        # Test Delete
        db.delete(result)
        db.commit()
        print("[SUCCESS] Deleted test worker")
        
        print("Database Verification Complete. All Systems Operational!")
        
    except Exception as e:
        print(f"[ERROR] Verification Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify()
