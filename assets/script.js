/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Theme (persisted) ---------- */
const themeBtn = $("#themeBtn");
const root = document.documentElement;

function setTheme(next) {
  if (next) root.setAttribute("data-theme", next);
  else root.removeAttribute("data-theme");
  localStorage.setItem("theme", next || "dark");
}

const stored = localStorage.getItem("theme");
if (stored === "light") setTheme("light");
if (stored === "dark") setTheme("dark");

themeBtn?.addEventListener("click", () => {
  const isLight = root.getAttribute("data-theme") === "light";
  setTheme(isLight ? "dark" : "light");
});

/* ---------- Active chapter highlighting ---------- */
const pages = $$(".page");
const tocLinks = $$(".toc__link");

const byId = new Map(tocLinks.map(a => [a.getAttribute("href"), a]));

const io = new IntersectionObserver((entries) => {
  // Pick the most visible page
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;

  const id = "#" + visible.target.id;
  tocLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === id));
}, { threshold: [0.25, 0.35, 0.5, 0.65] });

pages.forEach(p => io.observe(p));

/* ---------- Reading progress bar ---------- */
const progressBar = $("#progressBar");
function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ---------- Keyboard nav: J/K to move chapters ---------- */
function scrollToPage(idx) {
  const clamped = Math.max(0, Math.min(pages.length - 1, idx));
  pages[clamped].scrollIntoView({ behavior: "smooth", block: "start" });
}

function currentPageIndex() {
  // find first page whose top is below a small threshold
  const y = window.scrollY;
  let best = 0;
  let bestDist = Infinity;
  pages.forEach((p, i) => {
    const top = p.getBoundingClientRect().top + y;
    const dist = Math.abs(top - y - 60);
    if (dist < bestDist) { best = i; bestDist = dist; }
  });
  return best;
}

window.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

  if (e.key.toLowerCase() === "j") {
    e.preventDefault();
    scrollToPage(currentPageIndex() + 1);
  }
  if (e.key.toLowerCase() === "k") {
    e.preventDefault();
    scrollToPage(currentPageIndex() - 1);
  }
});

/* ---------- Contact form: copy message (static site friendly) ---------- */
const form = $("#contactForm");
const hint = $("#formHint");
const year = $("#year");

if (year) year.textContent = new Date().getFullYear();

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const name = (fd.get("name") || "").toString().trim();
  const email = (fd.get("email") || "").toString().trim();
  const message = (fd.get("message") || "").toString().trim();

  const payload =
`Hi Gayathri,
Name: ${name}
Email: ${email}

Message:
${message}
`;

  try {
    await navigator.clipboard.writeText(payload);
    if (hint) hint.textContent = "Copied! Now paste this into an email or LinkedIn message.";
    form.reset();
  } catch {
    if (hint) hint.textContent = "Could not copy automatically. Please copy manually from the message box.";
    alert(payload);
  }
});


