/* ── State ──────────────────────────────────────── */
let sentences = [];
let sentencePages = [];
let current = 0;
let playing = false;
let autoAdvance = false;
let speechRate = 1.0;
let speechSynth = window.speechSynthesis;
let currentUtterance = null;
let focusMode = false;
let sessionSeconds = 0;
let sessionInterval = null;
let sentencesRead = 0;
let availableVoices = [];
let selectedVoiceIndex = 0;

// PDF Variables
let pdfDoc = null;
let currentPdfPage = 1;
let isPdfMode = false;
let pdfFile = null;

// Pomodoro
let pomoTotal = 25 * 60;
let pomoRemaining = pomoTotal;
let pomoRunning = false;
let pomoBreak = false;
let pomoCount = 0;
let pomoInterval = null;

// Load available voices when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadAvailableVoices, 100);
  window.speechSynthesis.onvoiceschanged = loadAvailableVoices;
});

function loadAvailableVoices() {
  availableVoices = speechSynth.getVoices();
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect || voiceSelect.children.length > 1) return;
  
  availableVoices.forEach((voice, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = voice.name + (voice.default ? ' (Default)' : '');
    voiceSelect.appendChild(option);
  });
}

const RECALL_QUESTIONS = [
  "What was the main idea of what you just read?",
  "Summarize the last few sentences in your own words.",
  "What concept or term was introduced? Can you explain it?",
  "How does this passage connect to what you already know?",
  "What question does this passage raise in your mind?",
  "What was the author trying to convey here?",
  "Can you give a real-world example of what was described?"
];

/* ── Upload & Load ──────────────────────────────── */
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('click', () => document.getElementById('fileInput').click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragging');
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
});
document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files[0]) uploadFile(e.target.files[0]);
});

function startReading() {
  const pasted = document.getElementById('pasteText').value.trim();
  if (pasted) {
    submitText(null, pasted);
  } else if (document.getElementById('fileInput').files[0]) {
    uploadFile(document.getElementById('fileInput').files[0]);
  } else {
    alert('Please upload a file or paste some text first.');
  }
}

function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const title = document.getElementById('bookTitle').value || file.name.replace(/\.[^.]+$/, '');
  formData.append('title', title);
  
  // Store PDF file for rendering if it's a PDF
  if (file.type === 'application/pdf') {
    pdfFile = file;
  }
  
  fetchAndLoad(formData, title);
}

function submitText(e, text) {
  const formData = new FormData();
  formData.append('text', text);
  const title = document.getElementById('bookTitle').value || 'Untitled';
  formData.append('title', title);
  fetchAndLoad(formData, title);
}

async function fetchAndLoad(formData, title) {
  const btn = document.getElementById('startBtn');
  btn.textContent = 'Loading...';
  btn.disabled = true;

  try {
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) { alert(data.error); btn.textContent = 'Begin Reading'; btn.disabled = false; return; }
    
    // Store data in page memory instead of server
    sentencePages = data.sentence_pages || [];
    isPdfMode = data.is_pdf || false;
    
    initReader(data.sentences, title, data.total_pages || 0);
  } catch (err) {
    console.error(err);
    alert('Failed to load. Make sure the server is running.');
    btn.innerHTML = '<span>Begin Reading</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btn.disabled = false;
  }
}

/* ── Reader Init ────────────────────────────────── */
function initReader(sents, title, totalPages) {
  sentences = sents;
  current = 0;
  sentencesRead = 0;
  sessionSeconds = 0;

  document.getElementById('upload-screen').classList.remove('active');
  document.getElementById('reader-screen').classList.add('active');
  document.getElementById('bookTitleDisplay').textContent = title;

  // Setup PDF viewer if needed
  if (isPdfMode && pdfFile) {
    setupPdfMode(totalPages);
  } else {
    setupSentenceMode();
  }

  buildSentenceList();
  updateDisplay();

  sessionInterval = setInterval(() => {
    sessionSeconds++;
    const m = Math.floor(sessionSeconds / 60);
    const s = sessionSeconds % 60;
    document.getElementById('statTime').textContent = m + ':' + String(s).padStart(2, '0');
  }, 1000);
}

