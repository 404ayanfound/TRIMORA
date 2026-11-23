/* HAMBURGER MENU */

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    const isOpen = navMenu.classList.contains("active");

    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", isOpen);
});

// Close menu after clicking a link

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// SELECTION BUTTONS

// LOAD ADMIN-MANAGED SERVICE AND BARBER OPTIONS
function loadBookingOptions() {
    let services = [];
    let barbers = [];
    try { services = JSON.parse(localStorage.getItem("trimoraServices") || "[]"); } catch (error) {}
    try { barbers = JSON.parse(localStorage.getItem("trimoraBarbers") || "[]"); } catch (error) {}
    if (!Array.isArray(services) || services.length === 0) services = [
        { name: "Haircut", price: 150 }, { name: "Beard Trim", price: 100 }, { name: "Hair + Beard", price: 200 }
    ];
    if (!Array.isArray(barbers)) barbers = [];
    const serviceBox = document.getElementById("service-options");
    const barberBox = document.getElementById("barber-options");
    const images = { "haircut":"images/haircut 2.jpg", "beard trim":"images/beard 2.jpg", "hair + beard":"images/hair & beard 2.jpg" };
    serviceBox.innerHTML = "";
    services.forEach(service => {
        if (!service || !service.name) return;
        const button = document.createElement("button");
        button.type = "button"; button.dataset.name = service.name; button.dataset.price = Number(service.price) || 0;
        const image = document.createElement("img"); image.src = images[String(service.name).toLowerCase()] || "images/haircut 2.jpg"; image.alt = service.name;
        const label = document.createElement("span"); label.textContent = service.name;
        const price = document.createElement("small"); price.textContent = "₹" + (Number(service.price) || 0);
        label.appendChild(price); button.append(image, label); serviceBox.appendChild(button);
    });
    barberBox.innerHTML = "";
    barbers.forEach(barber => {
        if (!barber || typeof barber === "string" || !barber.name) return;
        const button = document.createElement("button"); button.type = "button"; button.dataset.name = barber.name;
        const image = document.createElement("img"); image.src = "images/barber.jpg"; image.alt = barber.name;
        const label = document.createElement("span"); label.textContent = barber.name;
        button.append(image, label); barberBox.appendChild(button);
    });
    if (!barberBox.children.length) barberBox.textContent = "No barbers available. Please contact Admin to add a barber account.";
}
loadBookingOptions();

const serviceButtons = document.querySelectorAll(".service-options button");
const barberButtons = document.querySelectorAll(".barber-options button");
const timeButtons = document.querySelectorAll(".time button");

// Summary elements

const summaryService = document.getElementById("summary-service");
const summaryBarber = document.getElementById("summary-barber");
const summaryDate = document.getElementById("summary-date");
const summaryTime = document.getElementById("summary-time");

// Input elements

const dateInput = document.getElementById("appointment-date");
const confirmButton = document.getElementById("confirm-booking");

// Prevent past dates

const today = new Date();

const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.min = localToday;

// SERVICE SELECTION

serviceButtons.forEach(button => {
    button.addEventListener("click", () => {
        serviceButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        summaryService.textContent =
            "Service: " + button.dataset.name +
            " - ₹" + button.dataset.price;
    });
});

// BARBER SELECTION

barberButtons.forEach(button => {
    button.addEventListener("click", () => {
        barberButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        summaryBarber.textContent =
            "Barber: " + button.dataset.name;
    });
});

// DATE SELECTION

dateInput.addEventListener("change", () => {
    summaryDate.textContent = dateInput.value
        ? "Date: " + dateInput.value
        : "Date: Not Selected";

    // Reset previous time selection

    timeButtons.forEach(button => button.classList.remove("selected"));
    summaryTime.textContent = "Time: Not Selected";
});

// TIME SELECTION

timeButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (!dateInput.value) {
            alert("Please select a date first.");
            return;
        }

        timeButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        summaryTime.textContent =
            "Time: " + button.textContent.trim();
    });
});

