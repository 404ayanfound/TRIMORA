
/* TRIMORA BOOK APPOINTMENT */

// Selection buttons
const serviceButtons = document.querySelectorAll(".service-options button");
const barberButtons = document.querySelectorAll(".barber-options button");
const timeButtons = document.querySelectorAll(".time button");

const summaryService = document.getElementById("summary-service");
const summaryBarber = document.getElementById("summary-barber");
const summaryDate = document.getElementById("summary-date");
const summaryTime = document.getElementById("summary-time");
const dateInput = document.querySelector('input[type="date"]');
const confirmButton = document.querySelector(".summary button");

// Service selection
serviceButtons.forEach(button => {
    button.addEventListener("click", () => {
        serviceButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        summaryService.textContent =
            "Service: " + (button.dataset.name || button.textContent.trim()) +
            " - ₹" + (button.dataset.price || 0);
    });
});

// Barber selection
barberButtons.forEach(button => {
    button.addEventListener("click", () => {
        barberButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        summaryBarber.textContent =
            "Barber: " + (button.dataset.name || button.textContent.trim());
    });
});

// Date selection
dateInput?.addEventListener("change", function () {
    summaryDate.textContent = "Date: " + this.value;
});

// Time selection
timeButtons.forEach(button => {
    button.addEventListener("click", () => {
        timeButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        summaryTime.textContent = "Time: " + button.textContent.trim();
    });
});

// Read saved JSON safely
function readAppointments() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("trimoraAppointments") || "[]"
        );

        if (Array.isArray(saved) && saved.length > 0) {
            return saved;
        }
    } catch (error) {
        console.error("Could not read appointments:", error);
    }

    try {
        const single = JSON.parse(
            localStorage.getItem("trimoraAppointment") || "null"
        );

        return single ? [single] : [];
    } catch (error) {
        return [];
    }
}

// Confirm appointment
confirmButton?.addEventListener("click", () => {
    const service = document.querySelector(".service-options .selected");
    const barber = document.querySelector(".barber-options .selected");
    const time = document.querySelector(".time .selected");
    const date = dateInput?.value;

    if (!service || !barber || !date || !time) {
        alert("Please select service, barber, date and time.");
        return;
    }

    // Customer name from possible login storage keys
    const customerName =
        localStorage.getItem("trimoraCustomerName") ||
        localStorage.getItem("customerName") ||
        localStorage.getItem("userName") ||
        localStorage.getItem("trimoraUserName") ||
        "Customer";

    const serviceName =
        service.dataset.name || service.textContent.trim();

    const barberName =
        barber.dataset.name || barber.textContent.trim();

    const price = Number(service.dataset.price || 0);

    const appointments = readAppointments();

    // Prevent duplicate booking for same barber/date/time
    const alreadyBooked = appointments.some(item =>
        String(item.barber || item.barberName || "").trim().toLowerCase() ===
            barberName.trim().toLowerCase() &&
        item.date === date &&
        String(item.time || "").trim() === time.textContent.trim() &&
        !["cancelled", "canceled", "completed"].includes(
            String(item.status || "").toLowerCase()
        )
    );

    if (alreadyBooked) {
        alert("This barber already has a booking at that date and time. Please select another time.");
        return;
    }

    const appointment = {
        id: Date.now(),
        customer: customerName,
        customerName: customerName,
        service: serviceName,
        price: price,
        barber: barberName,
        date: date,
        time: time.textContent.trim(),
        status: "Confirmed",
        queue: "—"
    };

    appointments.push(appointment);

    localStorage.setItem(
        "trimoraAppointments",
        JSON.stringify(appointments)
    );

    localStorage.setItem(
        "trimoraAppointment",
        JSON.stringify(appointment)
    );

    alert("Appointment confirmed successfully!");

    window.location.href = "user.html";
});
