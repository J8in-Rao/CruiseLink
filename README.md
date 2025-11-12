# CruiseLink

**CruiseLink** is an all-in-one platform for managing your cruise ship experience. It provides a seamless interface for both passengers (Voyagers) and crew members to manage services, bookings, and orders on board.

## Features

CruiseLink offers a role-based system to cater to the specific needs of different users:

### Voyager (Passenger)
- **Service Booking:** Book appointments for the Beauty Salon, Fitness Center, and Party Hall.
- **Entertainment:** Browse and book movie tickets.
- **Shopping:** Order items from on-board stationery and gift shops.
- **Catering:** Place orders for food and beverages.
- **Personal Management:** View and manage all personal bookings and orders in one place.
- **Profile:** Manage personal profile settings.

### Admin
- **Item Management:** Add, update, and remove items for catering and stationery.
- **Voyager Management:** Oversee and manage passenger accounts.
- **Movie Management:** Manage the list of available movies.
- **Analytics:** View analytics for catering services.
- **Order Management:** Track catering orders and manage inventory.
- **Communications:** Access a shared inbox for voyager communications.

### Manager
- **Booking Management:** Oversee and manage bookings for movies, salon, fitness center, and party hall.
- **Analytics:** Access analytics related to all bookings.

### Supervisor
- **Stationery Management:** Manage stationery orders, inventory levels, and item catalog.
- **Analytics:** View analytics specific to stationery sales.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **AI:** [Google AI Genkit](https://firebase.google.com/docs/genkit)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Charting:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v20 or later)
- npm, yarn, or pnpm

### Installation

1.  Clone the repo.
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your Firebase project and add your configuration to a `.env.local` file in the root of the project. See `firebase/config.ts`.

### Running the Application

1.  To run the web application:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

2.  To run the Genkit AI development environment:
    ```sh
    npm run genkit:dev
    ```

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in the development mode with Turbopack.
-   `npm run build`: Builds the app for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
-   `npm run typecheck`: Runs the TypeScript compiler to check for type errors.
-   `npm run genkit:dev`: Starts the Genkit development server.
-   `npm run genkit:watch`: Starts the Genkit development server in watch mode.