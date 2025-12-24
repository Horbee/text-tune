import asyncio
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, HTTPException

from schemas import GECInput, GECOutput
from model.handler import ministral_model_pipeline


executor = ThreadPoolExecutor(max_workers=2)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: model is already loaded at import time
    yield
    # Shutdown: cleanup executor
    executor.shutdown(wait=True)


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Text Tune AI is running!"}


@app.post("/gec")
async def gec(input: GECInput) -> GECOutput:
    try:
        loop = asyncio.get_event_loop()
        correction = await loop.run_in_executor(
            executor, ministral_model_pipeline, input.text
        )
        return GECOutput(corrected_text=correction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")