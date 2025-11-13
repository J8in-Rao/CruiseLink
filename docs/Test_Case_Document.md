# CruiseLink - Test Case Document

## 1. Introduction

This Test Case Document outlines the functional and non-functional testing performed on CruiseLink, a cruise ship operations management platform. It validates ordering workflows, booking modules, authentication, RBAC (role-based access control), analytics pages, inventory updates, and admin tools.

All tests were performed on the deployed environment:
- [https://cruise-link.vercel.app/](https://cruise-link.vercel.app/)

## 2. Test Strategy

CruiseLink was tested using:

- Black-box testing
- Role-based permission testing
- Positive & Negative test cases
- UI/UX validation
- Error handling scenarios
- Database validation (Firestore)

Roles tested:
- Voyager
- Admin
- Manager
- Supervisor
- Head-Cook

## 3. Test Case Format

Each test case follows this structure:

| Field              | Description                      |
|--------------------|----------------------------------|
| Test Case ID       | Unique ID                        |
| Module             | System module being tested       |
| Precondition       | Requirements before executing    |
| Steps              | Step-by-step procedure           |
| Expected Result    | System's correct behavior        |
| Actual Result      | Outcome during testing           |

## 4. Test Cases

### 4.1 Authentication & User Roles

#### TC-01 - Voyager Login

| Field           | Value                             |
|-----------------|-----------------------------------|
| Module          | Authentication                    |
| Precondition    | Voyager account exists            |
| Steps           | 1. Enter email & password → Login |
| Expected Result | Redirect to Voyager Dashboard     |
| Actual Result   | ✅ Works                          |

#### TC-02 - Admin Login with Auto Role Assignment

| Field           | Value                                    |
|-----------------|------------------------------------------|
| Module          | Authentication                           |
| Precondition    | Use email admin@cruiselink.com           |
| Steps           | Login → System assigns Admin role        |
| Expected Result | Redirect to Admin Dashboard              |
| Actual Result   | ✅ Works                                 |

#### TC-03 - Unauthorized Role Access Blocked

| Field           | Value                                                                 |
|-----------------|-----------------------------------------------------------------------|
| Module          | RBAC                                                                  |
| Precondition    | Voyager logged in                                                     |
| Steps           | Try opening Admin URL manually                                        |
| Expected Result | Access denied → Redirect to 403 page or home                          |
| Actual Result   | ✅ Blocked correctly                                                  |

### 4.2 Voyager Ordering Module

#### TC-04 - Place Catering Order

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Catering                                       |
| Steps           | Select item → Add to cart → Place Order        |
| Expected Result | Firestore entry in allCateringOrders           |
| Actual Result   | ✅ Works                                       |

#### TC-05 - Place Stationery Order

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Stationery                                     |
| Steps           | Choose item → Checkout                         |
| Expected Result | Stored in allStationeryOrders; total calculated|
| Actual Result   | ✅ Works                                       |

#### TC-06 - My Orders Display

| Field           | Value                                                      |
|-----------------|------------------------------------------------------------|
| Module          | Voyager Dashboard                                          |
| Steps           | Open "My Orders"                                           |
| Expected Result | Display only orders of logged-in voyager                   |
| Actual Result   | ✅ Works                                                   |

### 4.3 Booking Module Tests

#### TC-07 - Movie Ticket Booking

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Movie Booking                                  |
| Steps           | Choose movie → Select time → Book              |
| Expected Result | Entry in allResortMovieTickets                 |
| Actual Result   | ✅ Works                                       |

#### TC-08 - Salon Booking

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Beauty Salon                                   |
| Steps           | Choose service → Select time → Submit          |
| Expected Result | Booking created with correct fields            |
| Actual Result   | ✅ Works                                       |

#### TC-09 - Fitness Center Booking

| Field           | Value                                                      |
|-----------------|------------------------------------------------------------|
| Module          | Fitness                                                    |
| Steps           | Select equipment → Choose timeslot                         |
| Expected Result | Stored booking displays in Manager panel                   |
| Actual Result   | ✅ Works                                                   |

#### TC-10 - Party Hall Reservation

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Party Hall                                     |
| Steps           | Select hall type → Choose date/time            |
| Expected Result | Entry in allPartyHallBookings                  |
| Actual Result   | ✅ Works                                       |

### 4.4 Admin Module Tests

#### TC-11 - Add Catering Item

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Admin → Catering Items                         |
| Steps           | Add name, price, image                         |
| Expected Result | Item appears in cateringItems                  |
| Actual Result   | ✅ Works                                       |

#### TC-12 - Edit / Delete Item

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Admin                                          |
| Steps           | Edit item → Save OR Delete item                |
| Expected Result | Firestore updated OR document deleted          |
| Actual Result   | ✅ Works                                       |

#### TC-13 - AI Powered Report Generation

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Admin → AI Reports                             |
| Steps           | Enter prompt → Generate                        |
| Expected Result | AI response based on Firestore data            |
| Actual Result   | ✅ Works                                       |

### 4.5 Manager, Supervisor & Head Cook

#### TC-14 - Manager Cancels Booking

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Manager                                        |
| Steps           | Open booking list → Cancel booking             |
| Expected Result | Booking status updates in Firestore            |
| Actual Result   | ✅ Works                                       |

#### TC-15 - Supervisor Updates Stationery Inventory

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Supervisor                                     |
| Steps           | Toggle inStock                                 |
| Expected Result | Update reflected in stationeryItems collection |
| Actual Result   | ✅ Works                                       |

#### TC-16 - Head Cook Manages Catering Orders

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Module          | Head Cook                                      |
| Steps           | Mark order as preparing/delivered              |
| Expected Result | Status modifies in Firestore                   |
| Actual Result   | ✅ Works                                       |

## 5. Negative Test Cases

#### TC-17 - Voyager Attempts to Edit Catalog Item

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Expected Result | ❌ Denied by Firestore Rules                   |
| Actual Result   | ✅ Denied                                      |

#### TC-18 - Supervisor Opens Catering Orders

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Expected Result | ❌ Access Blocked                              |
| Actual Result   | ✅ Blocked                                     |

#### TC-19 - Manager Attempts to Modify Stationery Items

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Expected Result | ❌ Blocked                                     |
| Actual Result   | ✅ Blocked                                     |

## 6. Test Summary

| Category                       | Total Tests | Passed | Failed |
|--------------------------------|-------------|--------|--------|
| Authentication                 | 3           | 3      | 0      |
| Ordering                       | 3           | 3      | 0      |
| Booking                        | 4           | 4      | 0      |
| Admin                          | 3           | 3      | 0      |
| Manager/Supervisor/Head Cook   | 3           | 3      | 0      |
| Negative Tests                 | 3           | 3      | 0      |
| **Overall**                    | **19**      | **19** | **0**  |