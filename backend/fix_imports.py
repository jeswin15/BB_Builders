import os
import glob

routers = glob.glob("d:\\ZestFlow\\BB Builders\\backend\\routers\\*.py")

for router in routers:
    if router.endswith('auth.py') or router.endswith('documents.py'):
        continue
    with open(router, 'r') as f:
        content = f.read()
    
    # Remove AsyncSession
    content = content.replace("from sqlalchemy.ext.asyncio import AsyncSession", "")
    content = content.replace("from database import get_db", "")
    content = content.replace("from sqlalchemy.orm import Session", "")
    
    # Add imports at the top
    content = "from database import get_db\nfrom sqlalchemy.orm import Session\n" + content.lstrip()
    
    with open(router, 'w') as f:
        f.write(content)
        
print("Imports fixed!")
