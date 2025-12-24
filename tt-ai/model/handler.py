from transformers import Mistral3ForConditionalGeneration, MistralCommonBackend, pipeline

MODEL_ID = "Horbee/Ministral-3-3B-GEC-german"
tokenizer = MistralCommonBackend.from_pretrained(MODEL_ID)
model = Mistral3ForConditionalGeneration.from_pretrained(MODEL_ID)
INSTRUCTION = "Korrigiere die Grammatik im folgenden Satz auf Standarddeutsch. Gib **nur** den korrigierten Satz zurück, ohne Anmerkungen."

# Create a text-generation pipeline
pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=4096,
    temperature=0.1,
)

# Wrap in LangChain

def ministral_model_pipeline(sentence: str) -> str:
    prompt_str = f"<s>[INST] {INSTRUCTION}\n\n{sentence} [/INST] "
    
    full_output = pipe(prompt_str)[0]['generated_text']

    if "[/INST]" in full_output:
        clean_correction = full_output.split("[/INST]")[-1].strip()
    else:
        # Fallback if the model hallucinated the tag away (rare)
        clean_correction = full_output

    # result = result.strip().replace("[/INST]", "")

    return clean_correction



