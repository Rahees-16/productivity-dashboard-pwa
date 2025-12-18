export function initTimer(element) {
    let timeLeft = 25 * 60; // 25 minutes
    let timerInterval = null;
    let isRunning = false;

    const render = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        element.innerHTML = `
      <h2 style="margin-bottom: 2rem;">Focus Timer</h2>
      <div style="font-size: 6rem; font-weight: 700; font-feature-settings: 'tnum'; margin-bottom: 2rem; color: ${isRunning ? 'var(--accent-color)' : 'white'}; transition: color 0.3s;">
        ${timeDisplay}
      </div>
      <div style="display: flex; gap: 1rem;">
        <button id="timer-toggle" style="
          padding: 1rem 2rem; 
          border-radius: 50px; 
          border: none; 
          background: ${isRunning ? '#ef4444' : 'var(--accent-color)'}; 
          color: white; 
          font-weight: 600; 
          font-size: 1.2rem;
          transition: transform 0.1s;
        ">${isRunning ? 'Pause' : 'Start Focus'}</button>
        
        <button id="timer-reset" style="
          padding: 1rem; 
          border-radius: 50px; 
          border: 1px solid rgba(255,255,255,0.2); 
          background: transparent; 
          color: white;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12"/></svg>
        </button>
      </div>
    `;

        // Re-attach listeners since we re-rendered
        element.querySelector('#timer-toggle').onclick = toggleTimer;
        element.querySelector('#timer-reset').onclick = resetTimer;
    };

    const toggleTimer = () => {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
        } else {
            isRunning = true;
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    render();
                } else {
                    clearInterval(timerInterval);
                    isRunning = false;
                    // Play sound or notify
                    render();
                }
            }, 1000);
        }
        render();
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = 25 * 60;
        render();
    };

    render();
}
