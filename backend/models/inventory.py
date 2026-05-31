from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

# --- Material Catalog Models ---
class MaterialCategory(str, Enum):
    CEMENT = "Cement"
    STEEL = "Steel"
    SAND = "Sand"
    BRICKS = "Bricks"
    PAINT = "Paint"
    ELECTRICAL = "Electrical"
    PLUMBING = "Plumbing"
    HARDWARE = "Hardware"
    CUSTOM = "Custom"

class UnitMeasurement(str, Enum):
    KG = "kg"
    TON = "ton"
    BAG = "bag"
    LITER = "liter"
    METER = "meter"
    PIECE = "piece"
    BOX = "box"

class MaterialBase(BaseModel):
    code: str
    name: str
    category: MaterialCategory
    supplier_id: Optional[str] = None
    unit_of_measurement: UnitMeasurement
    standard_rate: float
    gst_percentage: float = 18.0
    minimum_stock_level: float
    reorder_level: float

class MaterialCreate(MaterialBase):
    pass

class MaterialInDB(MaterialBase):
    id: str
    created_at: datetime = datetime.now()

# --- Warehouse / Inventory Models ---
class WarehouseBase(BaseModel):
    name: str
    location: str
    is_central: bool = False
    site_id: Optional[str] = None # If it's a site warehouse

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseInDB(WarehouseBase):
    id: str
    created_at: datetime = datetime.now()

class InventoryItemBase(BaseModel):
    warehouse_id: str
    material_id: str
    quantity: float = 0.0

class InventoryItemInDB(InventoryItemBase):
    id: str
    last_updated: datetime = datetime.now()

# --- Equipment Models ---
class EquipmentStatus(str, Enum):
    AVAILABLE = "Available"
    IN_USE = "In Use"
    UNDER_MAINTENANCE = "Under Maintenance"
    RETIRED = "Retired"

class EquipmentBase(BaseModel):
    code: str
    name: str
    type: str # Machinery, Vehicle, Tool
    is_rented: bool = False
    purchase_cost: Optional[float] = None
    rental_cost_per_day: Optional[float] = None
    assigned_site_id: Optional[str] = None
    status: EquipmentStatus = EquipmentStatus.AVAILABLE

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentInDB(EquipmentBase):
    id: str
    created_at: datetime = datetime.now()
