# WHAT THIS FILE DOES:
# Defines the /api/review POST endpoint
# Validates the request body
# Calls gemini_service and returns the result

from flask import Blueprint, request, jsonify
from services.gemini_service import review_code

# Blueprint = a mini Flask app we register on the main app
review_bp = Blueprint("review", __name__)


@review_bp.route("/api/review", methods=["POST"])
def review():
    data = request.get_json()

    # Validate input
    if not data:
        return jsonify({"error": "No data sent"}), 400

    code = data.get("code", "").strip()
    language = data.get("language", "python").strip()

    if not code:
        return jsonify({"error": "No code provided"}), 400

    if len(code) > 10000:
        return jsonify({"error": "Code too long (max 10,000 characters)"}), 400

    # Call Gemini
    result = review_code(code, language)

    if result["success"]:
        return jsonify(result["data"]), 200
    else:
        return jsonify({"error": result["error"]}), 500