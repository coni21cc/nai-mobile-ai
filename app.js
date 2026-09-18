const $=s=>document.querySelector(s);
const state={character:'nai',outfit:'home',mood:'開心',memory:JSON.parse(localStorage.getItem('nai-memory')||'{}')};
const characters=[
{id:'nai',name:'小奈',desc:'溫柔・黏人・活潑',ready:true},
{id:'haru',name:'小晴',desc:'活潑・愛鬧・元氣',ready:false},
{id:'aoi',name:'小葵',desc:'成熟・穩重・姐姐系',ready:false}
];
const outfits=[
{id:'home',name:'家居服',desc:'柔軟慵懶的居家穿搭'},
{id:'sleep',name:'睡衣',desc:'睡前的可愛睡衣'},
{id:'out',name:'外出服',desc:'甜美日常外出造型'},
{id:'school',name:'高中校服',desc:'清爽制服造型'},
{id:'casual',name:'休閒服',desc:'簡單舒服的日常穿搭'}
];
const sheets=['#characterSheet','#wardrobeSheet','#settingsSheet'];
function save(){localStorage.setItem('nai-memory',JSON.stringify(state.memory))}
function closeSheets(){sheets.forEach(s=>$(s).classList.add('hidden'));$('#sheetBackdrop').classList.add('hidden')}
function openSheet(id){closeSheets();$(id).classList.remove('hidden');$('#sheetBackdrop').classList.remove('hidden')}
function renderCharacters(){const list=$('#characterList');list.innerHTML='';characters.forEach(c=>{const b=document.createElement('button');b.className='character-card'+(c.id===state.character?' active':'');b.innerHTML=`<span><strong>${c.name}</strong><br><small>${c.desc}</small></span><span>${c.ready?'✓':'即將推出'}</span>`;b.onclick=()=>{if(!c.ready){$('#speech').textContent=`源哥～${c.name}還在準備中，先讓小奈陪你嘛 ♡`;closeSheets();return}state.character=c.id;$('#characterName').textContent=c.name;renderCharacters();closeSheets()};list.appendChild(b)})}
function renderOutfits(){const g=$('#outfitGrid');g.innerHTML='';outfits.forEach(o=>{const b=document.createElement('button');b.className='outfit-card'+(o.id===state.outfit?' active':'');b.innerHTML=`<strong>${o.name}</strong><small>${o.desc}</small>`;b.onclick=()=>{state.outfit=o.id;$('#outfitChip').textContent=o.name;$('#speech').textContent=`換成「${o.name}」啦～源哥覺得好看嗎？♡`;renderOutfits();closeSheets()};g.appendChild(b)})}
function mockReply(text){const t=text.trim();if(!t)return'';if(/累|辛苦|忙/.test(t)){state.mood='關心';return'源哥辛苦了～先陪我休息一下，好不好？♡'}if(/晚安|睡/.test(t)){state.mood='溫柔';return'晚安源哥～今天也要做個好夢喔，我陪你到睡著 ♡'}if(/喜歡/.test(t)){state.memory.lastLike=t;save();state.mood='開心';return'嘿嘿，我記住了～以後不能說我不懂源哥喔 ♡'}if(/記得|喜歡什麼/.test(t)&&state.memory.lastLike){return`我記得呀～你之前跟我說「${state.memory.lastLike}」♡`}if(/換.*睡衣/.test(t)){state.outfit='sleep';$('#outfitChip').textContent='睡衣';renderOutfits();return'好呀～換好睡衣了，源哥不准偷笑喔 ♡'}state.mood='開心';return`源哥～我有在聽呀。你剛剛說「${t}」♡`}
$('#characterBtn').onclick=()=>openSheet('#characterSheet');$('#wardrobeBtn').onclick=()=>openSheet('#wardrobeSheet');$('#settingsBtn').onclick=()=>openSheet('#settingsSheet');$('#sheetBackdrop').onclick=closeSheets;$('#closeWardrobe').onclick=closeSheets;$('#closeSettings').onclick=closeSheets;$('#addCharacterBtn').onclick=()=>{closeSheets();$('#speech').textContent='多女友角色系統已經預留好囉～之後可以一直新增 ♡'};
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const i=$('#chatInput');const r=mockReply(i.value);if(r){$('#speech').textContent=r;$('#moodChip').textContent='心情：'+state.mood;i.value=''}});
$('#shadowToggle').addEventListener('change',e=>$('#speech').style.textShadow=e.target.checked?'0 2px 14px rgba(0,0,0,.9),0 1px 2px rgba(0,0,0,.9)':'none');
$('#clearMemoryBtn').onclick=()=>{localStorage.removeItem('nai-memory');state.memory={};$('#speech').textContent='測試記憶已經清掉囉～';closeSheets()};
renderCharacters();renderOutfits();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
