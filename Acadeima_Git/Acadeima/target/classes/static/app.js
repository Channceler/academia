const modules = {
  alunos: {
    title: "Alunos", singular: "aluno", icon: "♙", endpoint: "/api/alunos",
    fields: [
      {name:"nome",label:"Nome completo",required:true,wide:true},
      {name:"email",label:"E-mail",type:"email",required:true},
      {name:"telefone",label:"Telefone"},
      {name:"dataNascimento",label:"Data de nascimento",type:"date"},
      {name:"ativo",label:"Situação",type:"select",options:[["true","Ativo"],["false","Inativo"]]}
    ],
    columns:[["Aluno","nome","person"],["E-mail","email"],["Telefone","telefone"],["Cadastro","dataNascimento","date"],["Situação","ativo","active"]]
  },
  planos: {
    title:"Planos",singular:"plano",icon:"◈",endpoint:"/api/planos",
    fields:[
      {name:"nome",label:"Nome do plano",required:true},
      {name:"valorMensal",label:"Valor mensal (R$)",type:"number",step:"0.01",required:true},
      {name:"duracaoMeses",label:"Duração (meses)",type:"number",required:true},
      {name:"ativo",label:"Situacao",type:"select",options:[["true","Ativo"],["false","Inativo"]]},
      {name:"descricao",label:"Descrição",type:"textarea",wide:true}
    ],
    columns:[["Plano","nome"],["Valor mensal","valorMensal","money"],["Duração","duracaoMeses","months"],["Descrição","descricao"],["Situação","ativo","active"]]
  },
  professores: {
    title:"Professores",singular:"professor",icon:"♧",endpoint:"/api/professores",
    fields:[
      {name:"nome",label:"Nome completo",required:true,wide:true},
      {name:"especialidade",label:"Especialidade",required:true},
      {name:"email",label:"E-mail",type:"email"},
      {name:"telefone",label:"Telefone"}
    ],
    columns:[["Professor","nome","person"],["Especialidade","especialidade"],["E-mail","email"],["Telefone","telefone"]]
  },
  mensalidades: {
    title:"Mensalidades",singular:"mensalidade",icon:"◷",endpoint:"/api/mensalidades",
    fields:[
      {name:"aluno",label:"Aluno",type:"selectRef",ref:"alunos",required:true},
      {name:"plano",label:"Plano",type:"selectRef",ref:"planos",required:true},
      {name:"referencia",label:"Referência (AAAA-MM)",type:"month",required:true},
      {name:"vencimento",label:"Vencimento",type:"date",required:true},
      {name:"valor",label:"Valor (R$)",type:"number",step:"0.01",required:true}
    ],
    columns:[["Aluno","aluno.nome"],["Plano","plano.nome"],["Referência","referencia"],["Vencimento","vencimento","date"],["Valor","valor","money"],["Situação","status","status"]]
  },
  treinos: {
    title:"Treinos",singular:"treino",icon:"⌁",endpoint:"/api/treinos",
    fields:[
      {name:"aluno",label:"Aluno",type:"selectRef",ref:"alunos",required:true},
      {name:"professor",label:"Professor",type:"selectRef",ref:"professores"},
      {name:"titulo",label:"Nome da ficha",required:true,wide:true},
      {name:"exercicios",label:"Exercícios, séries e repetições",type:"textarea",wide:true}
    ],
    columns:[["Ficha","titulo"],["Aluno","aluno.nome"],["Professor","professor.nome"],["Exercicios","exercicios"],["Criado em","criadoEm","date"]]
  },
  avaliacoes: {
    title:"Avaliações físicas",singular:"avaliação",icon:"◎",endpoint:"/api/avaliacoes",
    fields:[
      {name:"aluno",label:"Aluno",type:"selectRef",ref:"alunos",required:true},
      {name:"dataAvaliacao",label:"Data da avaliação",type:"date",required:true},
      {name:"peso",label:"Peso (kg)",type:"number",step:"0.1"},
      {name:"altura",label:"Altura (m)",type:"number",step:"0.01"},
      {name:"percentualGordura",label:"Gordura corporal (%)",type:"number",step:"0.1"},
      {name:"observacoes",label:"Observações",type:"textarea",wide:true}
    ],
    columns:[["Aluno","aluno.nome"],["Data","dataAvaliacao","date"],["Peso","peso","kg"],["Altura","altura","meters"],["Gordura","percentualGordura","percent"],["Observações","observacoes"]]
  }
};

