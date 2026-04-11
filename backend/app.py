from flask import Flask
from flask_cors import CORS
from routes.review import review_bp
from routes.interview import interview_bp

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:3000",
        ]
    }
})

app.register_blueprint(review_bp)
app.register_blueprint(interview_bp)

@app.route("/api/health")
def health():
    return {"status": "ok", "message": "CodeSphere AI backend is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)