/* TRIMORA BARBER DASHBOARD */

const appointmentList = document.getElementById("appointment-list");
const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const barberNameElement = document.getElementById("barber-name");

const loggedInBarber = localStorage.getItem("trimoraBarberName");
let activeFilter = "all";

if (loggedInBarber && barberNameElement) {
    barberNameElement.textContent = loggedInBarber;
}

function getAppointments() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("trimoraAppointments") || "[]"
        );

        if (Array.isArray(saved) && saved.length) return saved;
    } catch (error) {
        console.error("Appointment data error:", error);
    }

    try {
        const single = JSON.parse(
            localStorage.getItem("trimoraAppointment") || "null"
        );

        return single ? [single] : [];
    } catch {
        return [];
    }
}

function getStatus(appointment) {
    const status = String(appointment.status || "Pending").toLowerCase();

    if (["confirmed", "booked", "pending"].includes(status)) return "pending";
    if (["completed", "complete", "done"].includes(status)) return "completed";
    if (["cancelled", "canceled"].includes(status)) return "cancelled";

    return status;
}

function getServiceImage(service) {
    const name = service.toLowerCase();

    if (name.includes("hair") && name.includes("beard")) {
        return "images/hair & beard.jpg";
    }

    if (name.includes("beard")) return "images/beard.jpg";

    return "images/haircut.jpg";
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function getBarberAppointments() {
    if (!loggedInBarber) return [];

    return getAppointments().filter(appointment =>
        String(appointment.barber || appointment.barberName || "")
            .trim().toLowerCase() === loggedInBarber.trim().toLowerCase()
    );
}

function renderAppointments() {
    if (!appointmentList) return;

    if (!loggedInBarber) {
        totalCount.textContent = "0";
        pendingCount.textContent = "0";
        completedCount.textContent = "0";
        appointmentList.innerHTML =
            '<p class="empty-message">Barber login is not connected.</p>';
        return;
    }

    const appointments = getBarberAppointments();

    totalCount.textContent = appointments.length;
    pendingCount.textContent =
        appointments.filter(a => getStatus(a) === "pending").length;
    completedCount.textContent =
        appointments.filter(a => getStatus(a) === "completed").length;

    const filtered = appointments.filter(a =>
        activeFilter === "all" || getStatus(a) === activeFilter
    );

    if (!filtered.length) {
        appointmentList.innerHTML =
            '<p class="empty-message">No appointments available.</p>';
        return;
    }

    appointmentList.innerHTML = filtered.map(appointment => {
        const status = getStatus(appointment);
        const service = appointment.service || appointment.serviceName || "Service";
        const customer = appointment.customer || appointment.customerName ||
            appointment.name || "Customer";
        const price = appointment.price ?? appointment.servicePrice;
        const queue = appointment.queue || "—";

        return `
            <article class="appointment-card" data-id="${escapeHTML(appointment.id ?? "")}">
                <img class="service-image"
                     src="${getServiceImage(service)}"
                     alt="${escapeHTML(service)}">

                <div class="customer-info">
                    <h3>${escapeHTML(customer)}</h3>
                    <p>${escapeHTML(service)}${price !== undefined && price !== null && price !== "" ? " · ₹" + escapeHTML(price) : ""}</p>
                </div>

                <div class="appointment-info">
                    <span class="status ${status}">${escapeHTML(status)}</span>
                    <span class="queue-label">Queue</span>
                    <strong class="queue-number">${escapeHTML(queue)}</strong>
                </div>

                <div class="appointment-actions">
                    ${status === "pending" ? `
                        <button type="button" class="complete-btn" data-action="complete">Mark Complete</button>
                        <button type="button" class="cancel-btn" data-action="cancel">Cancel</button>
                    ` : ""}
                </div>
            </article>
        `;
    }).join("");
}

// Mobile Navigation
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close menu after clicking a navigation link
navMenu?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// Filter buttons
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");
        activeFilter = button.dataset.filter || "all";
        renderAppointments();
    });
});

// Complete or cancel appointment
appointmentList?.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const card = button.closest(".appointment-card");
    const id = card?.dataset.id;

    if (button.dataset.action === "cancel" &&
        !confirm("Are you sure you want to cancel this appointment?")) {
        return;
    }

    const appointments = getAppointments();
    const appointment = appointments.find(item =>
        String(item.id ?? "") === String(id ?? "") &&
        String(item.barber || item.barberName || "").trim().toLowerCase() ===
            String(loggedInBarber || "").trim().toLowerCase()
    );

    if (!appointment) {
        alert("Appointment could not be found.");
        return;
    }

    appointment.status =
        button.dataset.action === "complete" ? "Completed" : "Cancelled";

    localStorage.setItem(
        "trimoraAppointments",
        JSON.stringify(appointments)
    );

    localStorage.setItem(
        "trimoraAppointment",
        JSON.stringify(appointment)
    );

    renderAppointments();
});

// Initial display
renderAppointments();
