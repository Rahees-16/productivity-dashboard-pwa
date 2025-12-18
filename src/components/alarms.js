export function initAlarms(element) {
  const getAlarms = () => JSON.parse(localStorage.getItem('alarms')) || [];
  const saveAlarms = (alarms) => localStorage.setItem('alarms', JSON.stringify(alarms));

  let audioContext = null;
  let activeOscillator = null;

  // Create Alarm Overlay
  let alarmOverlay = document.getElementById('alarm-overlay');
  if (!alarmOverlay) {
    alarmOverlay = document.createElement('div');
    alarmOverlay.id = 'alarm-overlay';
    alarmOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.9); z-index: 2000;
      display: none; flex-direction: column; align-items: center; justify-content: center;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    `;
    alarmOverlay.innerHTML = `
      <div style="font-size: 6rem; margin-bottom: 1rem; animation: bounce 1s infinite alternate;">⏰</div>
      <h2 id="alarm-msg" style="font-size: 2.5rem; margin-bottom: 3rem; font-weight: 700; text-shadow: 0 4px 10px rgba(0,0,0,0.5);">Alarm Ringing!</h2>
      <button id="stop-alarm" class="animate-pulse-ring" style="
        background: #ef4444; color: white; border: none; padding: 1.2rem 4rem;
        border-radius: 50px; font-size: 1.5rem; font-weight: bold; cursor: pointer;
        box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
        transition: transform 0.1s;
      ">STOP</button>
    `;
    document.body.appendChild(alarmOverlay);

    const stopAlarm = () => {
      if (activeOscillator) {
        try { activeOscillator.stop(); } catch (e) { }
        activeOscillator = null;
      }
      alarmOverlay.style.display = 'none';
    };
    alarmOverlay.querySelector('#stop-alarm').onclick = stopAlarm;
  }

  const playAlarmSound = () => {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(523.25, audioContext.currentTime);

    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);

    for (let i = 0; i < 6; i++) {
      const start = now + i * 0.8;
      gain.gain.linearRampToValueAtTime(0.3, start + 0.1);
      gain.gain.linearRampToValueAtTime(0, start + 0.2);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.3);
      gain.gain.linearRampToValueAtTime(0, start + 0.4);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.5);
      gain.gain.linearRampToValueAtTime(0, start + 0.6);
    }

    osc.start();
    activeOscillator = osc;
    try { osc.stop(now + 6 * 0.8); } catch (e) { }
  };

  const checkAlarms = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = hours + ':' + minutes;
    const currentSeconds = now.getSeconds();

    if (currentSeconds === 0) {
      const alarms = getAlarms();
      alarms.forEach(alarm => {
        if (!alarm.enabled || alarmOverlay.style.display !== 'none') return;

        // Logic: specific date match OR daily (no date)
        const dateMatch = alarm.date ? alarm.date === todayStr : true;
        const timeMatch = alarm.time === currentTime;

        if (dateMatch && timeMatch) {
          playAlarmSound();
          const msgEl = document.getElementById('alarm-msg');
          if (msgEl) msgEl.innerText = alarm.label || 'Alarm';
          alarmOverlay.style.display = 'flex';
        }
      });
    }
  };

  setInterval(checkAlarms, 1000);

  const render = () => {
    const alarms = getAlarms();

    const listHtml = alarms.map((alarm, index) => {
      const isOneTime = !!alarm.date;
      return `
      <div style="
        display:flex; 
        align-items:center; 
        justify-content:space-between; 
        background:rgba(255,255,255,0.2); 
        padding: 1rem; 
        border-radius: 16px; 
        margin-bottom: 0.8rem;
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: transform 0.2s;
      " onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
        
        <div style="flex:1;">
          <div style="font-size:1.5rem; font-weight:700; letter-spacing:-0.5px; display:flex; align-items:baseline; gap:0.5rem;">
            ${alarm.time}
            ${isOneTime ? `<span style="font-size:0.8rem; font-weight:400; opacity:0.9; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">${alarm.date}</span>` : '<span style="font-size:0.8rem; font-weight:400; opacity:0.7;">Daily</span>'}
          </div>
          <div style="font-size:0.9rem; opacity:0.9; margin-top:2px;">${alarm.label || 'Alarm'}</div>
        </div>

        <div style="display:flex; align-items:center; gap:1.5rem;">
          <label class="toggle-switch">
            <input type="checkbox" data-toggle="${index}" ${alarm.enabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          
          <button data-delete="${index}" style="
            background: rgba(239, 68, 68, 0.1); 
            border: none; 
            color: #ef4444; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            opacity: 0.8;
            transition: all 0.2s;
          " onmouseover="this.style.opacity='1'; this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.opacity='0.8'; this.style.background='rgba(239, 68, 68, 0.1)'">
            ✕
          </button>
        </div>
      </div>
      `;
    }).join('');

    element.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2>Alarms</h2>
        <span style="font-size:0.9rem; opacity:0.5; font-weight:500;">${alarms.filter(a => a.enabled).length} Active</span>
      </div>
      
      <div style="
        display:flex; 
        flex-direction: column;
        gap:0.8rem; 
        margin-bottom:1.5rem;
        background: rgba(0,0,0,0.2);
        padding: 0.8rem;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.05);
      ">
        <div style="display:flex; gap:0.5rem;">
          <input type="time" id="alarm-time" style="
            background: rgba(255,255,255,0.05); 
            border:none; 
            color:white; 
            font-weight:600;
            font-size: 1.1rem;
            border-radius: 8px;
            flex: 1;
          ">
          <input type="date" id="alarm-date" style="
            background: rgba(255,255,255,0.05); 
            border:none; 
            color:white; 
            font-size: 0.9rem;
            border-radius: 8px;
            flex: 1;
            opacity: 0.8;
          " placeholder="Daily (Optional)">
        </div>
        
        <div style="display:flex; gap:0.5rem;">
          <input type="text" id="alarm-label" placeholder="Label..." style="
            flex:1; 
            background:transparent; 
            border:none; 
            border-bottom: 1px solid rgba(255,255,255,0.1);
            border-radius: 0;
            padding: 0.5rem;
          ">
          <button id="add-alarm" style="
            background:var(--accent-color); 
            border:none; 
            color:white; 
            width:40px; 
            border-radius: 8px;
            font-weight: bold;
            font-size: 1.2rem;
          ">+</button>
        </div>
      </div>

      <div style="max-height:300px; overflow-y:auto; padding-right: 5px;">
        ${alarms.length ? listHtml : '<div style="opacity:0.4; text-align:center; padding:2rem;">No alarms set</div>'}
      </div>
    `;

    // Listeners
    element.querySelector('#add-alarm').onclick = () => {
      const time = element.querySelector('#alarm-time').value;
      const date = element.querySelector('#alarm-date').value; // Might be empty
      const label = element.querySelector('#alarm-label').value || 'Alarm';

      if (time) {
        const alarms = getAlarms();
        alarms.push({ time, date: date || null, label, enabled: true });
        saveAlarms(alarms);
        render();
      }
    };

    element.querySelectorAll('input[data-toggle]').forEach(input => {
      input.onchange = (e) => {
        const idx = e.target.dataset.toggle;
        const alarms = getAlarms();
        alarms[idx].enabled = e.target.checked;
        saveAlarms(alarms);
        render();
      };
    });

    element.querySelectorAll('button[data-delete]').forEach(btn => {
      btn.onclick = (e) => {
        const idx = e.target.dataset.delete;
        const alarms = getAlarms();
        alarms.splice(idx, 1);
        saveAlarms(alarms);
        render();
      };
    });
  };

  render();
}
