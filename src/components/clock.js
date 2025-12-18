export function initClock(element) {
    const updateClock = () => {
        const now = new Date();

        // Time Display
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

        // Greeting Logic
        const hour = now.getHours();
        let greeting = 'Good Evening';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';

        element.innerHTML = `
      <div style="text-align: center;">
        <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--accent-color);">${greeting}</h2>
        <div style="font-size: 4rem; font-weight: 600; line-height: 1;">${timeString}</div>
        <div style="font-size: 1.2rem; opacity: 0.8; margin-top: 0.5rem;">${dateString}</div>
      </div>
    `;
    };

    updateClock();
    setInterval(updateClock, 1000);
}
