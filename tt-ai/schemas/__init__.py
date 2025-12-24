from pydantic import BaseModel


class GECInput(BaseModel):
    text: str


class GECOutput(BaseModel):
    corrected_text: str