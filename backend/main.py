from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI(title="DFMEA VDA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class FunctionItem(BaseModel):
    id: Optional[str] = None
    component: str
    function: str
    requirement: str

class FailureMode(BaseModel):
    id: Optional[str] = None
    function_id: str
    failure_mode: str
    failure_effect: str
    failure_cause: str
    severity: int       # 1-10
    occurrence: int     # 1-10
    detection: int      # 1-10

    @property
    def ap(self) -> str:
        """Action Priority per VDA FMEA 2019"""
        s, o, d = self.severity, self.occurrence, self.detection
        rpn = s * o * d
        if s >= 9:
            return "H"
        if rpn >= 200 or (s >= 7 and o >= 4):
            return "H"
        if rpn >= 125:
            return "M"
        return "L"

# --- In-memory store ---
functions: dict[str, dict] = {}
failures: dict[str, dict] = {}

# --- Endpoints ---

@app.get("/")
def root():
    return {"status": "ok", "service": "DFMEA VDA API"}

@app.get("/functions")
def list_functions():
    return list(functions.values())

@app.post("/functions", status_code=201)
def create_function(item: FunctionItem):
    item.id = str(uuid.uuid4())
    functions[item.id] = item.model_dump()
    return item

@app.delete("/functions/{item_id}")
def delete_function(item_id: str):
    if item_id not in functions:
        raise HTTPException(status_code=404, detail="Not found")
    del functions[item_id]
    return {"deleted": item_id}

@app.get("/failures")
def list_failures():
    result = []
    for f in failures.values():
        obj = FailureMode(**f)
        entry = f.copy()
        entry["ap"] = obj.ap
        entry["rpn"] = obj.severity * obj.occurrence * obj.detection
        result.append(entry)
    return result

@app.post("/failures", status_code=201)
def create_failure(item: FailureMode):
    item.id = str(uuid.uuid4())
    data = item.model_dump()
    data["ap"] = item.ap
    data["rpn"] = item.severity * item.occurrence * item.detection
    failures[item.id] = item.model_dump()
    return data

@app.delete("/failures/{item_id}")
def delete_failure(item_id: str):
    if item_id not in failures:
        raise HTTPException(status_code=404, detail="Not found")
    del failures[item_id]
    return {"deleted": item_id}
