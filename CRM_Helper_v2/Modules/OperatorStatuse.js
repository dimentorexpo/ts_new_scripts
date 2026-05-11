const win_OperStatus = `
<div style="width: 420px;">
  <span style="cursor: -webkit-grab; display: block;">
    <div class="crm-win-header">
      <button class="buttonHide" id="hideMeOpSt">hide</button>
      <button class="btnCRM btnCRMsmall" id="clearopersinfo">🧹</button>
    </div>
    <div id="opers_box" style="padding: 8px;">
      <div id="operstatustable" class="crm-scrollable" style="max-height: 400px; overflow: auto;"></div>
    </div>
  </span>
</div>`;

const wintOperStatus = createWindowCRM('CRM_OperStat', 'winTopOpStat', 'winLeftOpStat', win_OperStatus);
hideWindowOnDoubleClick('CRM_OperStat');

document.getElementById('clearopersinfo').onclick = () => {
  document.getElementById('operstatustable').innerHTML = "";
};

const STATUS_CONFIG = {
  Ready: { icon: '🟢', prefix: '', color: '#4ade80' },
  DND: { icon: '🔴', prefix: '🍔', color: '#f87171' },
  InServiceOut: { icon: '🟡', prefix: '📞', color: '#fbbf24' },
  AfterServiceOut: { icon: '🟠', prefix: '📵', color: '#fb923c' },
  Timeout: { icon: '⭕', prefix: '⏳', color: '#a78bfa' }
};

// FIX: keep single socket instance, close properly
let operSocket = null;
let operSocketInterval = null;

document.getElementById('btnOperStatus').onclick = () => {
  const win = document.getElementById('CRM_OperStat');
  const willHide = win.style.display !== 'none' && !!win.style.display;
  win.style.display = willHide ? 'none' : '';

  if (willHide) {
    if (operSocket && operSocket.readyState === 1) operSocket.send('2');
    if (operSocketInterval) { clearInterval(operSocketInterval); operSocketInterval = null; }
    return;
  }

  // Close previous socket if any
  if (operSocket) { try { operSocket.close(); } catch(e) {} operSocket = null; }

  operSocket = new WebSocket("wss://telephony.skyeng.ru/phone-stats/?EIO=4&transport=websocket");

  operSocketInterval = setInterval(() => {
    if (operSocket.readyState !== 1) return;
    clearInterval(operSocketInterval);
    operSocketInterval = null;
    operSocket.send('40/group-413,');
    operSocket.onmessage = (event) => {
      const msg = event.data;
      operSocket.send('3');
      const container = document.getElementById('operstatustable');
      container.innerHTML = '';
      let total = 0;
      Object.entries(STATUS_CONFIG).forEach(([status, cfg]) => {
        const regex = new RegExp(`(?:"name":")([^"]+)(?:".*?lastStatus":"${status}")`, 'g');
        const matches = [...msg.matchAll(regex)];
        const count = matches.length;
        total += count;
        const section = document.createElement('div');
        section.className = 'crm-oper-status-section';
        section.innerHTML = `
          <div class="crm-oper-header" style="color: ${cfg.color};">
            ${status}
            <span class="crm-oper-count">${count}</span>
          </div>
          <div class="crm-oper-list">
            ${matches.map(m => `<div class="crm-oper-item">${cfg.icon} ${cfg.prefix} ${m[1]}</div>`).join('')}
          </div>`;
        container.appendChild(section);
      });
      const totalSection = document.createElement('div');
      totalSection.className = 'crm-oper-status-section';
      totalSection.innerHTML = `
        <div class="crm-oper-header" style="background: rgba(0,212,255,0.15); color: #fff;">
          Всего операторов в системе
          <span class="crm-oper-count" style="background: var(--accent-cyan); color: #000;">${total}</span>
        </div>`;
      container.appendChild(totalSection);
    };
  }, 1000);

  document.getElementById('hideMeOpSt').onclick = () => {
    win.style.display = 'none';
    if (operSocket && operSocket.readyState === 1) operSocket.send('2');
    if (operSocketInterval) { clearInterval(operSocketInterval); operSocketInterval = null; }
    document.getElementById('operstatustable').innerHTML = '';
  };
};
