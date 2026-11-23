
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("active");
    menuToggle.textContent = open ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", open);
});

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

const serviceBox = document.getElementById("service-options");
const barberBox = document.getElementById("barber-options");

const defaultServices = [
    { name: "Haircut", price: 150 },
    { name: "Beard Trim", price: 100 },
    { name: "Hair + Beard", price: 200 }
];

const defaultBarbers = [
    { name: "Arjun", image: "images/arjun.jpg" },
    { name: "Rahul", image: "images/rahul.jpg" },
    { name: "Vikash", image: "images/vikash.jpg" }
];

function getSaved(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : fallback;
    } catch {
        return fallback;
    }
}

const services = getSaved("trimoraServices", defaultServices);
const barbers = [...defaultBarbers];

getSaved("trimoraBarbers", []).forEach(barber => {
    if (!barber || typeof barber !== "object" || !barber.name) return;

    if (!barbers.some(item =>
        item.name.toLowerCase() === barber.name.trim().toLowerCase()
    )) {
        barbers.push({
            name: barber.name.trim(),
            image: barber.image || "images/barber.jpg"
        });
    }
});

const serviceImages = {
    "haircut": "images/haircut 2.jpg",
    "beard trim": "images/beard 2.jpg",
    "hair + beard": "images/hair & beard 2.jpg"
};

services.forEach(service => {
    if (!service || !service.name) return;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.name = service.name;
    button.dataset.price = Number(service.price) || 0;

    const image = document.createElement("img");
    image.src = service.image || serviceImages[service.name.toLowerCase()] || "images/haircut.jpg";
    image.alt = service.name;

    const label = document.createElement("span");
    label.textContent = service.name;

    const price = document.createElement("small");
    price.textContent = "₹" + (Number(service.price) || 0);

    label.appendChild(price);
    button.append(image, label);
    serviceBox.appendChild(button);
});

barbers.forEach(barber => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.name = barber.name;

    const image = document.createElement("img");
    image.src = barber.image;
    image.alt = barber.name;
    image.onerror = function () {
        this.onerror = null;
        this.src = "images/barber.jpg";
    };

    const label = document.createElement("span");
    label.textContent = barber.name;

    button.append(image, label);
    barberBox.appendChild(button);
});

serviceBox.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    serviceBox.querySelectorAll("button").forEach(item =>
        item.classList.remove("selected")
    );

    button.classList.add("selected");
    document.getElementById("summary-service").textContent =
        `Service: ${button.dataset.name} - ₹${button.dataset.price}`;
});

barberBox.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    barberBox.querySelectorAll("button").forEach(item =>
        item.classList.remove("selected")
    );

    button.classList.add("selected");
    document.getElementById("summary-barber").textContent =
        "Barber: " + button.dataset.name;
});

const dateInput = document.getElementById("appointment-date");
const timeButtons = document.querySelectorAll(".time button");
const confirmButton = document.getElementById("confirm-booking");

const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.min = localToday;

dateInput.addEventListener("change", () => {
    document.getElementById("summary-date").textContent =
        dateInput.value ? "Date: " + dateInput.value : "Date: Not Selected";

    timeButtons.forEach(button => button.classList.remove("selected"));
    document.getElementById("summary-time").textContent = "Time: Not Selected";
});

timeButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (!dateInput.value) {
            alert("Please select a date first.");
            return;
        }

        timeButtons.forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");

        document.getElementById("summary-time").textContent =
            "Time: " + button.textContent.trim();
    });
});

function readAppointments() {
    try {
        const saved = JSON.parse(localStorage.getItem("trimoraAppointments") || "[]");
        if (Array.isArray(saved)) return saved;
    } catch {}

    try {
        const old = JSON.parse(localStorage.getItem("trimoraAppointment") || "null");
        return old ? [old] : [];
    } catch {
        return [];
    }
}

function getCustomer() {
    try {
        const user = JSON.parse(localStorage.getItem("trimoraLoggedInUser") || "null");
        if (user && user.name) return user.name;
    } catch {}

    return localStorage.getItem("trimoraCustomerName") ||
        localStorage.getItem("customerName") ||
        localStorage.getItem("userName") ||
        "Customer";
}

function generateQueue(appointments, barber, date) {
    const count = appointments.filter(item =>
        String(item.barber || item.barberName || "").toLowerCase() === barber.toLowerCase() &&
        item.date === date &&
        !["cancelled", "canceled"].includes(String(item.status).toLowerCase())
    ).length;

    return String(count + 1).padStart(2, "0");
}

confirmButton.addEventListener("click", () => {
    const service = serviceBox.querySelector(".selected");
    const barber = barberBox.querySelector(".selected");
    const time = document.querySelector(".time .selected");
    const date = dateInput.value;

    if (!service || !barber || !date || !time) {
        alert("Please select service, barber, date and time.");
        return;
    }

    if (date < localToday) {
        alert("Please select today or a future date.");
        return;
    }

    const appointments = readAppointments();
    const barberName = barber.dataset.name;
    const selectedTime = time.textContent.trim();

    const alreadyBooked = appointments.some(item =>
        String(item.barber || item.barberName || "").toLowerCase() === barberName.toLowerCase() &&
        item.date === date &&
        String(item.time || "").trim() === selectedTime &&
        !["cancelled", "canceled", "completed"].includes(String(item.status).toLowerCase())
    );

    if (alreadyBooked) {
        alert("This barber already has a booking at that date and time.");
        return;
    }

    let email = "";

    try {
        const user = JSON.parse(localStorage.getItem("trimoraLoggedInUser") || "null");
        email = user?.email || "";
    } catch {}

    const appointment = {
        id: Date.now(),
        customer: getCustomer(),
        customerName: getCustomer(),
        email,
        service: service.dataset.name,
        price: Number(service.dataset.price),
        barber: barberName,
        date,
        time: selectedTime,
        status: "Confirmed",
        queue: generateQueue(appointments, barberName, date)
    };

    appointments.push(appointment);

    localStorage.setItem("trimoraAppointments", JSON.stringify(appointments));
    localStorage.setItem("trimoraAppointment", JSON.stringify(appointment));

    alert("Appointment confirmed successfully!\nYour Queue Number: #" + appointment.queue);
    window.location.href = "user.html";
});
