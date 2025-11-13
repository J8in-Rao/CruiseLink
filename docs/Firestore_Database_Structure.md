# CruiseLink – Firestore Database Structure

This document describes the complete database schema used in the CruiseLink application. The database is implemented using Google Firestore (NoSQL) with a role-based security model.

## Overview

CruiseLink uses a flat, scalable NoSQL structure optimized for:

- Real-time updates
- Minimal read/write cost
- Role-based access
- Clear separation of business modules

The database contains booking collections, order collections, catalog collections, user collections, and role collections.

## Collections & Data Schemas

### 1. Voyager Accounts

**Collection:** `voyagers`

- **Document ID:** `uid` (matches Firebase Auth UID)

#### Fields

| Field         | Type      | Description                           |
|---------------|-----------|---------------------------------------|
| uid           | string    | Voyager/user unique ID                |
| name          | string    | Full name                             |
| email         | string    | Email address                         |
| role          | string    | voyager / admin / manager / supervisor / head-cook |
| roomNumber    | string    | Cabin/room number                     |
| stayStartDate | timestamp | Voyager check-in date                 |
| stayEndDate   | timestamp | Voyager check-out date                |
| voyagerEmail  | string    | Duplicate field used in orders/booking logs (optional) |

#### Subcollections

Each voyager also contains a local history for convenience:

- `voyagers/{uid}/shopping`
- `voyagers/{uid}/bookings`

---

### 2. Catering Items

**Collection:** `cateringItems`

- **Document ID:** `id` (auto-generated or custom)

#### Fields

| Field       | Type    | Description                        |
|-------------|---------|------------------------------------|
| name        | string  | Item name                          |
| price       | number  | Price of item                      |
| description | string  | Detailed description               |
| imageUrl    | string  | Firestore Storage URL              |
| category    | string  | Category (e.g., Snacks, Drinks, Meals) |
| inStock     | boolean | True = available                   |
| id          | string  | Item ID                            |

---

### 3. Stationery Items

**Collection:** `stationeryItems`

- **Document ID:** `id`

#### Fields

Same as cateringItems:

| Field       | Type    |
|-------------|---------|
| name        | string  |
| price       | number  |
| description | string  |
| imageUrl    | string  |
| category    | string  |
| inStock     | boolean |
| id          | string  |

---

### 4. Catering Orders

**Collection:** `allCateringOrders`

- **Document ID:** `id`

#### Fields

| Field             | Type        | Description                        |
|-------------------|-------------|------------------------------------|
| id                | string      | Order ID                           |
| voyagerId         | string      | UID of voyager placing order       |
| voyagerName       | string      | Voyager's name                     |
| voyagerEmail      | string      | Voyager's email                    |
| itemIds           | array       | List of ordered items              |
| items             | array(object) | {itemId, name, quantity}       |
| orderDate         | timestamp   | Timestamp of order                 |
| originalOrderId   | string      | Reference for modifications        |
| totalAmount       | number      | Final order cost                   |
| status            | string      | pending / preparing / delivered    |

---

### 5. Stationery Orders

**Collection:** `allStationeryOrders`

- **Document ID:** `id`

#### Fields

(Same structure as catering orders)

| Field         | Type      |
|---------------|-----------|
| voyagerId     | string    |
| voyagerName   | string    |
| voyagerEmail  | string    |
| items         | array     |
| totalAmount   | number    |
| status        | string    |
| createdAt     | timestamp |

---

### 6. Movie Tickets

**Collection:** `allResortMovieTickets`

- **Document ID:** `id`

#### Fields

| Field             | Type      |
|-------------------|-----------|
| id                | string    |
| voyagerId         | string    |
| voyagerName       | string    |
| movieName         | string    |
| showtime          | timestamp |
| seatNumber        | string    |
| originalTicketId  | string    |
| status            | string    |
| createdAt         | timestamp |

---

### 7. Beauty Salon Bookings

**Collection:** `allBeautySalonBookings`

- **Document ID:** `id`

#### Fields

| Field             | Type      |
|-------------------|-----------|
| id                | string    |
| voyagerId         | string    |
| voyagerName       | string    |
| serviceType       | string    | (Haircut, Spa, etc.) |
| appointmentTime   | timestamp |
| status            | string    |
| originalBookingId | string    |
| createdAt         | timestamp |

---

### 8. Fitness Center Bookings

**Collection:** `allFitnessCenterBookings`

#### Fields

| Field             | Type      |
|-------------------|-----------|
| id                | string    |
| voyagerId         | string    |
| voyagerName       | string    |
| trainingEquipment | array     |
| startTime         | timestamp |
| endTime           | timestamp |
| status            | string    |
| originalBookingId | string    |

---

### 9. Party Hall Bookings

**Collection:** `allPartyHallBookings`

#### Fields

| Field             | Type      |
|-------------------|-----------|
| id                | string    |
| voyagerId         | string    |
| voyagerName       | string    |
| hallType          | string    | (Birthday, Wedding, Corporate, etc.) |
| startTime         | timestamp |
| endTime           | timestamp |
| status            | string    |
| originalBookingId | string    |

---

### 10. Help Center / Messaging

**Collection:** `messages`

- **Document ID:** `id`

#### Fields

| Field         | Type      |
|---------------|-----------|
| id            | string    |
| voyagerId     | string    |
| voyagerName   | string    |
| voyagerEmail  | string    |
| content       | string    |
| createdAt     | timestamp |
| status        | string    | (unread / read)

Admin sees grouped messages by voyager.

---

### 11. Role Collections

Used for RBAC via Firestore Rules.

**Collections:**

- `role_admin`
- `roles_manager`
- `roles_supervisor`
- `roles_head-cook`

- **Document ID:** `uid`

#### Fields

| Field | Type   |
|-------|--------|
| uid   | string |
| name  | string |
| role  | string | (admin/manager/supervisor/head-cook) |
| email | string |

These collections let Firestore Rules allow:

- Admin-only writes
- Manager bookings read
- Supervisor order read
- Head cook catering read

## Relationships Overview

### Voyager → Orders

Voyager ID used as FK in:

- `allCateringOrders`
- `allStationeryOrders`
- `allBeautySalonBookings`
- `allPartyHallBookings`
- `allFitnessCenterBookings`
- `allResortMovieTickets`

### Admin → Catalogs

Admin writes to:

- `cateringItems`
- `stationeryItems`
- `movies`

### Manager → Bookings

Manager manages:

- `allResortMovieTickets`
- `allSalonBookings`
- `allFitnessCenterBookings`
- `allPartyHallBookings`

### Supervisor → Stationery

Supervisor controls:

- `allStationeryOrders`
- `stationeryItems`

### Head Cook → Catering

Head-cook controls:

- `allCateringOrders`
- `cateringItems`