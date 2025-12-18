export function initNotes(element) {
    const getNotes = () => JSON.parse(localStorage.getItem('notes_v2')) || [];
    const saveNotes = (notes) => localStorage.setItem('notes_v2', JSON.stringify(notes));

    let activeNoteId = null;

    const render = () => {
        const notes = getNotes();

        // Editor View
        if (activeNoteId !== null) {
            const activeNote = notes.find(n => n.id === activeNoteId);
            if (!activeNote) { activeNoteId = null; return render(); }

            element.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <button id="back-list" style="background:none; border:none; color:var(--accent-color); cursor:pointer;">← Back</button>
          <button id="delete-note" style="background:none; border:none; color:#ef4444; opacity:0.7; cursor:pointer;">Delete</button>
        </div>
        <input id="note-title" value="${activeNote.title}" placeholder="Title" style="width:100%; margin-bottom:0.5rem; font-weight:600; font-size:1.1rem; background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.1);">
        <textarea id="note-content" placeholder="Start typing..." style="
          width: 100%; 
          height: 250px; 
          resize: none; 
          background: rgba(0,0,0,0.1); 
          border: none; 
          border-radius: 8px; 
          padding: 1rem; 
          color: white; 
          font-size: 1rem; 
          line-height: 1.5;
        ">${activeNote.content}</textarea>
      `;

            const titleInput = element.querySelector('#note-title');
            const contentInput = element.querySelector('#note-content');

            const save = () => {
                const notes = getNotes();
                const idx = notes.findIndex(n => n.id === activeNoteId);
                if (idx !== -1) {
                    notes[idx].title = titleInput.value;
                    notes[idx].content = contentInput.value;
                    notes[idx].updated = new Date().toISOString();
                    saveNotes(notes);
                }
            };

            titleInput.oninput = save;
            contentInput.oninput = save;

            element.querySelector('#back-list').onclick = () => { activeNoteId = null; render(); };
            element.querySelector('#delete-note').onclick = () => {
                if (confirm('Delete this note?')) {
                    const notes = getNotes();
                    const newNotes = notes.filter(n => n.id !== activeNoteId);
                    saveNotes(newNotes);
                    activeNoteId = null;
                    render();
                }
            };
            return;
        }

        // List View
        const listHtml = notes.map(note => `
      <div class="note-item" data-id="${note.id}" style="
        background: rgba(255,255,255,0.05); 
        padding: 0.8rem; 
        border-radius: 8px; 
        margin-bottom: 0.5rem; 
        cursor: pointer;
        transition: background 0.2s;
      ">
        <div style="font-weight:600; margin-bottom:0.2rem;">${note.title || 'Untitled Note'}</div>
        <div style="font-size:0.8rem; opacity:0.6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${note.content || 'No content'}
        </div>
      </div>
    `).join('');

        element.innerHTML = `
      <h2 style="display:flex; justify-content:space-between; align-items:center;">
        Notes
        <button id="add-note" style="background:var(--accent-color); border:none; color:white; width:30px; height:30px; border-radius:50%; font-size:1.2rem; cursor:pointer;">+</button>
      </h2>
      <div style="max-height:300px; overflow-y:auto;">
        ${notes.length ? listHtml : '<div style="opacity:0.5; padding:1rem; text-align:center;">No notes</div>'}
      </div>
    `;

        element.querySelector('#add-note').onclick = () => {
            const notes = getNotes();
            const newNote = {
                id: Date.now(),
                title: '',
                content: '',
                created: new Date().toISOString()
            };
            notes.unshift(newNote);
            saveNotes(notes);
            activeNoteId = newNote.id;
            render();
        };

        element.querySelectorAll('.note-item').forEach(el => {
            el.onclick = () => {
                activeNoteId = Number(el.dataset.id);
                render();
            };
        });
    };

    render();
}
