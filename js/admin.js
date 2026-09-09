const loginCard = document.getElementById("loginCard");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const pendingFeed = document.getElementById("pendingFeed");
const adminEmpty = document.getElementById("adminEmpty");
const logoutBtn = document.getElementById("logoutBtn");

function esc(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}
function dateText(date) {
  return new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(date));
}

async function checkSession() {
  if (!window.ccpReady) {
    loginStatus.textContent = "Connect Supabase in js/config.js first.";
    return;
  }
  const { data } = await ccp.auth.getSession();
  if (data.session) showPanel();
}

function showPanel() {
  loginCard.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  loadPending();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginStatus.textContent = "Logging in...";
  const { error } = await ccp.auth.signInWithPassword({
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  });
  if (error) {
    loginStatus.textContent = error.message;
    return;
  }
  loginStatus.textContent = "";
  showPanel();
});

logoutBtn.addEventListener("click", async () => {
  await ccp.auth.signOut();
  location.reload();
});

async function loadPending() {
  const { data, error } = await ccp.from("confessions")
    .select("*")
    .eq("status","pending")
    .order("created_at",{ascending:true});

  pendingFeed.innerHTML = "";
  if (error) {
    pendingFeed.innerHTML = `<p class="empty">Could not load pending confessions.</p>`;
    console.error(error);
    return;
  }
  adminEmpty.classList.toggle("hidden", data.length !== 0);

  data.forEach(c => {
    const card = document.createElement("article");
    card.className = "confession";
    card.innerHTML = `
      <div class="meta">
        <span class="tag">${esc(c.category)}</span>
        <span class="tag">${dateText(c.created_at)}</span>
      </div>
      <div class="confession-text">${esc(c.message)}</div>
      <div class="bottom-meta"><span>— ${esc(c.nickname || "Anonymous")}</span></div>
      <div class="admin-actions">
        <button class="btn btn-approve" data-action="approve">Approve</button>
        <button class="btn btn-danger" data-action="reject">Reject</button>
      </div>`;
    card.querySelector('[data-action="approve"]').onclick = () => moderate(c.id, "approved");
    card.querySelector('[data-action="reject"]').onclick = () => moderate(c.id, "rejected");
    pendingFeed.appendChild(card);
  });
}

async function moderate(id, status) {
  const { error } = await ccp.from("confessions").update({status}).eq("id",id);
  if (error) {
    alert("Action failed. Check your admin/RLS setup.");
    console.error(error);
    return;
  }
  loadPending();
}

checkSession();
