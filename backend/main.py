from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import asyncio
import random
from datetime import datetime, timedelta
from typing import List

from database import engine, Base, get_db
import models 
import schemas

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LoadMind AI Backend")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database on startup
@app.on_event("startup")
def seed_data():
    db = next(get_db())
    # Check if baselines exist
    if db.query(models.Baseline).count() == 0:
        baselines = [
            models.Baseline(
                name="Production-v1 (Oct 12)",
                environment="Prod",
                status="Current Baseline",
                avg_response_time=161,
                max_rps=4100,
                error_rate=0.8,
                perf_score=89
            ),
            models.Baseline(
                name="Staging-v2 (Oct 10)",
                environment="Stage",
                status="Stable Release",
                avg_response_time=145,
                max_rps=4500,
                error_rate=0.2,
                perf_score=95
            ),
            models.Baseline(
                name="Legacy-v1.4 (Sept 28)",
                environment="Prod",
                status="Previous Major",
                avg_response_time=185,
                max_rps=3800,
                error_rate=1.5,
                perf_score=82
            )
        ]
        db.add_all(baselines)
        db.commit()

    # Check if default test config exists
    if db.query(models.TestConfig).count() == 0:
        default_config = models.TestConfig(
            name="Production Checkout Stress Test",
            profile="Stress Test",
            target_vus=1000,
            ramp_up=60,
            duration=15,
            ai_enabled=True,
            cost=4.25
        )
        db.add(default_config)
        db.commit()

        # Seed some historical runs
        run1 = models.TestRun(
            test_config_id=default_config.id,
            run_number=4091,
            status="Completed",
            started_at=datetime.utcnow() - timedelta(days=2),
            completed_at=datetime.utcnow() - timedelta(days=2, minutes=15),
            health_score=90,
            perf_score=91
        )
        run2 = models.TestRun(
            test_config_id=default_config.id,
            run_number=4092,
            status="Completed",
            started_at=datetime.utcnow() - timedelta(days=1),
            completed_at=datetime.utcnow() - timedelta(days=1, minutes=15),
            health_score=92,
            perf_score=94
        )
        db.add_all([run1, run2])
        db.commit()

        # Seed metric points for run2 (the dashboard/comparison run)
        metrics = []
        for i in range(15):
            t = i * 60  # every minute
            # Simulate slight load increase and stable metrics
            metrics.append(models.MetricPoint(
                test_run_id=run2.id,
                timestamp=t,
                rps=int(2000 + (i * 150) + random.randint(-50, 50)),
                p50=int(110 + random.randint(-5, 5)),
                p95=int(135 + random.randint(-8, 8)),
                p99=int(180 + (i * 2) + random.randint(-15, 15)),
                cpu=float(35.5 + (i * 2.5) + random.uniform(-2, 2)),
                memory=float(42.1 + (i * 0.8) + random.uniform(-0.5, 0.5)),
                errors=int(random.randint(0, 3) if i < 12 else random.randint(5, 15))
            ))
        db.add_all(metrics)
        db.commit()
    db.close()


@app.get("/api/baselines", response_model=List[schemas.BaselineResponse])
def get_baselines(db: Session = Depends(get_db)):
    return db.query(models.Baseline).all()


@app.get("/api/tests", response_model=List[schemas.TestConfigResponse])
def get_tests(db: Session = Depends(get_db)):
    return db.query(models.TestConfig).order_by(models.TestConfig.created_at.desc()).all()


