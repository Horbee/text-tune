from pydantic import BaseModel


class GECInput(BaseModel):
    text: str


class GECOutput(BaseModel):
    corrected_sentence: str
    original_sentence: str