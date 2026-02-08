import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Question Endpoints - ILHRF API Docs',
};

export default function QuestionDocs() {
    return (
        <div className="prose max-w-none">
            <h1>Question Management</h1>

            <h2>Get Questions (GET /api/question/get-questions?languageCode=hin_Deva)</h2>
            <p>Fetches unanswered questions for the user. Requires JWT/API key.</p>

            <pre><code>{`const token = localStorage.getItem('token');
const response = await fetch('/api/question/get-questions?languageCode=hin_Deva', {
  headers: { Authorization: \`Bearer \${token}\` }
});`}</code></pre>

            <h3>Success (200)</h3>
            <pre><code>{`{
  "success": true,
  "data": [
    { "id": "q123", "text": "What is your name?", "languageCode": "hin_Deva" }
  ]
}`}</code></pre>

            <h3>Error (404 - No Questions)</h3>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": ["No questions available"],
    "error": "Not Found",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/question/get-questions",
    "method": "GET"
  }
}`}</code></pre>

            <h2>Submit Answer (POST /api/question/submit-answer)</h2>
            <p>Submit answer for a question. Body: {'{'} questionId, answerText {'}'}.</p>

            <pre><code>{`const token = localStorage.getItem('token');
const response = await fetch('/api/question/submit-answer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${token}\`
  },
  body: JSON.stringify({ questionId: 'q123', answerText: 'My name is Alvyn' })
});`}</code></pre>

            <h3>Success (201)</h3>
            <pre><code>{`{
  "success": true,
  "data": { "answerId": "a456", "message": "Answer submitted" }
}`}</code></pre>

            <h3>Error (400 - Invalid Answer)</h3>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": ["Answer too short (min 1 word)"],
    "error": "Bad Request",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/question/submit-answer",
    "method": "POST"
  }
}`}</code></pre>

            <h2>Submit Question (POST /api/question/submit-question)</h2>
            <p>Users submit new questions. Body: {'{'} text, languageCode {'}'}.</p>

            <pre><code>{`const token = localStorage.getItem('token');
const response = await fetch('/api/question/submit-question', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${token}\`
  },
  body: JSON.stringify({ text: 'What is this?', languageCode: 'eng_Latn' })
});`}</code></pre>

            <h3>Success (201)</h3>
            <pre><code>{`{
  "success": true,
  "data": { "questionId": "q789", "message": "Question submitted for review" }
}`}</code></pre>

            <h3>Error (413 - Too Long)</h3>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 413,
    "message": ["Question text too long (max 500 chars)"],
    "error": "Payload Too Large",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/question/submit-question",
    "method": "POST"
  }
}`}</code></pre>
        </div>
    );
}