// READ ALL SAVED APPOINTMENTS

function readAppointments() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("trimoraAppointments") || "[]"
        );

        if (Array.isArray(saved)) {
            return saved;
        }
    } catch (error) {
        console.error("Could not read appointments:", error);
    }

    // Old single-booking compatibility

    try {
        const oldBooking = JSON.parse(
            localStorage.getItem("trimoraAppointment") || "null"
        );

        return oldBooking ? [oldBooking] : [];
    } catch (error) {
        return [];
    }
}

// GET LOGGED-IN CUSTOMER

function getCustomer() {
    try {
        const user = JSON.parse(
            localStorage.getItem("trimoraLoggedInUser") || "null"
        );

        if (user && user.name) {
            return user.name;
        }
    } catch (error) {
        console.error("Could not read logged-in user:", error);
    }

    return (
        localStorage.getItem("trimoraCustomerName") ||
        localStorage.getItem("customerName") ||
        localStorage.getItem("userName") ||
        localStorage.getItem("trimoraUserName") ||
        "Customer"
    );
}

// GENERATE QUEUE NUMBER

function generateQueue(appointments, barberName, date) {
    const sameBarberAppointments = appointments.filter(item =>
        String(item.barber || item.barberName || "").trim().toLowerCase() ===
            barberName.trim().toLowerCase() &&
        item.date === date &&
        !["cancelled", "canceled"].includes(
            String(item.status || "").toLowerCase()
        )
    );

    return String(sameBarberAppointments.length + 1).padStart(2, "0");
}

// CONFIRM BOOKING

confirmButton.addEventListener("click", () => {

    const service = document.querySelector(".service-options .selected");
    const barber = document.querySelector(".barber-options .selected");
    const selectedTime = document.querySelector(".time .selected");
    const date = dateInput.value;

    // Validate all selections

    if (!service || !barber || !date || !selectedTime) {
        alert("Please select service, barber, date and time.");
        return;
    }

    // Prevent past date

    if (date < localToday) {
        alert("Please select today or a future date.");
        return;
    }

    const serviceName = service.dataset.name;
    const barberName = barber.dataset.name;
    const price = Number(service.dataset.price);
    const time = selectedTime.textContent.trim();

    const appointments = readAppointments();

    // Prevent duplicate active booking

    const alreadyBooked = appointments.some(item =>
        String(item.barber || item.barberName || "").trim().toLowerCase() ===
            barberName.trim().toLowerCase() &&
        item.date === date &&
        String(item.time || "").trim() === time &&
        !["cancelled", "canceled", "completed"].includes(
            String(item.status || "").toLowerCase()
        )
    );

    if (alreadyBooked) {
        alert("This barber already has a booking at that date and time. Please select another time.");
        return;
    }

    // Appointment details

    const customerName = getCustomer();
    let customerEmail = "";
    try {
        const loggedInUser = JSON.parse(localStorage.getItem("trimoraLoggedInUser") || "null");
        customerEmail = loggedInUser && loggedInUser.email ? loggedInUser.email : "";
    } catch (error) {}

    const appointment = {
        id: Date.now(),
        customer: customerName,
        customerName: customerName,
        email: customerEmail,
        service: serviceName,
        price: price,
        barber: barberName,
        date: date,
        time: time,
        status: "Confirmed",
        queue: generateQueue(appointments, barberName, date)
    };

    // Save all appointments

    appointments.push(appointment);

    localStorage.setItem(
        "trimoraAppointments",
        JSON.stringify(appointments)
    );

    // Keep latest appointment for existing dashboard

    localStorage.setItem(
        "trimoraAppointment",
        JSON.stringify(appointment)
    );

    alert(
        "Appointment confirmed successfully!\nYour Queue Number: #" +
        appointment.queue
    );

    window.location.href = "user.html";
});
