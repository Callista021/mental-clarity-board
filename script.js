document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector(".main");
  const textNoteBtn = document.querySelector(".pastel-purple");
  const sketchBtn = document.querySelector(".pastel-blue");
  const voiceNoteBtn = document.querySelector(".pastel-yellow");

  let notes = [];

  function renderNotes() {
    main.innerHTML = `
      <div class="toolbar">
        <button class="toolbar-btn green">⬇️ Export</button>
        <button class="toolbar-btn blue">⬆️ Import</button>
        <button class="toolbar-btn red">🗑️ Clear Board</button>
      </div>
      <div class="notes-container"></div>
    `;

    const notesContainer = main.querySelector(".notes-container");

    notes.forEach((note) => {
      const noteDiv = document.createElement("div");
      noteDiv.classList.add("note-card");
      noteDiv.style.background = note.color;

      if (note.type === "Sketch") {
        noteDiv.innerHTML = `<strong>${note.type} Note</strong><br><img src="${note.content}" alt="Sketch" style="width:100%;"/>`;
      } else if (note.type === "Voice") {
        noteDiv.innerHTML = `<strong>${note.type} Note</strong><audio controls src="${note.content}"></audio>`;
      } else {
        noteDiv.innerHTML = `<strong>${note.type} Note</strong><p>${note.content}</p>`;
      }

      notesContainer.appendChild(noteDiv);
    });

    attachToolbarEvents();
  }

  function attachToolbarEvents() {
    main.querySelector(".toolbar-btn.red").addEventListener("click", clearBoard);
    main.querySelector(".toolbar-btn.green").addEventListener("click", exportBoard);
    main.querySelector(".toolbar-btn.blue").addEventListener("click", importBoard);
  }

  textNoteBtn.addEventListener("click", () => {
    main.innerHTML += `
      <div class="modal">
        <div class="modal-content">
          <h3>Add Text Note</h3>
          <textarea placeholder="Write your note here..."></textarea>
          <button id="saveTextNote">Save</button>
          <button id="cancelTextNote">Cancel</button>
        </div>
      </div>
    `;

    document.getElementById("saveTextNote").addEventListener("click", () => {
      const content = main.querySelector(".modal textarea").value.trim();
      if (content) {
        notes.push({ type: "Text", content, color: "#f3e8ff" });
        renderNotes();
      }
    });

    document.getElementById("cancelTextNote").addEventListener("click", renderNotes);
  });

  voiceNoteBtn.addEventListener("click", () => {
    main.innerHTML = `
      <div class="toolbar">
        <button class="toolbar-btn green">⬇️ Export</button>
        <button class="toolbar-btn blue">⬆️ Import</button>
        <button class="toolbar-btn red">🗑️ Clear Board</button>
      </div>
      <div class="voice-container">
        <h3>Voice Recorder</h3>
        <button id="startRec">Start Recording</button>
        <button id="stopRec" disabled>Stop Recording</button>
        <audio id="audioPlayback" controls></audio>
        <button id="saveVoiceNote" disabled>Save Voice Note</button>
        <button id="backToNotes">Back</button>
      </div>
    `;

    attachToolbarEvents();

    const startBtn = document.getElementById("startRec");
    const stopBtn = document.getElementById("stopRec");
    const saveBtn = document.getElementById("saveVoiceNote");
    const audio = document.getElementById("audioPlayback");

    let mediaRecorder;
    let chunks = [];

    startBtn.addEventListener("click", async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        audio.src = URL.createObjectURL(blob);
        saveBtn.dataset.blobUrl = audio.src;
        saveBtn.dataset.blob = blob;
        saveBtn.disabled = false;
      };

      startBtn.disabled = true;
      stopBtn.disabled = false;
    });

    stopBtn.addEventListener("click", () => {
      mediaRecorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
    });

    saveBtn.addEventListener("click", () => {
      notes.push({ type: "Voice", content: audio.src, color: "#fef9c3" });
      renderNotes();
    });

    document.getElementById("backToNotes").addEventListener("click", renderNotes);
  });

  sketchBtn.addEventListener("click", () => {
    main.innerHTML = `
      <div class="toolbar">
        <button class="toolbar-btn green">⬇️ Export</button>
        <button class="toolbar-btn blue">⬆️ Import</button>
        <button class="toolbar-btn red">🗑️ Clear Board</button>
      </div>
      <div class="sketch-container">
        <canvas id="sketchCanvas" width="500" height="400"></canvas>
        <div class="sketch-tools">
          <label>Color: <input type="color" id="colorPicker" value="#000000"></label>
          <label>Size:
            <select id="penSize">
              <option value="2">Thin</option>
              <option value="5">Medium</option>
              <option value="10">Thick</option>
            </select>
          </label>
        </div>
        <div class="sketch-buttons">
          <button id="saveSketch">Save Sketch</button>
          <button id="clearSketch">Clear</button>
          <button id="backToNotes">Back</button>
        </div>
      </div>
    `;

    attachToolbarEvents();

    const canvas = document.getElementById("sketchCanvas");
    const ctx = canvas.getContext("2d");
    const colorPicker = document.getElementById("colorPicker");
    const penSize = document.getElementById("penSize");

    let drawing = false;

    canvas.addEventListener("mousedown", () => drawing = true);
    canvas.addEventListener("mouseup", () => drawing = false);
    canvas.addEventListener("mouseout", () => drawing = false);
    canvas.addEventListener("mousemove", draw);

    function draw(e) {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = colorPicker.value;
      ctx.beginPath();
      ctx.arc(e.clientX - rect.left, e.clientY - rect.top, penSize.value, 0, Math.PI * 2);
      ctx.fill();
    }

    document.getElementById("saveSketch").addEventListener("click", () => {
      const dataUrl = canvas.toDataURL();
      notes.push({ type: "Sketch", content: dataUrl, color: "#e0f2fe" });
      renderNotes();
    });

    document.getElementById("clearSketch").addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById("backToNotes").addEventListener("click", renderNotes);
  });

  function clearBoard() {
    if (confirm("Clear the board?")) {
      notes = [];
      renderNotes();
    }
  }

  function exportBoard() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "mental_clarity_board.json");
    dlAnchor.click();
  }

  function importBoard() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        notes = JSON.parse(e.target.result);
        renderNotes();
      };
      reader.readAsText(file);
    });
    fileInput.click();
  }

  attachToolbarEvents();
});