function setupPdfMode(totalPages) {
  // Show PDF panel, hide sentence panel
  document.getElementById('pdfPanel').style.display = 'flex';
  document.getElementById('sentencePanel').style.display = 'none';
  
  // Load PDF
  pdfjsLib.getDocument(URL.createObjectURL(pdfFile)).promise.then(doc => {
    pdfDoc = doc;
    document.getElementById('pdfTotalPages').textContent = totalPages;
    currentPdfPage = 1;
    renderPdfPage(currentPdfPage);
    generatePdfThumbnails();
  });
}

function setupSentenceMode() {
  // Show sentence panel, hide PDF panel
  document.getElementById('pdfPanel').style.display = 'none';
  document.getElementById('sentencePanel').style.display = 'flex';
}

function renderPdfPage(pageNum) {
  if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) return;
  
  currentPdfPage = pageNum;
  document.getElementById('pdfCurrentPage').textContent = pageNum;
  
  pdfDoc.getPage(pageNum).then(page => {
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    page.render({ canvasContext: ctx, viewport: viewport });
  });
}

function generatePdfThumbnails() {
  const container = document.getElementById('pdfThumbnails');
  container.innerHTML = '';
  
  // Generate thumbnails for up to 10 pages
  const thumbCount = Math.min(10, pdfDoc.numPages);
  for (let i = 1; i <= thumbCount; i++) {
    pdfDoc.getPage(i).then(page => {
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.className = 'pdf-thumbnail';
      if (i === currentPdfPage) canvas.classList.add('active');
      canvas.onclick = () => {
        jumpToPage(i);
      };
      
      page.render({ canvasContext: ctx, viewport: viewport }).promise.then(() => {
        container.appendChild(canvas);
      });
    });
  }
}

function jumpToPage(pageNum) {
  // Find first sentence on this page and jump to it
  const firstSentenceOnPage = sentencePages.findIndex(p => p + 1 === pageNum);
  if (firstSentenceOnPage !== -1) {
    pause();
    current = firstSentenceOnPage;
    updateDisplay();
  } else {
    // If no sentence found on this page, just show the page
    renderPdfPage(pageNum);
    updateThumbnailActive();
  }
}

function updateThumbnailActive() {
  document.querySelectorAll('.pdf-thumbnail').forEach((thumb, idx) => {
    thumb.classList.toggle('active', idx + 1 === currentPdfPage);
  });
}

function nextPdfPage() {
  if (pdfDoc && currentPdfPage < pdfDoc.numPages) {
    jumpToPage(currentPdfPage + 1);
  }
}

function prevPdfPage() {
  if (currentPdfPage > 1) {
    jumpToPage(currentPdfPage - 1);
  }
}

function buildSentenceList() {
  const list = document.getElementById('sentenceList');
  list.innerHTML = '';
  sentences.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'sent-item';
    div.id = `sent-${i}`;
    div.textContent = s.slice(0, 60) + (s.length > 60 ? '…' : '');
    div.title = s;
    div.onclick = () => {
      pause();
      current = i;
      updateDisplay();
      // Jump to the page if in PDF mode
      if (isPdfMode && sentencePages[i]) {
        renderPdfPage(sentencePages[i] + 1); // Pages are 1-indexed
        updateThumbnailActive();
      }
    };
    list.appendChild(div);
  });
}