@app.post("/api/tests", response_model=schemas.TestConfigResponse)
def create_test(config: schemas.TestConfigCreate, db: Session = Depends(get_db)):
    db_config = models.TestConfig(**config.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config


@app.get("/api/runs", response_model=List[schemas.TestRunResponse])
def get_runs(db: Session = Depends(get_db)):
    return db.query(models.TestRun).order_by(models.TestRun.started_at.desc()).all()


@app.post("/api/tests/{config_id}/run", response_model=schemas.TestRunResponse)
def run_test(config_id: int, db: Session = Depends(get_db)):
    config = db.query(models.TestConfig).filter(models.TestConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Test config not found")
    
    # Check if there is already a running test. If so, stop it.
    running_runs = db.query(models.TestRun).filter(models.TestRun.status == "Running").all()
    for rr in running_runs:
        rr.status = "Stopped"
        rr.completed_at = datetime.utcnow()
    
    # Get latest run number
    max_run = db.query(models.TestRun).order_by(models.TestRun.run_number.desc()).first()
    next_run_number = (max_run.run_number + 1) if max_run else 4001

    new_run = models.TestRun(
        test_config_id=config.id,
        run_number=next_run_number,
        status="Running",
        started_at=datetime.utcnow()
    )
    db.add(new_run)
    db.commit()
    db.refresh(new_run)
    return new_run


@app.post("/api/runs/{run_id}/stop", response_model=schemas.TestRunResponse)
def stop_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    run.status = "Stopped"
    run.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(run)
    return run


@app.get("/api/runs/{run_id}", response_model=schemas.TestRunResponse)
def get_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Calculate some generic summary stats
    total_runs = db.query(models.TestRun).count()
    completed_runs = db.query(models.TestRun).filter(models.TestRun.status == "Completed").count()
    active_run = db.query(models.TestRun).filter(models.TestRun.status == "Running").first()

    # Get recent runs
    recent_runs = db.query(models.TestRun).order_by(models.TestRun.started_at.desc()).limit(5).all()
    recent_runs_data = []
    for r in recent_runs:
        config = db.query(models.TestConfig).filter(models.TestConfig.id == r.test_config_id).first()
        recent_runs_data.append({
            "id": r.id,
            "run_number": r.run_number,
            "name": config.name if config else "Custom Test",
            "profile": config.profile if config else "Load Test",
            "status": r.status,
            "started_at": r.started_at,
            "health_score": r.health_score,
            "perf_score": r.perf_score
        })

    return {
        "total_runs": total_runs,
        "completed_runs": completed_runs,
        "active_run_id": active_run.id if active_run else None,
        "active_run_name": active_run.config.name if active_run and active_run.config else None,
        "recent_runs": recent_runs_data
    }


# SSE Stream for Live Metrics
async def live_metric_generator(run_id: int):
    # Retrieve the run details
    db = next(get_db())
    run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
    if not run:
        db.close()
        yield f"data: {json.dumps({'error': 'Run not found'})}\n\n"
        return
    
    config = db.query(models.TestConfig).filter(models.TestConfig.id == run.test_config_id).first()
    duration_secs = (config.duration if config else 15) * 60
    target_vus = config.target_vus if config else 1000
    ramp_up = config.ramp_up if config else 60
    
    db.close()

    elapsed = 0
    while True:
        # Check running state from DB again
        db = next(get_db())
        current_run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
        if not current_run or current_run.status != "Running":
            db.close()
            yield f"data: {json.dumps({'status': 'finished'})}\n\n"
            break
        
        # Calculate mock performance metrics
        # VU count based on ramp-up
        if elapsed < ramp_up:
            current_vus = int((elapsed / ramp_up) * target_vus)
        else:
            current_vus = target_vus

        # Fluctuate metrics realistically
        # Response time trends upward with VUs
        base_rt = 100 + (current_vus / target_vus) * 40
        p50 = int(base_rt + random.randint(-5, 5))
        p95 = int(base_rt * 1.25 + random.randint(-10, 15))
        p99 = int(base_rt * 2.2 + (elapsed * 0.1) + random.randint(-30, 40))
        
        # CPU & memory
        cpu = min(98.5, 20.0 + (current_vus / target_vus) * 60 + random.uniform(-2.5, 2.5))
        memory = min(99.0, 30.0 + (elapsed / duration_secs) * 20 + random.uniform(-0.5, 0.5))
        
        # RPS increases with VUs
        rps = int((current_vus * 1.2) + random.randint(-20, 20))
        
        # Errors (higher stress causes more error spikes)
        if elapsed > ramp_up and random.random() < 0.15:
            errors = random.randint(1, 12)
        else:
            errors = 0

        metric_data = {
            "elapsed": elapsed,
            "status": "Running",
            "vus": current_vus,
            "target_vus": target_vus,
            "rps": rps,
            "p50": p50,
            "p95": p95,
            "p99": p99,
            "cpu": round(cpu, 1),
            "memory": round(memory, 1),
            "errors": errors
        }

        # Write to database (optional, for history)
        new_point = models.MetricPoint(
            test_run_id=run_id,
            timestamp=elapsed,
            rps=rps,
            p50=p50,
            p95=p95,
            p99=p99,
            cpu=round(cpu, 1),
            memory=round(memory, 1),
            errors=errors
        )
        db.add(new_point)
        db.commit()
        db.close()

        yield f"data: {json.dumps(metric_data)}\n\n"
        
        elapsed += 2
        await asyncio.sleep(2.0)


@app.get("/api/runs/{run_id}/stream")
def stream_run_metrics(run_id: int):
    return StreamingResponse(live_metric_generator(run_id), media_type="text/event-stream")
