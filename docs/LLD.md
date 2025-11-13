# Low-Level Design (LLD)

## 1. Architecture

The CruiseLink application is built on a modern, serverless architecture that leverages the strengths of Next.js for the frontend and Firebase for the backend.

- **Frontend:** A Next.js application using the App Router. This provides a fast, server-rendered React application with a great developer experience.
- **Backend:** Firebase is the core of the backend, providing:
    - **Firebase Authentication:** For user management and role-based access control.
    - **Firestore:** A NoSQL database for storing all application data, including user profiles, orders, bookings, and more.
- **AI Features:** Genkit is used to build and manage the AI-powered reporting feature. It interfaces with Google's AI models to analyze data from Firestore.

## 2. Data Model

The data model is designed to be flexible and scalable, with a clear separation of concerns between different modules. The complete data schema is defined in `docs/backend.json`.

### Key Collections

- **voyagers:** Stores user profile information for all users, including their role, room number, and stay dates.
- **cateringItems:** Stores the catalog of all catering items available for purchase.
- **stationeryItems:** Stores the catalog of all stationery and gift items.
- **movies:** Stores the list of movies and their showtimes.
- **bookings:** Stores all booking information for movies, salon, fitness center, and party hall.
- **orders:** Stores all order information for catering and stationery items.
- **roles_admin, roles_head-cook, roles_manager, roles_supervisor:** These collections are used to enforce security rules in Firestore. When a user with a special role is created, a document is added to the corresponding collection, allowing for easy role-based access control in Firestore security rules.

## 3. Key Components and Libraries

- **UI Components:** The UI is built using a combination of custom components and the [ShadCN UI](https://ui.shadcn.com/) library. This provides a consistent and modern design system.
- **Icons:** All icons are from the [lucide-react](https://lucide.dev/guide/packages/lucide-react) library.
- **Charts and Analytics:** The analytics dashboards are built using [recharts](https://recharts.org/), which provides a set of composable and customizable charts.
- **Forms:** All forms in the application are managed using [react-hook-form](https://react-hook-form.com/) for state management and [zod](https://zod.dev/) for validation. This provides a robust and type-safe way to handle user input.
- **Date and Time:** [date-fns](https://date-fns.org/) is used for all date and time formatting to ensure consistency across the application.

## 4. AI-Powered Reports

The AI-Powered Reports feature is a key component of the admin dashboard. It is built using Genkit and works as follows:

1.  The admin provides a prompt in the report generator interface.
2.  The prompt is sent to a Genkit flow.
3.  The Genkit flow queries the Firestore database to retrieve all relevant voyage event data.
4.  The data is then passed to a Google AI model, which analyzes the data and generates a report based on the admin's prompt.
5.  The report is then displayed to the admin in the UI.
