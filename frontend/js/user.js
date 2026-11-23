(() => {
    let user;

    try {
        user = JSON.parse(localStorage.getItem("trimoraLoggedInUser"));
    } catch {
        user = null;
    }

    if (!user?.email) {
        window.location.replace("login.html");
        return;
    }

    const $ = id => document.getElementById(id);
    const serviceBarber = document.querySelector(".service-barber");
    const details = document.querySelectorAll(".appointment-details strong");
    const status = document.querySelector(".status");
    const cancelButton = document.querySelector(".cancel-btn");
    const menuToggle = $("menu-toggle");
    const navMenu = $("nav-menu");

    const barberImages = {
        arjun: "images/arjun.jpg",
        rahul: "images/rahul.jpg",
        vikash: "images/vikash.jpg"
    };

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

    function getAppointments() {
        try {
            const data = JSON.parse(localStorage.getItem("trimoraAppointments") || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function getMyAppointment() {
        return getAppointments()
            .filter(item =>
                String(item.email || "").toLowerCase() === user.email.toLowerCase() &&
                !["cancelled", "canceled"].includes(String(item.status).toLowerCase())
            )
            .sort((a, b) => Number(b.id) - Number(a.id))[0] || null;
    }

    function loadAppointment() {
        const appointment = getMyAppointment();

        if (!appointment) {
            serviceBarber.hidden = true;
            $("service-name").textContent = "—";
            $("barber-name").textContent = "—";
            $("service-price").textContent = "—";
            details.forEach(item => item.textContent = "—");
            status.textContent = "No Appointment";
            status.className = "status no-appointment";
            cancelButton.disabled = true;
            return;
        }

        serviceBarber.hidden = false;

        const service = String(appointment.service || "").toLowerCase();
        let serviceName = appointment.service || "Haircut";
        let image = "images/haircut.jpg";
        let price = 150;

        if (service.includes("hair") && service.includes("beard")) {
            serviceName = "Hair + Beard";
            image = "images/hair & beard.jpg";
            price = 200;
        } else if (service.includes("beard")) {
            serviceName = "Beard Trim";
            image = "images/beard.jpg";
            price = 100;
        }

        $("service-name").textContent = serviceName;
        $("service-price").textContent = "₹" + (Number(appointment.price) || price);
        $("service-image").src = image;

        const barber = appointment.barber || appointment.barberName || "";
        const barberKey = Object.keys(barberImages).find(name =>
            barber.toLowerCase().includes(name)
        );

        $("barber-name").textContent = barber;
        $("barber-image").src = barberImages[barberKey] || "images/barber.jpg";
        $("barber-image").onerror = function () {
            this.onerror = null;
            this.src = "images/barber.jpg";
        };

        details[0].textContent = appointment.date || "—";
        details[1].textContent = appointment.time || "—";
        details[2].textContent = appointment.queue
            ? "#" + String(appointment.queue).replace(/^#/, "")
            : "—";

        status.textContent = appointment.status || "Confirmed";
        status.className = "status confirmed";
        cancelButton.disabled =
            String(appointment.status).toLowerCase() === "completed";
    }

    cancelButton.addEventListener("click", () => {
        const appointment = getMyAppointment();
        if (!appointment || !confirm("Are you sure you want to cancel your appointment?")) return;

        const appointments = getAppointments().map(item =>
            String(item.id) === String(appointment.id)
                ? { ...item, status: "Cancelled" }
                : item
        );

        localStorage.setItem("trimoraAppointments", JSON.stringify(appointments));
        loadAppointment();
        alert("Appointment cancelled successfully!");
    });

    $("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("trimoraLoggedInUser");
    });

    loadAppointment();
})();