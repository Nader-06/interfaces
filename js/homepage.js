/****************************
 * ===== GLOBAL STORAGE KEYS =====
 ****************************/
const USERS_KEY = "users";           // array of user objects
const SESSION_KEY = "sessionUser";   // string = username of logged-in user
const TIPS_KEY = "tips";             // array of tip objects (used later in Version b)

/****************************
 * ===== UTIL: STORAGE HELPERS =====
 ****************************/
function getUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveUsers(usersArr) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usersArr));
}

function setSession(username) {
    if (username) {
        localStorage.setItem(SESSION_KEY, username);
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

function getSession() {
    return localStorage.getItem(SESSION_KEY); // username or null
}

/****************************
 * ===== UTIL: MODAL HANDLING =====
 * We'll reuse this in other pages too.
 ****************************/
const modalOverlay = document.getElementById("modal-overlay");
const modalBoxMsg = document.getElementById("modal-message");
const modalConfirmBtn = document.getElementById("modal-confirm");
const modalCancelBtn = document.getElementById("modal-cancel");
const modalOkBtn = document.getElementById("modal-ok");

// generic showModal(options)
function showModal({ message, mode = "alert", onConfirm = null, onCancel = null }) {
    // mode = "alert"   -> just OK button
    // mode = "confirm" -> Confirm + Cancel

    modalBoxMsg.textContent = message || "";

    if (mode === "alert") {
        modalConfirmBtn.classList.add("hidden");
        modalCancelBtn.classList.add("hidden");
        modalOkBtn.classList.remove("hidden");

        // Clear previous listeners
        modalOkBtn.replaceWith(modalOkBtn.cloneNode(true));
        const newOk = document.getElementById("modal-ok");
        newOk.addEventListener("click", () => hideModal());

    } else if (mode === "confirm") {
        modalOkBtn.classList.add("hidden");
        modalConfirmBtn.classList.remove("hidden");
        modalCancelBtn.classList.remove("hidden");

        // reset listeners
        modalConfirmBtn.replaceWith(modalConfirmBtn.cloneNode(true));
        modalCancelBtn.replaceWith(modalCancelBtn.cloneNode(true));

        const newConfirm = document.getElementById("modal-confirm");
        const newCancel = document.getElementById("modal-cancel");

        newConfirm.addEventListener("click", () => {
            hideModal();
            if (typeof onConfirm === "function") onConfirm();
        });
        newCancel.addEventListener("click", () => {
            hideModal();
            if (typeof onCancel === "function") onCancel();
        });
    }

    modalOverlay.classList.remove("hidden");
}

function hideModal() {
    modalOverlay.classList.add("hidden");
}

/****************************
 * ===== LOGIN LOGIC (right sidebar) =====
 ****************************/
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const usernameInput = document.getElementById("login-username");
const passwordInput = document.getElementById("login-password");
const rememberMeInput = document.getElementById("remember_me");

// OPTIONAL NICE TOUCH: preload username if "remember me" had been used
(function preloadRememberedUser() {
    const remembered = localStorage.getItem("rememberedUser");
    if (remembered && usernameInput) {
        usernameInput.value = remembered;
        rememberMeInput.checked = true;
    }
})();

if (loginBtn) {
    loginBtn.addEventListener("click", handleLogin);
}

if (registerBtn) {
    registerBtn.addEventListener("click", () => {
        // Version a page (registration form)
        window.location.href = "registration_form.html";
    });
}

function handleLogin() {
    const enteredUser = usernameInput.value.trim();
    const enteredPass = passwordInput.value;

    if (!enteredUser || !enteredPass) {
        showModal({
            message: "Please enter username and password.",
            mode: "alert"
        });
        return;
    }

    const users = getUsers();
    // find user
    const found = users.find(u => u.username === enteredUser && u.password === enteredPass);

    if (!found) {
        // login failed
        showModal({
            message: "Login failed. User not found or password incorrect.",
            mode: "alert"
        });
        return;
    }

    // login success
    setSession(found.username);

    // remember me?
    if (rememberMeInput.checked) {
        localStorage.setItem("rememberedUser", found.username);
    } else {
        localStorage.removeItem("rememberedUser");
    }

    // redirect to Version b (logged-in page)
    window.location.href = "logged.html";
}

/****************************
 * ===== CAROUSEL LOGIC =====
 * Requirements:
 * - next / prev buttons
 * - wrap around
 * - auto-advance every 2 seconds
 ****************************/

// 1. Data for the packs
// You can customize these to match real trips / images / prices.
const trips = [
    {
        title: "The Middle East in one week",
        desc: "Journey through the Middle East’s rich culture, passing from the Egyptian pyramids through Jerusalem and Istanbul, and onward to the vibrant spirit of Dubai.",
        price: "800€",
        img: "../images/middle_east.webp",
        buyHref: "buy.html",
        packId: "middle-east"
    },
    {
        title: "Europe by Train",
        desc: "Glide from Paris to Berlin to Prague and Venice. Iconic stations, budget food, zero stress on visas inside Schengen (mostly).",
        price: "650€",
        img: "../images/trains_europe.jpg",
        buyHref: "buy.html",
        packId: "europe-train"
    },
    {
        title: "Amazon Safari",
        desc: "Rainforest trekking, river dolphins, local tribes, and survival basics in the heart of the Amazon basin.",
        price: "1,200€",
        img: "../images/amazon_safari.jpg",
        buyHref: "buy.html",
        packId: "amazon-safari"
    }
];

// 2. Grab DOM elements
const titleEl = document.getElementById("carousel-title");
const descEl = document.getElementById("carousel-desc");
const priceEl = document.getElementById("carousel-price");
const imgEl = document.getElementById("carousel-img");
const buyBtnEl = document.getElementById("carousel-buy");

const prevBtn = document.getElementById("carousel-prev");
const nextBtn = document.getElementById("carousel-next");

// 3. State
let currentIndex = 0;
let autoAdvanceInterval = null;

function renderTrip(index) {
    const trip = trips[index];  

    if (titleEl) titleEl.textContent = trip.title;
    if (descEl) descEl.textContent = trip.desc;
    if (priceEl) priceEl.textContent = trip.price;

    // change banner background dynamically
    const bannerEl = document.querySelector(".mid_inner_banner");
    if (bannerEl) {
        bannerEl.style.backgroundImage = `url('${trip.img}')`;
    }

    if (imgEl) imgEl.src = trip.img; // your inner <img> stays as-is
    if (buyBtnEl) {
        buyBtnEl.onclick = () => {
            localStorage.setItem("selectedPack", trip.packId);
            window.location.href = trip.buyHref;
        };
    }
}

// 5. Navigation helpers
function showNext() {
    currentIndex = (currentIndex + 1) % trips.length;
    renderTrip(currentIndex);
}

function showPrev() {
    currentIndex = (currentIndex - 1 + trips.length) % trips.length;
    renderTrip(currentIndex);
}

// 6. Wire buttons
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        showNext();
        restartAutoAdvance();
    });
}
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        showPrev();
        restartAutoAdvance();
    });
}

// 7. Auto-advance every 2 seconds
function startAutoAdvance() {
    stopAutoAdvance(); // safety
    autoAdvanceInterval = setInterval(showNext, 2000);
}

function stopAutoAdvance() {
    if (autoAdvanceInterval) {
        clearInterval(autoAdvanceInterval);
        autoAdvanceInterval = null;
    }
}

function restartAutoAdvance() {
    startAutoAdvance();
}

// 8. Init carousel
renderTrip(currentIndex);
startAutoAdvance();
