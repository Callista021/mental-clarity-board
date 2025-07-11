document.addEventListener("DOMContentLoaded", () => {
  const boardCenter = document.querySelector(".board-center");
  const main = document.querySelector(".main");
  const textNoteBtn = document.querySelector(".pastel-purple");
  const sketchBtn = document.querySelector(".pastel-blue");
  const voiceNoteBtn = document.querySelector(".pastel-yellow");
  const clearBoardBtn = document.querySelector(".toolbar-btn.red");
  const exportBtn = document.querySelector(".toolbar-btn.green");
  const importBtn = document.querySelector(".toolbar-btn.blue");

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
      } else {
        noteDiv.innerHTML = `
          <strong>${note.type} Note</strong>
          <p>${note.content}</p>
        `;
      }

      notesContainer.appendChild(noteDiv);
    });

    // Reattach toolbar events
    main.querySelector(".toolbar-btn.red").addEventListener("click", clearBoard);
    main.querySelector(".toolbar-btn.green").addEventListener("click", exportBoard);
    main.querySelector(".toolbar-btn.blue").addEventListener("click", importBoard);
  }

  textNoteBtn.addEventListener("click", () => {
    const content = prompt("Enter text note content:");
    if (content) {
      notes.push({
        type: "Text",
        content,
        color: "#f3e8ff"
      });
      renderNotes();
    }
  });

  sketchBtn.addEventListener("click", () => {
    showSketchCanvas();
  });

  voiceNoteBtn.addEventListener("click", () => {
    const content = prompt("Describe your voice note:");
    if (content) {
      notes.push({
        type: "Voice",
        content,
        color: "#fef9c3"
      });
      renderNotes();
    }
  });

  function clearBoard() {
    if (confirm("Are you sure you want to clear the board?")) {
      notes = [];
      location.reload();
    }
  }
  clearBoardBtn.addEventListener("click", clearBoard);

  function exportBoard() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "mental_clarity_board.json");
    dlAnchor.click();
  }
  exportBtn.addEventListener("click", exportBoard);

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
  importBtn.addEventListener("click", importBoard);

  function showSketchCanvas() {
    main.innerHTML = `
      <div class="toolbar">
        <button class="toolbar-btn green">⬇️ Export</button>
        <button class="toolbar-btn blue">⬆️ Import</button>
        <button class="toolbar-btn red">🗑️ Clear Board</button>
      </div>
      <div class="sketch-container">
        <canvas id="sketchCanvas" width="500" height="400" style="border:1px solid #ccc;"></canvas>
        <div class="sketch-buttons">
          <button id="saveSketch">Save Sketch</button>
          <button id="clearSketch">Clear Sketch</button>
          <button id="backToNotes">Back</button>
        </div>
      </div>
    `;

    const canvas = document.getElementById("sketchCanvas");
    const ctx = canvas.getContext("2d");
    let drawing = false;

    canvas.addEventListener("mousedown", () => drawing = true);
    canvas.addEventListener("mouseup", () => drawing = false);
    canvas.addEventListener("mouseout", () => drawing = false);
    canvas.addEventListener("mousemove", draw);

    function draw(e) {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    document.getElementById("saveSketch").addEventListener("click", () => {
      const dataUrl = canvas.toDataURL();
      notes.push({
        type: "Sketch",
        content: dataUrl,
        color: "#e0f2fe"
      });
      renderNotes();
    });

    document.getElementById("clearSketch").addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById("backToNotes").addEventListener("click", renderNotes);

    // Reattach toolbar events
    main.querySelector(".toolbar-btn.red").addEventListener("click", clearBoard);
    main.querySelector(".toolbar-btn.green").addEventListener("click", exportBoard);
    main.querySelector(".toolbar-btn.blue").addEventListener("click", importBoard);
  }
});
