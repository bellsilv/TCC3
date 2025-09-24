let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
let feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
let usuarioLogado = null;

function irPara(pagina){
  document.querySelectorAll(".pagina").forEach(sec=>sec.classList.remove("active"));
  document.getElementById(pagina)?.classList.add("active");
  if(pagina==="reservas") atualizarSelectNotebooks();
  if(pagina==="cancelar") carregarCancelamentos();
  if(pagina==="admin" && usuarioLogado==="admin") carregarAdmin();
}


document.getElementById("loginForm")?.addEventListener("submit", e=>{
  e.preventDefault();
  const usuario=document.getElementById("usuario").value;
  const senha=document.getElementById("senha").value;
  const user=usuarios.find(u=>u.usuario===usuario && u.senha===senha);
  const erro=document.getElementById("erroLogin");
  if(user){ usuarioLogado=usuario; erro.textContent=""; alert("Login bem-sucedido!"); liberarMenuUsuario(); irPara("reservas"); }
  else erro.textContent="RA ou senha inválidos!";
});

document.getElementById("cadForm")?.addEventListener("submit", e=>{
  e.preventDefault();
  const usuario=document.getElementById("cad-usuario").value;
  const senha=document.getElementById("cad-senha").value;
  const erro=document.getElementById("erroCad");
  if(usuarios.find(u=>u.usuario===usuario)){ erro.textContent="RA já cadastrado!"; return; }
  usuarios.push({usuario, senha}); localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Cadastro realizado! Faça login."); irPara("login");
});

function liberarMenuUsuario(){
  const menu=document.getElementById("menu");
  if(!document.getElementById("reservasBtn")){
    const btnR=document.createElement("button"); btnR.id="reservasBtn"; btnR.textContent="Reservas"; btnR.onclick=()=>irPara("reservas");
    const btnC=document.createElement("button"); btnC.id="cancelarBtn"; btnC.textContent="Cancelar"; btnC.onclick=()=>irPara("cancelar");
    const btnF=document.createElement("button"); btnF.id="feedbackBtn"; btnF.textContent="Feedback"; btnF.onclick=()=>irPara("feedback");
    menu.appendChild(btnR); menu.appendChild(btnC); menu.appendChild(btnF);
  }
}

function atualizarSelectNotebooks(){
  const select=document.querySelector("#reservaForm select"); if(!select) return;
  select.innerHTML='<option value="">Selecione o notebook</option>';
  const data=document.querySelector("#reservaForm input[type='date']").value;
  for(let i=1;i<=18;i++){
    const option=document.createElement("option"); option.value=i;
    const reservado=reservas.find(r=>r.notebook==i && r.data===data);
    option.textContent=reservado?`Notebook ${i} (Reservado)`:`Notebook ${i}`; if(reservado) option.disabled=true;
    select.appendChild(option);
  }
}

document.getElementById("reservaForm")?.addEventListener("submit", e=>{
  e.preventDefault(); if(!usuarioLogado){ alert("Faça login!"); irPara("login"); return; }
  const nome=e.target.querySelector('input[type="text"]').value;
  const data=e.target.querySelector('input[type="date"]').value;
  const notebook=e.target.querySelector('select').value; if(!notebook){ alert("Selecione um notebook!"); return; }
  reservas.push({id:Date.now(), usuario:usuarioLogado, nome, notebook, data});
  localStorage.setItem("reservas", JSON.stringify(reservas)); alert("Reserva realizada!"); atualizarSelectNotebooks(); carregarReservas();
});

function carregarReservas(){
  const lista=document.getElementById("listaReservas"); lista.innerHTML="";
  const minhas=reservas.filter(r=>r.usuario===usuarioLogado);
  if(minhas.length===0) lista.innerHTML="<li>Nenhuma reserva encontrada.</li>";
  else minhas.forEach(r=>{ const li=document.createElement("li"); li.textContent=`${r.notebook} | ${r.data}`; lista.appendChild(li); });
}

function carregarCancelamentos(){
  const lista=document.getElementById("listaCancelar"); lista.innerHTML="";
  const minhas=reservas.filter(r=>r.usuario===usuarioLogado);
  if(minhas.length===0) lista.innerHTML="<li>Nenhuma reserva para cancelar.</li>";
  else minhas.forEach(r=>{
    const li=document.createElement("li"); li.textContent=`${r.notebook} | ${r.data}`;
    const btn=document.createElement("button"); btn.textContent="Cancelar"; btn.onclick=()=>{ reservas=reservas.filter(x=>x.id!==r.id); localStorage.setItem("reservas", JSON.stringify(reservas)); carregarCancelamentos(); atualizarSelectNotebooks(); };
    li.appendChild(btn); lista.appendChild(li);
  });
}

document.getElementById("adminForm")?.addEventListener("submit", e=>{
  e.preventDefault(); 
  const pass=document.getElementById("adminPass").value; 
  const erro=document.getElementById("erroAdmin");
  if(pass==="admin123"){ 
      usuarioLogado="admin"; 
      erro.textContent=""; 
      document.getElementById("adminArea").classList.remove("hidden"); 
      carregarAdmin(); 
      alert("Bem-vindo administrador!"); 
      irPara("admin");
  } 
  else erro.textContent="Senha incorreta!";
});

function carregarAdmin(){
  const listaR=document.getElementById("adminReservas"); listaR.innerHTML="";
  if(reservas.length===0) listaR.innerHTML="<li>Nenhuma reserva registrada.</li>";
  else reservas.forEach(r=>{ const li=document.createElement("li"); li.textContent=`${r.usuario} → Notebook ${r.notebook} | ${r.data}`; listaR.appendChild(li); });

  const listaF=document.getElementById("adminFeedbacks"); listaF.innerHTML="";
  if(feedbacks.length===0) listaF.innerHTML="<li>Nenhum feedback enviado.</li>";
  else feedbacks.forEach(f=>{ const li=document.createElement("li"); li.innerHTML=`${f.usuario}: ${f.mensagem} | ⭐${f.estrelas}`; listaF.appendChild(li); });
}

let estrelasSelecionadas=0;
document.querySelectorAll(".star").forEach(star=>{
  star.addEventListener("click", ()=>{
    estrelasSelecionadas=star.dataset.value;
    document.querySelectorAll(".star").forEach(s=>s.classList.remove("selecionada"));
    document.querySelectorAll(".star").forEach(s=>{ if(s.dataset.value <= estrelasSelecionadas) s.classList.add("selecionada"); });
  });
});

document.getElementById("feedbackForm")?.addEventListener("submit", e=>{
  e.preventDefault(); if(!usuarioLogado){ alert("Faça login!"); irPara("login"); return; }
  const mensagem=e.target.querySelector("textarea").value;
  feedbacks.push({usuario:usuarioLogado, mensagem, estrelas:estrelasSelecionadas});
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  document.getElementById("msgFeedback").textContent="Feedback enviado!";
  e.target.reset(); estrelasSelecionadas=0;
  document.querySelectorAll(".star").forEach(s=>s.classList.remove("selecionada"));
});
