const feed = document.getElementById("feed");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const sort = document.getElementById("sort");
const randomBtn = document.getElementById("randomBtn");

let allConfessions = [];

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

function render(items) {
  feed.innerHTML = "";
  empty.classList.toggle("hidden", items.length !== 0);

  items.forEach(c => {
    const article = document.createElement("article");

    article.className =
      "confession" + (c.pinned ? " pinned" : "");

    article.innerHTML = `
      ${c.pinned ? `<div class="pin">📌 PINNED CONFESSION</div>` : ""}

      <div class="confession-text">
        ${esc(c.message)}
      </div>

      <div class="meta">
        <span class="tag">${esc(c.category)}</span>
      </div>

      <div class="bottom-meta">
        <span>— ${esc(c.nickname || "Anonymous")}</span>
        <span>${formatDate(c.created_at)}</span>
      </div>
    `;

    feed.appendChild(article);
  });
}

function applyFilters() {
  const q = search.value.trim().toLowerCase();
  const cat = categoryFilter.value;

  let items = allConfessions.filter(c =>
    (!q || c.message.toLowerCase().includes(q)) &&
    (cat === "All categories" || c.category === cat)
  );

  if (sort.value === "oldest") {
    items.sort(
      (a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
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
      "id,message,category,nickname,created_at,pinned"
    )
    .eq("status", "approved")
    .order("created_at", {
      ascending: false
    });

  loading.classList.add("hidden");

  if (error) {
    loading.textContent =
      "Could not load confessions.";
    loading.classList.remove("hidden");

    console.error(error);
    return;
  }

  allConfessions = data || [];
  applyFilters();
}

search.addEventListener("input", applyFilters);

categoryFilter.addEventListener(
  "change",
  applyFilters
);

sort.addEventListener(
  "change",
  applyFilters
);

randomBtn.addEventListener("click", () => {
  if (!allConfessions.length) return;

  const item =
    allConfessions[
      Math.floor(
        Math.random() * allConfessions.length
      )
    ];

  render([item]);

  window.scrollTo({
    top:
      document.querySelector(".feed").offsetTop - 20,
    behavior: "smooth"
  });
});

load();