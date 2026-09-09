const form = document.getElementById("confessionForm");
const message = document.getElementById("message");
const counter = document.getElementById("counter");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

message.addEventListener("input", () => counter.textContent = message.value.length);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";

  if (!window.ccpReady) {
    statusEl.textContent = "Database is not connected yet. Add your Supabase keys in js/config.js.";
    return;
  }

  const text = message.value.trim();
  const category = document.getElementById("category").value;
  const nickname = document.getElementById("nickname").value.trim() || "Anonymous";

  if (text.length < 3) {
    statusEl.textContent = "Please write a little more.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  const { error } = await ccp.from("confessions").insert({
    message: text,
    category,
    nickname,
    status: "pending"
  });

  submitBtn.disabled = false;
  submitBtn.textContent = "Send anonymously";

  if (error) {
    statusEl.textContent = "Could not send right now. Please try again.";
    console.error(error);
    return;
  }

  form.reset();
  counter.textContent = "0";
  statusEl.textContent = "Sent anonymously. It will appear after moderation.";
});
