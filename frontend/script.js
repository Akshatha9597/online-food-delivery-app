// ==========================================
// RESTAURANT ADMIN LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("errorMessage");


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        // Prevent page refresh
        event.preventDefault();


        // Get login values
        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        // Clear old message
        if (loginMessage) {
            loginMessage.textContent = "";
        }


        // Get login button
        const loginButton =
            loginForm.querySelector("button[type='submit']");


        // Disable button
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";
        }


        try {

            // Connect to backend
            const response = await fetch("/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });


            // Check server response
            if (!response.ok) {
                throw new Error(
                    "Server returned status " + response.status
                );
            }


            const data = await response.json();


            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            if (data.success) {

                if (loginMessage) {
                    loginMessage.textContent =
                        "Login successful! Redirecting...";

                    loginMessage.style.color = "#16a34a";
                }


                // Go to dashboard
                setTimeout(function () {

                    window.location.href = "dashboard.html";

                }, 500);

            }


            // ==========================================
            // LOGIN FAILED
            // ==========================================

            else {

                if (loginMessage) {
                    loginMessage.textContent =
                        data.message || "Invalid email or password.";

                    loginMessage.style.color = "#dc2626";
                }


                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent =
                        "Login to Dashboard →";
                }

            }

        }


        // ==========================================
        // CONNECTION ERROR
        // ==========================================

        catch (error) {

            console.error("Login error:", error);


            if (loginMessage) {

                loginMessage.textContent =
                    "Unable to connect to the server.";

                loginMessage.style.color = "#dc2626";

            }


            if (loginButton) {

                loginButton.disabled = false;

                loginButton.textContent =
                    "Login to Dashboard →";

            }

        }

    });

}