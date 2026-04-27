# Virtual Closet - PFW Career Services

A modern web application for managing Purdue Fort Wayne's Career Closet, enabling students to browse professional clothing and build outfits.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)

## Features

### Student Features

- **Browse Clothing**: Filter by category, size, color, and availability
- **Build Outfits**: Create complete outfits from available items

### Admin Features

- **Clothing Management**: Add, edit, and delete clothing items
- **User Management**: View and manage user accounts
- **Bulk Upload**: Import clothing items via CSV

## Tech Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management
- **CSS3** - Styling

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Google Cloud Storage** - Image storage
- **bcrypt** - Password hashing

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Git**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Google Cloud Platform** account (for image storage)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/DWilliams325/VirtualCloset.git
   cd virtual-closet-app
   ```

2. **Install client dependencies**

   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

## Configuration

### Server Configuration

1. **Create `.env` file in the `server` directory**

   ```env
   # MongoDB Connection
   MONGODB_URI=your_mongodb_connection_string

   # Google Cloud Storage
   GCS_BUCKET_NAME=your_bucket_name
   GCS_PROJECT_ID=your_project_id

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

2. **Add Google Cloud credentials**
   - Place your `gcs-credentials.json` file in `server/src/config/`
   - Ensure this file contains your Google Cloud service account credentials

### Client Configuration

The client uses Vite and runs on port `5173` by default. The API base URL is configured in `client/src/services/api.js`.

## Running the Project

### Development Mode

**Option 1: Run both servers simultaneously (recommended)**

In separate terminal windows:

```bash
# Terminal 1 - Frontend
cd client
npm run dev
```

```bash
# Terminal 2 - Backend
cd server
npm run dev
```

**Option 2: Run individually**

Frontend only:

```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

Backend only:

```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

### Production Mode

```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm start
```

## Project Structure

```
virtual-closet-app/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   │   └── pfw-Logo.svg  # PFW logo
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── AdminClothingManagement.jsx
│   │   │   ├── AdminUserManagement.jsx
│   │   │   ├── BrowseClothingComponent.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── NavBar.jsx
│   │   ├── context/       # React Context providers
│   │   │   └── OutfitContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BrowseClothing.jsx
│   │   │   ├── BuildOutfit.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── SignIn.jsx
│   │   │   └── UploadImages.jsx
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS files
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   │   ├── database.js
│   │   │   └── gcs-credentials.json (gitignored)
│   │   ├── controllers/   # Route controllers
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── clothingController.js
│   │   │   └── imageController.js
│   │   ├── middleware/    # Custom middleware
│   │   │   ├── adminAuth.js
│   │   │   ├── auth.js
│   │   │   └── csvUpload.js
│   │   ├── models/        # Mongoose models
│   │   │   ├── ClothingItem.js
│   │   │   └── user.js
│   │   ├── routes/        # API routes
│   │   │   ├── admin.js
│   │   │   ├── auth.js
│   │   │   ├── clothing.js
│   │   │   ├── images.js
│   │   │   └── upload.js
│   │   ├── services/      # Business logic
│   │   │   ├── clothingService.js
│   │   │   ├── gcsService.js
│   │   │   └── storageService.js
│   │   ├── utils/         # Utility functions
│   │   └── index.js       # Server entry point
│   ├── test/              # Test files
│   ├── .env               # Environment variables (gitignored)
│   └── package.json
│
└── README.md              # This file
```

## API Documentation

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@pfw.edu",
  "password": "securePassword123",
  "role": "user"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@pfw.edu",
  "password": "securePassword123"
}
```

### Clothing Endpoints

#### Get All Clothing

```http
GET /api/clothing
```

#### Get Clothing by Category

```http
GET /api/clothing?category=Tops
```

#### Add Clothing Item (Admin)

```http
POST /api/admin/clothing
Content-Type: application/json

{
  "name": "Blue Blazer",
  "category": "Outerwear",
  "subcategory": "Blazer",
  "size": "M",
  "color": "Blue",
  "season": "All",
  "imageUrl": "gs://bucket/path/to/image.webp"
}
```

## User Roles

### Student/User Role

- Browse and search clothing items
- Build and save outfits

### Admin Role

- All user permissions
- Manage clothing inventory
- Manage user accounts
- Upload items via CSV

## Color Options

Available clothing colors:

- Black, Brown, Green, White, Gray, Tan, Navy
- Blue, Yellow, Red, Pink, Purple, Orange

## Size Options

Available sizes: XS, S, M, L, XL

## Categories

- **Tops**: Shirts, blouses, t-shirts
- **Bottoms**: Pants, skirts, shorts
- **Dresses**: Formal and casual dresses
- **Outerwear**: Blazers, jackets, coats
- **Shoes**: Professional footwear
- **Accessories**: Ties, scarves, belts, bags

## Security

- Passwords are hashed using bcrypt
- Admin routes protected with custom middleware
- MongoDB connection secured with environment variables
- Google Cloud credentials stored securely

## Notes

- Images are stored in Google Cloud Storage with signed URLs
- The application uses MongoDB Atlas for the database
- Frontend runs on port 5173, backend on port 5000
- CORS is configured to allow cross-origin requests

## Troubleshooting

### Server won't start

- Ensure `.env` file exists with correct MongoDB URI
- Check `gcs-credentials.json` is in `server/src/config/`
- Verify all dependencies are installed: `npm install`

### Images not loading

- Verify GCS bucket name and credentials
- Check signed URL generation in `gcsService.js`
- Ensure images are in the correct bucket folder

### Database connection issues

- Verify MongoDB URI in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions

## License

This project is developed for Purdue University Fort Wayne Career Services.

## Contributors

- Development Team: PFW Web Application Development Class
