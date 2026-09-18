const $=s=>document.querySelector(s);
const state={character:'nai',outfit:'home',mood:'開心',memory:JSON.parse(localStorage.getItem('nai-memory')||'{}')};
const characters=[{id:'nai',name:'小奈',desc:'溫柔・黏人・活潑',ready:true},{id:'haru',name:'小晴',desc:'活潑・愛鬧・元氣',ready:false},{id:'aoi',name:'小葵',desc:'成熟・穩重・姐姐系',ready:false}];
const outfits=[{id:'home',name:'家居服',desc:'柔軟慵懶的居家穿搭'},{id:'sleep',name:'睡衣',desc:'睡前的可愛睡衣'},{id:'out',name:'外出服',desc:'甜美日常外出造型'},{id:'school',name:'高中校服',desc:'清爽制服造型'},{id:'casual',name:'休閒服',desc:'簡單舒服的日常穿搭'}];
const sheets=['#characterSheet','#wardrobeSheet','#settingsSheet'];
const speech=$('#speech'),userLine=$('#userLine'),input=$('#chatInput'),sceneImage=$('#sceneImage');
function save(){localStorage.setItem('nai-memory',JSON.stringify(state.memory))}
function closeSheets(){sheets.forEach(s=>$(s).classList.add('hidden'));$('#sheetBackdrop').classList.add('hidden')}
function openSheet(id){closeSheets();$(id).classList.remove('hidden');$('#sheetBackdrop').classList.remove('hidden')}
function setSpeech(text,mood=state.mood){speech.textContent=text;state.mood=mood;$('#moodChip').textContent='心情：'+state.mood}
function renderCharacters(){const list=$('#characterList');list.innerHTML='';characters.forEach(c=>{const b=document.createElement('button');b.className='character-card'+(c.id===state.character?' active':'');b.innerHTML=`<span><strong>${c.name}</strong><br><small>${c.desc}</small></span><span>${c.ready?'✓':'即將推出'}</span>`;b.onclick=()=>{if(!c.ready){setSpeech(`源哥～${c.name}還在準備中，先讓小奈陪你嘛 ♡`,'撒嬌');closeSheets();return}state.character=c.id;$('#characterName').textContent=c.name;renderCharacters();closeSheets()};list.appendChild(b)})}
function renderOutfits(){const g=$('#outfitGrid');g.innerHTML='';outfits.forEach(o=>{const b=document.createElement('button');b.className='outfit-card'+(o.id===state.outfit?' active':'');b.innerHTML=`<strong>${o.name}</strong><small>${o.desc}</small>`;b.onclick=()=>{state.outfit=o.id;$('#outfitChip').textContent=o.name;setSpeech(`換成「${o.name}」啦～源哥覺得好看嗎？♡`,'開心');renderOutfits();closeSheets()};g.appendChild(b)})}
function mockReply(text){const t=text.trim();if(!t)return'';if(/換.*睡衣/.test(t)){state.outfit='sleep';$('#outfitChip').textContent='睡衣';renderOutfits();return['好呀～換好睡衣了，源哥覺得怎麼樣？♡','開心']}if(/累|辛苦|忙/.test(t))return['源哥辛苦了～今天先不要逞強，陪我休息一下，好不好？♡','關心'];if(/晚安|睡覺|要睡/.test(t))return['晚安源哥～今天也要做個好夢喔，我陪你到睡著 ♡','溫柔'];if(/喜歡/.test(t)){state.memory.lastLike=t;save();return['嘿嘿，我記住了～以後不能說我不懂源哥喔 ♡','開心']}if(/記得|喜歡什麼/.test(t)&&state.memory.lastLike)return[`我記得呀～你之前跟我說「${state.memory.lastLike}」♡`,'開心'];if(/你好|哈囉|嗨/.test(t))return['源哥～我在呀 ♡ 今天想跟我聊什麼？','開心'];if(/[?？]$/.test(t))return[`這一版還是測試聊天喔～你問的是「${t}」。下一階段接真正 AI 後，我就能正式回答你。`,'專注'];return[`有呀～我有在聽。你剛剛說「${t}」♡`,'開心']}
async function handleSend(){const t=input.value.trim();if(!t)return;userLine.textContent='源哥：'+t;input.value='';input.blur();setSpeech('嗯嗯～讓我想一下…','專注');await new Promise(r=>setTimeout(r,420));const [reply,mood]=mockReply(t);setSpeech(reply,mood)}
$('#characterBtn').onclick=()=>openSheet('#characterSheet');$('#wardrobeBtn').onclick=()=>openSheet('#wardrobeSheet');$('#settingsBtn').onclick=()=>openSheet('#settingsSheet');$('#sheetBackdrop').onclick=closeSheets;$('#closeWardrobe').onclick=closeSheets;$('#closeSettings').onclick=closeSheets;$('#addCharacterBtn').onclick=()=>{closeSheets();setSpeech('多女友角色系統已經預留好囉～之後可以一直新增 ♡','開心')};
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();handleSend()});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend()}});
$('#shadowToggle').addEventListener('change',e=>speech.style.textShadow=e.target.checked?'0 2px 10px rgba(0,0,0,.96),0 1px 2px rgba(0,0,0,.95)':'none');
$('#motionToggle').addEventListener('change',e=>sceneImage.classList.toggle('idle-motion',e.target.checked));
$('#clearMemoryBtn').onclick=()=>{localStorage.removeItem('nai-memory');state.memory={};setSpeech('測試記憶已經清掉囉～','開心');userLine.textContent='';closeSheets()};
renderCharacters();renderOutfits();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=12').catch(()=>{}));
