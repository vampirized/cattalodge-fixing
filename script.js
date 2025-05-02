document.addEventListener('DOMContentLoaded', function() {
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    const dropdownMenu = document.getElementById('dropdownMenu');

    dropdownTrigger.addEventListener('click', function() {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Close the dropdown if the user clicks outside of it
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-image')) {
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
            }
        }
    });
});

const apiBase = "http://localhost:5000";
const occupiedWeeks = new Set();
const weekInput = document.getElementById('week-input');
const claimButton = document.getElementById('claim-btn');
const deleteButton = document.getElementById('delete-btn');

// Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "main.html"; // Ha nincs token, vissza a főoldalra
    }
});

// Regisztrációs űrlap eseményfigyelő
async function registerUser(event) {
    event.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }) // Biztosítsd, hogy itt a megfelelő adatok vannak
        });

        const data = await response.json();
        alert(data.message);
        window.location.href = "main.html";
    } catch (error) {
        console.error("Hiba történt a regisztráció során:", error);
    }
}


const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", registerUser);
}

// Bejelentkezési űrlap eseményfigyelő
async function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${apiBase}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "main.html";
        } else {
            alert("Érvénytelen hitelesítési adatok!");
        }
    } catch (error) {
        console.error("Hiba történt a bejelentkezés során:", error);
    }
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", loginUser);
}

// Főoldal betöltése és kijelentkezés
const welcomeMessage = document.getElementById("welcomeMessage");
const logoutBtn = document.getElementById("logout");
if (welcomeMessage && logoutBtn) {
    const token = localStorage.getItem("token");

    if (token) {
        fetch(`${apiBase}/main`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => welcomeMessage.textContent = data.message)
            .catch(() => window.location.href = "main.html");
    } else {
        window.location.href = "main.html";
    }

    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        window.location.href = "main.html";
    });
}

// Foglalás kezelése
weekInput.addEventListener('change', function() {
    const selectedWeek = weekInput.value;
    if (occupiedWeeks.has(selectedWeek)) {
        weekInput.classList.add('occupied');
        deleteButton.disabled = false;
    } else {
        weekInput.classList.remove('occupied');
        deleteButton.disabled = true;
    }
});

claimButton.addEventListener('click', function() {
    const selectedWeek = weekInput.value;
    if (selectedWeek && !occupiedWeeks.has(selectedWeek)) {
        occupiedWeeks.add(selectedWeek);
        weekInput.classList.add('occupied');
        deleteButton.disabled = false;
        alert(`Week ${selectedWeek} claimed!`);
    } else {
        alert(`Week ${selectedWeek} is already occupied or not selected.`);
    }
});

deleteButton.addEventListener('click', function() {
    const selectedWeek = weekInput.value;
    if (occupiedWeeks.has(selectedWeek)) {
        occupiedWeeks.delete(selectedWeek);
        weekInput.classList.remove('occupied');
        deleteButton.disabled = true;
        alert(`Week ${selectedWeek} deleted!`);
    } else {
        alert(`Week ${selectedWeek} is not occupied.`);
    }
});
