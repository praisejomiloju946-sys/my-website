
// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyA9xnQYmz7ewl-zLTsQI0DwmnvM1e1sGug",
    authDomain: "osun-province-9.firebaseapp.com",
    projectId: "osun-province-9",
    storageBucket: "osun-province-9.firebasestorage.app",
    messagingSenderId: "341930350733",
    appId: "1:341930350733:web:5a41bc349acff72506eac4",
    measurementId: "G-7ZFD1GFZLT"
};


// ==========================================
// INITIALISE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase connected successfully!");


// ==========================================
// AUTHORISED ADMINISTRATOR EMAILS
// ==========================================

const adminEmails = [
    "praisejomiloju946@gmail.com",
    "olawuwopraiseoluwajomiloju@gmail.com",
    "praisejomiloju1@gmail.com"
];


// ==========================================
// VARIABLES
// ==========================================

let currentUser = null;
let allPayments = [];
let unsubscribePayments = null;


// ==========================================
// HTML ELEMENTS
// ==========================================

const paymentForm = document.getElementById("paymentForm");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");

const adminToggle = document.getElementById("adminToggle");
const adminLogin = document.getElementById("adminLogin");
const loginForm = document.getElementById("loginForm");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");
const loginBtn = document.getElementById("loginBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

const adminDashboard = document.getElementById("adminDashboard");
const publicSection = document.getElementById("publicSection");

const adminWelcome = document.getElementById("adminWelcome");

const logoutBtn = document.getElementById("logoutBtn");
const backToPublic = document.getElementById("backToPublic");

const backToPublicFromDashboard =
    document.getElementById("backToPublicFromDashboard");

const paymentTable = document.getElementById("paymentTable");
const searchPayments = document.getElementById("searchPayments");
const refreshBtn = document.getElementById("refreshBtn");


// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPublic() {
    publicSection.hidden = false;
    adminLogin.hidden = true;
    adminDashboard.hidden = true;
}

function showLogin() {
    publicSection.hidden = true;
    adminLogin.hidden = false;
    adminDashboard.hidden = true;
}

function showDashboard() {
    publicSection.hidden = true;
    adminLogin.hidden = true;
    adminDashboard.hidden = false;
}


// ==========================================
// ADMIN LOGIN BUTTON
// ==========================================

if (adminToggle) {
    adminToggle.addEventListener("click", function () {
        showLogin();
        loginMessage.textContent = "";
        console.log("Admin login page opened.");
    });
} else {
    console.error("Admin Login button was not found.");
}


// ==========================================
// BACK TO HOMEPAGE
// ==========================================

if (backToPublic) {
    backToPublic.addEventListener("click", function () {
        showPublic();
    });
}

if (backToPublicFromDashboard) {
    backToPublicFromDashboard.addEventListener("click", function () {
        showPublic();
    });
}


// ==========================================
// PUBLIC PAYMENT SUBMISSION
// ==========================================

if (paymentForm) {

    paymentForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const fullName =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const purpose =
            document.getElementById("paymentPurpose").value;

        const amount =
            Number(document.getElementById("amount").value);

        const transactionRef =
            document.getElementById("transactionRef").value.trim();

        const paymentDate =
            document.getElementById("paymentDate").value;

        const note =
            document.getElementById("note").value.trim();


        if (
            !fullName ||
            !email ||
            !phone ||
            !purpose ||
            !amount ||
            amount <= 0 ||
            !transactionRef ||
            !paymentDate
        ) {
            formMessage.textContent =
                "Please complete all required fields.";

            return;
        }


        try {

            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";

            formMessage.textContent = "Please wait...";


            const paymentData = {
                fullName: fullName,
                email: email,
                phone: phone,
                purpose: purpose,
                amount: amount,
                transactionRef: transactionRef,
                paymentDate: paymentDate,
                note: note,
                status: "Pending",
                submittedAt: serverTimestamp()
            };


            const newPayment = doc(
                collection(db, "paymentRequests")
            );

            await setDoc(newPayment, paymentData);


            formMessage.textContent =
                "Payment details submitted successfully! Your payment is pending verification.";

            paymentForm.reset();


        } catch (error) {

            console.error("Payment submission error:", error);

            formMessage.textContent =
                "Submission failed: " + error.code;

        } finally {

            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Payment";

        }

    });

}


// ==========================================
// ADMINISTRATOR LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            adminEmail.value.trim().toLowerCase();

        const password =
            adminPassword.value;


        if (!adminEmails.includes(email)) {

            loginMessage.textContent =
                "This email is not authorised.";

            return;
        }


        try {

            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";

            loginMessage.textContent = "Please wait...";


            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            loginMessage.textContent =
                "Login successful!";

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            loginMessage.textContent =
                "Firebase Error: " + error.code;

        } finally {

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

        }

    });

}


// ==========================================
// FORGOT ADMINISTRATOR PASSWORD
// ==========================================

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener("click", async function () {

        const email =
            adminEmail.value.trim().toLowerCase();


        if (!email) {

            loginMessage.textContent =
                "Enter your administrator Gmail first.";

            adminEmail.focus();

            return;
        }


        if (!adminEmails.includes(email)) {

            loginMessage.textContent =
                "This email is not authorised.";

            return;
        }


        try {

            forgotPasswordBtn.disabled = true;

            forgotPasswordBtn.textContent =
                "Sending reset link...";

            loginMessage.textContent =
                "Sending password reset email...";


            await sendPasswordResetEmail(auth, email);


            loginMessage.textContent =
                "Password reset email sent. Check your Gmail inbox and spam folder.";


        } catch (error) {

            console.error("PASSWORD RESET ERROR:", error);

            loginMessage.textContent =
                "Password reset error: " + error.code;

        } finally {

            forgotPasswordBtn.disabled = false;

            forgotPasswordBtn.textContent =
                "Forgot Password?";

        }

    });

}


