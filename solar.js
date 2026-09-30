const ham = document.getElementById("hamburger");
const menu = document.getElementById("mobile-menu");
const form = document.getElementById("quote-form");
const quoteResult = document.getElementById("quote-result");
const quoteTitle = document.getElementById("quote-title");
const quoteDetail = document.getElementById("quote-detail");

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

const PACKAGES = {
  standard: {
    name: "₦550,000 Solar Package",
    detail: "For slightly higher use, including selected small refrigeration if the appliance and usage allow it.",
  },
  home: {
    name: "₦700,000 Solar Package",
    detail: "A more capable home backup for fans, TV, lighting, charging, and selected small refrigeration. We confirm the fridge on a load check.",
  },
  plus: {
    name: "₦850,000 Solar Package",
    detail: "More backup for a home or small business. What it can run depends on each appliance rating and usage pattern.",
  },
  storage: {
    name: "₦1.1 Million Solar Package",
    detail: "More battery storage and solar generation for higher energy use. A deep freezer or similar load needs this kind of capacity, confirmed on site.",
  },
  business: {
    name: "₦1.75 Million Solar Package",
    detail: "For a medium home, office, or business with higher daytime and backup needs.",
  },
  large: {
    name: "₦2.6 Million Solar Package",
    detail: "A stronger system for a larger home, office, or business. It can support a significantly higher load, and selected air conditioning can be configured in depending on the overall load and usage pattern.",
  },
  custom: {
    name: "Custom system",
    detail: "Water pumps and business machines are sized from a load assessment. Share the appliance rating, how long it runs, and your budget, and we will recommend the inverter, battery, and panels.",
  },
};

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

function selectedAppliances() {
  return [...form.querySelectorAll('input[name="appliance"]:checked')].map((input) => input.value);
}

function recommendPackage() {
  const selected = selectedAppliances();
  const property = document.getElementById("property").value;
  const has = (item) => selected.includes(item);
  const commercial = /office|commercial|business/i.test(property);

  if (has("Water pumping machine") || has("Business machines")) return PACKAGES.custom;
  if (has("Air conditioner")) return PACKAGES.large;
  if (has("Deep freezer")) return PACKAGES.storage;
  if (commercial) return PACKAGES.business;
  if (has("Washing machine") || has("Pressing iron")) return PACKAGES.plus;
  if (has("Refrigerator")) return PACKAGES.home;
  if (selected.length) return PACKAGES.standard;
  return null;
}

function updateQuote() {
  const match = recommendPackage();
  if (!match) {
    quoteResult.hidden = true;
    return;
  }
  quoteTitle.textContent = match.name;
  quoteDetail.textContent = match.detail;
  quoteResult.hidden = false;
}

form.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("change", updateQuote);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.querySelectorAll(".invalid").forEach((field) => field.classList.remove("invalid"));

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const property = document.getElementById("property").value;
  const userLocation = document.getElementById("location").value.trim();
  const message = document.getElementById("message").value.trim();
  const budget = document.getElementById("budget").value.trim();
  const inspection = document.getElementById("inspection").checked;
  const appliances = selectedAppliances();
  const match = recommendPackage();

  if (!name) return fieldError("name", "Please enter your full name");
  if (!phone) return fieldError("phone", "Please enter your phone number");
  if (!property) return fieldError("property", "Please select your property type");

  const lines = [
    "Hello SetGlobalTech,",
    "",
    match
      ? `I would like a quote for this option: ${match.name}.`
      : "I would like a solar quote.",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Property: ${property}`,
  ];
  if (userLocation) lines.push(`Location: ${userLocation}`);
  if (budget) lines.push(`Budget: ${budget}`);
  if (appliances.length) lines.push(`Appliances: ${appliances.join(", ")}`);
  if (match) lines.push(`About this option: ${match.detail}`);
  if (inspection) lines.push("Please book a site inspection and load assessment.");
  if (message) lines.push(`Notes: ${message}`);

  window.open(whatsappUrl(lines.join("\n")), "_blank", "noopener");
  showToast(match ? `Opening WhatsApp with the ${match.name}` : "Opening WhatsApp");
});

function fieldError(id, message) {
  const field = document.getElementById(id);
  field.classList.add("invalid");
  field.focus();
  showToast(message);
}

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
