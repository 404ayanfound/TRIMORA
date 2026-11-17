const serviceBarber = document.querySelector(".service-barber");
const serviceName = document.getElementById("service-name");
const barberName = document.getElementById("barber-name");
const servicePrice = document.getElementById("service-price");
const serviceImage = document.getElementById("service-image");
const barberImage = document.getElementById("barber-image");
const details = document.querySelectorAll(".appointment-details strong");
const status = document.querySelector(".status");
const cancelButton = document.querySelector(".cancel-btn");

const barberImages = {
    arjun: "images/arjun.jpg",
    rahul: "images/rahul.jpg",
    vikash: "images/vikash.jpg"
};

function getAppointment() {
    try {
        return JSON.parse(localStorage.getItem("trimoraAppointment") || "null");
    } catch (error) {
        return null;
    }
}

function loadAppointment() {
    const appointment = getAppointment();

    if (appointment && appointment.service) {
        serviceBarber.hidden = false;

        const fullService = String(appointment.service).trim();
        const service = fullService.toLowerCase();
        let serviceLabel;
        let defaultPrice;
        let imagePath;

        if (service.includes("hair") && service.includes("beard")) {
            serviceLabel = "Hair + Beard";
            defaultPrice = "₹200";
            imagePath = "images/hair & beard.jpg";
        } else if (service.includes("beard")) {
            serviceLabel = "Beard Trim";
            defaultPrice = "₹100";
            imagePath = "images/beard.jpg";
        } else {
            serviceLabel = "Haircut";
            defaultPrice = "₹150";
            imagePath = "images/haircut.jpg";
        }

        const savedPrice = fullService.match(/₹\s*[\d,]+/);

        serviceName.textContent = serviceLabel;
        servicePrice.textContent = savedPrice ? savedPrice[0] : defaultPrice;
        serviceImage.src = imagePath;

        barberName.textContent = appointment.barber || "—";

        const selectedBarber = String(appointment.barber || "").trim().toLowerCase();
        const barberKey = Object.keys(barberImages).find(name =>
            selectedBarber.includes(name)
        );
        const selectedImage = barberKey ? barberImages[barberKey] : "images/barber.jpg";

        barberImage.onerror = function () {
            this.onerror = null;
            this.src = "images/barber.jpg";
        };
        barberImage.src = selectedImage;

        details[0].textContent = appointment.date || "—";
        details[1].textContent = appointment.time || "—";
        details[2].textContent = appointment.queue || "—";

        status.textContent = appointment.status || "Booked";
        cancelButton.disabled = false;
    } else {
        serviceBarber.hidden = true;

        serviceName.textContent = "—";
        barberName.textContent = "—";
        servicePrice.textContent = "—";
        details.forEach(detail => detail.textContent = "—");

        status.textContent = "No Appointment";
        cancelButton.disabled = true;
    }
}

loadAppointment();

cancelButton.addEventListener("click", () => {
    if (!getAppointment()) {
        loadAppointment();
        return;
    }

    if (confirm("Are you sure you want to cancel your appointment?")) {
        localStorage.removeItem("trimoraAppointment");
        loadAppointment();
        alert("Appointment cancelled successfully!");
    }
});