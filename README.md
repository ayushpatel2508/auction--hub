# Auction-Sockets

A real-time auction platform where users can create, join, and bid on auctions in real-time. Features include live bidding, watchlists, bid history, and user profiles.

## Features
### Real-time Bidding & Communication
- **Real-time Bidding**: Powered by Socket.IO for instant updates across all participants.
- **Live Notifications**: Alerts when new bids are placed or users join/leave auctions.
- **Dynamic Countdown**: Real-time tracking of auction end times.

### User Management
- **Authentication**: Secure JWT-based registration and login with HTTP-only cookies.
- **User Profiles**: Manage your own auctions, bids, and won items.
- **Watchlist**: Track auctions you're interested in for quick access.

### Auction Management
- **Create Auctions**: Easily list items with images (stored on Cloudinary), descriptions, and categories.
- **Bid History**: View full transparency of all past bids in a room.
- **Join/Quit Rooms**: Seamlessly enter and exit auction rooms.

## Tech Stack
### Client (Frontend)
| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI Library |
| **Vite** | Build Tool |
| **Tailwind CSS** | Utility-first CSS Styling |
| **Radix UI** | Accessible Component Primitives |
| **Socket.IO Client** | Real-time Communication |
| **React Router** | Client-side Routing |
| **Lucide React** | Icon Pack |
| **Axios** | HTTP Client |

### Server (Backend)
| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Runtime Environment |
| **Express 5** | Web Framework |
| **Socket.IO** | Real-time Events |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication Tokens |
| **bcryptjs** | Password Hashing |
| **Cloudinary** | Image Hosting |
| **Multer** | File Upload Handling |
| **Express Rate Limit** | Brute-force Protection |

## Project Structure
```text
auction-sockets/
├── client/                 # React Frontend (Vite)
│   └── src/
│       ├── components/     # UI Components (layout, ui, etc)
│       ├── contexts/       # Auth & State Contexts
│       ├── pages/          # Full Page Views
│       └── services/       # API and Socket Services
│
└── server/                 # Node.js Backend (Express)
    ├── config/             # Configuration files
    ├── dbconnect/          # MongoDB Connection
    ├── middleware/         # Auth & Upload Middleware
    ├── models/             # Mongoose Schemas (User, Auction, Bid, Presence)
    ├── routes/             # API Endpoints
    └── scripts/            # Database utility scripts
```

## Getting Started
### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Bun (optional, but used in server)
- Cloudinary Account (for image uploads)

### Environment Variables
#### Server (`server/.env`):
```text
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```

#### Client (`client/.env`):
```text
VITE_API_URL=http://localhost:5000
```

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ayushpatel2508/auction--hub
    cd auction-sockets
    ```
2.  **Install Server Dependencies**:
    ```bash
    cd server
    npm install  # or bun install
    ```
3.  **Install Client Dependencies**:
    ```bash
    cd ../client
    npm install
    ```

### Running Locally
#### Terminal 1 - Server:
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

#### Terminal 2 - Client:
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

## API Endpoints
### Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Protected |
| GET | `/api/auth/verify` | Verify current session | Protected |

### Auctions
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/auction/create` | Create new auction | Protected |
| GET | `/api/auctions` | Get all auctions | Public |
| GET | `/api/auction/:roomId` | Get auction details | Public |
| GET | `/api/auction/:roomId/bids` | Get bid history | Public |
| DELETE | `/api/auction/:roomId` | Delete auction | Owner |

### User Profile
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/users/profile` | Get user profile | Protected |
| GET | `/api/users/watchlist` | Get watchlist | Protected |
| GET | `/api/users/my-auctions` | Get created auctions | Protected |
| GET | `/api/users/joined-auctions` | Get joined auctions | Protected |
