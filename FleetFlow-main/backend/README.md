# FleetFlow: Modular Fleet & Logistics Management Backend (FastAPI + SQLite)

This is the production-ready Python backend for **FleetFlow**, built with **FastAPI**, **SQLAlchemy ORM**, and **SQLite**.

---

## 🛠️ Windows Step-by-Step Setup Guide

### 1. Prerequisites
Ensure you have **Python 3.10+** installed on Windows.
Check by opening Command Prompt (`cmd`) or PowerShell:
```powershell
python --version
```

### 2. Navigate to the backend directory
```powershell
cd backend
```

### 3. Create a Virtual Environment
```powershell
python -m venv venv
```

### 4. Activate the Virtual Environment
**PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```
*(If you encounter execution policy error in PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

**Command Prompt (cmd):**
```cmd
venv\Scripts\activate.bat
```

### 5. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 6. Run the FastAPI Server
```powershell
uvicorn main:app --reload --port 8000
```
- **Interactive Swagger Docs:** http://localhost:8000/docs
- **Alternative Redoc:** http://localhost:8000/redoc
- **API Base:** http://localhost:8000/api

---

## 💻 Frontend (React + Vite) Setup

In a new terminal window:
```powershell
# From the project root
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 📊 Core Business Rules Implemented

1. **Vehicle Intake**: Add new vehicle (`Van-05`, 500kg capacity) ➔ Status automatically set to `Available`.
2. **Driver Compliance**: Add Driver (`Alex`). System verifies license validity for vehicle category (`Van`). Blocks if expired.
3. **Dispatch Validation**: Assign Driver to Vehicle for cargo.
   - **Weight Check**: If `CargoWeight > MaxCapacity`, API returns `400 Validation Error` and prevents dispatch.
   - **Status Transition**: Vehicle & Driver ➔ `On Trip`.
4. **Trip Completion**: Driver marks trip `Completed` with final Odometer reading.
   - Vehicle & Driver ➔ `Available`.
   - Vehicle Odometer automatically updated.
5. **Maintenance Auto-Logic**: Adding vehicle to a Service Log automatically switches its status to `In Shop`, removing it from the Dispatcher's selection pool.
6. **Analytics & Financials**: Computes Fuel Efficiency (`km/L`), Total Operational Cost (`Fuel + Maintenance`), and Vehicle ROI:
   $$\text{ROI} = \frac{\text{Revenue} - (\text{Maintenance} + \text{Fuel})}{\text{Acquisition Cost}} \times 100\%$$
