import os
import re

routers_dir = "d:\\ZestFlow\\BB Builders\\backend\\routers"
schemas = {
    "clients.py": {"model": "ClientModel", "db_model": "Client", "collection": "clients", "id_field": "id"},
    "equipment.py": {"model": "EquipmentModel", "db_model": "Equipment", "collection": "equipment", "id_field": "id"},
    "finance.py": {"model": "TransactionModel", "db_model": "FinanceTransaction", "collection": "transactions", "id_field": "id"},
    "hr.py": {"model": "HRModel", "db_model": "HRStaff", "collection": "hr", "id_field": "id"},
    "inventory.py": {"model": "InventoryModel", "db_model": "InventoryItem", "collection": "inventory", "id_field": "id"},
    "invoices.py": {"model": "InvoiceModel", "db_model": "Invoice", "collection": "invoices", "id_field": "id"},
    "management.py": {"model": "ManagementNoteModel", "db_model": "ManagementNote", "collection": "management", "id_field": "id"},
    "materials.py": {"model": "MaterialModel", "db_model": "Material", "collection": "materials", "id_field": "id"},
    "projects.py": {"model": "ProjectModel", "db_model": "Project", "collection": "projects", "id_field": "id"},
    "sites.py": {"model": "SiteModel", "db_model": "Site", "collection": "sites", "id_field": "id"},
    "workers.py": {"model": "WorkerModel", "db_model": "Worker", "collection": "workers", "id_field": "id"},
}

for filename, meta in schemas.items():
    filepath = os.path.join(routers_dir, filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r") as f:
        content = f.read()

    split_index = content.find('@router.get')
    if split_index == -1:
        continue
        
    pydantic_code = content[:split_index]
    
    pydantic_code = re.sub(r'from database import get_db.*?\n', '', pydantic_code)
    pydantic_code = pydantic_code.replace("from typing import List, Optional\nfrom sqlalchemy.ext.asyncio import AsyncSession\nfrom sqlalchemy import select, update, delete\nfrom database import get_db", "from typing import List, Optional\nfrom sqlalchemy.orm import Session\nfrom sqlalchemy import select, update, delete\nfrom database import get_db")
    
    new_routes = f"""
@router.get("", response_model=List[{meta['model']}])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select({meta['db_model']}))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model={meta['model']})
def create_item(item: {meta['model']}, db: Session = Depends(get_db)):
    db.add({meta['db_model']}(id=item.{meta['id_field']}, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{{{meta['id_field']}}}", response_model={meta['model']})
def update_item({meta['id_field']}: str, item: {meta['model']}, db: Session = Depends(get_db)):
    db.execute(update({meta['db_model']}).where({meta['db_model']}.id == {meta['id_field']}).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{{{meta['id_field']}}}")
def delete_item({meta['id_field']}: str, db: Session = Depends(get_db)):
    db.execute(delete({meta['db_model']}).where({meta['db_model']}.id == {meta['id_field']}))
    db.commit()
    return {{"status": "deleted"}}
"""
    with open(filepath, "w") as f:
        f.write(pydantic_code.strip() + "\n\n" + new_routes.strip() + "\n")
