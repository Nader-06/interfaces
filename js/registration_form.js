const USERS_KEY = "users";
const SESSION_KEY = "sessionUser";

const form = document.getElementById("registration-form");
const nameInput = document.getElementById("name");
const surnameInput = document.getElementById("surname");
const emailInput = document.getElementById("email");
const confirmEmailInput = document.getElementById("confirm_email");
const dobInput = document.getElementById("date_of_birth");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const photoInput = document.getElementById("photo");
const privacyCheck = document.getElementById("privacy-check");
const signupBtn = document.getElementById("signup-btn");
const goLoginBtn = document.getElementById("go-login-btn");

const modalOverlay = document.getElementById("modal-overlay");
const modalMessage = document.getElementById("modal-message");
const modalOk = document.getElementById("modal-ok");
const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");

function showModal(message, { mode = "alert", onConfirm = null, onCancel = null } = {}) {
    if (!modalOverlay || !modalMessage) return alert(message); // graceful fallback

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

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(username) {
    localStorage.setItem(SESSION_KEY, username);
}

privacyCheck?.addEventListener("change", () => {
    if (!signupBtn) return;
    signupBtn.disabled = !privacyCheck.checked;
});

goLoginBtn?.addEventListener("click", () => {
    window.location.href = "homepage.html";
});

signupBtn?.addEventListener("click", () => {
    handleSignup().catch((err) => {
        console.error(err);
        showModal("An unexpected error occurred. Please try again.");
    });
});

async function handleSignup() {
    if (!privacyCheck?.checked) {
        showModal("You must accept the privacy policy to continue.");
        return;
    }

    const errors = [];

    const nameValue = nameInput.value.trim();
    if (nameValue.length < 3) {
        errors.push("The name must contain at least 3 characters.");
    }

    const surnameValue = surnameInput.value.trim();
    const surnameParts = surnameValue.split(/\s+/).filter(Boolean);
    const invalidSurname =
        surnameParts.length < 2 || surnameParts.some((part) => part.length < 3);
    if (invalidSurname) {
        errors.push("Enter at least two surnames of 3 or more characters each.");
    }

    const emailValue = emailInput.value.trim();
    const confirmEmailValue = confirmEmailInput.value.trim();
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/i;
    if (!emailPattern.test(emailValue)) {
        errors.push("Enter a valid email address (name@domain.extension).");
    }
    if (emailValue !== confirmEmailValue) {
        errors.push("The confirmation email must match the original email.");
    }

    const dobRaw = dobInput.value;
    if (!dobRaw) {
        errors.push("Select your date of birth.");
    } else {
        const dobDate = new Date(dobRaw);
        const today = new Date();
        if (Number.isNaN(dobDate.getTime())) {
            errors.push("Enter a valid date of birth.");
        } else {
            const age = today.getFullYear() - dobDate.getFullYear() -
                (today < new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate()) ? 1 : 0);
            if (dobDate > today) {
                errors.push("The date of birth cannot be in the future.");
            }
            if (age < 13 || age > 120) {
                errors.push("Please enter a realistic age (between 13 and 120 years).");
            }
        }
    }

    const usernameValue = usernameInput.value.trim();
    if (usernameValue.length < 5) {
        errors.push("The login username must be at least 5 characters long.");
    }

    const passwordValue = passwordInput.value;
    const digitMatches = passwordValue.match(/\d/g) || [];
    const hasUpper = /[A-Z]/.test(passwordValue);
    const hasLower = /[a-z]/.test(passwordValue);
    const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);
    if (
        passwordValue.length < 8 ||
        digitMatches.length < 2 ||
        !hasUpper ||
        !hasLower ||
        !hasSpecial
    ) {
        errors.push("Password must have 8 characters, with 2 digits, 1 special character, 1 uppercase and 1 lowercase letter.");
    }

    const photoFile = photoInput.files[0];
    if (!photoFile) {
        errors.push("Please upload a profile image in webp, png or jpg format.");
    } else {
        const allowedTypes = ["image/webp", "image/png", "image/jpeg"];
        const fileType = photoFile.type || "";
        const extension = photoFile.name.split(".").pop()?.toLowerCase();
        if (!allowedTypes.includes(fileType) && !["webp", "png", "jpg", "jpeg"].includes(extension)) {
            errors.push("Unsupported image format. Use webp, png or jpg.");
        }
    }

    const existingUsers = getUsers();
    if (existingUsers.some((user) => user.username.toLowerCase() === usernameValue.toLowerCase())) {
        errors.push("This login username is already registered.");
    }
    if (existingUsers.some((user) => user.email.toLowerCase() === emailValue.toLowerCase())) {
        errors.push("This email is already registered.");
    }

    if (errors.length > 0) {
        showModal(errors.join("\n"));
        return;
    }

    const photoDataUrl = await readFileAsDataURL(photoFile);

    const newUser = {
        name: nameValue,
        surnames: surnameValue,
        email: emailValue,
        username: usernameValue,
        password: passwordValue,
        dob: dobRaw,
        photo: photoDataUrl,
        createdAt: Date.now()
    };

    existingUsers.push(newUser);
    saveUsers(existingUsers);
    setSession(usernameValue);

    form?.reset();
    if (privacyCheck) {
        privacyCheck.checked = false;
    }
    if (signupBtn) {
        signupBtn.disabled = true;
    }

    showModal("Registration completed successfully.", {
        onConfirm: () => {
            window.location.href = "logged.html";
        }
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
