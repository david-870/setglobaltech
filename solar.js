const ham = document.getElementById("hamburger");
const menu = document.getElementById("mobile-menu");
const form = document.getElementById("quote-form");

const WHATSAPP_NUMBER = "2348112677662";

function whatsappUrl(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

document.querySelectorAll(".quote-link").forEach((link) => {
  const packageName = link.dataset.package;
  const note = link.dataset.note || "";
  const lines = ["Hello SetGlobalTech,", ""];
  if (packageName) {
    lines.push(`I would like a quote for this option: ${packageName}.`);
    if (note) lines.push("", note);
  } else {
    lines.push("I would like a solar quote. Please recommend a system for my appliances and budget.");
  }
  link.href = whatsappUrl(lines.join("\n"));
  link.target = "_blank";
  link.rel = "noopener";
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    ham.classList.remove("active");
    ham.setAttribute("aria-expanded", "false");
  });
});

ham.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  ham.classList.toggle("active", open);
  ham.setAttribute("aria-expanded", String(open));
});

window.addEventListener("scroll", () => {
  document.querySelector(".nav").classList.toggle("scrolled", window.scrollY > 40);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    menu.classList.remove("open");
    ham.classList.remove("active");
    ham.setAttribute("aria-expanded", "false");
  });
});

function applianceCounts() {
  return [...form.querySelectorAll('input[name="appliance"]')]
    .map((input) => {
      const ratingInput = form.querySelector(`input[name="rating"][data-for="${input.dataset.name}"]`);
      return {
        label: input.closest(".qty-row").querySelector(".qty-name").textContent.trim(),
        singular: input.dataset.name,
        count: Math.max(0, Number(input.value) || 0),
        rating: ratingInput ? ratingInput.value.trim() : "",
        unit: ratingInput ? ratingInput.dataset.unit : "",
      };
    })
    .filter((item) => item.count > 0 || item.rating);
}

function rowValue(row, name) {
  const field = row.querySelector(`[name="${name}"]`);
  return field ? field.value.trim() : "";
}

function airConditioners() {
  return [...form.querySelectorAll('[data-kind="ac"]')]
    .map((row) => ({
      count: Math.max(0, Number(rowValue(row, "ac-count")) || 0),
      hp: rowValue(row, "ac-hp"),
      room: rowValue(row, "ac-room"),
    }))
    .filter((item) => item.count > 0 || item.hp || item.room);
}

function officeMachines() {
  return [...form.querySelectorAll('[data-kind="office"]')]
    .map((row) => {
      const type = rowValue(row, "office-type");
      const other = rowValue(row, "office-other");
      return {
        name: type === "Other" ? other : type,
        count: Math.max(0, Number(rowValue(row, "office-count")) || 0),
        watts: rowValue(row, "office-watts"),
      };
    })
    .filter((item) => item.name || item.count > 0 || item.watts);
}

function businessMachines() {
  return [...form.querySelectorAll('[data-kind="business"]')]
    .map((row) => ({
      name: rowValue(row, "biz-name"),
      count: Math.max(0, Number(rowValue(row, "biz-count")) || 0),
      watts: rowValue(row, "biz-watts"),
    }))
    .filter((item) => item.name || item.count > 0 || item.watts);
}

function formatSimple(item) {
  const noun = item.count === 1 ? item.singular : item.label;
  const amount = item.count ? `${item.count} ${noun}` : noun;
  if (!item.rating) return amount;
  const rated = `${item.rating}${item.unit}`;
  return item.count > 1 ? `${amount}, ${rated} each` : `${amount}, ${rated}`;
}

function formatRated(item, unit) {
  const name = item.name || "Machine";
  const amount = item.count ? `${item.count} ${name}` : name;
  if (!item.watts && !item.hp) return amount;
  const rated = item.hp ? `${item.hp}HP` : `${item.watts}${unit}`;
  return item.count > 1 ? `${amount}, ${rated} each` : `${amount}, ${rated}`;
}

