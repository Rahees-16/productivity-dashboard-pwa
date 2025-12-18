export function initNotes(element) {
    const getNotes = () => localStorage.getItem('notes') || '';
    const saveNotes = (text) => localStorage.setItem('notes', text);

    element.innerHTML = `
    <h2>Quick Notes</h2>
    <textarea id="notes-area" placeholder="Jot down your thoughts..." style="
      width: 100%; 
      height: 200px; 
      resize: none; 
      background: rgba(0,0,0,0.2); 
      border: 1px solid var(--glass-border); 
      border-radius: 12px; 
      padding: 1rem; 
      color: white; 
      font-size: 1rem; 
      line-height: 1.5;
    ">${getNotes()}</textarea>
    <div id="save-status" style="font-size: 0.8rem; opacity: 0.5; text-align: right; margin-top: 0.5rem; height: 1.2em;"></div>
  `;

    const textarea = element.querySelector('#notes-area');
    const status = element.querySelector('#save-status');

    textarea.oninput = () => {
        saveNotes(textarea.value);
        status.innerText = 'Saved';
        setTimeout(() => { status.innerText = ''; }, 2000);
    };
}