const icons = {inicio:"⌂",...Object.fromEntries(Object.entries(modules).map(([key,value])=>[key,value.icon]))};
let current = "inicio";
let records = [];
let editingId = null;
let toastTimer;
const content = document.querySelector("#content");
const dialog = document.querySelector("#record-dialog");
const form = document.querySelector("#record-form");

document.querySelector("#today").textContent = new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short",year:"numeric"}).format(new Date());
document.querySelector("#navigation").innerHTML = [
  `<button class="nav-item active" data-module="inicio"><span class="nav-icon">${icons.inicio}</span>Visão geral</button>`,
  ...Object.entries(modules).map(([key,module])=>`<button class="nav-item" data-module="${key}"><span class="nav-icon">${module.icon}</span>${module.title}</button>`)
].join("");
document.querySelector("#navigation").addEventListener("click",event=>{
  const button=event.target.closest("[data-module]");
  if(button) navigate(button.dataset.module);
});
document.querySelector("#close-dialog").addEventListener("click",closeDialog);
document.querySelector("#cancel-dialog").addEventListener("click",closeDialog);
document.querySelector("#record-form").addEventListener("submit",saveRecord);
document.querySelector("#content").addEventListener("click",handleActions);
document.querySelector("#content").addEventListener("input",event=>{
  if(event.target.matches(".search")) renderTable(event.target.value);
});

function navigate(module) {
  current=module;
  document.querySelectorAll(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.module===module));
  document.querySelector("#page-title").textContent=module==="inicio"?"Visão geral":modules[module].title;
  if(module==="inicio") renderDashboard();
  else renderModule();
}

async function api(url,options={}) {
  const response=await fetch(url,{headers:{"Content-Type":"application/json"},...options});
  if(!response.ok) {
    let message=`Falha na requisicao (${response.status}).`;
    const responseText=await response.text();
    if(responseText) {
      try {
        const body=JSON.parse(responseText);
        message=body.detail||body.message||body.error||responseText;
      } catch {
        message=responseText;
      }
    }
    throw new Error(message);
  }
  return response.status===204?null:response.json();
}