function updateDisplay() {
  if (!sentences.length) return;
  const s = sentences[current];

  document.getElementById('currentSentence').innerHTML = `<span class="sentence-word-wrap">${s}</span>`;
  document.getElementById('sentenceCounter').textContent =
    `Sentence ${current + 1} of ${sentences.length}`;
  document.getElementById('focusSentence').textContent = s;
  document.getElementById('focusCount').textContent = `${current + 1} / ${sentences.length}`;

  const pct = Math.round(((current + 1) / sentences.length) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = `${current + 1} / ${sentences.length}`;
  document.getElementById('statPct').textContent = pct + '%';
  document.getElementById('statRead').textContent = sentencesRead;

  // Update sidebar
  document.querySelectorAll('.sent-item').forEach((el, i) => {
    el.className = 'sent-item' + (i === current ? ' active' : i < current ? ' done' : '');
  });
  const activeEl = document.getElementById(`sent-${current}`);
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  // Jump to correct PDF page if in PDF mode
  if (isPdfMode && sentencePages[current]) {
    renderPdfPage(sentencePages[current] + 1); // Pages are 1-indexed
    updateThumbnailActive();
  }

  // Auto-trigger AI every 5 sentences
  if (current > 0 && current % 5 === 0) {
    const slice = sentences.slice(Math.max(0, current - 5), current).join(' ');
    fetchExplanation(slice, 'passage');
  }
}

/* ── Speech ─────────────────────────────────────── */
function togglePlay() {
  if (playing) pause();
  else speak(sentences[current]);
}

function speak(text) {
  if (speechSynth.speaking) speechSynth.cancel();
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = speechRate;
  currentUtterance.pitch = 1;
  
  // Set the selected voice
  if (availableVoices.length > selectedVoiceIndex) {
    currentUtterance.voice = availableVoices[selectedVoiceIndex];
  }

  currentUtterance.onstart = () => {
    playing = true;
    setPlayIcon(true);
  };
  currentUtterance.onend = () => {
    playing = false;
    setPlayIcon(false);
    sentencesRead++;
    document.getElementById('statRead').textContent = sentencesRead;

    if (autoAdvance && current < sentences.length - 1) {
      current++;
      updateDisplay();
      setTimeout(() => speak(sentences[current]), 400);
    }
  };
  currentUtterance.onerror = () => { playing = false; setPlayIcon(false); };
  speechSynth.speak(currentUtterance);
}

function pause() {
  if (speechSynth.speaking) speechSynth.cancel();
  playing = false;
  setPlayIcon(false);
}

function setPlayIcon(isPlaying) {
  const icon = document.getElementById('playIcon');
  icon.innerHTML = isPlaying
    ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
    : '<polygon points="5 3 19 12 5 21 5 3"/>';

  const focusBtn = document.getElementById('focusPlayBtn');
  focusBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
}

function nextSentence() {
  pause();
  if (current < sentences.length - 1) { current++; updateDisplay(); }
}

function prevSentence() {
  pause();
  if (current > 0) { current--; updateDisplay(); }
}

function repeatSentence() {
  pause();
  setTimeout(() => speak(sentences[current]), 100);
}

function updateSpeed(val) {
  speechRate = parseFloat(val);
  document.getElementById('speedVal').textContent = speechRate.toFixed(2).replace(/\.?0+$/, '') + '×';
}

function toggleAuto(checkbox) {
  autoAdvance = checkbox.checked;
}

function changeVoice(select) {
  selectedVoiceIndex = parseInt(select.value);
}

/* ── AI Explanation ─────────────────────────────── */
async function explainSentence() {
  fetchExplanation(sentences[current], 'sentence');
}

async function fetchExplanation(text, mode) {
  const panel = document.getElementById('aiPanel');
  const content = document.getElementById('aiContent');
  const title = document.getElementById('aiPanelTitle');
  panel.style.display = 'block';
  title.textContent = mode === 'sentence' ? 'Explanation' : 'Passage Summary';
  content.innerHTML = '<span class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';

  if (focusMode) {
    document.getElementById('focusAi').style.display = 'block';
    document.getElementById('focusAiText').innerHTML = '<span class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
  }

  try {
    const res = await fetch('/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode })
    });

    let accumulated = '';
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    content.innerHTML = '<span class="ai-cursor"></span>';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const chunk = JSON.parse(line.slice(6)).chunk;
            accumulated += chunk;
            content.innerHTML = accumulated + '<span class="ai-cursor"></span>';
            if (focusMode) document.getElementById('focusAiText').innerHTML = accumulated + '<span class="ai-cursor"></span>';
          } catch {}
        }
      }
    }
    content.innerHTML = accumulated;
    if (focusMode) document.getElementById('focusAiText').innerHTML = accumulated;
  } catch (e) {
    content.textContent = 'Could not fetch explanation.';
  }
}

function closeAiPanel() {
  document.getElementById('aiPanel').style.display = 'none';
}

/* ── Recall ─────────────────────────────────────── */
function triggerRecall() {
  const q = RECALL_QUESTIONS[Math.floor(Math.random() * RECALL_QUESTIONS.length)];
  document.getElementById('recallQuestion').textContent = q;
  document.getElementById('recallInput').value = '';
  document.getElementById('recallFeedback').style.display = 'none';
  document.getElementById('recallPanel').style.display = 'block';
  document.getElementById('recallInput').focus();
}

