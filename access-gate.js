/* AkkoFlac access gate — loaded by index.html */
(function(){
  const style=document.createElement('style');
  style.textContent=`
  #akkoflacAccess{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 18% 12%,color-mix(in srgb,var(--accent) 25%,transparent),transparent 42%),radial-gradient(circle at 82% 88%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 40%),var(--bg);backdrop-filter:blur(2px);transition:opacity .45s ease,visibility .45s ease}
  #akkoflacAccess.gone{opacity:0;visibility:hidden;pointer-events:none}
  .ak-access-card{width:min(440px,100%);padding:42px 36px 36px;text-align:center;border-radius:28px;background:rgba(255,255,255,.09);backdrop-filter:blur(40px) saturate(1.4);-webkit-backdrop-filter:blur(40px) saturate(1.4);border:1px solid var(--glass-border-strong);box-shadow:0 24px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.1);animation:akAccessIn .55s cubic-bezier(.2,.8,.2,1)}
  @keyframes akAccessIn{from{opacity:0;transform:translateY(15px) scale(.97)}to{opacity:1;transform:none}}
  .ak-access-kicker{margin-bottom:12px;color:var(--accent);font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase}
  .ak-access-title{margin-bottom:12px;color:var(--text);font-size:clamp(28px,5vw,36px);font-weight:700;letter-spacing:-1px}
  .ak-access-title span{color:var(--accent)}
  .ak-access-text{margin:0 auto 25px;max-width:320px;color:var(--text-soft);font-size:14px;line-height:1.65}
  .ak-access-input{width:100%;height:58px;margin-bottom:11px;border:1px solid var(--glass-border);border-radius:16px;outline:0;background:rgba(255,255,255,.07);color:var(--text);text-align:center;font-size:25px;font-weight:700;letter-spacing:7px;text-transform:uppercase;box-shadow:inset 0 1px 0 rgba(255,255,255,.07);transition:.25s}
  .ak-access-input:focus{border-color:color-mix(in srgb,var(--accent) 65%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
  .ak-access-btn{width:100%;height:52px;border:0;border-radius:16px;background:var(--accent);color:#0a0a0a;font-size:15px;font-weight:700;box-shadow:0 6px 22px var(--accent-glow);cursor:pointer;transition:.2s}
  .ak-access-btn:hover{background:var(--accent-bright);transform:translateY(-2px)}
  .ak-access-btn:disabled{opacity:.55;cursor:wait;transform:none}
  .ak-access-error{min-height:20px;margin:8px 0 2px;color:#ff929f;font-size:12px}
  .ak-access-input.bad{animation:akShake .35s ease;border-color:#ff6f7b}
  @keyframes akShake{25%{transform:translateX(-7px)}50%{transform:translateX(7px)}75%{transform:translateX(-4px)}}
  @media(max-width:760px){.ak-access-card{padding:34px 22px 28px;border-radius:22px}.ak-access-input{height:54px}}
  `;
  document.head.appendChild(style);

  function cookieExists(name){return document.cookie.split(';').some(x=>x.trim().startsWith(name+'='))}
  function mount(){
    if(cookieExists('akkoflac_access')) return;
    document.querySelectorAll('body > :not(#akkoflacAccess)').forEach(el=>{if(el.id!=='akkoflacAccess')el.dataset.akLocked='1'});
    const gate=document.createElement('div');gate.id='akkoflacAccess';
    gate.innerHTML=`<div class="ak-access-card"><div class="ak-access-kicker">Access Required</div><h2 class="ak-access-title">Enter your <span>code</span></h2><p class="ak-access-text">Enter the 5-character access code you received. Each code can only be used once.</p><input id="akAccessInput" class="ak-access-input" maxlength="5" minlength="5" autocomplete="one-time-code" spellcheck="false" placeholder="•••••"><div id="akAccessError" class="ak-access-error"></div><button id="akAccessSubmit" class="ak-access-btn">Unlock AkkoFlac</button></div>`;
    document.body.appendChild(gate);
    const input=gate.querySelector('#akAccessInput'),btn=gate.querySelector('#akAccessSubmit'),err=gate.querySelector('#akAccessError');
    const submit=async()=>{
      const code=input.value.trim().toUpperCase();
      if(code.length!==5){err.textContent='Enter all 5 characters.';input.classList.remove('bad');void input.offsetWidth;input.classList.add('bad');return}
      btn.disabled=true;btn.textContent='Checking…';err.textContent='';
      try{
        const r=await fetch('/.netlify/functions/verify-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
        const d=await r.json();
        if(!r.ok||!d.valid)throw new Error(d.error||'That code is invalid or already used.');
        gate.classList.add('gone');
        setTimeout(()=>gate.remove(),500);
      }catch(e){err.textContent=e.message;input.classList.remove('bad');void input.offsetWidth;input.classList.add('bad');btn.disabled=false;btn.textContent='Unlock AkkoFlac'}
    };
    btn.onclick=submit;input.addEventListener('input',()=>{input.value=input.value.replace(/[^a-z0-9]/gi,'').toUpperCase()});input.addEventListener('keydown',e=>{if(e.key==='Enter')submit()});setTimeout(()=>input.focus(),80);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
