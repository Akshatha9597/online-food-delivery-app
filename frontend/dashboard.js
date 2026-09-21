const logoutBtn =
    document.getElementById("logoutBtn");

const menuBtn =
    document.getElementById("menuBtn");

const ordersTable =
    document.getElementById("ordersTable");

const totalOrders =
    document.getElementById("totalOrders");

const pendingOrders =
    document.getElementById("pendingOrders");

const menuItems =
    document.getElementById("menuItems");

const todaySales =
    document.getElementById("todaySales");

const restaurantStatus =
    document.getElementById("restaurantStatus");

const availabilityBtn =
    document.getElementById("availabilityBtn");


// ===============================
// Logout
// ===============================

logoutBtn.addEventListener("click", () => {

    window.location.href = "index.html";

});


// ===============================
// Menu Management
// ===============================

menuBtn.addEventListener("click", () => {

    window.location.href = "menu.html";

});


// ===============================
// Restaurant Availability
// ===============================

let restaurantIsOpen = true;


// Load Restaurant Status

async function loadRestaurantStatus() {

    restaurantStatus.textContent =
        "Checking restaurant status...";

    availabilityBtn.textContent =
        "Loading...";


    try {

        const response = await fetch(
            "http://localhost:5000/api/restaurant/status"
        );


        if (!response.ok) {

            throw new Error(
                "Server returned " + response.status
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            restaurantStatus.textContent =
                "Unable to load restaurant status.";

            availabilityBtn.textContent =
                "Try Again";

            return;

        }


        restaurantIsOpen =
            Boolean(data.restaurant.is_open);


        updateAvailabilityDisplay();


    } catch (error) {

        console.error(
            "Restaurant status error:",
            error
        );


        restaurantStatus.textContent =
            "Unable to connect to server.";

        availabilityBtn.textContent =
            "Try Again";

    }

}


// Update Restaurant Display

function updateAvailabilityDisplay() {

    if (restaurantIsOpen) {

        restaurantStatus.textContent =
            "🟢 Restaurant is OPEN";

        availabilityBtn.textContent =
            "Close Restaurant";

    } else {

        restaurantStatus.textContent =
            "🔴 Restaurant is CLOSED";

        availabilityBtn.textContent =
            "Open Restaurant";

    }

}


// Change Restaurant Status

availabilityBtn.addEventListener(
    "click",
    async () => {

        if (
            availabilityBtn.textContent ===
            "Try Again"
        ) {

            loadRestaurantStatus();

            return;

        }


        const newStatus =
            !restaurantIsOpen;


        availabilityBtn.disabled = true;


        try {

            const response = await fetch(
                "http://localhost:5000/api/restaurant/status",
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        isOpen:
                            newStatus

                    })

                }
            );


            const data =
                await response.json();


            if (data.success) {

                restaurantIsOpen =
                    newStatus;

                updateAvailabilityDisplay();

            } else {

                alert(data.message);

            }


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );


            alert(
                "Unable to update restaurant status."
            );

        }


        availabilityBtn.disabled = false;

    }
);


// ===============================
// Update Order Status
// ===============================

async function updateOrderStatus(
    id,
    status
) {

    try {

        const response = await fetch(
            "http://localhost:5000/api/orders/" + id,
            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    status:
                        status

                })

            }
        );


        const data =
            await response.json();


        if (data.success) {

            loadOrders();

        } else {

            alert(data.message);

        }


    } catch (error) {

        console.error(
            "Order update error:",
            error
        );


        alert(
            "Unable to update order."
        );

    }

}


// ===============================
// Reject Order
// ===============================

function rejectOrder(id) {

    const confirmReject =
        confirm(
            "Are you sure you want to reject this order?"
        );


    if (!confirmReject) {

        return;

    }


    updateOrderStatus(
        id,
        "Rejected"
    );

}


window.updateOrderStatus =
    updateOrderStatus;

window.rejectOrder =
    rejectOrder;


// ===============================
// Load Orders
// ===============================

async function loadOrders() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/orders"
        );


        const data =
            await response.json();


        if (!data.success) {

            alert(data.message);

            return;

        }


        ordersTable.innerHTML = "";


        data.orders.forEach(order => {

            const row =
                document.createElement("tr");


            let actions = "";


            // Pending

            if (
                order.status === "Pending"
            ) {

                actions = `

                    <button
                        type="button"
                        onclick="updateOrderStatus(
                            ${order.id},
                            'Accepted'
                        )"
                    >
                        Accept
                    </button>


                    <button
                        type="button"
                        onclick="rejectOrder(
                            ${order.id}
                        )"
                    >
                        Reject
                    </button>

                `;

            }


            // Accepted

            else if (
                order.status === "Accepted"
            ) {

                actions = `

                    <button
                        type="button"
                        onclick="updateOrderStatus(
                            ${order.id},
                            'Preparing'
                        )"
                    >
                        Start Preparing
                    </button>

                `;

            }


            // Preparing

            else if (
                order.status === "Preparing"
            ) {

                actions = `

                    <button
                        type="button"
                        onclick="updateOrderStatus(
                            ${order.id},
                            'Ready'
                        )"
                    >
                        Mark Ready
                    </button>

                `;

            }


            // Ready

            else if (
                order.status === "Ready"
            ) {

                actions = `

                    <button
                        type="button"
                        onclick="updateOrderStatus(
                            ${order.id},
                            'Delivered'
                        )"
                    >
                        Mark Delivered
                    </button>

                `;

            }


            // Rejected

            else if (
                order.status === "Rejected"
            ) {

                actions = `
                    <span>
                        Order rejected
                    </span>
                `;

            }


            // Delivered

            else if (
                order.status === "Delivered"
            ) {

                actions = `
                    <span>
                        Completed
                    </span>
                `;

            }


            row.innerHTML = `

                <td>
                    #${order.id}
                </td>


                <td>
                    ${order.customer_name}
                </td>


                <td>
                    ${order.items}
                </td>


                <td>
                    ₹${Number(
                        order.amount
                    ).toFixed(2)}
                </td>


                <td>
                    ${order.status}
                </td>


                <td>
                    ${actions}
                </td>

            `;


            ordersTable.appendChild(row);

        });


        // =========================
        // Dashboard Statistics
        // =========================

        totalOrders.textContent =
            data.orders.length;


        const pendingCount =
            data.orders.filter(
                order =>
                    order.status ===
                    "Pending"
            ).length;


        pendingOrders.textContent =
            pendingCount;


        // =========================
        // Today's Sales
        // =========================

        const today =
            new Date();


        const todayDate =
            today.toISOString()
                .split("T")[0];


        const salesToday =
            data.orders
                .filter(order => {

                    if (!order.order_date) {

                        return false;

                    }


                    const orderDate =
                        new Date(
                            order.order_date
                        );


                    const orderDateString =
                        orderDate
                            .toISOString()
                            .split("T")[0];


                    return (
                        orderDateString ===
                        todayDate
                    );

                })
                .reduce(
                    (
                        total,
                        order
                    ) =>
                        total +
                        Number(
                            order.amount
                        ),
                    0
                );


        todaySales.textContent =
            "₹" +
            salesToday.toFixed(2);


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );

    }

}


// ===============================
// Load Menu Count
// ===============================

async function loadMenuCount() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/menu"
        );


        const data =
            await response.json();


        if (data.success) {

            menuItems.textContent =
                data.menu.length;

        }

    } catch (error) {

        console.error(
            "Menu count error:",
            error
        );

    }

}


// ===============================
// Start Dashboard
// ===============================

loadRestaurantStatus();

loadOrders();

loadMenuCount();