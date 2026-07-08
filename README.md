# HomeNest Project (Airbnb Clone)

This is a web application built using the MVC architecture with **Node.js, Express, EJS, and Mongoose (MongoDB)**. I developed this project to learn how full-stack Node.js applications work, including user authentication, file uploads, sessions, and database integrations.

It is styled using **Tailwind CSS**.

---

## Key Features

### 👤 User Roles & Auth
* **Signup & Login:** Users can create an account and log in. Passwords are encrypted and saved securely using `bcryptjs`.
* **Roles:** Users can register as a **Guest** (default) or a **Host**.
* **Sessions:** Built using `express-session` and `connect-mongodb-session` so sessions are stored directly in MongoDB. Users stay logged in even if the server restarts.

### 🏠 For Guests (Store)
* **Browse Homes:** View all listed homes on the index/homepage.
* **Home Details:** Click on a house to view its detailed page (price, description, location, rating, and photo).
* **Favourites List:** Guests can add homes to their personal "Favourites" list and remove them.
* **Bookings Page:** A simple bookings overview page.

### 🛠️ For Hosts
* **Add Listings:** Hosts can list new houses.
* **File Uploads (Multer):** When creating a listing, hosts can upload an image file of the house. Images are stored in the local `uploads/` directory with unique randomly generated filenames.
* **Manage Listings:** Hosts can view a list of only the properties they have listed, with options to **Edit** (update price, description, location, rating, or photo) or **Delete** them.

---

## Tech Stack Used
* **Backend Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Template Engine:** EJS (Embedded JavaScript)
* **Styling:** Tailwind CSS (built with a watcher command)
* **File Uploads:** Multer
* **Authentication:** Bcryptjs (password hashing)
* **Session Storage:** express-session, connect-mongodb-session
* **Environment Variables:** dotenv

---

## Database Schemas (Mongoose)

### 1. User Schema (`models/user.js`)
* `firstname` (String, required)
* `lastname` (String)
* `email` (String, required, unique)
* `password` (String, required)
* `usertype` (String: enum `'guest'` or `'host'`)
* `favourites` (Array of ObjectIds referencing `Home`)

### 2. Home Schema (`models/home.js`)
* `houseName` (String, required)
* `price` (Number, required)
* `location` (String, required)
* `rating` (Number, required)
* `photo` (String path to upload folder)
* `description` (String)

---

## Setup Instructions

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Install Dependencies
Clone this repository, navigate to the folder, and run:
```bash
npm install
```

### 3. Setup Environment Variables (`.env`)
Create a file named `.env` in the root folder of your project (or copy `.env.example`).
```env
PORT=4000
MONGO_URI=your_mongodb_connection_uri_here
SESSION_SECRET=your_session_secret_here
```

> **Note:** The `.env` file is excluded from GitHub using `.gitignore` to keep credentials secure.

### 4. Build Styles & Run the Server
To compile the Tailwind CSS output and run the application in development mode (using nodemon):
```bash
npm start
```
By default, the server will run at: **`http://localhost:4000`**

---

## Routes & Endpoints

### Guest/Store Routes (`routes/storerouter.js`)
* `GET /` - Index/homepage (landing screen)
* `GET /homes` - List of all properties
* `GET /homes/:homeId` - Individual property details
* `GET /bookings` - Bookings view
* `GET /favourites` - View user's favourite listings
* `POST /favourites` - Add a property to favourites
* `POST /favourites/delete/:homeId` - Remove a property from favourites

### Host Routes (`routes/hostRouter.js`)
* `GET /host/add-home` - Form to add a property
* `POST /host/add-home` - Handle adding a property with photo upload
* `GET /host/host-home-list` - View only your hosted listings
* `GET /host/edit-home/:homeId` - Edit form for a property
* `POST /host/edit-home` - Handle editing details/photo update
* `POST /host/delete-home/:homeId` - Delete a property listing

### Authentication Routes (`routes/authRouter.js`)
* `GET /signup` - Signup page
* `POST /signup` - Process user registration
* `GET /login` - Login page
* `POST /login` - Process login & initialize session
* `POST /logout` - Log out and destroy session
