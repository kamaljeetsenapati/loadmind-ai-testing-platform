from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TestConfigBase(BaseModel):
    name: str
    profile: str
    target_vus: int
    ramp_up: int
    duration: int
    ai_enabled: bool
    cost: float

class TestConfigCreate(TestConfigBase):
    pass

class TestConfigResponse(TestConfigBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class TestRunResponse(BaseModel):
    id: int
    test_config_id: int
    run_number: int
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    health_score: int
    perf_score: int
    config: Optional[TestConfigResponse] = None

    class Config:
        orm_mode = True
        from_attributes = True

class MetricPointResponse(BaseModel):
    id: int
    test_run_id: int
    timestamp: int
    rps: int
    p50: int
    p95: int
    p99: int
    cpu: float
    memory: float
    errors: int

    class Config:
        orm_mode = True
        from_attributes = True

class BaselineResponse(BaseModel):
    id: int
    name: str
    environment: str
    status: str
    avg_response_time: int
    max_rps: int
    error_rate: float
    perf_score: int

    class Config:
        orm_mode = True
        from_attributes = True
