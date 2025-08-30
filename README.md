# BrowseMind Chrome Extension

BrowseMind is a powerful Chrome extension designed to help users take control of their digital well-being. It provides tools to manage browsing habits, block distracting websites, and track online activity, all aimed at boosting productivity and focus. This project includes both the Chrome extension and a backend server for data persistence and user authentication.

## Features

- **Website Blocking:** Block specific websites to eliminate distractions during focused work sessions.
- **Activity Tracking:** Monitor and log browsing activity to gain insights into online habits.
- **Interactive Dashboard:** Visualize browsing data and productivity metrics through a user-friendly dashboard.
- **Customizable Options:** Configure blocking lists, tracking preferences, and other settings via an options page.
- **User Authentication:** Securely manage user accounts and data with a dedicated backend.
- **Data Persistence:** Store browsing data and user settings on a server for consistent access across sessions.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Google Chrome browser

### Installation

The project consists of two main parts: the `backend` server and the `extension` itself.

#### 1. Backend Setup

The backend handles user authentication and data storage.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory based on `.env.example` (if available, otherwise create one with necessary variables like `DATABASE_URL`, `JWT_SECRET`, etc.).
    Example `.env` content:
    ```
    DATABASE_URL="file:./prisma/dev.db"
    JWT_SECRET="your_jwt_secret_key"
    PORT=3000
    ```
4.  **Run Prisma migrations:**
    ```bash
    npx prisma migrate dev --name init
    ```
    This will set up your database schema.
5.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The backend server should now be running, typically on `http://localhost:3000`.

#### 2. Chrome Extension Setup

The extension is built using Vite and React.

1.  **Navigate to the extension directory:**
    ```bash
    cd extension
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Build the extension:**
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the production-ready extension files.
4.  **Load the extension in Chrome:**
    - Open Chrome and go to `chrome://extensions`.
    - Enable "Developer mode" using the toggle in the top right corner.
    - Click on "Load unpacked" and select the `extension/dist` directory.
    - The BrowseMind extension should now appear in your list of extensions.

## Usage

1.  **Pin the Extension:** Click the puzzle piece icon in Chrome's toolbar, then click the pin icon next to "BrowseMind" to make it easily accessible.
2.  **Register/Login:** Click the BrowseMind extension icon. You will be prompted to register a new account or log in with an existing one.
3.  **Configure Options:** After logging in, you can access the extension's options page (usually by right-clicking the extension icon and selecting "Options" or navigating through the popup) to set up blocked sites and other preferences.
4.  **View Dashboard:** The dashboard provides an overview of your browsing activity and productivity.

## Contributing

We welcome contributions to the BrowseMind project! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Prisma](https://www.prisma.io/)
- [Express](https://expressjs.com/)
