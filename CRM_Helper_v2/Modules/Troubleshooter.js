const processedUserIds = new Map(); // FIX: Map with size limit instead of plain object
const MAX_CACHE_SIZE = 500;

function addusersinfo() {
  const selectors = [
    { sel: '.p-10.w-85', type: 'topline' },
    { sel: '.cdk-header-cell', type: 'other', filter: el => /^\d+$/.test(el.innerText) },
    { sel: '.mat-option-text', type: 'other', filter: el => /^\d+$/.test(el.innerText) },
    { sel: '[id^="mat-input-"]', type: 'input', filter: el => /^\d+$/.test(el.value) }
  ];
  selectors.forEach(({ sel, type, filter }) => {
    const elements = Array.from(document.querySelectorAll(sel)).filter(el => !el.hasAttribute('info-added') && (!filter || filter(el)));
    elements.forEach(el => {
      const id = el.innerText || el.value;
      getuserinfocrm(id, el, type);
      el.setAttribute('info-added', 'true');
    });
  });
}

function getuserinfocrm(userid, pageelement, elemtype) {
  if (processedUserIds.has(userid)) { addinginfo(pageelement, userid, elemtype); return; }
  const fetchURL = `https://backend.skyeng.ru/api/persons/${userid}?crm2=true&debugParam=person-page`;
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions: { method: 'GET' } }, (response) => {
    if (!response?.success) return;
    const userInfo = JSON.parse(response.fetchansver);
    const name = `${userInfo.data.name}${userInfo.data.surname ? ` ${userInfo.data.surname}` : ''}`;
    processedUserIds.set(userid, { nameofuser: name, flagusertype: userInfo.data.type, readyflag: '1' });
    // FIX: evict oldest if over limit
    if (processedUserIds.size > MAX_CACHE_SIZE) {
      const firstKey = processedUserIds.keys().next().value;
      processedUserIds.delete(firstKey);
    }
    addinginfo(pageelement, userid, elemtype);
  });
}

function addinginfo(pageelement, userid, elemtype) {
  const cached = processedUserIds.get(userid);
  if (!cached) return;
  const { flagusertype, nameofuser } = cached;
  const styles = { student: { text: '(У)', color: '#f87171' }, teacher: { text: '(П)', color: '#60a5fa' } };
  const { text, color } = styles[flagusertype] || { text: '', color: '' };
  if (elemtype === 'input') { if (!pageelement.value.includes(text)) pageelement.value += text; return; }
  const span = document.createElement('span');
  span.style.cssText = `color: ${color}; font-weight: 600; margin-left: 4px;`;
  span.innerText = text;
  if (elemtype === 'topline') {
    span.title = nameofuser;
    pageelement.style.cssText = 'width: 110px; color: #60a5fa; text-decoration: underline; cursor: pointer;';
    pageelement.title = "ЛКМ — открыть в CRM, ПКМ — скопировать ID";
    pageelement.addEventListener('click', () => window.open(`https://crm2.skyeng.ru/persons/${userid}`));
    pageelement.addEventListener('contextmenu', (e) => { e.preventDefault(); copyToClipboard(userid); createAndShowButton('💾 Скопировано'); });
  }
  pageelement.appendChild(span);
}

const observer = new MutationObserver(() => addusersinfo());
observer.observe(document.body, { childList: true, subtree: true });
