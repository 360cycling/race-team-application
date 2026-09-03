(function(){
  "use strict";
  var JOSH_EMAIL = "josh@360cycling.co.uk";
  var TEAM_EMAIL = "info@360cycling.co.uk";
  var $ = function(id){ return document.getElementById(id); };

  /* ---------- team view switcher (one team shown at a time) ---------- */
  var swBtns = [].slice.call(document.querySelectorAll(".swbtn"));
  var teamsEye = $("teamseye"), teamsHead = $("teamshead"), teamsLede = $("teamslede");
  var pickJ = $("pickJ"), pickU = $("pickU");
  var viewCopy = {
    junior: { eye: "360 JRT", head: "The Junior Race Team",
      lede: "The junior team, and how to join it for 2027. Use the toggle to view the Under-23 team." },
    u23: { eye: "360 U23", head: "The Under-23 Team",
      lede: "The under-23 team, and how to join it for 2027. Use the toggle to view the junior team." }
  };
  function setView(v, fromUser){
    if (v !== "junior" && v !== "u23") v = "junior";
    document.body.setAttribute("data-view", v);
    swBtns.forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === v)); });
    if (teamsEye) teamsEye.textContent = viewCopy[v].eye;
    if (teamsHead) teamsHead.textContent = viewCopy[v].head;
    if (teamsLede) teamsLede.textContent = viewCopy[v].lede;
    if (v === "junior") pickJ.checked = true; else pickU.checked = true;
    teamChanged();
    try { sessionStorage.setItem("r360view", v); } catch(e){}
    if (fromUser) { try { history.replaceState(null, "", "#" + v); } catch(e){} }
  }
  swBtns.forEach(function(b){
    b.addEventListener("click", function(){ setView(b.getAttribute("data-view"), true); });
  });
  [].slice.call(document.querySelectorAll(".teampick label")).forEach(function(lb){
    lb.addEventListener("keydown", function(ev){
      if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); $(lb.htmlFor).checked = true; teamChanged(); }
    });
  });

  /* ---------- form fields ---------- */
  var f = {
    name: $("f_name"), dob: $("f_dob"), email: $("f_email"), phone: $("f_phone"),
    town: $("f_town"), club: $("f_club"), cover: $("f_cover"),
    gname: $("f_gname"), gcontact: $("f_gcontact")
  };
  var agehint = $("agehint"), teamerr = $("teamerr"), guardian = $("guardian");
  var covercnt = $("covercnt");

  function team(){ return pickJ.checked ? "junior" : (pickU.checked ? "u23" : ""); }
  function racingAge(){
    var v = f.dob.value; if (!v) return null;
    var y = parseInt(v.slice(0, 4), 10);
    if (!y || y < 1970 || y > 2015) return null;
    return 2027 - y;
  }
  function ageCheck(){
    var ra = racingAge(); var t = team();
    agehint.classList.remove("on"); agehint.textContent = "";
    if (ra === null || !t) return;
    var fits = (t === "junior") ? (ra >= 17 && ra <= 18) : (ra >= 18);
    if (!fits) {
      var msg;
      if (t === "junior" && ra >= 19) msg = "Racing age " + ra + " in 2027 normally fits the Under-23 team. You can still apply for the junior team if there is a reason, or switch above.";
      else if (t === "u23" && ra === 17) msg = "Racing age 17 in 2027 fits the Junior team under British Cycling rules. You can still apply for U23 if there is a reason, or switch above.";
      else msg = "British Cycling junior racing starts at racing age 17, and you would be " + ra + " in 2027. You can still apply and explain your situation.";
      agehint.textContent = msg;
      agehint.classList.add("on");
    }
  }
  function actualAge(){
    var v = f.dob.value; if (!v) return null;
    var dob = new Date(v); if (isNaN(dob.getTime())) return null;
    var now = new Date();
    var a = now.getFullYear() - dob.getFullYear();
    var m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
    return a;
  }
  function guardianCheck(){
    var age = actualAge();
    var minor = (age !== null && age < 18);
    guardian.classList.toggle("on", minor);
  }
  function teamChanged(){ if (teamerr) teamerr.style.display = "none"; ageCheck(); guardianCheck(); saveDraft(); }
  f.dob.addEventListener("change", function(){ ageCheck(); guardianCheck(); });
  pickJ.addEventListener("change", teamChanged);
  pickU.addEventListener("change", teamChanged);

  function updCnt(){ if (covercnt) covercnt.textContent = f.cover.value.length + " / 1500"; }
  f.cover.addEventListener("input", updCnt);

  /* ---------- session draft (device only, dies with the tab) ---------- */
  function saveDraft(){
    try {
      var d = { t: team() };
      Object.keys(f).forEach(function(k){ if (f[k]) d[k] = f[k].value; });
      sessionStorage.setItem("r360draft", JSON.stringify(d));
    } catch(e){}
  }
  function loadDraft(){
    try {
      var raw = sessionStorage.getItem("r360draft"); if (!raw) return;
      var d = JSON.parse(raw);
      Object.keys(f).forEach(function(k){ if (f[k] && d[k]) f[k].value = d[k]; });
      updCnt();
    } catch(e){}
  }
  Object.keys(f).forEach(function(k){ if (f[k]) f[k].addEventListener("input", saveDraft); });
  loadDraft(); updCnt();

  /* ---------- CV attach ---------- */
  var cvzone = $("cvzone"), cvinput = $("f_cv"), cvfileEl = $("cvfile");
  var cvName = "";
  var OK_EXT = /\.(pdf|docx?)$/i;
  function setCv(file){
    if (!file) return;
    if (!OK_EXT.test(file.name)) { cvMsg("That does not look like a PDF or Word file. Save your CV as .pdf, .doc or .docx and try again.", false); return; }
    if (file.size > 5 * 1024 * 1024) { cvMsg("That file is over 5 MB. Export a smaller PDF and try again.", false); return; }
    cvName = file.name;
    cvzone.classList.add("has");
    cvfileEl.classList.add("on");
    cvfileEl.style.color = "";
    cvfileEl.textContent = "Ready: " + file.name;
  }
  function cvMsg(msg, ok){
    cvfileEl.classList.add("on");
    cvfileEl.style.color = ok ? "#7DE8B5" : "#FFB3AE";
    cvfileEl.textContent = msg;
    if (!ok) { cvzone.classList.remove("has"); cvName = ""; }
  }
  cvzone.addEventListener("click", function(){ cvinput.click(); });
  cvzone.addEventListener("keydown", function(ev){ if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); cvinput.click(); } });
  cvinput.addEventListener("change", function(){ setCv(cvinput.files && cvinput.files[0]); });
  ["dragenter","dragover"].forEach(function(t){ cvzone.addEventListener(t, function(ev){ ev.preventDefault(); cvzone.classList.add("drag"); }); });
  ["dragleave","drop"].forEach(function(t){ cvzone.addEventListener(t, function(ev){ ev.preventDefault(); cvzone.classList.remove("drag"); }); });
  cvzone.addEventListener("drop", function(ev){
    var files = ev.dataTransfer && ev.dataTransfer.files;
    if (files && files.length) {
      // put the dropped file into the actual input so it is submitted with the form
      try { cvinput.files = files; } catch(e){
        try { var dt = new DataTransfer(); dt.items.add(files[0]); cvinput.files = dt.files; } catch(e2){}
      }
      setCv(files[0]);
    }
  });

  /* ---------- validation ---------- */
  function markErr(el, on){
    var fld = el.closest(".fld");
    if (fld) fld.classList.toggle("err", on);
    if (on) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
  }
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function validate(){
    var ok = true, firstBad = null;
    if (!team()) { teamerr.style.display = "block"; ok = false; firstBad = document.querySelector(".teampick"); }
    var req = [
      ["name", function(v){ return v.trim().length >= 2; }],
      ["dob", function(v){ if (!v) return false; var d = new Date(v); if (isNaN(d.getTime())) return false; var y = d.getFullYear(); return y >= 1965 && y <= 2014 && d <= new Date(); }],
      ["email", validEmail],
      ["town", function(v){ return v.trim().length >= 2; }],
      ["cover", function(v){ return v.trim().length >= 30; }]
    ];
    if (guardian.classList.contains("on")) {
      req.push(["gname", function(v){ return v.trim().length >= 2; }]);
      req.push(["gcontact", function(v){ return v.trim().length >= 5; }]);
    }
    req.forEach(function(pair){
      var el = f[pair[0]]; if (!el) return;
      var good = pair[1](el.value);
      markErr(el, !good);
      if (!good) { ok = false; if (!firstBad) firstBad = el; }
    });
    ["c_privacy", "c_accurate"].forEach(function(id){
      var box = $(id);
      var row = box.closest(".consent");
      row.classList.toggle("err", !box.checked);
      if (!box.checked) { ok = false; if (!firstBad) firstBad = box; }
    });
    if (!ok && firstBad) {
      if (firstBad.scrollIntoView) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      try { firstBad.focus({ preventScroll: true }); } catch(e){}
    }
    return ok;
  }
  Object.keys(f).forEach(function(k){ if (f[k]) f[k].addEventListener("input", function(){ markErr(f[k], false); }); });
  ["c_privacy", "c_accurate"].forEach(function(id){
    $(id).addEventListener("change", function(){ $(id).closest(".consent").classList.remove("err"); });
  });

  /* ---------- submit: native POST to the form service, with the CV attached ---------- */
  var form = $("appform");
  var sendbtn = $("sendbtn");
  form.addEventListener("submit", function(ev){
    if (!validate()) { ev.preventDefault(); return; }
    var ra = racingAge();
    // a readable subject line, and a racing-age line so it's in the email
    var subj = $("f_subject");
    if (subj) subj.value = "2027 " + (team() === "junior" ? "Junior (JRT)" : "U23") + " application - " + f.name.value.trim();
    if (ra !== null && !$("f_ragefield")) {
      var h = document.createElement("input");
      h.type = "hidden"; h.id = "f_ragefield"; h.name = "Racing age in 2027"; h.value = String(ra);
      form.appendChild(h);
    }
    if (!$("f_teamfield")) {
      var t = document.createElement("input");
      t.type = "hidden"; t.id = "f_teamfield"; t.name = "Applying for"; t.value = (team() === "junior" ? "Junior (360 JRT)" : "Under-23");
      form.appendChild(t);
    } else { $("f_teamfield").value = (team() === "junior" ? "Junior (360 JRT)" : "Under-23"); }
    // hand off; the browser POSTs to FormSubmit which emails the team and redirects back
    sendbtn.disabled = true;
    sendbtn.textContent = "Sending…";
    try { sessionStorage.removeItem("r360draft"); } catch(e){}
    // let the native submit proceed
  });

  /* show the confirmation after FormSubmit redirects back with ?sent=1 */
  (function(){
    if (/[?&]sent=1/.test(location.search)) {
      var pane = $("sentpane");
      if (pane) {
        pane.classList.add("on");
        setTimeout(function(){ pane.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200);
      }
      // tidy the URL so a refresh does not re-show it
      try { history.replaceState(null, "", location.pathname + "#apply"); } catch(e){}
    }
  })();

  /* ---------- back to top ---------- */
  var totop = $("totop");
  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(e){}
  window.addEventListener("scroll", function(){
    totop.classList.toggle("on", window.scrollY > 600);
  }, { passive: true });
  totop.addEventListener("click", function(){
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  /* ---------- owner edit mode (open the page with ?edit) ----------
     Lets the team retype any wording directly on the page, then download
     the updated index.html to upload back to the GitHub repository.
     Purely client-side: visitors' edits never persist or affect anyone. */
  function enableEditMode(){
    var bar = document.createElement("div");
    bar.id = "editbar";
    bar.setAttribute("contenteditable", "false");
    bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99;background:#E11414;color:#fff;padding:12px 18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-family:'IBM Plex Mono',monospace;font-size:12px";
    bar.innerHTML = '<b style="letter-spacing:.08em;text-transform:uppercase">Editing mode</b>' +
      '<span>Click any text and retype it. Nothing is public until you upload the downloaded file to GitHub (repo &rarr; index.html &rarr; replace).</span>' +
      '<span style="margin-left:auto;display:flex;gap:8px">' +
      '<button id="ed_dl" style="background:#fff;color:#0B0D12;border:0;border-radius:3px;padding:8px 14px;font-family:inherit;font-weight:600;cursor:pointer">Download HTML</button>' +
      '<button id="ed_copy" style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:3px;padding:8px 14px;font-family:inherit;cursor:pointer">Copy HTML</button>' +
      '<button id="ed_exit" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:3px;padding:8px 14px;font-family:inherit;cursor:pointer">Exit</button></span>';
    document.body.appendChild(bar);
    document.body.contentEditable = "true";
    document.body.style.paddingBottom = "70px";
    function serialize(){
      var clone = document.documentElement.cloneNode(true);
      var b = clone.querySelector("#editbar"); if (b) b.parentNode.removeChild(b);
      var bodyEl = clone.querySelector("body");
      // strip runtime state so the exported file is a clean default snapshot
      bodyEl.removeAttribute("contenteditable");
      bodyEl.removeAttribute("data-view");
      bodyEl.removeAttribute("style");
      [].slice.call(clone.querySelectorAll("[contenteditable]")).forEach(function(el){ el.removeAttribute("contenteditable"); });
      // reset the team headings to their canonical (junior) defaults
      var ce = clone.querySelector("#teamseye"); if (ce) ce.textContent = "360 JRT";
      var ch = clone.querySelector("#teamshead"); if (ch) ch.textContent = "The Junior Race Team";
      var cl = clone.querySelector("#teamslede"); if (cl) cl.textContent = "The Junior Race Team page: the blue kit and how to join it for 2027. Use the toggle to view the Under-23 team.";
      // reset controls and transient UI
      [].slice.call(clone.querySelectorAll(".swbtn")).forEach(function(el){ el.setAttribute("aria-pressed", String(el.getAttribute("data-view") === "junior")); });
      [].slice.call(clone.querySelectorAll(".fld.err")).forEach(function(el){ el.classList.remove("err"); });
      [].slice.call(clone.querySelectorAll(".consent.err")).forEach(function(el){ el.classList.remove("err"); });
      var ah = clone.querySelector("#agehint"); if (ah) { ah.textContent = ""; ah.classList.remove("on"); }
      var g = clone.querySelector("#guardian.on"); if (g) g.classList.remove("on");
      var cz = clone.querySelector("#cvzone"); if (cz) cz.classList.remove("has");
      var cf = clone.querySelector("#cvfile"); if (cf) { cf.textContent = ""; cf.classList.remove("on"); }
      var ap = clone.querySelector("#sentpane.on"); if (ap) ap.classList.remove("on");
      return "<!doctype html>\n" + clone.outerHTML;
    }
    $("ed_dl").addEventListener("click", function(){
      var blob = new Blob([serialize()], { type: "text/html" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "index.html";
      document.body.appendChild(a); a.click(); a.remove();
    });
    $("ed_copy").addEventListener("click", function(){
      var t = serialize();
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t);
      var btn = $("ed_copy");
      btn.textContent = "Copied"; setTimeout(function(){ btn.textContent = "Copy HTML"; }, 1600);
    });
    $("ed_exit").addEventListener("click", function(){
      try { location.href = location.pathname; } catch(e){}
    });
  }
  if (/[?&]edit/.test(location.search)) enableEditMode();

  /* ---------- initial view ---------- */
  var initView = "junior";
  var h0 = (location.hash || "").replace("#", "");
  if (h0 === "junior" || h0 === "u23") initView = h0;
  else { try { var sv = sessionStorage.getItem("r360view"); if (sv === "junior" || sv === "u23") initView = sv; } catch(e){} }
  setView(initView, false);
})();
