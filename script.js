function addNote() {
  const colorPicker = document.getElementById('colorPicker');
  const text = prompt("Enter your note:").trim();
  if (!text) {
    alert('Please enter a note!');
    return;
  }

  const color = colorPicker.value;
  const timestamp = new Date().toLocaleString();

  createNote(text, color, timestamp);
  saveNotes();
  updateNotesCount();
}

function createNote(text, color, timestamp) {
  const note = document.createElement('div');
  note.className = 'note';
  note.style.backgroundColor = color;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = () => {
    note.remove();
    saveNotes();
    updateNotesCount();
  };

  const noteText = document.createElement('div');
  noteText.textContent = text;

  const time = document.createElement('span');
  time.className = 'timestamp';
  time.textContent = timestamp;

  note.appendChild(deleteBtn);
  note.appendChild(noteText);
  note.appendChild(time);

  const notesContainer = document.getElementById('notesContainer');
  notesContainer.appendChild(note);

  hideStartPrompt();
}

function clearAllNotes() {
  document.getElementById('notesContainer').innerHTML = '<div class="start-prompt"><div class="plus-icon">+</div><p>Start Your Brain Dump</p><span>Click the + button in the toolbar to add your first note</span></div>';
  localStorage.removeItem('notes');
  updateNotesCount();
}

function saveNotes() {
  const notes = [];
  document.querySelectorAll('.note').forEach(note => {
    const text = note.children[1].textContent;
    const timestamp = note.querySelector('.timestamp').textContent;
    const color = note.style.backgroundColor;
    notes.push({ text, color, timestamp });
  });
  localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
  const saved = JSON.parse(localStorage.getItem('notes') || '[]');
  saved.forEach(note => createNote(note.text, note.color, note.timestamp));
  updateNotesCount();
}

function exportNotes() {
  const notes = Array.from(document.querySelectorAll('.note')).map(note => {
    const text = note.children[1].textContent;
    const time = note.querySelector('.timestamp').textContent;
    return `- ${text}\n  (${time})`;
  }).join('\n\n');

  const blob = new Blob([notes], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mental-clarity-notes.txt';
  a.click();
}

function updateNotesCount() {
  const count = document.querySelectorAll('.note').length;
  document.getElementById('notesCount').textContent = `${count} note${count !== 1 ? 's' : ''}`;
}

function hideStartPrompt() {
  const prompt = document.querySelector('.start-prompt');
  if (prompt) prompt.remove();
}

window.onload = loadNotes;
