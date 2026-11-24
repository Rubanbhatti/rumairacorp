'use strict';
const config=window.RUMAIRA,b=config.business,products=config.products;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeImage(s){return /^(assets\/[a-z0-9_./ -]+|data:image\/(png|jpeg|webp|gif|svg\+xml);base64,[a-z0-9+/=]+)$/i.test(s||'')?s:'assets/mark.svg'}
function socialURL(s){try{const u=new URL(s);return u.protocol==='https:'?u.href:null}catch{return null}}
const wa='https://wa.me/'+b.whatsapp.replace(/\D/g,'');
$$('[data-email]').forEach(a=>{a.textContent=b.email;a.href='mailto:'+b.email});
$$('[data-phone]').forEach(a=>{a.textContent=b.phone;a.href='tel:'+b.phone.replace(/[^+0-9]/g,'')});
$$('[data-whatsapp]').forEach(a=>{a.href=wa+'?text='+encodeURIComponent('Hello Rumaira Corp, I would like to enquire about jewellery, bags, shoes, apparel and bulk orders.');a.removeAttribute('target')});
$$('[data-socials]').forEach(el=>{for(const [key,title] of [['instagram','Instagram'],['facebook','Facebook']]){const u=socialURL(b[key]);const a=document.createElement(u?'a':'span');a.textContent=title+(u?' →':' · coming soon');if(u){a.href=u;a.target='_blank';a.rel='noopener noreferrer'}else a.className='social-pending';el.append(a)}});
$('#year').textContent=new Date().getFullYear();
$('#menu-toggle').onclick=()=>{const open=$('#navigation').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',open);$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation')};
$$('nav a').forEach(a=>a.onclick=()=>{$('#navigation').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false')});
let category='All designs',search='',bag={};
try{const saved=JSON.parse(localStorage.getItem('rumaira-enquiry')||'{}');for(const p of products){const n=saved[p.id];if(Number.isInteger(n)&&n>0&&n<=10000)bag[p.id]=n}}catch{}
function persist(){try{localStorage.setItem('rumaira-enquiry',JSON.stringify(bag))}catch{}$('#bag-count').textContent=Object.keys(bag).length}
let toastTimer;function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2500)}
function add(id){bag[id]=Math.min((bag[id]||0)+1,10000);persist();toast('Added to your quote')}
const cats=['All designs',...new Set(products.map(p=>p.category))];
$('#filters').innerHTML=cats.map(c=>`<button type="button" aria-pressed="${c===category}" class="${c===category?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
function chooseCategory(value){category=value;$$('#filters [data-category]').forEach(a=>{const selected=a.dataset.category===value;a.classList.toggle('active',selected);a.setAttribute('aria-pressed',selected)});renderProducts()}
$('#filters').onclick=e=>{const btn=e.target.closest('[data-category]');if(btn)chooseCategory(btn.dataset.category)};
$('#category-cards').innerHTML=cats.slice(1).map(c=>{const first=products.find(p=>p.category===c);return `<button class="category-card" data-browse="${esc(c)}"><img src="${esc(safeImage(first.image))}" alt="" width="240" height="240"><span>${esc(c)} <b>→</b></span><small>${products.filter(p=>p.category===c).length} designs</small></button>`}).join('');
$('#category-cards').onclick=e=>{const btn=e.target.closest('[data-browse]');if(!btn)return;search='';$('#search').value='';chooseCategory(btn.dataset.browse);$('#collection').scrollIntoView({behavior:'smooth'})};
$('#search').oninput=e=>{search=e.target.value.toLowerCase().trim();renderProducts()};
function renderProducts(){const shown=products.filter(p=>(category==='All designs'||p.category===category)&&`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(search));$('#products').innerHTML=shown.map(p=>`<article><button class="product-image" data-detail="${esc(p.id)}" aria-label="View ${esc(p.name)}"><img src="${esc(safeImage(p.image))}" alt="${esc(p.sample?'Illustration of '+p.name:p.name)}" width="700" height="700" loading="lazy">${p.sample?'<span>DESIGN CONCEPT</span>':''}</button><div class="product-info"><div class="top"><h3>${esc(p.name)}</h3><button class="add-button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to quote">Add to quote +</button></div><p>${esc(p.tagline)}</p><button class="detail-link" data-detail="${esc(p.id)}">View details →</button><div class="product-meta"><span>${esc(p.category)} · ${esc(p.id)}</span><span>Quote per ${p.unit==='pairs'?'pair':'piece'}</span></div></div></article>`).join('');$('#no-results').hidden=shown.length>0;$('#sample-note').hidden=!products.some(p=>p.sample)}
$('#products').onclick=e=>{const addBtn=e.target.closest('[data-add]'),detail=e.target.closest('[data-detail]');if(addBtn)add(addBtn.dataset.add);if(detail)showProduct(detail.dataset.detail)};
function showProduct(id){const p=products.find(p=>p.id===id);$('#product-detail').innerHTML=`<div class="detail-grid"><img src="${esc(safeImage(p.image))}" alt="${esc(p.name)}"><div><p class="eyebrow">${esc(p.category)} · ${esc(p.id)}</p><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p>${p.sample?'<p class="fine">Sample concept illustration. Confirm actual materials, dimensions, colours and availability before ordering.</p>':''}<p>Request a quote for your quantity and destination. Customisation can be discussed.</p><button class="btn" data-detail-add="${esc(p.id)}">Add to quote +</button></div></div>`;$('#product-dialog').showModal()}
$('#product-detail').onclick=e=>{const a=e.target.closest('[data-detail-add]');if(a)add(a.dataset.detailAdd)};
$$('[data-close]').forEach(btn=>btn.onclick=()=>btn.closest('dialog').close());
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
function renderBag(){const selected=products.filter(p=>bag[p.id]);$('#bag-items').innerHTML=selected.length?selected.map(p=>`<div class="bag-row"><img src="${esc(safeImage(p.image))}" alt=""><div><h3>${esc(p.name)}</h3><small>${esc(p.id)} · Quote requested</small></div><label>${p.unit==='pairs'?'Pairs':'Pieces'}<input type="number" min="1" max="10000" step="1" value="${bag[p.id]}" data-qty="${esc(p.id)}" aria-label="Quantity for ${esc(p.name)}"></label><button data-remove="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">×</button></div>`).join(''):'<p>Your quote list is empty. Close this window, then choose “Add to quote” on a design you like.</p>';$('#bag-form').hidden=!selected.length;$('#bag-status').textContent=''}
$('#open-bag').onclick=()=>{renderBag();$('#bag-dialog').showModal()};
$('#bag-items').onclick=e=>{const a=e.target.closest('[data-remove]');if(a){delete bag[a.dataset.remove];persist();renderBag()}};
$('#bag-items').addEventListener('input',e=>{if(!e.target.matches('[data-qty]'))return;const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=10000){bag[e.target.dataset.qty]=n;persist()}});
$('#bag-items').addEventListener('change',e=>{if(!e.target.matches('[data-qty]'))return;const n=Number(e.target.value);if(!Number.isInteger(n)||n<1||n>10000){e.target.value=bag[e.target.dataset.qty];toast('Choose a whole quantity from 1 to 10,000');return}bag[e.target.dataset.qty]=n;persist()});
function send(message,email,status){
 const url=email?'mailto:'+b.email+'?subject='+encodeURIComponent('Rumaira Corp — product enquiry')+'&body='+encodeURIComponent(message):wa+'?text='+encodeURIComponent(message);
 $('#prepared-message').value=message;$('#send-link').href=url;$('#send-link').textContent=email?'Open email app →':'Open WhatsApp →';$('#send-help').textContent=email?'Open your email app, then review and send your enquiry.':'Open WhatsApp, then press Send there to share your enquiry.';$('#copy-status').textContent='';status.textContent='Your message is ready to review. It has not been sent.';$('#send-dialog').showModal();
}
$('#copy-message').onclick=async()=>{try{if(!navigator.clipboard)throw Error('Unavailable');await navigator.clipboard.writeText($('#prepared-message').value);$('#copy-status').textContent='Message copied. Paste it into WhatsApp or email.'}catch{$('#prepared-message').focus();$('#prepared-message').select();$('#copy-status').textContent='Message selected. Use your device’s Copy command, then paste into WhatsApp or email.'}};

$('#contact-form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const text=`Hello Rumaira Corp,\n\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nInterest: ${d.get('interest')}\nDestination: ${d.get('country')}\n\n${d.get('message')}`;send(text,e.submitter?.value==='email',$('#contact-status'))};
$('#bag-form').onsubmit=e=>{e.preventDefault();if(!Object.keys(bag).length)return;const d=new FormData(e.target);const text=`Hello Rumaira Corp, I would like a quote.\n\nName: ${d.get('name')}\nDestination: ${d.get('country')}\n\n${products.filter(p=>bag[p.id]).map(p=>`${p.id} — ${p.name}: ${bag[p.id]} ${p.unit==='pairs'?'pairs':'pieces'}${p.sample?' (design concept)':''}`).join('\n')}\n\nNotes: ${d.get('notes')||'None'}\n\nPlease confirm availability, materials, pricing, payment terms and shipping.`;send(text,e.submitter?.value==='email',$('#bag-status'))};
persist();renderProducts();

// Bring buyers back to their selection after adding a product.
const oldAdd=add;add=function(id){oldAdd(id);document.querySelector('#open-bag').classList.add('has-items')};