// ==========================================
// CHECK ADMINISTRATOR AUTHENTICATION
// ==========================================

onAuthStateChanged(auth, async function (user) {

    if (user) {

        const email = user.email?.toLowerCase();


        if (!adminEmails.includes(email)) {

            alert(
                "You are not authorised to access this dashboard."
            );

            await signOut(auth);

            return;
        }


        currentUser = user;

        adminWelcome.textContent =
            "Welcome, " + user.email;

        showDashboard();

        loadPayments();


    } else {

        currentUser = null;

        allPayments = [];

        stopPaymentListener();

        showPublic();

    }

});


// ==========================================
// LOAD PAYMENTS FROM FIRESTORE
// ==========================================

function loadPayments() {

    if (!currentUser) return;

    stopPaymentListener();


    const paymentsQuery = query(
        collection(db, "paymentRequests"),
        orderBy("submittedAt", "desc")
    );


    unsubscribePayments = onSnapshot(

        paymentsQuery,

        function (snapshot) {

            allPayments = snapshot.docs.map(function (document) {

                return {
                    id: document.id,
                    ...document.data()
                };

            });


            displayPayments();

            updateStatistics();

        },


        function (error) {

            console.error("Loading payments failed:", error);

            alert(
                "Unable to load payments: " + error.code
            );

        }

    );

}


// ==========================================
// STOP PAYMENT LISTENER
// ==========================================

function stopPaymentListener() {

    if (unsubscribePayments) {

        unsubscribePayments();

        unsubscribePayments = null;

    }

}


// ==========================================
// DISPLAY PAYMENT RECORDS
// ==========================================

function displayPayments() {

    if (!paymentTable) return;


    const tableBody =
        paymentTable.querySelector("tbody");

    if (!tableBody) return;


    tableBody.replaceChildren();


    const searchText =
        searchPayments.value.trim().toLowerCase();


    const filteredPayments = allPayments.filter(function (payment) {

        return [

            payment.fullName,
            payment.email,
            payment.phone,
            payment.transactionRef,
            payment.purpose,
            payment.status

        ].some(function (value) {

            return String(value || "")
                .toLowerCase()
                .includes(searchText);

        });

    });


    if (filteredPayments.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.textContent = "No payment records found.";

        row.appendChild(cell);

        tableBody.appendChild(row);

        return;
    }


    filteredPayments.forEach(function (payment) {

        const row = document.createElement("tr");


        const values = [

            payment.fullName,
            "₦" + Number(payment.amount).toLocaleString(),
            payment.purpose,
            payment.transactionRef,
            payment.status

        ];


        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value || "-";

            row.appendChild(cell);

        });


        const actionCell =
            document.createElement("td");


        if (payment.status === "Pending") {

            const confirmButton =
                document.createElement("button");

            confirmButton.textContent = "Confirm";

            confirmButton.type = "button";

            confirmButton.addEventListener("click", function () {

                reviewPayment(payment.id, "Confirmed");

            });


            const rejectButton =
                document.createElement("button");

            rejectButton.textContent = "Reject";

            rejectButton.type = "button";

            rejectButton.addEventListener("click", function () {

                reviewPayment(payment.id, "Rejected");

            });


            actionCell.append(
                confirmButton,
                rejectButton
            );


        } else {

            actionCell.textContent = "Reviewed";

        }


        row.appendChild(actionCell);

        tableBody.appendChild(row);

    });

}


// ==========================================
// CONFIRM OR REJECT PAYMENT
// ==========================================

async function reviewPayment(paymentId, newStatus) {

    if (!currentUser) return;


    const confirmed = confirm(
        "Are you sure you want to mark this payment as " +
        newStatus + "?"
    );


    if (!confirmed) return;


    try {

        await updateDoc(

            doc(db, "paymentRequests", paymentId),

            {
                status: newStatus,
                reviewedBy: currentUser.email,
                reviewedAt: serverTimestamp()
            }

        );


        alert(
            "Payment successfully marked as " +
            newStatus + "."
        );


    } catch (error) {

        console.error("Payment review error:", error);

        alert(
            "Unable to update payment: " + error.code
        );

    }

}


// ==========================================
// UPDATE DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {

    const total = allPayments.length;


    const pending = allPayments.filter(function (payment) {

        return payment.status === "Pending";

    }).length;


    const confirmed = allPayments.filter(function (payment) {

        return payment.status === "Confirmed";

    }).length;


    const rejected = allPayments.filter(function (payment) {

        return payment.status === "Rejected";

    }).length;


    document.getElementById("totalCount").textContent = total;

    document.getElementById("pendingCount").textContent = pending;

    document.getElementById("confirmedCount").textContent = confirmed;

    document.getElementById("rejectedCount").textContent = rejected;

}


// ==========================================
// SEARCH PAYMENT RECORDS
// ==========================================

if (searchPayments) {

    searchPayments.addEventListener("input", displayPayments);

}


// ==========================================
// REFRESH PAYMENT RECORDS
// ==========================================

if (refreshBtn) {

    refreshBtn.addEventListener("click", function () {

        displayPayments();

        updateStatistics();

    });

}


// ==========================================
// ADMINISTRATOR LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        try {

            await signOut(auth);

            currentUser = null;

            allPayments = [];

            showPublic();

            console.log("Administrator logged out.");

        } catch (error) {

            console.error("Logout error:", error);

        }

    });

}


// ==========================================
// INITIAL PAGE
// ==========================================

showPublic();

console.log("Osun Province 9 Portal is ready!");
