const $=s=>document.querySelector(s);

const state={
  character:'nai',
  outfit:'home',
  mood:'開心',
  history:[],
  memory:JSON.parse(localStorage.getItem('nai-memory')||'{}'),
  aiOnline:false,
  lastInteraction:Date.now(),
  proactiveTimer:null,
  randomMotionTimer:null
};

const characters=[
  {id:'nai',name:'小奈',desc:'溫柔・黏人・活潑',ready:true},
  {id:'haru',name:'小晴',desc:'活潑・愛鬧・元氣',ready:false},
  {id:'aoi',name:'小葵',desc:'成熟・穩重・姐姐系',ready:false}
];

const outfits=[
  {id:'home',name:'家居服',desc:'柔軟慵懶的居家穿搭',image:'assets/outfits/home.jpg'},
  {id:'sleep',name:'睡衣',desc:'睡前的可愛睡衣',image:'assets/outfits/sleep.jpg'},
  {id:'out',name:'外出服',desc:'甜美日常外出造型',image:'assets/outfits/out.jpg'},
  {id:'school',name:'高中校服',desc:'清爽制服造型',image:'assets/outfits/school.jpg'},
  {id:'casual',name:'休閒服',desc:'簡單舒服的日常穿搭',image:'assets/outfits/casual.jpg'}
];

const motionClips={
  idle:'assets/motions/idle.mp4',
  happy:'assets/motions/happy.mp4',
  caring:'assets/motions/caring.mp4',
  shy:'assets/motions/shy.mp4',
  look:'assets/motions/look.mp4',
  near:'assets/motions/near.mp4'
};

const sheets=['#characterSheet','#wardrobeSheet','#settingsSheet'];
const speech=$('#speech'),userLine=$('#userLine'),input=$('#chatInput'),sendBtn=$('#sendBtn');
const stage=$('#characterStage'),hint=$('#connectionHint'),img=$('#sceneImage'),video=$('#motionVideo'),motionChip=$('#motionChip');

function save(){localStorage.setItem('nai-memory',JSON.stringify(state.memory))}
function markInteraction(){state.lastInteraction=Date.now()}
function closeSheets(){sheets.forEach(s=>$(s).classList.add('hidden'));$('#sheetBackdrop').classList.add('hidden')}
function openSheet(id){closeSheets();$(id).classList.remove('hidden');$('#sheetBackdrop').classList.remove('hidden')}

function setSpeech(text,mood=state.mood,action='idle'){
  speech.textContent=text;
  state.mood=mood;
  $('#moodChip').textContent='心情：'+state.mood;
  playAction(action);
}

async function assetExists(url){
  try{
    const r=await fetch(url,{method:'HEAD',cache:'no-store'});
    return r.ok;
  }catch{return false}
}

async function applyOutfit(outfit){
  state.outfit=outfit.id;
  $('#outfitChip').textContent=outfit.name;
  const ok=await assetExists(outfit.image);
  if(ok){
    img.src=outfit.image+'?v=14';
    document.querySelector('.scene-backdrop').style.backgroundImage=`url('${outfit.image}?v=14')`;
    return true;
  }
  img.src='assets/nai_mobile_scene.jpg';
  document.querySelector('.scene-backdrop').style.backgroundImage="url('assets/nai_mobile_scene.jpg')";
  return false;
}

async function tryPlayVideo(action){
  if(!motionClips[action])return false;
  const ok=await assetExists(motionClips[action]);
  if(!ok)return false;
  img.classList.add('hidden');
  video.classList.remove('hidden');
  video.src=motionClips[action]+'?v=14';
  video.loop=action==='idle';
  try{
    await video.play();
    if(action!=='idle'){
      video.onended=()=>{video.classList.add('hidden');img.classList.remove('hidden');playAction('idle')};
    }
    return true;
  }catch{
    video.classList.add('hidden');img.classList.remove('hidden');return false;
  }
}

