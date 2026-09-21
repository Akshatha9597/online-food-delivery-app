const API =
    "http://localhost:5000/api";


// ===============================
// ELEMENTS
// ===============================

const backBtn =
    document.getElementById("backBtn");

const menuForm =
    document.getElementById("menuForm");

const menuTable =
    document.getElementById("menuTable");

const menuMessage =
    document.getElementById("menuMessage");

const formTitle =
    document.getElementById("formTitle");

const submitBtn =
    document.getElementById("submitBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const searchMenu =
    document.getElementById("searchMenu");

const categoryFilter =
    document.getElementById("categoryFilter");

const availabilityFilter =
    document.getElementById("availabilityFilter");

const totalMenuItems =
    document.getElementById("totalMenuItems");

const availableItems =
    document.getElementById("availableItems");

const unavailableItems =
    document.getElementById("unavailableItems");

const totalCategories =
    document.getElementById("totalCategories");


// ===============================
// STATE
// ===============================

let editingId = null;

let allMenuItems = [];


// ===============================
// BACK TO DASHBOARD
// ===============================

backBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "dashboard.html";

    }
);


// ===============================
// MESSAGE
// ===============================

function showMessage(
    message,
    success = true
) {

    menuMessage.textContent =
        message;

    menuMessage.className =
        success
            ? "success-message"
            : "error-message";


    setTimeout(() => {

        menuMessage.textContent =
            "";

        menuMessage.className =
            "";

    }, 3000);

}


// ===============================
// LOAD MENU
// ===============================

async function loadMenu() {

    try {

        const response =
            await fetch(
                `${API}/menu`
            );


        const data =
            await response.json();


        if (!data.success) {

            showMessage(
                data.message,
                false
            );

            return;

        }


        allMenuItems =
            data.menu || [];


        updateStatistics();

        populateCategories();

        renderMenu();


    } catch (error) {

        console.error(
            "Menu loading error:",
            error
        );


        showMessage(
            "Unable to connect to server.",
            false
        );

    }

}


// ===============================
// STATISTICS
// ===============================

function updateStatistics() {

    const total =
        allMenuItems.length;


    const available =
        allMenuItems.filter(
            item =>
                Boolean(
                    item.is_available
                )
        ).length;


    const unavailable =
        total - available;


    const categories =
        new Set(
            allMenuItems.map(
                item =>
                    item.category
            )
        );


    totalMenuItems.textContent =
        total;

    availableItems.textContent =
        available;

    unavailableItems.textContent =
        unavailable;

    totalCategories.textContent =
        categories.size;

}


// ===============================
// CATEGORY FILTER
// ===============================

function populateCategories() {

    const currentValue =
        categoryFilter.value;


    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    const categories =
        [
            ...new Set(
                allMenuItems.map(
                    item =>
                        item.category
                )
            )
        ].sort();


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;

            option.textContent =
                category;


            categoryFilter.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            currentValue
        )
    ) {

        categoryFilter.value =
            currentValue;

    }

}


// ===============================
// RENDER MENU
// ===============================

