export function initCalendar(element) {
    let currentDate = new Date();

    // Data Manager
    const getDailyData = () => JSON.parse(localStorage.getItem('dailyData')) || {};
    const saveDailyData = (data) => localStorage.setItem('dailyData', JSON.stringify(data));

    const renderCalendar = () => {
        element.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Header
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `
      <button id="prev-month" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&lt;</button>
      <h2>${currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h2>
      <button id="next-month" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&gt;</button>
    `;
        element.appendChild(header);

        // Grid
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // Day Names
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-day-name';
            el.innerText = day;
            grid.appendChild(el);
        });

        // Empty Slots
        for (let i = 0; i < firstDay; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day empty';
            grid.appendChild(el);
        }

        // Days
        const dailyData = getDailyData();
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const el = document.createElement('div');
            el.className = 'calendar-day';
            if (dateStr === todayStr) el.classList.add('today');

            el.innerHTML = `<span>${i}</span>`;

            // Markers for data
            const data = dailyData[dateStr];
            if (data && (data.diary || (data.tasks && data.tasks.length > 0))) {
                const marker = document.createElement('div');
                marker.className = 'day-marker';
                el.appendChild(marker);
            }

            el.onclick = () => openDayModal(dateStr);
            grid.appendChild(el);
        }

        element.appendChild(grid);

        // Listeners
        element.querySelector('#prev-month').onclick = () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        };
        element.querySelector('#next-month').onclick = () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        };
    };

    renderCalendar();
}

function openDayModal(dateStr) {
    const modal = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');

    const getDayData = () => {
        const allData = JSON.parse(localStorage.getItem('dailyData')) || {};
        return allData[dateStr] || { diary: '', tasks: [] };
    };

    const saveDayData = (newData) => {
        const allData = JSON.parse(localStorage.getItem('dailyData')) || {};
        allData[dateStr] = newData;
        localStorage.setItem('dailyData', JSON.stringify(allData));
    };

    const renderModalContent = () => {
        const data = getDayData();
        const dateObj = new Date(dateStr + 'T00:00:00');

        body.innerHTML = `
      <h2>${dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
      
      <div class="detail-section">
        <h3>📖 Diary</h3>
        <textarea id="day-diary" style="width:100%; height:150px; margin-top:0.5rem;" placeholder="How was your day?">${data.diary || ''}</textarea>
      </div>

      <div class="detail-section">
        <h3>✅ Tasks</h3>
        <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
          <input id="day-task-input" type="text" placeholder="Task title" style="flex:1;">
          <input id="day-task-desc" type="text" placeholder="Description (optional)" style="flex:1;">
          <button id="add-day-task" style="background:var(--accent-color); border:none; color:white; padding:0 1rem; border-radius:8px;">Add</button>
        </div>
        <div id="day-task-list"></div>
      </div>
    `;

        // Render Tasks
        const list = body.querySelector('#day-task-list');
        data.tasks.forEach((task, idx) => {
            const item = document.createElement('div');
            item.className = 'task-item-dated';
            item.innerHTML = `
        <div style="display:flex; flex-direction:column;">
          <strong style="text-decoration: ${task.done ? 'line-through' : 'none'}; opacity:${task.done ? 0.5 : 1}">${task.title}</strong>
          <small style="opacity:0.7;">${task.desc}</small>
        </div>
        <div>
          <input type="checkbox" ${task.done ? 'checked' : ''} class="day-task-check" data-idx="${idx}">
          <button class="day-task-del" data-idx="${idx}" style="background:none; border:none; color:#ef4444; margin-left:10px; cursor:pointer;">✕</button>
        </div>
      `;
            list.appendChild(item);
        });

        // Listeners
        body.querySelector('#day-diary').oninput = (e) => {
            const current = getDayData();
            current.diary = e.target.value;
            saveDayData(current);
        };

        body.querySelector('#add-day-task').onclick = () => {
            const title = body.querySelector('#day-task-input').value;
            const desc = body.querySelector('#day-task-desc').value;
            if (title) {
                const current = getDayData();
                current.tasks = current.tasks || [];
                current.tasks.push({ title, desc, done: false });
                saveDayData(current);
                renderModalContent();
            }
        };

        body.querySelectorAll('.day-task-check').forEach(cb => {
            cb.onchange = (e) => {
                const idx = e.target.dataset.idx;
                const current = getDayData();
                current.tasks[idx].done = !current.tasks[idx].done;
                saveDayData(current);
                renderModalContent();
            };
        });

        body.querySelectorAll('.day-task-del').forEach(btn => {
            btn.onclick = (e) => {
                const idx = e.target.dataset.idx;
                const current = getDayData();
                current.tasks.splice(idx, 1);
                saveDayData(current);
                renderModalContent();
            };
        });
    };

    renderModalContent();

    modal.classList.remove('hidden');

    const closeModal = () => {
        modal.classList.add('hidden');
        // Refresh calendar to show markers
        const calendarEl = document.getElementById('calendar-container');
        if (calendarEl) initCalendar(calendarEl);
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}