function bindRepeaters() {
  form.querySelectorAll(".load-add").forEach((button) => {
    button.addEventListener("click", () => {
      const list = document.getElementById(button.dataset.target);
      const copy = list.firstElementChild.cloneNode(true);
      copy.querySelectorAll("input").forEach((input) => { input.value = ""; });
      copy.querySelectorAll("select").forEach((select) => { select.value = ""; });
      const other = copy.querySelector(".office-other");
      if (other) other.classList.remove("show");
      list.appendChild(copy);
    });
  });

  form.addEventListener("click", (event) => {
    const remove = event.target.closest(".load-remove");
    if (!remove) return;
    const row = remove.closest(".load-row");
    const list = row.parentElement;
    if (list.children.length === 1) {
      row.querySelectorAll("input").forEach((input) => { input.value = ""; });
      row.querySelectorAll("select").forEach((select) => { select.value = ""; });
      const other = row.querySelector(".office-other");
      if (other) other.classList.remove("show");
      return;
    }
    row.remove();
  });

  form.addEventListener("change", (event) => {
    if (event.target.name !== "office-type") return;
    const other = event.target.closest(".load-row").querySelector(".office-other");
    other.classList.toggle("show", event.target.value === "Other");
  });
}

bindRepeaters();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.querySelectorAll(".invalid").forEach((field) => field.classList.remove("invalid"));

  const phone = document.getElementById("phone").value.trim();
  const property = document.getElementById("property").value;
  const userLocation = document.getElementById("location").value.trim();
  const message = document.getElementById("message").value.trim();
  const budget = document.getElementById("budget").value.trim();
  const appliances = applianceCounts();
  const air = airConditioners();
  const office = officeMachines();
  const business = businessMachines();

  if (!phone) return fieldError("phone", "Please enter your WhatsApp number");
  if (phone.startsWith("+")) return fieldError("phone", "Enter your WhatsApp number starting with 0");
  if (!property) return fieldError("property", "Please select your property type");
  if (!userLocation) return fieldError("location", "Please enter your location");
  if (!appliances.length && !air.length && !office.length && !business.length) {
    const firstAppliance = form.querySelector('input[name="appliance"]');
    firstAppliance.classList.add("invalid");
    firstAppliance.focus();
    return showToast("Enter the appliances you want to power");
  }
  if (!budget) return fieldError("budget", "Please enter your budget");

  const lines = [
    "Hello SetGlobalTech,",
    "",
    "I would like a custom solar system.",
    "",
    `WhatsApp: ${phone}`,
    `Property: ${property}`,
    `Location: ${userLocation}`,
    `Budget: ${budget}`,
  ];
  if (appliances.length) {
    lines.push("", "Appliances:", ...appliances.map(formatSimple));
  }
  if (air.length) {
    lines.push("", "Air conditioners:", ...air.map((item) => {
      const count = item.count || 1;
      const hp = item.hp ? `${item.hp}HP` : "horsepower not stated";
      const room = item.room ? `, ${item.room}` : "";
      return `${count} x ${hp}${room}`;
    }));
  }
  if (office.length) {
    lines.push("", "Office equipment:", ...office.map((item) => formatRated(item, "W")));
  }
  if (business.length) {
    lines.push("", "Business machines:", ...business.map((item) => formatRated(item, "W")));
  }
  if (message) lines.push("", `Notes: ${message}`);

  window.open(whatsappUrl(lines.join("\n")), "_blank", "noopener");
  showToast("Opening WhatsApp");
});

function fieldError(id, message) {
  const field = document.getElementById(id);
  field.classList.add("invalid");
  field.focus();
  showToast(message);
}

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const track = slider.querySelector(".slider-track");
  const slides = [...track.children];
  const dots = slider.querySelector(".slider-dots");
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Photo ${i + 1}`);
    dot.addEventListener("click", () => {
      go(i);
      restart();
    });
    dots.appendChild(dot);
  });

  function go(next) {
    index = (next + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.querySelectorAll(".slider-dot").forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle("active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function restart() {
    clearInterval(timer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => go(index + 1), 5000);
  }

  slider.querySelector(".slider-prev").addEventListener("click", () => {
    go(index - 1);
    restart();
  });
  slider.querySelector(".slider-next").addEventListener("click", () => {
    go(index + 1);
    restart();
  });

  const viewport = slider.querySelector(".slider-viewport");
  let startX = 0;
  viewport.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });
  viewport.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? index + 1 : index - 1);
    restart();
  });

  go(0);
  restart();
});

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}
