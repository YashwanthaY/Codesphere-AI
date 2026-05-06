import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"


def call_groq(prompt: str) -> str:
    """Call Groq REST API directly — no SDK needed."""
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 2048,
    }
    response = requests.post(GROQ_URL, headers=headers, json=body, timeout=30)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()


def clean_json(text: str) -> dict:
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


def review_code(code: str, language: str) -> dict:
    prompt = f"""You are a senior software engineer doing a professional code review.
Review the following {language} code carefully.

CODE TO REVIEW:
```{language}
{code}
```

Respond ONLY with a valid JSON object (no markdown, no extra text):
{{
  "score": <integer 1-10>,
  "summary": "<one sentence overall assessment>",
  "bugs": [
    {{"line": "<line number or general>", "issue": "<description>", "severity": "<high|medium|low>"}}
  ],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "positives": ["<what the code does well>"],
  "improved_code": "<the full improved version of the code as a string>"
}}"""
    try:
        text = call_groq(prompt)
        result = clean_json(text)
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_interview_question(topic: str, difficulty: str) -> dict:
    prompt = f"""Generate a {difficulty} level technical interview question about {topic}.
Respond ONLY with valid JSON:
{{
  "question": "<the interview question>",
  "topic": "{topic}",
  "difficulty": "{difficulty}",
  "hint": "<a subtle hint without giving away the answer>",
  "sample_answer": "<a complete model answer>"
}}"""
    try:
        text = call_groq(prompt)
        result = clean_json(text)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


def evaluate_answer(question: str, answer: str, topic: str) -> dict:
    prompt = f"""You are a technical interviewer evaluating a candidate's answer.

Question: {question}
Topic: {topic}
Candidate's Answer: {answer}

Respond ONLY with valid JSON:
{{
  "score": <integer 1-10>,
  "feedback": "<detailed feedback on the answer>",
  "what_was_good": "<what they got right>",
  "what_was_missing": "<key points they missed>",
  "model_answer": "<a complete ideal answer>"
}}"""
    try:
        text = call_groq(prompt)
        result = clean_json(text)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
def execute_code(code: str, language: str, stdin: str = "") -> dict:
    stdin_section = f"\nStandard Input (stdin):\n{stdin}" if stdin else ""
    prompt = f"""You are a code interpreter. Execute the following {language} code mentally and return ONLY the output.

CODE:
````{language}
{code}
```{stdin_section}

Rules:
- Return ONLY valid JSON, no markdown, no explanation
- Simulate the execution exactly as a real interpreter would
- If there are print statements, include their output in stdout
- If there are errors, include them in stderr
- exitCode should be 0 for success, 1 for errors

Respond in this exact JSON format:
{{
  "stdout": "<exact output the code would print>",
  "stderr": "<any error messages, empty string if none>",
  "exitCode": <0 for success, 1 for error>
}}"""
    try:
        text = call_groq(prompt)
        result = clean_json(text)
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse response: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": str(e)}
    

def chat_response(message: str) -> dict:
    prompt = f"""You are an expert DSA tutor and coding interview coach.
Answer the student's question clearly and concisely.
Focus on DSA, algorithms, time/space complexity, and coding interviews.
Use examples when helpful. Be friendly and encouraging.

Student's question: {message}

Answer:"""
    try:
        text = call_groq(prompt)
        return {"success": True, "reply": text}
    except Exception as e:
        return {"success": False, "error": str(e)}
    
    
def explain_code(code: str, language: str) -> dict:
    prompt = f"""You are a coding teacher explaining code to a beginner student.
Explain the following {language} code clearly and simply.

CODE:
```{language}
{code}
```

Rules:
- Explain what the OVERALL code does in 1-2 sentences first
- Then explain each important line or block
- Use simple English, no jargon
- Format like:
  OVERVIEW: ...
  
  LINE BY LINE:
  Line 1-3: ...
  Line 4: ...
  etc.
- Point out any patterns or algorithms used
- Mention time/space complexity if relevant"""
    try:
        text = call_groq(prompt)
        return {{"success": True, "explanation": text}}
    except Exception as e:
        return {{"success": False, "error": str(e)}}
    