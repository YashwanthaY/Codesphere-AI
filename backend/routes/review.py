from flask import Blueprint, request, jsonify
from services.gemini_service import review_code

review_bp = Blueprint("review", __name__)

@review_bp.route("/api/review", methods=["POST"])
def review():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data sent"}), 400

    code = data.get("code", "").strip()
    language = data.get("language", "python").strip()

    if not code:
        return jsonify({"error": "No code provided"}), 400

    if len(code) > 10000:
        return jsonify({"error": "Code too long (max 10,000 characters)"}), 400

    result = review_code(code, language)

    if result["success"]:
        return jsonify(result["data"]), 200
    else:
        return jsonify({"error": result["error"]}), 500
    
@review_bp.route("/api/execute", methods=["POST"])
def execute():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent"}), 400

    code     = data.get("code", "").strip()
    language = data.get("language", "python").strip()
    stdin    = data.get("stdin", "").strip()

    if not code:
        return jsonify({"error": "No code provided"}), 400

    from services.gemini_service import execute_code
    result = execute_code(code, language, stdin)

    if result["success"]:
        return jsonify(result["data"]), 200
    else:
        return jsonify({"error": result["error"]}), 500
    
    
@review_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent"}), 400
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"error": "No message provided"}), 400
    from services.gemini_service import chat_response
    result = chat_response(message)
    if result["success"]:
        return jsonify({"reply": result["reply"]}), 200
    else:
        return jsonify({"error": result["error"]}), 500
    
@review_bp.route("/api/explain", methods=["POST"])
def explain():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent"}), 400
    code     = data.get("code", "").strip()
    language = data.get("language", "python").strip()
    if not code:
        return jsonify({"error": "No code provided"}), 400
    from services.gemini_service import explain_code
    result = explain_code(code, language)
    if result["success"]:
        return jsonify({"explanation": result["explanation"]}), 200
    else:
        return jsonify({"error": result["error"]}), 500