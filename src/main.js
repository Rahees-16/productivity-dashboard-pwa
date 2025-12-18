import './style.css';
import { initClock } from './components/clock.js';
import { initTimer } from './components/timer.js';
import { initTodo } from './components/todo.js';
import { initNotes } from './components/notes.js';
import { initCalendar } from './components/calendar.js';
import { initAlarms } from './components/alarms.js';

document.querySelector('#app').innerHTML = `
  <header class="header">
    <div id="clock-container" class="glass-panel"></div>
  </header>
  
  <main class="grid-container">
    <div class="main-column">
      <section id="timer-container" class="glass-panel widget-large"></section>
      <section id="calendar-container" class="glass-panel widget-large" style="margin-top: 2rem;"></section>
    </div>
    
    <div class="side-column">
      <section id="alarms-container" class="glass-panel widget-medium"></section>
      <section id="todo-container" class="glass-panel widget-medium"></section>
      <section id="notes-container" class="glass-panel widget-medium"></section>
    </div>
  </main>

  <!-- Modal Overlay -->
  <div id="modal-overlay" class="modal-overlay hidden">
    <div class="glass-panel modal-content">
      <button id="modal-close" class="modal-close">&times;</button>
      <div id="modal-body"></div>
    </div>
  </div>
`;

// Initialize Components
initClock(document.querySelector('#clock-container'));
initTimer(document.querySelector('#timer-container'));
initAlarms(document.querySelector('#alarms-container'));
initTodo(document.querySelector('#todo-container'));
initNotes(document.querySelector('#notes-container'));
initCalendar(document.querySelector('#calendar-container'));

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => console.log('SW registered: ', registration.scope),
      (err) => console.log('SW registration failed: ', err)
    );
  });
}
