// ==========================================
// ORDERS MANAGEMENT
// ==========================================

const ordersTable =
    document.getElementById("ordersTable");

const ordersMessage =
    document.getElementById("ordersMessage");

const totalOrders =
    document.getElementById("totalOrders");

const pendingOrders =
    document.getElementById("pendingOrders");

const completedOrders =
    document.getElementById("completedOrders");


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    try {

        const response =
            await fetch("/api/orders");

        const orders =
            await response.json();


        ordersTable.innerHTML = "";

        ordersMessage.textContent = "";


        // Summary

        totalOrders.textContent =
            orders.length;


        const pending =
            orders.filter(
                order =>
                    order.status === "Pending"
            ).length;


        const completed =
            orders.filter(
                order =>
                    order.status === "Delivered"
            ).length;


        pendingOrders.textContent =
            pending;

        completedOrders.textContent =
            completed;


        // No orders

        if (orders.length === 0) {

            ordersMessage.textContent =
                "No orders found.";

            return;
        }


        // Display orders

        orders.forEach(order => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    #${order.id}
                </td>

                <td>
                    ${order.customer_name || "Customer"}
                </td>

                <td>
                    ${order.items || "Food items"}
                </td>

                <td>
                    ₹${Number(order.total_amount || 0).toFixed(2)}
                </td>

                <td>

                    <select
                        class="status-select"
                        data-id="${order.id}"
                    >

                        <option value="Pending"
                            ${order.status === "Pending" ? "selected" : ""}>
                            Pending
                        </option>

                        <option value="Accepted"
                            ${order.status === "Accepted" ? "selected" : ""}>
                            Accepted
                        </option>

                        <option value="Rejected"
                            ${order.status === "Rejected" ? "selected" : ""}>
                            Rejected
                        </option>

                        <option value="Preparing"
                            ${order.status === "Preparing" ? "selected" : ""}>
                            Preparing
                        </option>

                        <option value="Ready"
                            ${order.status === "Ready" ? "selected" : ""}>
                            Ready
                        </option>

                        <option value="Delivered"
                            ${order.status === "Delivered" ? "selected" : ""}>
                            Delivered
                        </option>

                    </select>

                </td>

            `;


            ordersTable.appendChild(row);

        });


        // Add status listeners

        document
            .querySelectorAll(".status-select")
            .forEach(select => {

                select.addEventListener(
                    "change",
                    updateOrderStatus
                );

            });


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );

        ordersMessage.textContent =
            "Unable to load orders.";

    }

}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function updateOrderStatus(event) {

    const select =
        event.target;

    const orderId =
        select.dataset.id;

    const newStatus =
        select.value;


    try {

        const response =
            await fetch(
                `/api/orders/${orderId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to update order."
            );

            return;
        }


        loadOrders();


    } catch (error) {

        console.error(
            "Error updating order:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


// ==========================================
// BACK TO DASHBOARD
// ==========================================

document
    .getElementById("backBtn")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "dashboard.html";

        }
    );


// ==========================================
// INITIAL LOAD
// ==========================================

loadOrders();