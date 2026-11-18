/* 广应科图书馆：通用交互脚本 */

/* 模块一：导航交互 */
(function(){
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".main-nav");
  const navToggle = document.querySelector(".nav-toggle");

  function onScroll(){ if(header){ header.classList.toggle("scrolled", window.scrollY > 40); } }
  window.addEventListener("scroll", onScroll); onScroll();
  if(navToggle && nav){ navToggle.addEventListener("click", () => nav.classList.toggle("show")); }

  document.querySelectorAll(".has-sub .menu-btn").forEach(btn => {
    btn.addEventListener("click", function(e){
      e.preventDefault();
      const li = this.closest(".has-sub");
      document.querySelectorAll(".has-sub").forEach(item => { if(item !== li) item.classList.remove("open"); });
      li.classList.toggle("open");
    });
  });
  document.addEventListener("click", function(e){
    if(!e.target.closest(".has-sub")) document.querySelectorAll(".has-sub").forEach(item => item.classList.remove("open"));
  });

  /* 模块二：首页轮播图 */
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".dot"));
  let index = 0;
  function showSlide(i){
    if(!slides.length) return;
    index = (i + slides.length) % slides.length;
    slides.forEach((s,n) => s.classList.toggle("active", n === index));
    dots.forEach((d,n) => d.classList.toggle("active", n === index));
  }
  dots.forEach((dot,i) => dot.addEventListener("click", () => showSlide(i)));
  if(slides.length){ setInterval(() => showSlide(index + 1), 4500); showSlide(0); }
})();

/* 模块三：我的书架（阅读计划） */
(function(){
  const input = document.querySelector("#taskInput");
  const addBtn = document.querySelector("#addTask");
  const pendingList = document.querySelector("#pendingList");
  const doneList = document.querySelector("#doneList");
  const tabs = document.querySelectorAll("[data-tab]");
  const panels = document.querySelectorAll("[data-panel]");
  if(!input || !addBtn) return;
  const seed = ["借阅一本专业基础教材并完成目录梳理","阅读导赏长文并摘录三个要点","完成一次数据库检索练习","参加一次读书活动或整理主题书单"];
  let pending = JSON.parse(localStorage.getItem("libraryPending") || "null") || seed;
  let done = JSON.parse(localStorage.getItem("libraryDone") || "[]");
  function save(){ localStorage.setItem("libraryPending", JSON.stringify(pending)); localStorage.setItem("libraryDone", JSON.stringify(done)); }
  function item(text, actionText, fn){
    const li = document.createElement("li");
    li.innerHTML = `<span>${text}</span>`;
    const btn = document.createElement("button");
    btn.textContent = actionText;
    btn.addEventListener("click", fn);
    li.appendChild(btn);
    return li;
  }
  function render(){
    pendingList.innerHTML = ""; doneList.innerHTML = "";
    if(!pending.length) pendingList.innerHTML = `<div class="empty">暂无待读书目，可以继续添加阅读计划。</div>`;
    if(!done.length) doneList.innerHTML = `<div class="empty">完成阅读后会显示在这里。</div>`;
    pending.forEach((text,i)=> pendingList.appendChild(item(text,"完成",()=>{ done.unshift(text); pending.splice(i,1); save(); render(); })));
    done.forEach((text,i)=> doneList.appendChild(item(text,"移回",()=>{ pending.unshift(text); done.splice(i,1); save(); render(); })));
  }
  addBtn.addEventListener("click", ()=>{
    const value = input.value.trim();
    if(value.length < 2){ input.focus(); return; }
    pending.unshift(value); input.value = ""; save(); render();
  });
  input.addEventListener("keydown", e => { if(e.key === "Enter") addBtn.click(); });
  tabs.forEach(tab => tab.addEventListener("click", ()=>{
    tabs.forEach(t => t.classList.remove("active")); tab.classList.add("active");
    panels.forEach(p => p.style.display = p.dataset.panel === tab.dataset.tab ? "block" : "none");
  }));
  render();
})();

/* 模块四：读者登记（表单验证） */
(function(){
  const form = document.querySelector("#registerForm");
  if(!form) return;
  const rules = {
    username: { re:/^[\u4e00-\u9fa5A-Za-z0-9_]{2,30}$/, msg:"用户名需为2-30位中文、字母、数字或下划线。" },
    password: { re:/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_!@#$%^&*]{6,16}$/, msg:"密码需为6-16位，并同时包含字母和数字。" },
    phone: { re:/^1[3-9]\d{9}$/, msg:"请输入有效的11位中国大陆手机号。" },
    email: { re:/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, msg:"请输入有效邮箱地址，如 name@example.com。" }
  };
  function check(input){
    const hint = form.querySelector(`[data-hint="${input.name}"]`);
    if(input.name === "confirmPassword"){
      const password = form.querySelector("#password").value.trim();
      const ok = input.value.trim() !== "" && input.value.trim() === password;
      hint.textContent = ok ? "两次密码一致。" : "两次输入的密码不一致，请重新输入。";
      hint.className = "hint " + (ok ? "ok" : "error");
      return ok;
    }
    const rule = rules[input.name];
    if(!rule) return true;
    const ok = rule.re.test(input.value.trim());
    hint.textContent = ok ? "格式正确。" : rule.msg;
    hint.className = "hint " + (ok ? "ok" : "error");
    return ok;
  }
  form.querySelectorAll("input").forEach(input => input.addEventListener("input", () => {
    check(input);
    if(input.name === "password"){
      const confirm = form.querySelector("#confirmPassword");
      if(confirm.value.trim()) check(confirm);
    }
  }));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = Array.from(form.querySelectorAll("input")).every(check);
    const result = document.querySelector("#registerResult");
    result.textContent = ok ? "读者登记信息校验通过（本地演示，未上传服务器）。" : "请根据提示修改信息后再提交。";
    result.className = "hint " + (ok ? "ok" : "error");
  });
})();