function closeRecall() {
  document.getElementById('recallPanel').style.display = 'none';
}

async function submitRecall() {
  const ans = document.getElementById('recallInput').value.trim();
  if (!ans) return;
  const q = document.getElementById('recallQuestion').textContent;
  const ctx = sentences.slice(Math.max(0, current - 5), current + 1).join(' ');

  document.getElementById('recallFeedback').style.display = 'block';
  document.getElementById('recallFeedbackText').innerHTML =
    '<span class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';

  try {
    const res = await fetch('/recall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, answer: ans, context: ctx })
    });

    let accumulated = '';
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const chunk = JSON.parse(line.slice(6)).chunk;
            accumulated += chunk;
            document.getElementById('recallFeedbackText').innerHTML = accumulated + '<span class="ai-cursor"></span>';
          } catch {}
        }
      }
    }
    document.getElementById('recallFeedbackText').innerHTML = accumulated;
  } catch (e) {
    document.getElementById('recallFeedbackText').textContent = 'Could not get feedback.';
  }
}

/* ── Focus Mode ─────────────────────────────────── */
function toggleFocusMode() {
  focusMode = !focusMode;
  document.getElementById('focusOverlay').classList.toggle('active', focusMode);
}

/* ── Pomodoro ───────────────────────────────────── */
function togglePomodoro() {
  if (pomoRunning) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    document.getElementById('pomoBtn').textContent = 'Start';
  } else {
    pomoRunning = true;
    document.getElementById('pomoBtn').textContent = 'Stop';
    pomoInterval = setInterval(tickPomo, 1000);
  }
}

function tickPomo() {
  pomoRemaining--;
  updatePomoDisplay();
  if (pomoRemaining <= 0) {
    if (!pomoBreak) {
      pomoBreak = true;
      pomoCount++;
      document.getElementById('pomoCount').textContent = pomoCount;
      pomoTotal = 5 * 60;
      pomoRemaining = pomoTotal;
      document.getElementById('pomoLabel').textContent = 'Break';
    } else {
      pomoBreak = false;
      pomoTotal = 25 * 60;
      pomoRemaining = pomoTotal;
      document.getElementById('pomoLabel').textContent = 'Focus';
    }
  }
}

function updatePomoDisplay() {
  const m = Math.floor(pomoRemaining / 60);
  const s = pomoRemaining % 60;
  document.getElementById('pomoTimer').textContent = m + ':' + String(s).padStart(2, '0');
  // Ring: circumference = 2πr = 2 * π * 34 ≈ 213.6
  const pct = pomoRemaining / pomoTotal;
  const offset = 213.6 * (1 - pct);
  document.getElementById('pomoRing').style.strokeDashoffset = offset;
}

/* ── Reset ──────────────────────────────────────── */
function resetToUpload() {
  pause();
  clearInterval(sessionInterval);
  clearInterval(pomoInterval);
  sentences = [];
  current = 0;
  focusMode = false;
  pomoRunning = false;
  document.getElementById('focusOverlay').classList.remove('active');
  document.getElementById('reader-screen').classList.remove('active');
  document.getElementById('upload-screen').classList.add('active');
  document.getElementById('aiPanel').style.display = 'none';
  document.getElementById('recallPanel').style.display = 'none';
  document.getElementById('pasteText').value = '';
  document.getElementById('fileInput').value = '';
  const btn = document.getElementById('startBtn');
  btn.innerHTML = '<span>Begin Reading</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  btn.disabled = false;
}

/* ── Keyboard Shortcuts ─────────────────────────── */
document.addEventListener('keydown', e => {
  if (!sentences.length) return;
  const tag = document.activeElement.tagName;
  if (tag === 'TEXTAREA' || tag === 'INPUT') return;

  switch (e.key) {
    case ' ': e.preventDefault(); togglePlay(); break;
    case 'ArrowRight': nextSentence(); break;
    case 'ArrowLeft': prevSentence(); break;
    case 'r': case 'R': repeatSentence(); break;
    case 'e': case 'E': explainSentence(); break;
    case 'f': case 'F': toggleFocusMode(); break;
    case 'Escape': if (focusMode) toggleFocusMode(); break;
  }
});