function renderMenu() {

    const search =
        searchMenu.value
            .trim()
            .toLowerCase();


    const category =
        categoryFilter.value;


    const availability =
        availabilityFilter.value;


    const filtered =
        allMenuItems.filter(
            item => {

                const matchesSearch =
                    item.food_name
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchesCategory =
                    category === "all" ||
                    item.category ===
                        category;


                const isAvailable =
                    Boolean(
                        item.is_available
                    );


                const matchesAvailability =
                    availability === "all" ||

                    (
                        availability ===
                            "available" &&
                        isAvailable
                    ) ||

                    (
                        availability ===
                            "unavailable" &&
                        !isAvailable
                    );


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesAvailability
                );

            }
        );


    menuTable.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        menuTable.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-state"
                >
                    No matching food items found.
                </td>

            </tr>

        `;

        return;

    }


    filtered.forEach(
        item => {

            const row =
                document.createElement(
                    "tr"
                );


            const available =
                Boolean(
                    item.is_available
                );


            const description =
                item.description ||
                "No description added";


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            item.food_name
                        )}
                    </strong>

                </td>


                <td>

                    <span class="food-description">

                        ${escapeHTML(
                            description
                        )}

                    </span>

                </td>


                <td>

                    <span class="category-badge">

                        ${escapeHTML(
                            item.category
                        )}

                    </span>

                </td>


                <td>

                    ₹${Number(
                        item.price
                    ).toFixed(2)}

                </td>


                <td>

                    <span class="status-badge ${
                        available
                            ? "status-available"
                            : "status-unavailable"
                    }">

                        ${
                            available
                                ? "Available"
                                : "Unavailable"
                        }

                    </span>

                </td>


                <td>

                    <button
                        type="button"
                        class="small-btn editBtn"
                        data-id="${item.id}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="small-btn availabilityBtn"
                        data-id="${item.id}"
                        data-available="${available}"
                    >

                        ${
                            available
                                ? "Disable"
                                : "Enable"
                        }

                    </button>


                    <button
                        type="button"
                        class="small-btn delete-btn deleteBtn"
                        data-id="${item.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            menuTable.appendChild(
                row
            );

        }
    );

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ===============================
// ADD / EDIT MENU ITEM
// ===============================

menuForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const foodName =
            document.getElementById(
                "foodName"
            ).value.trim();


        const description =
            document.getElementById(
                "foodDescription"
            ).value.trim();


        const price =
            Number(
                document.getElementById(
                    "foodPrice"
                ).value
            );


        const category =
            document.getElementById(
                "foodCategory"
            ).value;


        // =========================
        // VALIDATION
        // =========================

        if (
            foodName.length < 2
        ) {

            showMessage(
                "Food name must contain at least 2 characters.",
                false
            );

            return;

        }


        if (
            description.length < 5
        ) {

            showMessage(
                "Please enter a short food description.",
                false
            );

            return;

        }


        if (
            !price ||
            price <= 0
        ) {

            showMessage(
                "Please enter a valid price.",
                false
            );

            return;

        }


        if (!category) {

            showMessage(
                "Please select a category.",
                false
            );

            return;

        }


        submitBtn.disabled =
            true;


        try {

            const url =
                editingId === null
                    ? `${API}/menu`
                    : `${API}/menu/${editingId}`;


            const method =
                editingId === null
                    ? "POST"
                    : "PUT";


            const response =
                await fetch(
                    url,
                    {

                        method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },


                        body:
                            JSON.stringify({

                                foodName:
                                    foodName,

                                description:
                                    description,

                                price:
                                    price,

                                category:
                                    category

                            })

                    }
                );


            const data =
                await response.json();


            if (!data.success) {

                showMessage(
                    data.message,
                    false
                );

                return;

            }


            showMessage(
                data.message,
                true
            );


            resetForm();

            await loadMenu();


        } catch (error) {

            console.error(
                "Menu save error:",
                error
            );


            showMessage(
                "Unable to save food item.",
                false
            );


        } finally {

            submitBtn.disabled =
                false;

        }

    }
);


// ===============================
// CANCEL EDIT
// ===============================

cancelBtn.addEventListener(
    "click",
    resetForm
);


function resetForm() {

    menuForm.reset();


    editingId =
        null;


    formTitle.textContent =
        "Add New Menu Item";


    submitBtn.textContent =
        "Add Food Item";


    cancelBtn.style.display =
        "none";

}


// ===============================
// MENU BUTTON ACTIONS
// ===============================

menuTable.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {

            return;

        }


        const id =
            button.dataset.id;


        // =========================
        // EDIT
        // =========================

        if (
            button.classList.contains(
                "editBtn"
            )
        ) {

            const item =
                allMenuItems.find(
                    food =>
                        String(
                            food.id
                        ) === String(id)
                );


            if (!item) {

                return;

            }


            editingId =
                item.id;


            document.getElementById(
                "foodName"
            ).value =
                item.food_name;


            document.getElementById(
                "foodDescription"
            ).value =
                item.description || "";


            document.getElementById(
                "foodPrice"
            ).value =
                item.price;


            document.getElementById(
                "foodCategory"
            ).value =
                item.category;


            formTitle.textContent =
                "Edit Menu Item";


            submitBtn.textContent =
                "Update Food Item";


            cancelBtn.style.display =
                "inline-block";


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });


            return;

        }


        // =========================
        // DELETE
        // =========================

        if (
            button.classList.contains(
                "deleteBtn"
            )
        ) {

            const confirmed =
                confirm(
                    "Are you sure you want to delete this food item?"
                );


            if (!confirmed) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API}/menu/${id}`,
                        {
                            method:
                                "DELETE"
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    showMessage(
                        data.message,
                        true
                    );


                    await loadMenu();

                } else {

                    showMessage(
                        data.message,
                        false
                    );

                }


            } catch (error) {

                console.error(
                    "Delete error:",
                    error
                );


                showMessage(
                    "Unable to delete item.",
                    false
                );

            }


            return;

        }


        // =========================
        // AVAILABILITY
        // =========================

        if (
            button.classList.contains(
                "availabilityBtn"
            )
        ) {

            const current =
                button.dataset.available ===
                "true";


            try {

                const response =
                    await fetch(
                        `${API}/menu/${id}/availability`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    isAvailable:
                                        !current

                                })

                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    showMessage(
                        data.message,
                        true
                    );


                    await loadMenu();

                } else {

                    showMessage(
                        data.message,
                        false
                    );

                }


            } catch (error) {

                console.error(
                    "Availability error:",
                    error
                );


                showMessage(
                    "Unable to update availability.",
                    false
                );

            }

        }

    }
);


// ===============================
// FILTERS
// ===============================

searchMenu.addEventListener(
    "input",
    renderMenu
);


categoryFilter.addEventListener(
    "change",
    renderMenu
);


availabilityFilter.addEventListener(
    "change",
    renderMenu
);


// ===============================
// START
// ===============================

loadMenu();