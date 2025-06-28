# E-commerce Application

This repository contains a full-stack e-commerce application with a Node.js Express backend and a React frontend.

## Getting Started

### 1. Clone the Repository

To get a copy of this project up and running on your local machine, first clone the repository using Git:

```bash
git clone https://github.com/mohityadavbkbiet/Ecommerce-Application.git
cd Ecommerce-Application
```

### 2. How to Run with Docker (Recommended)

This is the easiest way to get both the frontend and backend running with all their dependencies.

#### Prerequisites

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your system.

#### Steps

1.  **Navigate to the root directory** of the cloned repository (where `docker-compose.yml` is located):
    ```bash
    cd Ecommerce-Application
    ```
2.  **Build and start the services** using Docker Compose:
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the Docker images for both the `backend` and `frontend` services.
    *   Start the `backend` service (Node.js server) on `http://localhost:5000`.
    *   Start the `frontend` service (React development server) on `http://localhost:5001`.
    *   Start a MongoDB container, which the backend will connect to.
3.  **Access the application**:
    *   Frontend: Open your web browser and go to `http://localhost:5001`
    *   Backend API: The backend API will be accessible at `http://localhost:5000`

To stop the services, press `Ctrl+C` in the terminal where `docker-compose up` is running, then run:

```bash
docker-compose down
```

### 3. How to Run Natively

If you prefer to run the frontend and backend directly on your machine without Docker, follow these instructions.

#### Backend

The backend is a Node.js Express application.

##### Prerequisites

*   [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
*   [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or access to a MongoDB Atlas cluster.

##### Installation

1.  **Navigate to the Backend directory**:
    ```bash
    cd Backend
    ```
2.  **Install Node.js dependencies**:
    ```bash
    npm install
    ```
3.  **Create a `.env` file**:
    In the `Backend` directory, create a file named `.env` and add the following content. Replace `YOUR_MONGODB_URI` with your MongoDB connection string (e.g., `mongodb://localhost:27017/ecommercedb` if running locally, or your MongoDB Atlas URI). Replace `YOUR_JWT_SECRET` with a strong, random string.

    ```
    PORT=5000
    MONGODB_URI=YOUR_MONGODB_URI
    JWT_SECRET=YOUR_JWT_SECRET
    ```

##### Running the Server

1.  **Ensure MongoDB is running**.
2.  **Start the backend server**:
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:5000`. You should see a message like "MongoDB connected successfully!" and "Server running on http://localhost:5000".

#### Frontend

The frontend is a React application built with Vite.

##### Prerequisites

*   [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
*   [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

##### Installation

1.  **Navigate to the Frontend directory**:
    ```bash
    cd Frontend
    ```
2.  **Install Node.js dependencies**:
    ```bash
    npm install
    ```

##### Running the Development Server

1.  **Start the frontend development server**:
    ```bash
    npm run dev
    ```
    The application will typically open in your browser at `http://localhost:5173` (or another port if 5173 is in use). The Vite development server will automatically proxy API requests to the backend running on `http://localhost:5000`.

    **Note**: If you change the backend port, you might need to update the proxy configuration in `Frontend/vite.config.js` (if one exists, or add one if needed) or ensure your frontend fetches from the correct backend URL.