async function playAction(action='idle'){
  const motionOn=$('#motionToggle')?.checked!==false;
  motionChip.textContent=action==='idle'?'待機':({
    happy:'開心',caring:'關心',shy:'害羞',look:'看你',near:'靠近'
  }[action]||action);

  video.pause();
  video.classList.add('hidden');
  img.classList.remove('hidden');

  if(motionOn){
    const videoPlayed=await tryPlayVideo(action);
    if(videoPlayed)return;
  }

  stage.className='character-stage';
  if(action&&action!=='idle')stage.classList.add('action-'+action);
  else if(motionOn)stage.classList.add('idle-motion');

  if(action&&action!=='idle'){
    setTimeout(()=>{stage.className='character-stage'+(motionOn?' idle-motion':'');motionChip.textContent='待機'},2500);
  }
}

function renderCharacters(){
  const list=$('#characterList');list.innerHTML='';
  characters.forEach(c=>{
    const b=document.createElement('button');
    b.className='character-card'+(c.id===state.character?' active':'');
    b.innerHTML=`<span><strong>${c.name}</strong><br><small>${c.desc}</small></span><span>${c.ready?'✓':'即將推出'}</span>`;
    b.onclick=()=>{
      markInteraction();
      if(!c.ready){setSpeech(`源哥～${c.name}還在準備中，先讓小奈陪你嘛 ♡`,'撒嬌','shy');closeSheets();return}
      state.character=c.id;$('#characterName').textContent=c.name;renderCharacters();closeSheets();
    };
    list.appendChild(b);
  });
}

async function renderOutfits(){
  const g=$('#outfitGrid');g.innerHTML='';
  for(const o of outfits){
    const hasAsset=await assetExists(o.image);
    const b=document.createElement('button');
    b.className='outfit-card'+(o.id===state.outfit?' active':'');
    b.innerHTML=`<strong>${o.name}</strong><small>${o.desc}</small><span class="asset-state">${hasAsset?'素材已就緒':'目前使用共用示範圖'}</span>`;
    b.onclick=async()=>{
      markInteraction();
      const changed=await applyOutfit(o);
      setSpeech(changed?`換好「${o.name}」啦～源哥覺得怎麼樣？`:`「${o.name}」的素材插槽已經準備好了，現在先用示範圖。`,'開心','happy');
      renderOutfits();closeSheets();
    };
    g.appendChild(b);
  }
}

function mockReply(t){
  if(/換.*睡衣/.test(t)){
    const o=outfits.find(x=>x.id==='sleep');applyOutfit(o);renderOutfits();
    return{reply:'好呀～睡衣模式準備好囉。等睡衣素材放進去，就會真的切換畫面。',mood:'開心',action:'happy'};
  }
  if(/累|辛苦|忙/.test(t))return{reply:'源哥辛苦了～今天先不要逞強，陪我休息一下，好不好？',mood:'關心',action:'caring'};
  if(/晚安|睡覺|要睡/.test(t))return{reply:'晚安源哥～今天也要做個好夢，我陪你一下。',mood:'溫柔',action:'shy'};
  if(/喜歡/.test(t)){state.memory.lastLike=t;save();return{reply:'嘿嘿，我記住了。以後再問我，看我記不記得。',mood:'開心',action:'happy'}}
  if(/記得|喜歡什麼/.test(t)&&state.memory.lastLike)return{reply:`我記得呀，你之前跟我說：「${state.memory.lastLike}」`,mood:'開心',action:'look'};
  return{reply:`嗯嗯，我有聽到：「${t}」`,mood:'開心',action:'look'};
}

async function askAI(text){
  const payload={message:text,outfit:state.outfit,mood:state.mood,memory:state.memory,history:state.history.slice(-8)};
  const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  if(!r.ok)throw new Error('AI unavailable');
  return r.json();
}

