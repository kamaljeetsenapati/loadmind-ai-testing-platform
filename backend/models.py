from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
class TestConfig(Base):
    __tablename__ = "test_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    profile = Column(String)  # "Load Test", "Spike Test", "Stress Test"
    target_vus = Column(Integer)
    ramp_up = Column(Integer)
    duration = Column(Integer)
    ai_enabled = Column(Boolean, default=True)
    cost = Column(Float)
    created_at = Column(DateTime, server_default=func.now())

    runs = relationship("TestRun", back_populates="config")

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    test_config_id = Column(Integer, ForeignKey("test_configs.id"))
    run_number = Column(Integer)
    status = Column(String)  # "Running", "Completed", "Stopped"
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    health_score = Column(Integer, default=92)
    perf_score = Column(Integer, default=94)

    config = relationship("TestConfig", back_populates="runs")
    metrics = relationship("MetricPoint", back_populates="run")

class MetricPoint(Base):
    __tablename__ = "metric_points"

    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id"))
    timestamp = Column(Integer)  # seconds relative to start
    rps = Column(Integer)
    p50 = Column(Integer)
    p95 = Column(Integer)
    p99 = Column(Integer)
    cpu = Column(Float)
    memory = Column(Float)
    errors = Column(Integer)

    run = relationship("TestRun", back_populates="metrics")

class Baseline(Base):
    __tablename__ = "baselines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    environment = Column(String)  # "Prod", "Stage", "QA"
    status = Column(String)  # "Current Baseline", "Stable Release", "Previous Major"
    avg_response_time = Column(Integer)  # ms
    max_rps = Column(Integer)
    error_rate = Column(Float)  # %
    perf_score = Column(Integer)
