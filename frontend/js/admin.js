
/* TRIMORA ADMIN DASHBOARD */

// Load saved data
let appointments = JSON.parse(
    localStorage.getItem("trimoraAppointments")
) || [];

const singleAppointment = JSON.parse(
    localStorage.getItem("trimoraAppointment")
);

if (appointments.length === 0 && singleAppointment) {
    appointments = [singleAppointment];
}

let barbers = JSON.parse(
    localStorage.getItem("trimoraBarbers")
) || [];

let services = JSON.parse(
    localStorage.getItem("trimoraServices")
) || [
    { name: "Haircut", price: 150 },
    { name: "Beard Trim", price: 100 },
    { name: "Hair + Beard", price: 200 }
];

let paymentTotal = Number(
    localStorage.getItem("trimoraPayments")
) || 0;


// Save data
function saveData() {
    localStorage.setItem(
        "trimoraAppointments",
        JSON.stringify(appointments)
    );

    localStorage.setItem(
        "trimoraBarbers",
        JSON.stringify(barbers)
    );

    localStorage.setItem(
        "trimoraServices",
        JSON.stringify(services)
    );
}


// Dashboard summary
function updateSummary() {
    document.getElementById("total-count").textContent =
        appointments.length;

    document.getElementById("pending-count").textContent =
        appointments.filter(item =>
            ["pending", "confirmed"].includes(
                (item.status || "Pending").toLowerCase()
            )
        ).length;

    document.getElementById("barber-count").textContent =
        barbers.length;

    document.getElementById("payment-total").textContent =
        "₹" + paymentTotal;
}


// Show appointments
const filter = document.getElementById("appointment-filter");
const table = document.getElementById("appointment-table");

function showAppointments() {
    const selectedStatus = filter.value;

    const filtered = appointments.filter(item => {
        const status = (item.status || "Pending").toLowerCase();

        if (selectedStatus === "all") return true;

        if (selectedStatus === "pending") {
            return status === "pending" || status === "confirmed";
        }

        return status === selectedStatus;
    });

    table.innerHTML = "";

    if (filtered.length === 0) {
        table.innerHTML =
            '<tr><td colspan="8">No appointments available.</td></tr>';
        return;
    }

    filtered.forEach(item => {
        const row = document.createElement("tr");

        const values = [
            item.customer || "Customer",
            item.service || "-",
            item.barber || "-",
            item.date || "-",
            item.time || "-",
            item.queue || "-",
            "₹" + (item.price || 0),
            item.status || "Pending"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

filter.addEventListener("change", showAppointments);


// Add and display barbers
const barberList = document.getElementById("barber-list");

function showBarbers() {
    barberList.innerHTML = "";

    if (barbers.length === 0) {
        barberList.textContent = "No barbers added yet.";
        return;
    }

    barbers.forEach((barber, index) => {
        const card = document.createElement("div");
        card.className = "stat-card";

        const name = typeof barber === "string"
            ? barber
            : barber.name;

        const details = document.createElement("div");
        details.textContent = name;

        const removeBtn = document.createElement("button");
        removeBtn.className = "add-btn";
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", () => {
            if (confirm("Remove " + name + "?")) {
                barbers.splice(index, 1);
                saveData();
                showBarbers();
                updateSummary();
            }
        });

        card.append(details, removeBtn);
        barberList.appendChild(card);
    });
}

document.getElementById("add-barber-btn").addEventListener("click", () => {
    const name = prompt("Enter barber name:");

    if (!name || !name.trim()) return;

    barbers.push({ name: name.trim() });

    saveData();
    showBarbers();
    updateSummary();
});


// Add and display services
const serviceList = document.getElementById("service-list");

function showServices() {
    serviceList.innerHTML = "";

    services.forEach((service, index) => {
        const card = document.createElement("div");
        card.className = "stat-card";

        const details = document.createElement("div");
        details.textContent = service.name + " - ₹" + service.price;

        const removeBtn = document.createElement("button");
        removeBtn.className = "add-btn";
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", () => {
            if (confirm("Remove " + service.name + "?")) {
                services.splice(index, 1);
                saveData();
                showServices();
            }
        });

        card.append(details, removeBtn);
        serviceList.appendChild(card);
    });

    if (services.length === 0) {
        serviceList.textContent = "No services added yet.";
    }
}

document.getElementById("add-service-btn").addEventListener("click", () => {
    const name = prompt("Enter service name:");

    if (!name || !name.trim()) return;

    const price = prompt("Enter service price in rupees:");

    if (price === null || price.trim() === "" ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
        alert("Please enter a valid price.");
        return;
    }

    services.push({
        name: name.trim(),
        price: Number(price)
    });

    saveData();
    showServices();
});


// Show customers from available bookings
function showCustomers() {
    const customerTable = document.getElementById("customer-table");
    const customers = {};

    appointments.forEach(item => {
        const name = item.customer || "Customer";
        const email = item.email || "";

        const key = email || name;

        if (!customers[key]) {
            customers[key] = {
                name,
                email,
                bookings: 0
            };
        }

        customers[key].bookings++;
    });

    customerTable.innerHTML = "";

    const customerList = Object.values(customers);

    if (customerList.length === 0) {
        customerTable.innerHTML =
            '<tr><td colspan="3">No customers available.</td></tr>';
        return;
    }

    customerList.forEach(customer => {
        const row = document.createElement("tr");

        [customer.name, customer.email || "-", customer.bookings]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        customerTable.appendChild(row);
    });
}


// Initial display
saveData();
updateSummary();
showAppointments();
showBarbers();
showServices();
showCustomers();
