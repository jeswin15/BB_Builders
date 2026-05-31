from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum

# --- Advance Payment Models ---
class AdvanceStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    DEDUCTED = "Deducted" # Meaning it has been accounted for in payroll

class AdvancePaymentBase(BaseModel):
    worker_id: str
    amount: float = Field(..., gt=0)
    request_date: date
    reason: str
    status: AdvanceStatus = AdvanceStatus.PENDING
    approved_by: Optional[str] = None
    associated_payroll_id: Optional[str] = None

class AdvancePaymentCreate(AdvancePaymentBase):
    pass

class AdvancePaymentInDB(AdvancePaymentBase):
    id: str
    created_at: datetime = datetime.now()

# --- Payroll Models ---
class PayrollStatus(str, Enum):
    DRAFT = "Draft"
    APPROVED = "Approved"
    PAID = "Paid"

class PayrollBase(BaseModel):
    worker_id: str
    period_start: date
    period_end: date
    gross_wage: float = 0.0
    advances_deducted: float = 0.0
    net_payable: float = 0.0
    status: PayrollStatus = PayrollStatus.DRAFT

class PayrollCreate(PayrollBase):
    pass

class PayrollInDB(PayrollBase):
    id: str
    created_at: datetime = datetime.now()

# --- Expense Models ---
class ExpenseCategory(str, Enum):
    LABOR = "Labor"
    MATERIAL = "Material"
    TRANSPORT = "Transport"
    FUEL = "Fuel"
    EQUIPMENT = "Equipment"
    FOOD = "Food"
    ADMIN = "Admin"
    MISC = "Miscellaneous"

class ExpenseBase(BaseModel):
    project_id: Optional[str] = None # Can be null if it's a general company expense
    category: ExpenseCategory
    amount: float = Field(..., gt=0)
    date: date
    description: str
    receipt_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseInDB(ExpenseBase):
    id: str
    created_at: datetime = datetime.now()

# --- Invoice Models ---
class InvoiceStatus(str, Enum):
    DRAFT = "Draft"
    SENT = "Sent"
    PARTIAL = "Partial Payment"
    PAID = "Paid"
    OVERDUE = "Overdue"

class InvoiceBase(BaseModel):
    client_id: str
    project_id: str
    invoice_number: str
    issue_date: date
    due_date: date
    subtotal: float
    tax_amount: float
    total_amount: float
    status: InvoiceStatus = InvoiceStatus.DRAFT

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceInDB(InvoiceBase):
    id: str
    created_at: datetime = datetime.now()
