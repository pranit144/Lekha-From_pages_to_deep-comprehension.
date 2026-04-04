# Lekha — AI Reading Assistant
## Python + Flask + HTML/CSS

A focused, AI-powered reading assistant. Upload any PDF or TXT, read sentence-by-sentence with text-to-speech, get AI explanations, and test your recall.

---

## Setup

### 1. Install dependencies

```bash
pip install flask anthropic PyMuPDF
```

> PyMuPDF is optional — only needed for PDF support. TXT files work without it.

### 2. Set your Anthropic API key

**Windows:**
```cmd
set ANTHROPIC_API_KEY=sk-ant-...
```

**Mac/Linux:**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run the server

```bash
python app.py
```

### 4. Open in browser

```
http://localhost:5000
```

---

## Features

| Feature | Description |
|---|---|
| PDF / TXT upload | Drag & drop or browse |
| Paste text | Works directly in the app |
| Sentence-by-sentence playback | Browser TTS engine |
| Speed control | 0.5× to 2× |
| Auto-advance | Reads continuously |
| AI Explain | Claude explains current sentence |
| Passage summary | Auto-triggered every 5 sentences |
| Active Recall | Random comprehension questions + AI feedback |
| Focus Mode | Distraction-free fullscreen overlay |
| Pomodoro Timer | 25 min focus / 5 min break with ring animation |
| Progress tracking | Sentences read, time, completion % |
| Keyboard shortcuts | Space, ←→, R, E, F, Esc |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `→` | Next sentence |
| `←` | Previous sentence |
| `R` | Repeat current sentence |
| `E` | Explain current sentence |
| `F` | Toggle Focus Mode |
| `Esc` | Exit Focus Mode |

---

## Project Structure

```
ai_reader/
├── app.py               # Flask backend
├── requirements.txt     # Python deps
├── templates/
│   └── index.html       # Main HTML
├── static/
│   ├── css/
│   │   └── style.css    # Dark editorial theme
│   └── js/
│       └── reader.js    # All frontend logic
└── uploads/             # Temporary file storage (auto-cleared)
```

---

## Tech Stack

- **Backend**: Python + Flask
- **AI**: Anthropic Claude API (streaming)
- **PDF parsing**: PyMuPDF (fitz)
- **TTS**: Web Speech API (browser-native, no API cost)
- **Frontend**: Vanilla HTML + CSS + JavaScript
- **Font**: Playfair Display + JetBrains Mono + Inter

---

## Extending

**Add ElevenLabs TTS**: Replace the browser SpeechSynthesis in `reader.js` with a fetch to `/tts` endpoint using the ElevenLabs API.

**Add Supabase progress sync**: Call `/save_progress` endpoint on each sentence advance and store in Supabase.

**Add EPUB support**: `pip install ebooklib` and add an EPUB parser in `app.py`.
