const SESSION_KEY = "sessionUser";
const USERS_KEY = "users";

const PACKS = {
  "middle-east": {
    title: "Package: Middle East in One Week",
    description:
      "Route through Egypt, Jerusalem, Istanbul, and Dubai. Includes a basic guide, accommodation and transport recommendations, and safety tips for backpackers.",
    price: "800 €",
    image: "images/middle_east.webp"
  },
  "europe-train": {
    title: "Package: Europe by Train",
    description:
      "Discover iconic capitals by rail with flexible tickets, suggested hostels, and money-saving city passes for culture lovers.",
    price: "650 €",
    image: "images/trains_europe.jpg"
  },
  "amazon-safari": {
    title: "Package: Amazon Safari",
    description:
      "Navigate the Amazon with local guides, eco-lodges, wildlife watching tours, and essential safety recommendations for adventurers.",
    price: "1,200 €",
    image: "images/amazon_safari.jpg"
  }
};

const modalOverlay = document.getElementById("modal-overlay");
const modalMessage = document.getElementById("modal-message");
const modalOk = document.getElementById("modal-ok");

function showModal(message, onClose = null) {
  if (!modalOverlay || !modalMessage) {
    alert(message);
    if (typeof onClose === "function") onClose();
    return;
  }

  modalMessage.textContent = message;
  modalOverlay.classList.remove("hidden");

  modalOk.classList.remove("hidden");
  modalOk.onclick = () => {
    hideModal();
    if (typeof onClose === "function") onClose();
  };

  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");
  modalConfirm?.classList.add("hidden");
  modalCancel?.classList.add("hidden");
}

function hideModal() {
  modalOverlay?.classList.add("hidden");
}

function requireSession() {
  const username = localStorage.getItem(SESSION_KEY);
  if (!username) {
    window.location.href = "homepage.html";
    return null;
  }
  return username;
}

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function populatePack() {
  const packId = localStorage.getItem("selectedPack") || "middle-east";
  const pack = PACKS[packId] || PACKS["middle-east"];

  const imgEl = document.getElementById("pack-image");
  const titleEl = document.getElementById("pack-title");
  const descEl = document.getElementById("pack-desc");
  const priceEl = document.getElementById("pack-price");

  if (imgEl) imgEl.src = pack.image;
  if (titleEl) titleEl.textContent = pack.title;
  if (descEl) descEl.textContent = pack.description;
  if (priceEl) priceEl.innerHTML = `<strong>Price:</strong> ${pack.price}`;
}

function populateCustomerData(username) {
  const users = getUsers();
  const user = users.find((item) => item.username === username);
  if (!user) return;

  const nameEl = document.getElementById("cust_name");
  const emailEl = document.getElementById("cust_email");

  if (nameEl) nameEl.value = `${user.name} ${user.surnames}`.trim();
  if (emailEl) emailEl.value = user.email;
}

function setupForm(username) {
  const form = document.getElementById("purchase-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      showModal(errors.join("\n"));
      return;
    }

    showModal("Purchase completed.", () => {
      form.reset();
      populatePack();
      populateCustomerData(username);
    });
  });

  form.addEventListener("reset", () => {
    // Wait for the native reset to finish before restoring defaults
    setTimeout(() => {
      populateCustomerData(username);
    }, 0);
  });
}

function validateForm() {
  const errors = [];
  const nameValue = document.getElementById("cust_name")?.value.trim() || "";
  const emailValue = document.getElementById("cust_email")?.value.trim() || "";
  const cardTypeValue = document.getElementById("card_type")?.value || "";
  const cardNumberRaw = document.getElementById("card_number")?.value || "";
  const cardHolderValue = document.getElementById("card_holder")?.value.trim() || "";
  const expDateValue = document.getElementById("exp_date")?.value || "";
  const cvvValue = document.getElementById("cvv")?.value.trim() || "";

  if (nameValue.length < 3) {
    errors.push("The full name must contain at least 3 characters.");
  }

  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/i;
  if (!emailPattern.test(emailValue)) {
    errors.push("Enter a valid email address.");
  }

  if (!cardTypeValue) {
    errors.push("Select a card type.");
  }

  const digits = cardNumberRaw.replace(/\D/g, "");
  const validCardLengths = [13, 15, 16, 19];
  if (!validCardLengths.includes(digits.length)) {
    errors.push("Enter a valid card number (13, 15, 16 or 19 digits).");
  }

  if (cardHolderValue.length < 3) {
    errors.push("The card holder name must contain at least 3 characters.");
  }

  if (!expDateValue) {
    errors.push("Select an expiry date.");
  } else {
    const [year, month] = expDateValue.split("-").map(Number);
    if (!year || !month) {
      errors.push("Enter a valid expiry date.");
    } else {
      const expDate = new Date(year, month - 1, 1);
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (expDate < currentMonth) {
        errors.push("The card has already expired.");
      }
    }
  }

  if (!/^\d{3}$/.test(cvvValue)) {
    errors.push("The CVV must contain exactly 3 digits.");
  }

  return errors;
}

(function init() {
  const username = requireSession();
  if (!username) return;

  populatePack();
  populateCustomerData(username);
  setupForm(username);
})();