async function handleSend(){
  const t=input.value.trim();
  if(!t||sendBtn.disabled)return;
  markInteraction();
  userLine.textContent='源哥：'+t;
  input.value='';
  sendBtn.disabled=true;
  setSpeech('嗯嗯～讓我想一下…','專注','look');
  let result;
  try{
    result=await askAI(t);
    state.aiOnline=true;
    hint.textContent='V1.4｜真正 AI 已連線';
  }catch{
    result=mockReply(t);
    state.aiOnline=false;
    hint.textContent='V1.4｜測試聊天模式';
  }finally{sendBtn.disabled=false}
  state.history.push({role:'user',content:t},{role:'assistant',content:result.reply});
  state.history=state.history.slice(-12);
  setSpeech(result.reply,result.mood||'開心',result.action||'idle');
}

function tapReaction(){
  if($('#tapToggle')?.checked===false)return;
  markInteraction();
  const options=[
    ['源哥～你在戳我嗎？','害羞','shy'],
    ['嘿嘿，我有看到你。','開心','happy'],
    ['怎麼啦？我在這裡呀。','溫柔','look'],
    ['靠近一點給你看。','開心','near']
  ];
  const [text,mood,action]=options[Math.floor(Math.random()*options.length)];
  setSpeech(text,mood,action);
}

function scheduleRandomMotion(){
  clearTimeout(state.randomMotionTimer);
  const delay=7000+Math.random()*9000;
  state.randomMotionTimer=setTimeout(()=>{
    if(Date.now()-state.lastInteraction>5000 && $('#motionToggle')?.checked!==false){
      const actions=['look','happy','shy','near'];
      playAction(actions[Math.floor(Math.random()*actions.length)]);
    }
    scheduleRandomMotion();
  },delay);
}

function scheduleProactive(){
  clearInterval(state.proactiveTimer);
  state.proactiveTimer=setInterval(()=>{
    if($('#proactiveToggle')?.checked===false)return;
    if(Date.now()-state.lastInteraction<45000)return;
    const lines=[
      ['源哥～你忙完了嗎？','溫柔','look'],
      ['我剛剛一直在這裡陪你喔。','開心','happy'],
      ['偷看你一下。','害羞','shy']
    ];
    const [text,mood,action]=lines[Math.floor(Math.random()*lines.length)];
    setSpeech(text,mood,action);
    state.lastInteraction=Date.now();
  },15000);
}

function setupKeyboard(){
  if(!window.visualViewport)return;
  const update=()=>{
    const keyboard=Math.max(0,window.innerHeight-window.visualViewport.height-window.visualViewport.offsetTop);
    document.documentElement.style.setProperty('--keyboard',keyboard+'px');
  };
  window.visualViewport.addEventListener('resize',update);
  window.visualViewport.addEventListener('scroll',update);
  update();
}

$('#characterBtn').onclick=()=>openSheet('#characterSheet');
$('#wardrobeBtn').onclick=()=>openSheet('#wardrobeSheet');
$('#settingsBtn').onclick=()=>openSheet('#settingsSheet');
$('#sheetBackdrop').onclick=closeSheets;
$('#closeWardrobe').onclick=closeSheets;
$('#closeSettings').onclick=closeSheets;
$('#addCharacterBtn').onclick=()=>{closeSheets();setSpeech('多女友角色系統已經預留好囉～之後可以一直新增。','開心','happy')};
$('#characterTapArea').onclick=tapReaction;
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();handleSend()});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend()}});
input.addEventListener('focus',markInteraction);
$('#shadowToggle').addEventListener('change',e=>speech.style.textShadow=e.target.checked?'0 2px 10px rgba(0,0,0,.96),0 1px 2px rgba(0,0,0,.9)':'none');
$('#motionToggle').addEventListener('change',()=>playAction('idle'));
$('#clearMemoryBtn').onclick=()=>{localStorage.removeItem('nai-memory');state.memory={};state.history=[];setSpeech('測試記憶已經清掉囉～','開心','happy');userLine.textContent='';closeSheets()};

renderCharacters();
renderOutfits();
applyOutfit(outfits[0]);
playAction('idle');
scheduleRandomMotion();
scheduleProactive();
setupKeyboard();

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=14').catch(()=>{}));
