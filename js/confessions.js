const feed = document.getElementById("feed");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const sort = document.getElementById("sort");
const randomBtn = document.getElementById("randomBtn");

let allConfessions = [];

/* -------------------------
   Helpers
------------------------- */

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

/* -------------------------
   Popup
------------------------- */

function createPopup() {
  if (document.getElementById("confessionModal")) return;

  const modal = document.createElement("div");

  modal.id = "confessionModal";
  modal.className = "confession-modal hidden";

  modal.innerHTML = `
    <div class="confession-modal-backdrop"></div>

    <div class="confession-modal-box">
      <button class="modal-close" aria-label="Close">×</button>

      <div class="modal-pin"></div>

      <div class="modal-message"></div>

      <div class="modal-meta">
        <span class="modal-category"></span>
        <span class="modal-date"></span>
      </div>

      <div class="modal-bottom">
        <span class="modal-author"></span>

        <button class="modal-share">
          ↗ Share
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  modal.querySelector(".modal-close").addEventListener("click", close);

  modal.querySelector(".confession-modal-backdrop")
    .addEventListener("click", close);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
  });
}

function openPopup(c) {
  createPopup();

  const modal = document.getElementById("confessionModal");

  modal.querySelector(".modal-message").textContent =
    c.message || "";

  modal.querySelector(".modal-category").textContent =
    c.category || "Other";

  modal.querySelector(".modal-date").textContent =
    formatDate(c.created_at);

  modal.querySelector(".modal-author").textContent =
    `— ${c.nickname || "Anonymous"}`;

  const pin = modal.querySelector(".modal-pin");

  if (c.pinned) {
    pin.textContent = "📌 PINNED CONFESSION";
    pin.style.display = "block";
  } else {
    pin.textContent = "";
    pin.style.display = "none";
  }

  const shareButton = modal.querySelector(".modal-share");

  shareButton.onclick = async () => {
    const shareText =
      `${c.message}\n\n— ${c.nickname || "Anonymous"}`;

    const shareUrl =
      `${window.location.origin}${window.location.pathname}#${c.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "CCP Confession",
          text: shareText,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(
          `${shareText}\n${shareUrl}`
        );

        shareButton.textContent = "✓ Copied";

        setTimeout(() => {
          shareButton.textContent = "↗ Share";
        }, 1500);
      }
    } catch (error) {
      console.log("Share cancelled");
    }
  };

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/* -------------------------
   Render
------------------------- */

function render(items) {
  feed.innerHTML = "";

  empty.classList.toggle(
    "hidden",
    items.length !== 0
  );

  items.forEach(c => {
    const article = document.createElement("article");

    article.className =
      "confession" + (c.pinned ? " pinned" : "");

    article.innerHTML = `
      ${
        c.pinned
          ? `<div class="pin">📌 PINNED CONFESSION</div>`
          : ""
      }

      <div class="confession-text">
        ${esc(c.message)}
      </div>

      <div class="meta">
        <span class="tag">
          ${esc(c.category)}
        </span>
      </div>

      <div class="bottom-meta">
        <span>
          — ${esc(c.nickname || "Anonymous")}
        </span>

        <span>
          ${formatDate(c.created_at)}
        </span>
      </div>
    `;

    /* Click confession → Popup */
    article.addEventListener("click", () => {
      openPopup(c);
    });

    feed.appendChild(article);
  });
}

/* -------------------------
   Filters
------------------------- */

function applyFilters() {
  const q = search.value.trim().toLowerCase();
  const cat = categoryFilter.value;

  let items = allConfessions.filter(c =>
    (!q ||
      c.message.toLowerCase().includes(q)) &&
    (cat === "All categories" ||
      c.category === cat)
  );

  if (sort.value === "reacted") {
    /* Reaction removed.
       Keep sorting option working
       by treating all as equal. */
    items.sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );
  } else {
    items.sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );
  }

  render(items);
}

/* -------------------------
   Load confessions
------------------------- */

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

/* -------------------------
   Search / Filter
------------------------- */

search.addEventListener(
  "input",
  applyFilters
);

categoryFilter.addEventListener(
  "change",
  applyFilters
);

sort.addEventListener(
  "change",
  applyFilters
);

/* -------------------------
   Random
------------------------- */

randomBtn.addEventListener("click", () => {
  if (!allConfessions.length) return;

  const item =
    allConfessions[
      Math.floor(
        Math.random() *
        allConfessions.length
      )
    ];

  openPopup(item);
});

/* -------------------------
   Start
------------------------- */

createPopup();
load();