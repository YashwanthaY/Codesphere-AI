import os
import json
import time
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")


def call_gemini_with_retry(prompt: str, retries: int = 3, wait: int = 15) -> str:
    """Call Gemini API with automatic retry on 429 rate limit errors."""
    for attempt in range(retries):
        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower():
                if attempt < retries - 1:
                    print(f"[Gemini] Rate limited. Waiting {wait}s before retry {attempt + 2}/{retries}...")
                    time.sleep(wait)
                else:
                    raise Exception(
                        "Gemini API rate limit reached. You are on the free tier (15 requests/min). "
                        "Please wait 1 minute and try again."
                    )
            else:
                raise e


def clean_json_response(text: str) -> dict:
    """Strip markdown fences and parse JSON safely."""
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


def review_code(code: str, language: str) -> dict:
    prompt = f"""
You are a senior software engineer doing a professional code review.
Review the following {language} code carefully.

CODE TO REVIEW:
```{language}
{code}
```

Respond ONLY with a valid JSON object (no markdown, no extra text) in this exact format:
{{
  "score": <integer 1-10>,
  "summary": "<one sentence overall assessment>",
  "bugs": [
    {{"line": "<line number or general>", "issue": "<description>", "severity": "<high|medium|low>"}}
  ],
  "suggestions": [
    "<suggestion 1>",
    "<suggestion 2>",
    "<suggestion 3>"
  ],
  "positives": [
    "<what the code does well>"
  ],
  "improved_code": "<the full improved version of the code as a string>"
}}
"""
    try:
        text = call_gemini_with_retry(prompt)
        result = clean_json_response(text)
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_interview_question(topic: str, difficulty: str) -> dict:
    prompt = f"""
Generate a {difficulty} level technical interview question about {topic}.
Respond ONLY with valid JSON in this exact format:
{{
  "question": "<the interview question>",
  "topic": "{topic}",
  "difficulty": "{difficulty}",
  "hint": "<a subtle hint without giving away the answer>",
  "sample_answer": "<a complete model answer>"
}}
"""
    try:
        text = call_gemini_with_retry(prompt)
        result = clean_json_response(text)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


def evaluate_answer(question: str, answer: str, topic: str) -> dict:
    prompt = f"""
You are a technical interviewer evaluating a candidate's answer.

Question: {question}
Topic: {topic}
Candidate's Answer: {answer}

Respond ONLY with valid JSON in this exact format:
{{
  "score": <integer 1-10>,
  "feedback": "<detailed feedback on the answer>",
  "what_was_good": "<what they got right>",
  "what_was_missing": "<key points they missed>",
  "model_answer": "<a complete ideal answer>"
}}
"""
    try:
        text = call_gemini_with_retry(prompt)
        result = clean_json_response(text)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}