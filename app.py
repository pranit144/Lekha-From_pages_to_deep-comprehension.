from flask import Flask, render_template, request, jsonify, session
import os, re, json, time, uuid
import anthropic

app = Flask(__name__)
app.secret_key = os.urandom(24)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Server-side storage for reading sessions
READING_SESSIONS = {}

@app.before_request
def cleanup_old_sessions():
    """Remove sessions older than 1 hour"""
    current_time = time.time()
    expired = [sid for sid, data in READING_SESSIONS.items() 
               if current_time - data.get('start_time', current_time) > 3600]
    for sid in expired:
        del READING_SESSIONS[sid]

def split_sentences(text, page_map=None):
    text = re.sub(r'\s+', ' ', text).strip()
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 8]
    
    # If page_map provided, map each sentence to its page
    sentence_pages = []
    if page_map:
        char_pos = 0
        for sent in sentences:
            sent_start = text.find(sent, char_pos)
            sent_end = sent_start + len(sent)
            page = 0
            for i, (page_num, char_end) in enumerate(page_map):
                if sent_start < char_end:
                    page = page_num
                    break
            sentence_pages.append(page)
            char_pos = sent_end
        return sentences, sentence_pages
    
    return sentences, None

def extract_text_from_file(filepath, filename):
    ext = filename.lower().rsplit('.', 1)[-1]
    if ext == 'txt':
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read(), None
    elif ext == 'pdf':
        try:
            import fitz
            doc = fitz.open(filepath)
            text_parts = []
            page_map = []  # (page_num, char_position_end)
            char_count = 0
            
            for page_num, page in enumerate(doc):
                page_text = page.get_text()
                text_parts.append(page_text)
                char_count += len(page_text)
                page_map.append((page_num, char_count))
            
            full_text = " ".join(text_parts)
            return full_text, page_map
        except ImportError:
            return None, None
    return None, None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    page_map = None
    if 'file' in request.files and request.files['file'].filename:
        f = request.files['file']
        filename = f.filename
        filepath = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{filename}")
        f.save(filepath)
        text, page_map = extract_text_from_file(filepath, filename)
        os.remove(filepath)
        if text is None:
            return jsonify({"error": "Could not read file. Install PyMuPDF for PDF support."}), 400
    elif request.form.get('text'):
        text = request.form['text']
    else:
        return jsonify({"error": "No content provided"}), 400

    sentences, sentence_pages = split_sentences(text, page_map)
    if not sentences:
        return jsonify({"error": "Could not extract sentences"}), 400

    # Generate session ID and store data server-side
    session_id = str(uuid.uuid4())
    READING_SESSIONS[session_id] = {
        'sentences': sentences,
        'sentence_pages': sentence_pages,
        'current': 0,
        'start_time': time.time(),
        'is_pdf': page_map is not None,
        'total_pages': len(page_map) if page_map else 0
    }
    
    response = {"sentences": sentences, "total": len(sentences), "session_id": session_id}
    if sentence_pages:
        response["sentence_pages"] = sentence_pages
        if page_map:
            response["is_pdf"] = True
            response["total_pages"] = len(page_map)
    
    # Store minimal info in session cookie
    session['session_id'] = session_id
    
    return jsonify(response)

@app.route('/explain', methods=['POST'])
def explain():
    data = request.json
    text = data.get('text', '')
    mode = data.get('mode', 'sentence')

    if mode == 'sentence':
        prompt = f'Explain this sentence simply and clearly in 2-3 lines:\n\n"{text}"'
    else:
        prompt = f'Summarize and explain the key ideas from this passage in 3-4 lines:\n\n"{text}"'

    def generate():
        with client.messages.stream(
            model="claude-opus-4-5",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        ) as stream:
            for text_chunk in stream.text_stream:
                yield f"data: {json.dumps({'chunk': text_chunk})}\n\n"
        yield "data: [DONE]\n\n"

    from flask import Response
    return Response(generate(), mimetype='text/event-stream',
                    headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})

@app.route('/recall', methods=['POST'])
def recall():
    data = request.json
    question = data.get('question', '')
    answer = data.get('answer', '')
    context = data.get('context', '')

    prompt = f"""Context the user just read:
"{context}"

Question asked: "{question}"
User's answer: "{answer}"

Give brief, warm, encouraging feedback (2-3 lines). Tell them what they got right and gently correct any gaps. Be a supportive tutor."""

    def generate():
        with client.messages.stream(
            model="claude-opus-4-5",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        ) as stream:
            for text_chunk in stream.text_stream:
                yield f"data: {json.dumps({'chunk': text_chunk})}\n\n"
        yield "data: [DONE]\n\n"

    from flask import Response
    return Response(generate(), mimetype='text/event-stream',
                    headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})

@app.route('/save_progress', methods=['POST'])
def save_progress():
    data = request.json
    progress_file = 'reading_progress.json'
    try:
        with open(progress_file, 'r') as f:
            all_progress = json.load(f)
    except:
        all_progress = {}

    book_id = data.get('book_id', 'default')
    all_progress[book_id] = {
        'current': data.get('current', 0),
        'total': data.get('total', 0),
        'timestamp': time.time(),
        'title': data.get('title', 'Untitled')
    }
    with open(progress_file, 'w') as f:
        json.dump(all_progress, f)
    return jsonify({"status": "saved"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
