/* ══════════════════════════════════════════════════
   AMPARTABOX 2.0 — chatbot.js
══════════════════════════════════════════════════ */
(function () {
  const body  = document.getElementById('chatBody');
  const inp   = document.getElementById('chatIn');
  const btn   = document.getElementById('chatBtn');
  const prog  = document.getElementById('progFill');
  if (!body) return;

  const state = { step:0, data:{nombre:'',email:'',sede:'',tipo:'',fecha:'',hora:'',notas:''} };

  const AV = `<div class="msg-av"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg></div>`;

  const STEPS = [
    { key:null, intro:true, msgs:['¡Hola! Soy el asistente de <strong>AmpartaBox</strong>. Estoy acá para ayudarte a reservar tu espacio en Córdoba.','¿Cómo te llamás?'], input:'text', ph:'Tu nombre...', pct:10 },
    { key:'nombre', getMsg:d=>`Perfecto, <strong>${d.nombre}</strong>. ¿Cuál es tu email para enviarte la confirmación?`, input:'text', ph:'tu@email.com', pct:24, validate:v=>/\S+@\S+\.\S+/.test(v)||'Por favor ingresá un email válido.' },
    { key:'email', getMsg:()=>'¿En cuál de nuestras sedes querés reservar?', input:'options', opts:[{l:'Chacabuco 357 — P3',v:'chacabuco'},{l:'Av. Illia 520 — P7',v:'illia'},{l:'Humberto Primo — P1',v:'humberto'}], pct:40 },
    { key:'sede', getMsg:d=>{const n={chacabuco:'Chacabuco 357',illia:'Av. Illia 520',humberto:'Humberto Primo'}[d.sede];return`Buenísima elección, <strong>${n}</strong> es una de nuestras favoritas.\n\n¿Qué tipo de espacio necesitás?`;}, input:'options', opts:[{l:'Escritorio compartido',v:'shared'},{l:'Área privada',v:'privado'},{l:'Sala de reunión',v:'sala'}], pct:55 },
    { key:'tipo', getMsg:()=>'¿Para qué fecha?', input:'text', ph:'Ej: 28/03/2026', pct:68 },
    { key:'fecha', getMsg:()=>'Abrimos de <strong>8 a 22 hs</strong>. ¿En qué horario?', input:'options', opts:[{l:'8:00 — 12:00',v:'mañana'},{l:'12:00 — 17:00',v:'tarde'},{l:'17:00 — 22:00',v:'noche'},{l:'Día completo',v:'full'}], pct:82 },
    { key:'hora', getMsg:()=>'¿Querés aclarar algo más? (Escribí <em>"no"</em> si ya está todo.)', input:'text', ph:'Consultas o comentarios...', pct:93 },
    { key:'notas', getMsg:()=>null, input:'done', pct:100 },
  ];

  const setPct = p => prog.style.width = p + '%';
  const scroll = () => body.scrollTop = body.scrollHeight;
  const wait   = ms => new Promise(r => setTimeout(r, ms));

  function addBot(html) {
    const d = document.createElement('div');
    d.className = 'msg bot';
    d.innerHTML = AV + `<div class="msg-b">${html.replace(/\n/g,'<br>')}</div>`;
    body.appendChild(d); scroll();
  }
  function addUser(txt) {
    const d = document.createElement('div');
    d.className = 'msg user';
    d.innerHTML = `<div class="msg-b">${txt}</div>`;
    body.appendChild(d); scroll();
  }
  function showTyping() {
    const d = document.createElement('div');
    d.className = 'msg bot'; d.id = 'typing';
    d.innerHTML = AV + `<div class="msg-b"><div class="typing"><span></span><span></span><span></span></div></div>`;
    body.appendChild(d); scroll(); return d;
  }
  function rmTyping() { document.getElementById('typing')?.remove(); }

  async function say(html, delay=600) {
    showTyping(); await wait(delay); rmTyping(); addBot(html);
  }
  function setInput(s) { inp.disabled=false; btn.disabled=false; inp.placeholder=s.ph||'Escribí...'; inp.focus(); }
  function disableInput() { inp.disabled=true; btn.disabled=true; inp.placeholder='Seleccioná una opción...'; }

  function showChips(opts, onPick) {
    const wrap = document.createElement('div');
    wrap.className = 'chips-wrap';
    opts.forEach(o => {
      const c = document.createElement('div');
      c.className='chip'; c.textContent=o.l;
      c.onclick=()=>{ wrap.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); setTimeout(()=>{ onPick(o.v,o.l); wrap.remove(); },300); };
      wrap.appendChild(c);
    });
    body.appendChild(wrap); scroll();
  }

  async function run(i) {
    const s = STEPS[i]; setPct(s.pct);
    if (s.intro) {
      await say(s.msgs[0], 800); await say(s.msgs[1], 500); setInput(s); return;
    }
    const prev = STEPS[i-1];
    if (prev.getMsg) { const m=prev.getMsg(state.data); if(m) await say(m,700); }
    if (s.input==='done') { await finalize(); return; }
    if (s.input==='options') {
      disableInput();
      showChips(s.opts, async(v,l)=>{ state.data[s.key]=v; addUser(l); state.step++; await run(state.step); });
    } else { setInput(s); }
  }

  async function send() {
    const v = inp.value.trim(); if(!v) return;
    const s = STEPS[state.step];
    if (s.validate) { const e=s.validate(v); if(e!==true){ await say(e,350); return; } }
    if (s.key) state.data[s.key]=v;
    addUser(v); inp.value=''; disableInput();
    state.step++; await run(state.step);
  }

  async function finalize() {
    setPct(100);
    const sL={chacabuco:'Chacabuco 357 — P3',illia:'Av. Illia 520 — P7',humberto:'Humberto Primo — P1'};
    const tL={shared:'Escritorio compartido',privado:'Área privada',sala:'Sala de reunión'};
    const hL={mañana:'8:00–12:00',tarde:'12:00–17:00',noche:'17:00–22:00',full:'Día completo'};
    await say(`Perfecto, <strong>${state.data.nombre}</strong>. Acá está tu reserva:`, 700);
    await say(`<strong>Sede:</strong> ${sL[state.data.sede]}<br><strong>Espacio:</strong> ${tL[state.data.tipo]}<br><strong>Fecha:</strong> ${state.data.fecha}<br><strong>Horario:</strong> ${hL[state.data.hora]}<br><strong>Email:</strong> ${state.data.email}${state.data.notas&&state.data.notas.toLowerCase()!=='no'?'<br><strong>Nota:</strong> '+state.data.notas:''}`, 300);
    await wait(700);
    const d=document.createElement('div'); d.className='done';
    d.innerHTML=`<div class="done-ico"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div><h3>¡Reserva enviada!</h3><p>Confirmación en <strong>${state.data.email}</strong>.<br>¡Hasta pronto, ${state.data.nombre}!</p>`;
    body.appendChild(d); scroll();
    inp.disabled=true; btn.disabled=true; inp.placeholder='Reserva completada';
  }

  window.chatSend = send;
  inp.addEventListener('keydown', e=>{ if(e.key==='Enter') send(); });
  run(0);
})();