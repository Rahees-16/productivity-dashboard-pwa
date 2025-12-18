export function initTodo(element) {
  const getTodos = () => JSON.parse(localStorage.getItem('todos')) || [];
  const saveTodos = (todos) => localStorage.setItem('todos', JSON.stringify(todos));

  const render = () => {
    const todos = getTodos();

    const listHtml = todos.map((todo, index) => `
      <li style="
        display: flex; 
        align-items: flex-start; 
        padding: 0.8rem; 
        background: rgba(255,255,255,0.05); 
        border-radius: 12px; 
        margin-bottom: 0.5rem;
        transition: all 0.2s;
      ">
        <input type="checkbox" data-index="${index}" ${todo.done ? 'checked' : ''} style="
          width: 20px; 
          height: 20px; 
          accent-color: var(--accent-color); 
          margin-right: 1rem; 
          margin-top: 4px;
          cursor: pointer;
        ">
        <div style="flex: 1;">
          <div style="
            text-decoration: ${todo.done ? 'line-through' : 'none'};
            color: ${todo.done ? 'rgba(255,255,255,0.5)' : 'white'};
            font-weight: 500;
          ">${todo.text}</div>
          ${todo.desc ? `<div style="font-size: 0.85rem; opacity: 0.7; margin-top: 4px;">${todo.desc}</div>` : ''}
        </div>
        <button data-delete="${index}" style="
          background: none; 
          border: none; 
          color: #ef4444; 
          opacity: 0.5; 
          cursor: pointer; 
          padding: 5px;
          margin-left: 10px;
        ">✕</button>
      </li>
    `).join('');

    element.innerHTML = `
      <h2 style="display: flex; justify-content: space-between; align-items: center;">
        Tasks <span style="font-size: 0.9rem; opacity: 0.6; font-weight: 400;">${todos.filter(t => t.done).length}/${todos.length}</span>
      </h2>
      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
        <input type="text" id="todo-input" placeholder="Task title..." style="width: 100%;">
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="todo-desc" placeholder="Description (optional)" style="flex: 1;">
          <button id="todo-add" style="
            background: var(--accent-color); 
            border: none; 
            color: white; 
            width: 40px; 
            border-radius: 8px; 
            font-size: 1.2rem;
          ">+</button>
        </div>
      </div>
      <ul style="list-style: none; max-height: 300px; overflow-y: auto; padding-right: 5px;">
        ${todos.length ? listHtml : '<div style="opacity: 0.5; text-align: center; padding: 1rem;">No tasks yet</div>'}
      </ul>
    `;

    // Listeners
    element.querySelector('#todo-add').onclick = addTask;
    element.querySelector('#todo-desc').onkeydown = (e) => { if (e.key === 'Enter') addTask(); };
    element.querySelector('#todo-input').onkeydown = (e) => { if (e.key === 'Enter') element.querySelector('#todo-desc').focus(); };

    element.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.onchange = (e) => toggleTodo(e.target.dataset.index);
    });

    element.querySelectorAll('button[data-delete]').forEach(btn => {
      btn.onclick = (e) => deleteTodo(e.target.dataset.delete);
    });
  };

  const addTask = () => {
    const input = element.querySelector('#todo-input');
    const descInput = element.querySelector('#todo-desc');
    const text = input.value.trim();
    const desc = descInput.value.trim();

    if (text) {
      const todos = getTodos();
      todos.push({ text, desc, done: false });
      saveTodos(todos);
      render();
      setTimeout(() => element.querySelector('#todo-input').focus(), 0);
    }
  };

  const toggleTodo = (index) => {
    const todos = getTodos();
    todos[index].done = !todos[index].done;
    saveTodos(todos);
    render();
  };

  const deleteTodo = (index) => {
    const todos = getTodos();
    todos.splice(index, 1);
    saveTodos(todos);
    render();
  };

  render();
}