function showError(error) { notify(error.message||"Nao foi possivel concluir a operacao."); }
function notify(message) {
  const toast=document.querySelector("#toast");
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),3300);
}
function escapeHtml(value) {
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function initials(name) {
  return String(name||"?").split(/\s+/).slice(0,2).map(part=>part.charAt(0)).join("").toUpperCase();
}
function display(value,type) {
  if(value===null||value===undefined||value==="") return "—";
  if(type==="money") return Number(value).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  if(type==="date") return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
  if(type==="months") return `${value} ${Number(value)===1?"mês":"meses"}`;
  if(type==="kg") return `${Number(value).toLocaleString("pt-BR")} kg`;
  if(type==="meters") return `${Number(value).toLocaleString("pt-BR")} m`;
  if(type==="percent") return `${Number(value).toLocaleString("pt-BR")}%`;
  return String(value);
}
function getPath(object,path) { return path.split(".").reduce((value,key)=>value?.[key],object); }

async function renderDashboard() {
  content.innerHTML='<div class="loading">Carregando dados da academia...</div>';
  try {
    const [stats,bills]=await Promise.all([
      api("/api/resumo"),api("/api/mensalidades")
    ]);
    const cards=[
      ["Alunos cadastrados",stats.alunos,"cadastros no sistema","♙"],
      ["Planos disponíveis",stats.planos,"opções de matrícula","◈"],
      ["Professores",stats.professores,"profissionais cadastrados","♧"],
      ["Mensalidades pendentes",stats.mensalidadesPendentes,"aguardando pagamento","◷"]
    ];
    const recent=[...bills].sort((a,b)=>String(b.vencimento).localeCompare(String(a.vencimento))).slice(0,5);
    content.innerHTML=`
      <div class="welcome"><div><h2>Bem-vindo de volta 👋</h2><p>Acompanhe o que está acontecendo na sua academia.</p></div>
      <button class="button button-primary" data-action="new-student">＋ Novo aluno</button></div>
      <div class="stats-grid">${cards.map(([label,value,note,icon])=>`<article class="stat-card"><div class="stat-head"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></article>`).join("")}</div>
      <div class="dashboard-grid">
        <section class="panel"><div class="panel-heading"><h3>Mensalidades recentes</h3><button class="inline-link" data-action="navigate" data-module="mensalidades">Ver todas ↗</button></div>
          ${recent.length?`<div class="table-wrap"><table><thead><tr><th>ALUNO</th><th>VENCIMENTO</th><th>VALOR</th><th>SITUACAO</th></tr></thead><tbody>${recent.map(bill=>`<tr><td><div class="person"><span class="person-mark">${escapeHtml(initials(bill.aluno?.nome))}</span><span class="person-name">${escapeHtml(bill.aluno?.nome)}</span></div></td><td>${display(bill.vencimento,"date")}</td><td>${display(bill.valor,"money")}</td><td>${statusBadge(bill.status)}</td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">Nenhuma mensalidade cadastrada.</div>'}
        </section>
        <section class="panel"><div class="panel-heading"><h3>Acesso rapido</h3><span>ATALHOS</span></div><div class="shortcut-list">
          ${[["alunos","Novo aluno","Adicione um aluno à academia","♙"],["mensalidades","Registrar mensalidade","Controle cobranças e pagamentos","◷"],["treinos","Criar ficha de treino","Monte o treino de um aluno","⌁"],["avaliacoes","Nova avaliação","Registre medidas e evolução","◎"]].map(([module,title,subtitle,icon])=>`<button class="shortcut" data-action="shortcut" data-module="${module}"><span class="shortcut-icon">${icon}</span><span><strong>${title}</strong><small>${subtitle}</small></span></button>`).join("")}
        </div></section>
      </div>`;
  } catch(error) {
    content.innerHTML=`<div class="panel empty">Nao foi possivel carregar o sistema: ${escapeHtml(error.message)}<br><br>Confirme se o backend Spring Boot esta iniciado.</div>`;
  }
}

function statusBadge(status) {
  const paid=status==="PAGA"||status===true;
  const active=status===true;
  const text=status==="PAGA"?"Paga":status==="PENDENTE"?"Pendente":active?"Ativo":"Inativo";
  const css=status==="PENDENTE"?"badge-pending":paid||active?"badge-paid":"badge-inactive";
  return `<span class="badge ${css}">${text}</span>`;
}
async function renderModule(search="") {
  const module=modules[current];
  content.innerHTML='<div class="loading">Carregando registros...</div>';
  try {
    records=await api(module.endpoint);
    const total=records.length;
    content.innerHTML=`<div class="welcome"><div><h2>Gerencie ${module.title.toLowerCase()}</h2><p>Cadastre, consulte e mantenha as informações sempre atualizadas.</p></div>
      <button class="button button-primary" data-action="create">＋ Novo ${module.singular}</button></div>
      <div class="module-toolbar"><span class="eyebrow">${total} ${total===1?"REGISTRO":"REGISTROS"}</span><input class="search" type="search" placeholder="Buscar ${module.title.toLowerCase()}..." aria-label="Buscar registros" value="${escapeHtml(search)}"></div>
      <section class="panel module-panel"><div id="module-table"></div></section>`;
    renderTable(search);
  } catch(error) {
    content.innerHTML=`<div class="panel empty">Erro ao carregar ${module.title.toLowerCase()}: ${escapeHtml(error.message)}</div>`;
  }
}
function renderTable(search="") {
  const module=modules[current];
  const query=search.trim().toLocaleLowerCase("pt-BR");
  const filtered=records.filter(record=>!query||module.columns.some(([,path])=>String(getPath(record,path)??"").toLocaleLowerCase("pt-BR").includes(query)));
  if(!filtered.length) {
    document.querySelector("#module-table").innerHTML='<div class="empty">Nenhum registro encontrado. Use “Novo” para cadastrar.</div>';
    return;
  }
  const headers=module.columns.map(([label])=>`<th>${escapeHtml(label.toUpperCase())}</th>`).join("");
  const rows=filtered.map(record=>`<tr>${module.columns.map(([,path,type])=>`<td>${cellContent(getPath(record,path),type)}</td>`).join("")}<td><div class="row-actions">${current==="mensalidades"&&record.status==="PENDENTE"?`<button class="button button-small button-primary" data-action="pay" data-id="${record.id}">Registrar pagamento</button>`:""}<button class="button button-small button-quiet" data-action="edit" data-id="${record.id}">Editar</button><button class="button button-small button-danger" data-action="delete" data-id="${record.id}">Excluir</button></div></td></tr>`).join("");
  document.querySelector("#module-table").innerHTML=`<div class="table-wrap"><table><thead><tr>${headers}<th>AÇÕES</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function cellContent(value,type) {
  if(type==="person") return `<div class="person"><span class="person-mark">${escapeHtml(initials(value))}</span><span class="person-name">${escapeHtml(value||"—")}</span></div>`;
  if(type==="active") return statusBadge(value===true||value==="true");
  if(type==="status") return statusBadge(value);
  return escapeHtml(display(value,type));
}

async function handleActions(event) {
  const button=event.target.closest("[data-action]");
  if(!button) return;
  const action=button.dataset.action;
  const module=button.dataset.module;
  if(action==="navigate") return navigate(module);
  if(action==="shortcut") { await navigate(module); openForm(); return; }
  if(action==="new-student") { await navigate("alunos"); openForm(); return; }
  if(action==="create") return openForm();
  const id=Number(button.dataset.id);
  if(action==="edit") return openForm(records.find(item=>item.id===id));
  if(action==="delete") {
    const item=records.find(record=>record.id===id);
    const name=item?.nome||item?.titulo||item?.referencia||`#${id}`;
    if(!confirm(`Excluir ${modules[current].singular} ${name}?`)) return;
    try {
      await api(`${modules[current].endpoint}/${id}`,{method:"DELETE"});
      notify("Registro excluido com sucesso.");
      current==="inicio"?renderDashboard():renderModule(document.querySelector(".search")?.value||"");
    } catch(error) { showError(error); }
  }
  if(action==="pay") {
    try {
      await api(`${modules.mensalidades.endpoint}/${id}/pagar`,{method:"PATCH"});
      notify("Pagamento registrado com sucesso.");
      renderModule(document.querySelector(".search")?.value||"");
    } catch(error) { showError(error); }
  }
}

async function openForm(record=null) {
  editingId=record?.id??null;
  const module=modules[current];
  document.querySelector("#dialog-title").textContent=editingId?`Editar ${module.singular}`:`Novo ${module.singular}`;
  let fields;
  try {
    fields=await Promise.all(module.fields.map(async field=>{
      let control="";
      if(field.type==="select") {
        control=`<select id="field-${field.name}" name="${field.name}" ${field.required?"required":""}>${field.options.map(([value,label])=>`<option value="${value}">${label}</option>`).join("")}</select>`;
      } else if(field.type==="selectRef") {
        const options=await api(modules[field.ref].endpoint);
        control=`<select id="field-${field.name}" name="${field.name}" ${field.required?"required":""}><option value="">Selecione</option>${options.map(option=>`<option value="${option.id}">${escapeHtml(option.nome)}</option>`).join("")}</select>`;
      } else if(field.type==="textarea") {
        control=`<textarea id="field-${field.name}" name="${field.name}" ${field.required?"required":""}></textarea>`;
      } else {
        control=`<input id="field-${field.name}" name="${field.name}" type="${field.type||"text"}" ${field.step?`step="${field.step}"`:""} ${field.required?"required":""}>`;
      }
      return `<div class="field ${field.wide?"field-wide":""}"><label for="field-${field.name}">${field.label}</label>${control}</div>`;
    }));
  } catch(error) {
    showError(error);
    return;
  }
  document.querySelector("#form-fields").innerHTML=fields.join("");
  if(!record) {
    dialog.showModal();
    return;
  }
  for(const field of module.fields) {
    const input=form.elements.namedItem(field.name);
    const value=getPath(record,field.name);
    if(!input) continue;
    if(field.type==="selectRef") input.value=value?.id??"";
    else if(field.type==="select"&&typeof value==="boolean") input.value=String(value);
    else input.value=value??"";
  }
  dialog.showModal();
}
function closeDialog() { dialog.close(); editingId=null; form.reset(); }
async function saveRecord(event) {
  event.preventDefault();
  const module=modules[current];
  const payload={};
  for(const field of module.fields) {
    const value=form.elements.namedItem(field.name).value;
    if(field.type==="selectRef") payload[field.name]=value?{id:Number(value)}:null;
    else if(field.type==="number") payload[field.name]=value?Number(value):null;
    else if(field.type==="select"&&(value==="true"||value==="false")) payload[field.name]=value==="true";
    else payload[field.name]=value||null;
  }
  try {
    await api(editingId?`${module.endpoint}/${editingId}`:module.endpoint,{
      method:editingId?"PUT":"POST",body:JSON.stringify(payload)
    });
    closeDialog();
    notify(editingId?"Registro atualizado com sucesso.":"Registro cadastrado com sucesso.");
    if(current==="inicio") renderDashboard();
    else renderModule(document.querySelector(".search")?.value||"");
  } catch(error) { showError(error); }
}

navigate("inicio");
