# WHAT THIS FILE DOES:
# Endpoints for the Interview Coach module (Module 7)
# /api/interview/question — generates a question
# /api/interview/evaluate — scores the user's answer

from flask import Blueprint, request, jsonify
from services.gemini_service import generate_interview_question, evaluate_answer

interview_bp = Blueprint("interview", __name__)


@interview_bp.route("/api/interview/question", methods=["POST"])
def get_question():
    data = request.get_json()
    topic      = data.get("topic", "JavaScript")
    difficulty = data.get("difficulty", "Medium")

    result = generate_interview_question(topic, difficulty)

    if result["success"]:
        return jsonify(result["data"]), 200
    else:
        return jsonify({"error": result["error"]}), 500


@interview_bp.route("/api/interview/evaluate", methods=["POST"])
def evaluate():
    data = request.get_json()
    question = data.get("question", "")
    answer   = data.get("answer", "")
    topic    = data.get("topic", "General")

    if not answer.strip():
        return jsonify({"error": "No answer provided"}), 400

    result = evaluate_answer(question, answer, topic)

    if result["success"]:
        return jsonify(result["data"]), 200
    else:
        return jsonify({"error": result["error"]}), 500