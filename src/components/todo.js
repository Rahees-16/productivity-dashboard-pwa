export function initTodo(element) {
    const getTodos = () => JSON.parse(localStorage.getItem('todos')) || [];
    const saveTodos = (todos) => localStorage.setItem('todos', JSON.stringify(todos));

    const render = () => {
        const todos = getTodos();

        const listHtml = todos.map((todo, index) => `
      <li style="
        display: flex; 
        align-items: center; 
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
          cursor: pointer;
        ">
        <span style="
          flex: 1; 
          text-decoration: ${todo.done ? 'line-through' : 'none'};
          color: ${todo.done ? 'rgba(255,255,255,0.5)' : 'white'};
        ">${todo.text}</span>
        <button data-delete="${index}" style="
          background: none; 
          border: none; 
          color: #ef4444; 
          opacity: 0.5; 
          cursor: pointer; 
          padding: 5px;
        ">✕</button>
      </li>
    `).join('');

        element.innerHTML = `
      <h2 style="display: flex; justify-content: space-between; align-items: center;">
        Tasks <span style="font-size: 0.9rem; opacity: 0.6; font-weight: 400;">${todos.filter(t => t.done).length}/${todos.length}</span>
      </h2>
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <input type="text" id="todo-input" placeholder="Add a new task..." style="flex: 1;">
        <button id="todo-add" style="
          background: var(--accent-color); 
          border: none; 
          color: white; 
          width: 40px; 
          border-radius: 8px; 
          font-size: 1.2rem;
        ">+</button>
      </div>
      <ul style="list-style: none; max-height: 300px; overflow-y: auto; padding-right: 5px;">
        ${todos.length ? listHtml : '<div style="opacity: 0.5; text-align: center; padding: 1rem;">No tasks yet</div>'}
      </ul>
    `;

        // Listeners
        element.querySelector('#todo-add').onclick = addTask;
        element.querySelector('#todo-input').onkeydown = (e) => { if (e.key === 'Enter') addTask(); };

        element.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.onchange = (e) => toggleTodo(e.target.dataset.index);
        });

        element.querySelectorAll('button[data-delete]').forEach(btn => {
            btn.onclick = (e) => deleteTodo(e.target.dataset.delete);
        });
    };

    const addTask = () => {
        const input = element.querySelector('#todo-input');
        const text = input.value.trim();
        if (text) {
            const todos = getTodos();
            todos.push({ text, done: false });
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
