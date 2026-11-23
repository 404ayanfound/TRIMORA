(() => {
    const loggedInBarber = localStorage.getItem("trimoraBarberName");

    if (!loggedInBarber) {
        window.location.replace("barber-login.html");
        return;
    }

    const $ = id => document.getElementById(id);
    const appointmentList = $("appointment-list");
    let activeFilter = "all";

    $("barber-name").textContent = loggedInBarber;

    function getAppointments() {
        try {
            const data = JSON.parse(localStorage.getItem("trimoraAppointments") || "[]");
            if (Array.isArray(data) && data.length) return data;
        } catch {}

        try {
            const old = JSON.parse(localStorage.getItem("trimoraAppointment") || "null");
            return old ? [old] : [];
        } catch {
            return [];
        }
    }

    function getStatus(item) {
        const status = String(item.status || "Pending").toLowerCase();
        if (["confirmed", "booked", "pending"].includes(status)) return "pending";
        if (["completed", "complete", "done"].includes(status)) return "completed";
        if (["cancelled", "canceled"].includes(status)) return "cancelled";
        return status;
    }

    function serviceImage(service) {
        const name = service.toLowerCase();
        if (name.includes("hair") && name.includes("beard")) return "images/hair & beard.jpg";
        if (name.includes("beard")) return "images/beard.jpg";
        return "images/haircut.jpg";
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[char]);
    }

    function getBarberAppointments() {
        return getAppointments().filter(item =>
            String(item.barber || item.barberName || "").trim().toLowerCase() ===
            loggedInBarber.trim().toLowerCase()
        );
    }

    function renderAppointments() {
        const appointments = getBarberAppointments();
        const pending = appointments.filter(item => getStatus(item) === "pending");
        const completed = appointments.filter(item => getStatus(item) === "completed");

        $("total-count").textContent = appointments.length;
        $("pending-count").textContent = pending.length;
        $("completed-count").textContent = completed.length;

        const filtered = appointments.filter(item =>
            activeFilter === "all" || getStatus(item) === activeFilter
        );

        if (!filtered.length) {
            appointmentList.innerHTML = '<p class="empty-message">No appointments available.</p>';
            return;
        }

        appointmentList.innerHTML = filtered.map(item => {
            const status = getStatus(item);
            const service = item.service || item.serviceName || "Service";
            const customer = item.customer || item.customerName || item.name || "Customer";
            const price = item.price ?? item.servicePrice ?? "";
            const queue = item.queue || "—";

            return `
                <article class="appointment-card" data-id="${escapeHTML(item.id ?? "")}">
                    <img class="service-image" src="${serviceImage(service)}" alt="${escapeHTML(service)}">
                    <div class="customer-info">
                        <h3>${escapeHTML(customer)}</h3>
                        <p>${escapeHTML(service)}${price !== "" ? " · ₹" + escapeHTML(price) : ""}</p>
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

    const menuToggle = $("menu-toggle");
    const navMenu = $("nav-menu");

    menuToggle?.addEventListener("click", () => {
        const open = navMenu.classList.toggle("active");
        menuToggle.textContent = open ? "✕" : "☰";
        menuToggle.setAttribute("aria-expanded", open);
    });

    navMenu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(item =>
                item.classList.remove("active")
            );
            button.classList.add("active");
            activeFilter = button.dataset.filter || "all";
            renderAppointments();
        });
    });

    appointmentList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        if (button.dataset.action === "cancel" &&
            !confirm("Are you sure you want to cancel this appointment?")) return;

        const card = button.closest(".appointment-card");
        const appointments = getAppointments();
        const appointment = appointments.find(item =>
            String(item.id ?? "") === String(card?.dataset.id ?? "") &&
            String(item.barber || item.barberName || "").trim().toLowerCase() ===
                loggedInBarber.trim().toLowerCase()
        );

        if (!appointment) {
            alert("Appointment could not be found.");
            return;
        }

        appointment.status = button.dataset.action === "complete"
            ? "Completed"
            : "Cancelled";

        localStorage.setItem("trimoraAppointments", JSON.stringify(appointments));
        renderAppointments();
    });

    $("barber-logout")?.addEventListener("click", () => {
        ["trimoraBarberName", "trimoraBarberEmail", "trimoraLoggedInBarber"]
            .forEach(key => localStorage.removeItem(key));
    });

    renderAppointments();
})();