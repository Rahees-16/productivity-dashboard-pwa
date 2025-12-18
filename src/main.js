import './style.css';
import { initClock } from './components/clock.js';
import { initTimer } from './components/timer.js';
import { initTodo } from './components/todo.js';
import { initNotes } from './components/notes.js';

document.querySelector('#app').innerHTML = `
  <header class="header">
    <div id="clock-container" class="glass-panel"></div>
  </header>
  
  <main class="grid-container">
    <section id="timer-container" class="glass-panel widget-large">
      <!-- Timer Component will inject here -->
    </section>
    
    <div class="side-column">
      <section id="todo-container" class="glass-panel widget-medium">
        <!-- Todo Component will inject here -->
      </section>
      <section id="notes-container" class="glass-panel widget-medium">
        <!-- Notes Component will inject here -->
      </section>
    </div>
  </main>
`;

// Initialize Components
initClock(document.querySelector('#clock-container'));
initTimer(document.querySelector('#timer-container'));
initTodo(document.querySelector('#todo-container'));
initNotes(document.querySelector('#notes-container'));

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
            (registration) => console.log('SW registered: ', registration.scope),
            (err) => console.log('SW registration failed: ', err)
        );
    });
}
