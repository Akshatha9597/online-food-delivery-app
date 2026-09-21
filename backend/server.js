const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;


// ===============================
// Middleware
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// Frontend
// ===============================

const FRONTEND_PATH = path.join(
    __dirname,
    "../frontend"
);

app.use(
    express.static(FRONTEND_PATH)
);


// ===============================
// MySQL Connection
// ===============================

const db = mysql.createConnection({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME

});


db.connect((err) => {

    if (err) {

        console.error(
            "MySQL connection failed:",
            err
        );

        return;
    }

    console.log(
        "MySQL connected successfully!"
    );

});


// ===============================
// HOME / LOGIN PAGE
// ===============================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            FRONTEND_PATH,
            "index.html"
        )
    );

});


// ===============================
// LOGIN
// ===============================

app.post("/api/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    if (
        email === "admin@restaurant.com" &&
        password === "123456"
    ) {

        return res.json({

            success: true,

            message:
                "Login successful!"

        });

    }


    return res.json({

        success: false,

        message:
            "Invalid email or password."

    });

});


// ===============================
// MENU
// ===============================


// Get Menu

app.get("/api/menu", (req, res) => {

    const sql = `
        SELECT
            id,
            food_name,
            description,
            price,
            category,
            is_available
        FROM menu_items
        ORDER BY id DESC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to fetch menu."

                });

            }


            res.json({

                success: true,

                menu: results

            });

        }
    );

});


// Add Menu Item

app.post("/api/menu", (req, res) => {

    const {
        foodName,
        description,
        price,
        category
    } = req.body;


    if (
        !foodName ||
        !price ||
        !category
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please enter all food details."

        });

    }


    if (
        description &&
        description.length > 200
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Food description must be 200 characters or less."

        });

    }


    const sql = `
        INSERT INTO menu_items
        (
            food_name,
            description,
            price,
            category,
            is_available
        )
        VALUES (?, ?, ?, ?, TRUE)
    `;


    db.query(
        sql,
        [
            foodName,
            description || null,
            price,
            category
        ],
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to add food item."

                });

            }


            res.json({

                success: true,

                message:
                    "Food item added successfully!",

                id:
                    result.insertId

            });

        }
    );

});


// Update Menu Item

app.put("/api/menu/:id", (req, res) => {

    const id =
        req.params.id;


    const {
        foodName,
        description,
        price,
        category
    } = req.body;


    if (
        !foodName ||
        !price ||
        !category
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please enter all food details."

        });

    }


    if (
        description &&
        description.length > 200
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Food description must be 200 characters or less."

        });

    }


    const sql = `
        UPDATE menu_items
        SET
            food_name = ?,
            description = ?,
            price = ?,
            category = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [
            foodName,
            description || null,
            price,
            category,
            id
        ],
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to update food item."

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Food item not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Food item updated successfully!"

            });

        }
    );

});


// Delete Menu Item

app.delete("/api/menu/:id", (req, res) => {

    const id =
        req.params.id;


    db.query(
        "DELETE FROM menu_items WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to delete food item."

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Food item not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Food item deleted successfully!"

            });

        }
    );

});


// Menu Availability

app.put(
    "/api/menu/:id/availability",
    (req, res) => {

        const id =
            req.params.id;

        const isAvailable =
            req.body.isAvailable;


        if (
            typeof isAvailable !==
            "boolean"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "isAvailable must be true or false."

            });

        }


        const sql = `
            UPDATE menu_items
            SET is_available = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                isAvailable,
                id
            ],
            (err, result) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to update availability."

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Food item not found."

                    });

                }


                res.json({

                    success: true,

                    message:
                        isAvailable
                            ? "Food item is now available."
                            : "Food item is now unavailable."

                });

            }
        );

    }
);


// ===============================
// ORDERS
// ===============================


// Get Orders

app.get("/api/orders", (req, res) => {

    const sql = `
        SELECT *
        FROM orders
        ORDER BY order_date DESC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching orders:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to fetch orders."

                });

            }


            res.json({

                success: true,

                orders: results

            });

        }
    );

});


// Update Order Status

app.put("/api/orders/:id", (req, res) => {

    const id =
        req.params.id;

    const status =
        req.body.status;


    const allowedStatuses = [

        "Pending",
        "Accepted",
        "Rejected",
        "Preparing",
        "Ready",
        "Delivered"

    ];


    if (
        !allowedStatuses.includes(status)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid order status."

        });

    }


    const sql = `
        UPDATE orders
        SET status = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [
            status,
            id
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "Database update error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to update order."

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Order status updated successfully!"

            });

        }
    );

});


// ===============================
// RESTAURANT AVAILABILITY
// ===============================


// Get Restaurant Status

app.get(
    "/api/restaurant/status",
    (req, res) => {

        const sql = `
            SELECT *
            FROM restaurant_settings
            WHERE id = 1
        `;


        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.error(
                        "Error fetching restaurant status:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to fetch restaurant status."

                    });

                }


                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Restaurant settings not found."

                    });

                }


                res.json({

                    success: true,

                    restaurant:
                        results[0]

                });

            }
        );

    }
);


// Update Restaurant Status

app.put(
    "/api/restaurant/status",
    (req, res) => {

        const isOpen =
            req.body.isOpen;


        if (
            typeof isOpen !== "boolean"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "isOpen must be true or false."

            });

        }


        const sql = `
            UPDATE restaurant_settings
            SET is_open = ?
            WHERE id = 1
        `;


        db.query(
            sql,
            [isOpen],
            (err, result) => {

                if (err) {

                    console.error(
                        "Error updating restaurant status:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to update restaurant status."

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Restaurant settings not found."

                    });

                }


                res.json({

                    success: true,

                    message:
                        isOpen
                            ? "Restaurant is now Open."
                            : "Restaurant is now Closed."

                });

            }
        );

    }
);


// ===============================
// START SERVER
// ===============================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);