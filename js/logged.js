const USERS_KEY = "users";
const SESSION_KEY = "sessionUser";
const TIPS_KEY = "tips";

const modalOverlay = document.getElementById("modal-overlay");
const modalMessage = document.getElementById("modal-message");
const modalOk = document.getElementById("modal-ok");
const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");

function showModal(message, { mode = "alert", onConfirm = null, onCancel = null } = {}) {
  if (!modalOverlay || !modalMessage) {
    alert(message);
    return;
  }

  modalMessage.textContent = message;
  modalOverlay.classList.remove("hidden");

  if (mode === "alert") {
    modalOk.classList.remove("hidden");
    modalConfirm.classList.add("hidden");
    modalCancel.classList.add("hidden");

    modalOk.onclick = () => {
      hideModal();
      if (typeof onConfirm === "function") onConfirm();
    };
  } else {
    modalOk.classList.add("hidden");
    modalConfirm.classList.remove("hidden");
    modalCancel.classList.remove("hidden");

    modalConfirm.onclick = () => {
      hideModal();
      if (typeof onConfirm === "function") onConfirm();
    };
    modalCancel.onclick = () => {
      hideModal();
      if (typeof onCancel === "function") onCancel();
    };
  }
}

function hideModal() {
  modalOverlay?.classList.add("hidden");
}

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function getTips() {
  const raw = localStorage.getItem(TIPS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTips(tips) {
  localStorage.setItem(TIPS_KEY, JSON.stringify(tips));
}

function requireSession() {
  const username = localStorage.getItem(SESSION_KEY);
  if (!username) {
    window.location.href = "index.html";
    return null;
  }
  return username;
}

function seedDefaultTips() {
  const tips = getTips();
  if (tips.length > 0) return;

  const defaults = [
    {
      id: Date.now() - 3,
      title: "How to save using night transport",
      description:
        "Choose overnight buses or trains to save accommodation money and win extra daylight hours for sightseeing.",
      url: "tips.html#night-transport",
      author: "system",
      createdAt: Date.now() - 3
    },
    {
      id: Date.now() - 2,
      title: "International medical insurance guide",
      description:
        "Compare coverage and emergency services before travelling abroad to avoid surprises when you need assistance.",
      url: "tips.html#medical-insurance",
      author: "system",
      createdAt: Date.now() - 2
    },
    {
      id: Date.now() - 1,
      title: "Visas for Southeast Asia in advance",
      description:
        "Review visa requirements and processing times for each destination so you can cross borders without delays.",
      url: "tips.html#sea-visas",
      author: "system",
      createdAt: Date.now() - 1
    }
  ];

  saveTips(defaults);
}

function renderTips() {
  const list = document.getElementById("tips-list");
  if (!list) return;

  const tips = getTips()
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  list.innerHTML = "";
  tips.slice(0, 3).forEach((tip) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = tip.url || `tips.html#${slugify(tip.title)}`;
    link.textContent = tip.title;
    li.appendChild(link);
    list.appendChild(li);
  });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function setupTipForm(username) {
  const tipForm = document.getElementById("tip-form");
  const titleInput = document.getElementById("tip_title");
  const descInput = document.getElementById("tip_desc");
  if (!tipForm || !titleInput || !descInput) return;

  tipForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const errors = [];

    if (title.length < 15) {
      errors.push("The title must have at least 15 characters.");
    }
    if (description.length < 30) {
      errors.push("The description must contain at least 30 characters.");
    }

    if (errors.length > 0) {
      showModal(errors.join("\n"));
      return;
    }

    const tips = getTips();
    tips.unshift({
      id: Date.now(),
      title,
      description,
      url: `tips.html#${slugify(title)}`,
      author: username,
      createdAt: Date.now()
    });
    saveTips(tips);

    tipForm.reset();
    renderTips();

    showModal("Your tip has been added successfully.");
  });
}

function populateUserData(username) {
  const users = getUsers();
  const user = users.find((item) => item.username === username);
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    showModal("Your session has expired. Please log in again.", {
      onConfirm: () => (window.location.href = "index.html")
    });
    return;
  }

  const profileNameEl = document.getElementById("profile-name");
  const avatarEl = document.getElementById("profile-avatar");

  if (profileNameEl) {
    const fullName = `${user.name} ${user.surnames}`.trim();
    profileNameEl.textContent = fullName || user.username;
  }

  if (avatarEl && user.photo) {
    avatarEl.src = user.photo;
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    showModal("¿Desea cerrar sesión?", {
      mode: "confirm",
      onConfirm: () => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem("selectedPack");
        window.location.href = "index.html";
      }
    });
  });
}

(function init() {
  const username = requireSession();
  if (!username) return;

  seedDefaultTips();
  populateUserData(username);
  renderTips();
  setupTipForm(username);
  setupLogout();
})();
