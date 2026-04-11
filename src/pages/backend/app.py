# WHAT THIS FILE DOES:
# Main Flask application entry point
# Registers all route blueprints
# Configures CORS so our React frontend can call these APIs
# Runs on port 5000

from flask import Flask
from flask_cors import CORS
from routes.review import review_bp
from routes.interview import interview_bp

app = Flask(__name__)

# Allow requests from our React dev server (port 5173)
# and from Vercel in production
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*.vercel.app",
        ]
    }
})

# Register route blueprints
app.register_blueprint(review_bp)
app.register_blueprint(interview_bp)


# Health check endpoint — useful for deployment
@app.route("/api/health")
def health():
    return {"status": "ok", "message": "CodeSphere AI backend is running"}


if __name__ == "__main__":
    # debug=True auto-reloads when you save files
    app.run(debug=True, port=5000)
