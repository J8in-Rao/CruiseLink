# CruiseLink Tutorial

This tutorial will guide you through the process of creating an account, understanding the different user roles, and using the main features of the CruiseLink application.

## 1. Creating an Account and Assigning Roles

In this application, a user's role determines what they can see and do. The system is designed to be flexible for development, allowing you to easily test each permission level.

There are two primary ways to log in and get assigned a role:

### Method A: The Sign-Up Page (Recommended for Development)

This is the easiest way to assign yourself any role you want.

1.  Navigate to the **Sign Up** page.
2.  Fill in your name, email, and password.
3.  You will see a dropdown menu labeled "Role (for development)".
4.  Select the role you want to test (e.g., `admin`, `manager`, `head-cook`, etc.).
5.  Complete the sign-up process.

The application will create your account and immediately grant you all the permissions associated with the role you selected.

### Method B: The Login Page (Automatic Role Assignment)

The login page has a convenient shortcut for testing. The system automatically assigns a role based on the email address you use to sign in:

-   **Admin:** `admin@cruiselink.com`
-   **Manager:** `manager@cruiselink.com`
-   **Supervisor:** `supervisor@cruiselink.com`
-   **Head-Cook:** `head-cook@cruiselink.com`
-   **Voyager:** Any other email address (e.g., `voyager@email.com` or your personal Gmail).

Simply use one of these specific emails to log in (the password can be anything, as it will create a new user if one doesn't exist).

## 2. How to Change Roles

For security reasons, a user cannot change their own role from their profile page after an account has been created.

To test a different role, you must **Sign Out** and then **Sign Up** again using a new email address and selecting the new role from the dropdown menu.

## 3. What Can Each Role Do?

Here is a summary of the permissions for each role you can test:

### Voyager (The Passenger)

-   **Sees:** A personal dashboard with their room number and stay dates.
-   **Can Do:**
    -   Order food and gifts from the **Catering** and **Stationery** pages.
    -   Book tickets for **Movies**.
    -   Book appointments at the **Beauty Salon**, **Fitness Center**, and **Party Hall**.
    -   View all their personal orders and bookings in "My Orders" and "My Bookings".
    -   Contact support via the "Help Center".

### Admin (The Super User)

-   **Sees:** A comprehensive dashboard with "Overall Analytics" for the entire cruise operation.
-   **Can Do:**
    -   **Manage Items:** Add, edit, and delete items in Catering and Stationery.
    -   **Manage Movies:** Add, edit, and delete movies and showtimes.
    -   **Manage Voyagers:** View a list of all registered passengers.
    -   **Access Inbox:** Read and manage all messages from voyagers sent via the Help Center.

### Manager (The Booking Overseer)

-   **Sees:** A "Booking Analytics" dashboard focused on trends for movies, salon, fitness, and party hall reservations.
-   **Can Do:**
    -   View all bookings across the services they manage.
    -   Cancel any voyager's booking for movies, salon, fitness, or party halls.
    -   Manage the movie catalog (add/edit/delete movies).

### Supervisor (The Gift Shop Manager)

-   **Sees:** A dashboard focused purely on Stationery & Gifts.
-   **Can Do:**
    -   Manage all incoming stationery orders (update status, etc.).
    -   Manage stationery inventory (mark items as in/out of stock).
    -   View stationery-specific analytics on sales and popular items.

### Head-Cook (The Catering Manager)

-   **Sees:** A dashboard focused purely on Catering.
-   **Can Do:**
    -   Manage all incoming catering orders.
    -   Manage menu item inventory (in/out of stock).
    -   View catering-specific analytics on revenue and order trends.

This role-based system is at the core of the CruiseLink application, ensuring that each user has access to exactly what they need to perform their tasks. Happy testing!
