(() => {
    if (localStorage.getItem("trimoraAdminLoggedIn") !== "true") {
        window.location.replace("admin-login.html");
        return;
    }

    const $ = id => document.getElementById(id);
    const read = (key, fallback) => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return data ?? fallback;
        } catch {
            return fallback;
        }
    };

    let appointments = read("trimoraAppointments", []);
    const oldAppointment = read("trimoraAppointment", null);
    if (!appointments.length && oldAppointment) appointments = [oldAppointment];

    let barbers = read("trimoraBarbers", []);
    let services = read("trimoraServices", [
        { name: "Haircut", price: 150 },
        { name: "Beard Trim", price: 100 },
        { name: "Hair + Beard", price: 200 }
    ]);

    const filter = $("appointment-filter");
    const appointmentTable = $("appointment-table");
    const barberList = $("barber-list");
    const serviceList = $("service-list");
    const customerTable = $("customer-table");

    function saveData() {
        localStorage.setItem("trimoraAppointments", JSON.stringify(appointments));
        localStorage.setItem("trimoraBarbers", JSON.stringify(barbers));
        localStorage.setItem("trimoraServices", JSON.stringify(services));
    }

    function updateSummary() {
        $("total-count").textContent = appointments.length;
        $("pending-count").textContent = appointments.filter(item =>
            ["pending", "confirmed"].includes(String(item.status || "Pending").toLowerCase())
        ).length;
        $("barber-count").textContent = barbers.length;

        const total = appointments
            .filter(item => !["cancelled", "canceled"].includes(String(item.status).toLowerCase()))
            .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

        $("payment-total").textContent = "₹" + total;
    }

    function addTableRow(table, values) {
        const row = document.createElement("tr");
        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        table.appendChild(row);
    }

    function showAppointments() {
        const selected = filter.value;
        const filtered = appointments.filter(item => {
            const status = String(item.status || "Pending").toLowerCase();
            if (selected === "all") return true;
            if (selected === "pending") return ["pending", "confirmed"].includes(status);
            return status === selected;
        });

        appointmentTable.innerHTML = "";

        if (!filtered.length) {
            appointmentTable.innerHTML = '<tr><td colspan="8">No appointments available.</td></tr>';
            return;
        }

        filtered.forEach(item => addTableRow(appointmentTable, [
            item.customer || item.customerName || "Customer",
            item.service || "-",
            item.barber || "-",
            item.date || "-",
            item.time || "-",
            item.queue || "-",
            "₹" + (Number(item.price) || 0),
            item.status || "Pending"
        ]));
    }

    function showBarbers() {
        barberList.innerHTML = "";

        if (!barbers.length) {
            barberList.textContent = "No barbers added yet.";
            return;
        }

        barbers.forEach((barber, index) => {
            const name = typeof barber === "string" ? barber : barber.name;
            const card = document.createElement("div");
            const details = document.createElement("div");
            const title = document.createElement("strong");
            const email = document.createElement("p");
            const remove = document.createElement("button");

            card.className = "stat-card";
            title.textContent = name || "Barber";
            email.textContent = barber.email || "Email not available";
            remove.className = "add-btn";
            remove.textContent = "Remove";

            details.append(title, email);
            remove.addEventListener("click", () => {
                if (!confirm("Remove " + name + "?")) return;
                barbers.splice(index, 1);
                saveData();
                showBarbers();
                updateSummary();
            });

            card.append(details, remove);
            barberList.appendChild(card);
        });
    }

    $("add-barber-btn").addEventListener("click", () => {
        const name = prompt("Enter barber name:");
        if (!name?.trim()) return;

        const email = prompt("Enter barber email:")?.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (barbers.some(item =>
            typeof item === "object" && item.email?.toLowerCase() === email
        )) {
            alert("This barber email already exists.");
            return;
        }

        const password = prompt("Create barber password (minimum 6 characters):");
        if (!password || password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        const image = prompt("Enter barber image path:", "images/barber.jpg") || "images/barber.jpg";
        barbers.push({ name: name.trim(), email, password, image });
        saveData();
        showBarbers();
        updateSummary();
        alert("Barber account created successfully!");
    });

    function showServices() {
        serviceList.innerHTML = "";

        if (!services.length) {
            serviceList.textContent = "No services added yet.";
            return;
        }

        services.forEach((service, index) => {
            const card = document.createElement("div");
            const details = document.createElement("div");
            const remove = document.createElement("button");

            card.className = "stat-card";
            details.textContent = service.name + " - ₹" + service.price;
            remove.className = "add-btn";
            remove.textContent = "Remove";

            remove.addEventListener("click", () => {
                if (!confirm("Remove " + service.name + "?")) return;
                services.splice(index, 1);
                saveData();
                showServices();
            });

            card.append(details, remove);
            serviceList.appendChild(card);
        });
    }

    $("add-service-btn").addEventListener("click", () => {
        const name = prompt("Enter service name:");
        if (!name?.trim()) return;

        const price = prompt("Enter service price in rupees:");
        if (price === null || price.trim() === "" ||
            !Number.isFinite(Number(price)) || Number(price) < 0) {
            alert("Please enter a valid price.");
            return;
        }

        const images = {
            "haircut": "images/haircut.jpg",
            "beard trim": "images/beard.jpg",
            "hair + beard": "images/hair & beard.jpg"
        };
        const defaultImage = images[name.trim().toLowerCase()] || "images/haircut.jpg";
        const image = prompt("Enter service image path:", defaultImage) || defaultImage;
        services.push({ name: name.trim(), price: Number(price), image });
        saveData();
        showServices();
    });

    function showCustomers() {
        const customers = {};

        appointments.forEach(item => {
            const name = item.customer || item.customerName || "Customer";
            const email = item.email || "";
            const key = email || name;

            if (!customers[key]) customers[key] = { name, email, bookings: 0 };
            customers[key].bookings++;
        });

        customerTable.innerHTML = "";
        const list = Object.values(customers);

        if (!list.length) {
            customerTable.innerHTML = '<tr><td colspan="3">No customers available.</td></tr>';
            return;
        }

        list.forEach(item => addTableRow(customerTable, [
            item.name, item.email || "-", item.bookings
        ]));
    }

    filter.addEventListener("change", showAppointments);

    $("admin-logout").addEventListener("click", event => {
        event.preventDefault();
        localStorage.removeItem("trimoraAdminLoggedIn");
        window.location.href = "admin-login.html";
    });

    saveData();
    updateSummary();
    showAppointments();
    showBarbers();
    showServices();
    showCustomers();
})();