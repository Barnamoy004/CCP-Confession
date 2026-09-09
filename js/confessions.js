const feed = document.getElementById("feed");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const sort = document.getElementById("sort");
const randomBtn = document.getElementById("randomBtn");

let allConfessions = [];

function totalReactions(c) {
  return (c.heart || 0) +
         (c.laugh || 0) +
         (c.sad || 0) +
         (c.eyes || 0) +
         (c.skull || 0);
}

function esc(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

/* Check whether this visitor already reacted to this confession */
function hasReacted(id) {
  return localStorage.getItem(`ccp-reacted-${id}`) !== null;
}

function getReactedType(id) {
  return localStorage.getItem(`ccp-reacted-${id}`);
}

function render(items) {
  feed.innerHTML = "";
  empty.classList.toggle("hidden", items.length !== 0);

  items.forEach(c => {
    const article = document.createElement("article");

    article.className =
      "confession" + (c.pinned ? " pinned" : "");

    article.innerHTML = `
      ${c.pinned ? `<div class="pin">📌 PINNED CONFESSION</div>` : ""}

      <div class="confession-text">${esc(c.message)}</div>

      <div class="meta">
        <span class="tag">${esc(c.category)}</span>
        <span class="tag">${totalReactions(c)} reactions</span>
      </div>

      <div class="reactions">
        ${reactionButton(c, "heart", "❤️")}
        ${reactionButton(c, "laugh", "😂")}
        ${reactionButton(c, "sad", "🥺")}
        ${reactionButton(c, "eyes", "👀")}
        ${reactionButton(c, "skull", "💀")}
      </div>

      <div class="bottom-meta">
        <span>— ${esc(c.nickname || "Anonymous")}</span>
        <span>${formatDate(c.created_at)}</span>
      </div>
    `;

    article.querySelectorAll(".reaction").forEach(btn => {
      btn.addEventListener("click", () => {
        react(c.id, btn.dataset.type);
      });
    });

    feed.appendChild(article);
  });
}

function reactionButton(c, type, emoji) {
  const reactedType = getReactedType(c.id);
  const alreadyReacted = reactedType !== null;

  return `
    <button
      class="reaction ${reactedType === type ? "selected" : ""}"
      data-type="${type}"
      aria-label="React ${emoji}"
      ${alreadyReacted ? "disabled" : ""}
    >
      ${emoji} ${c[type] || 0}
    </button>
  `;
}

function applyFilters() {
  const q = search.value.trim().toLowerCase();
  const cat = categoryFilter.value;

  let items = allConfessions.filter(c =>
    (!q || c.message.toLowerCase().includes(q)) &&
    (cat === "All categories" || c.category === cat)
  );

  if (sort.value === "reacted") {
    items.sort(
      (a, b) => totalReactions(b) - totalReactions(a)
    );
  } else {
    items.sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );
  }

  render(items);
}

async function load() {
  if (!window.ccpReady) {
    loading.textContent =
      "Connect Supabase in js/config.js to load confessions.";
    return;
  }

  const { data, error } = await ccp
    .from("confessions")
    .select(
      "id,message,category,nickname,created_at,pinned,heart,laugh,sad,eyes,skull"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  loading.classList.add("hidden");

  if (error) {
    loading.textContent = "Could not load confessions.";
    loading.classList.remove("hidden");
    console.error(error);
    return;
  }

  allConfessions = data || [];
  applyFilters();
}

async function react(id, type) {

  /* Already reacted to this confession */
  if (hasReacted(id)) {
    return;
  }

  const { error } = await ccp.rpc("add_reaction", {
    confession_id: id,
    reaction_type: type
  });

  if (error) {
    console.error(error);
    return;
  }

  /* Save ONE reaction per confession */
  localStorage.setItem(`ccp-reacted-${id}`, type);

  const item = allConfessions.find(c => c.id === id);

  if (item) {
    item[type] = (item[type] || 0) + 1;
  }

  applyFilters();
}

search.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
sort.addEventListener("change", applyFilters);

randomBtn.addEventListener("click", () => {
  if (!allConfessions.length) return;

  const item =
    allConfessions[
      Math.floor(Math.random() * allConfessions.length)
    ];

  render([item]);

  window.scrollTo({
    top: document.querySelector(".feed").offsetTop - 20,
    behavior: "smooth"
  });
});
load();