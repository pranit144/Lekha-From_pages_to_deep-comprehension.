# 📖 Lekha — AI-Powered Reading Assistant

> *Transform how you read. One sentence at a time.*

A sophisticated, AI-enhanced reading platform that combines text-to-speech, intelligent explanations, and active recall testing. Perfect for deep learning, comprehension building, and focused reading sessions.

**Built with:** Python • Flask • Anthropic Claude API • Web Speech API

---

## ✨ Why Lekha?

- 🎯 **Active Recall Testing** — Automatically generates comprehension questions to reinforce learning
- 🤖 **AI Explanations** — Claude instantly explains complex sentences and concepts
- 📊 **Smart Summaries** — Auto-triggered passage summaries every 5 sentences
- 🔊 **Natural Speech** — Sentence-by-sentence playback with speed control (0.5×–2×)
- ⏱️ **Pomodoro Timer** — Built-in focus techniques with visual feedback
- 🎨 **Dark Theme** — Editorial design optimized for sustained reading
- ⌨️ **Keyboard-Driven** — Power-user shortcuts for seamless workflow

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- An [Anthropic API Key](https://console.anthropic.com) (free tier available)

### Installation

1. **Clone this repository**
```bash
git clone https://github.com/pranit144/Lekha-From_pages_to_deep-comprehension.git
cd Lekha-From_pages_to_deep-comprehension
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```
> **Note:** PyMuPDF is optional — include it for PDF support. TXT files work without it.

3. **Set your Anthropic API key**

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-..."
```

**Windows (CMD):**
```cmd
set ANTHROPIC_API_KEY=sk-ant-...
```

**macOS / Linux:**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

4. **Start the application**
```bash
python app.py
```

5. **Open in your browser**
```
http://localhost:5000
```

---

## 📋 Core Features

| Feature | Description | Benefits |
|---------|-------------|----------|
| 📤 **Multi-format Upload** | PDF, TXT, or paste directly | Flexible content sources |
| 🔊 **Sentence Playback** | Browser TTS with speed control | Natural reading pace |
| 🤖 **AI Explanations** | Claude explains complex sentences | Deeper comprehension |
| 📝 **Auto-Summaries** | Every 5 sentences | Better retention |
| ❓ **Active Recall Quiz** | AI-generated comprehension Q&A | Evidence-based learning |
| 🎯 **Focus Mode** | Fullscreen, distraction-free UI | Sustained concentration |
| ⏱️ **Pomodoro Timer** | 25/5 min cycles with ring animation | Optimized productivity |
| 📊 **Progress Tracking** | Sentences read, time, % complete | Performance insights |
| ⌨️ **Keyboard Shortcuts** | Navigate & control entirely via keyboard | Power-user efficiency |

---

## ⌨️ Keyboard Shortcuts

Navigate and control everything without touching the mouse.

| Shortcut | Action |
|----------|--------|
| `Space` | Play / Pause reading |
| `→` | Next sentence |
| `←` | Previous sentence |
| `R` | Repeat current sentence |
| `E` | Show AI explanation |
| `F` | Toggle Focus Mode |
| `Esc` | Exit Focus Mode |

---

## 📁 Project Structure

```
Lekha-From_pages_to_deep-comprehension/
├── app.py                      # Flask backend & API routes
├── requirements.txt            # Python dependencies
├── README.md                   # This file
├── templates/
│   └── index.html             # Main HTML interface
├── static/
│   ├── css/
│   │   └── style.css          # Dark editorial styling
│   └── js/
│       └── reader.js          # Frontend logic & interactions
└── uploads/                   # Temporary file storage
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Python 3 + Flask | HTTP server & API |
| **AI** | Anthropic Claude API | Text explanations & summaries |
| **PDF Parsing** | PyMuPDF (fitz) | Extract text from PDFs |
| **TTS** | Web Speech API | Browser-native text-to-speech |
| **Frontend** | HTML5 + CSS3 + JavaScript (Vanilla) | Lightweight, no frameworks |

---

## 🔧 Configuration

### Environment Variables

```bash
ANTHROPIC_API_KEY        # Your Anthropic API key (required)
FLASK_ENV                # Set to 'development' for debug mode
FLASK_DEBUG              # Set to '1' to enable live reload
```

### Customization

Edit `static/css/style.css` to:
- Change the dark theme to light mode
- Adjust text size and font families
- Modify color scheme

Edit `reader.js` to:
- Adjust Pomodoro timer durations (default: 25/5 min)
- Change summary frequency (default: every 5 sentences)
- Modify keyboard shortcuts

---

## 🐛 Troubleshooting

### "API Key Not Found"
- Ensure you've set `ANTHROPIC_API_KEY` in your environment
- Verify the API key is valid from [console.anthropic.com](https://console.anthropic.com)
- Restart the Flask server after setting the environment variable

### PDF Upload Fails
- Install PyMuPDF: `pip install PyMuPDF`
- Ensure the PDF isn't password-protected or corrupted
- Try a smaller PDF to test

### Text-to-Speech Not Working
- Check if your browser supports Web Speech API (Chrome, Edge, Safari)
- Some systems require audio permissions — check browser settings
- Test with a different browser

### Slow AI Responses
- Claude API may have higher latency during peak hours
- Check your internet connection
- Verify API key has sufficient quota

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add feature: xyz"`
6. Push to your branch: `git push origin feature/your-feature`
7. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

## 👤 Author

**Pranit** — Created as a passion project to make reading smarter and more productive.

---

## 🙏 Acknowledgments

- [Anthropic Claude](https://anthropic.com) for powerful AI explanations
- [Flask](https://flask.palletsprojects.com) for the lightweight backend
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for native TTS

---

## 📞 Support & Feedback

Have questions or suggestions? Open an [GitHub Issue](https://github.com/pranit144/Lekha-From_pages_to_deep-comprehension/issues) or reach out!

**Happy reading! 📚**
- **Frontend**: Vanilla HTML + CSS + JavaScript
- **Font**: Playfair Display + JetBrains Mono + Inter

---

## Extending

**Add ElevenLabs TTS**: Replace the browser SpeechSynthesis in `reader.js` with a fetch to `/tts` endpoint using the ElevenLabs API.

**Add Supabase progress sync**: Call `/save_progress` endpoint on each sentence advance and store in Supabase.

**Add EPUB support**: `pip install ebooklib` and add an EPUB parser in `app.py`.
