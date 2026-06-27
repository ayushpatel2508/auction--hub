# Auction Hub

A real-time auction platform where users can create, join, and bid on auctions. Built for speed and real-time updates using WebSockets.

## 🚀 Tech Stack

**Frontend:** React , Vite, Tailwind CSS, Radix UI, Socket.IO Client  
**Backend:** Node.js, Express, Socket.IO  
**Database:** MongoDB, Mongoose  
**Authentication & Storage:** JWT, Cloudinary (for images)  

## 🧠 Architecture & Tradeoffs

### 1. SQL vs NoSQL
My app has constant live bidding. This means the database is dealing with a massive amount of "write" operations compared to "read" operations. NoSQL (MongoDB) is generally much better at handling heavy write loads. Also, NoSQL is much easier to horizontally scale compared to traditional SQL databases when traffic increases.

### 2. Storing Sockets in Server Memory vs Redis
Right now, I store active socket connections directly in the Node.js server's RAM instead of using an external store like Redis. Because I are currently running on a single server. Fetching from local RAM is instant. If I used Redis on a single instance, it would actually increase latency because Redis is an external service, so it takes time to fetch data from one server to another.
*Future Scale:* If I ever scale up to multiple Node servers, I would then put the sockets in Redis using a pub/sub model to share data across the servers.

### 3. Good Indexing
I added indexes to make read queries extremely fast (like loading the chat history or even listing  the auciton based on filter  ).I also avoided to index those fields which are changing constantly cause every write on the indexed column has to pass through the the B-tree to update it and updating too many B-Tree indexes on every single bid would make our write operations slow.

### 4. WebSockets vs HTTP Polling
In a live auction, you need to see a bid the millisecond it happens. If we used standard HTTP polling (where the client asks the server "any new bids?" every 1 second), a room with 1,000 users would hit the server with 1,000 requests per second just to check for updates. WebSockets keep a single connection open, allowing the server to push the new bid to everyone instantly with basically zero overhead.

### 5. Stateless Authentication (JWT & Cookies)
I used JSON Web Tokens (JWT) stored in HTTP-only cookies instead of using traditional server-side Sessions. This keeps the Node.js server completely stateless. If the server restarts, or if I scale to multiple servers, users don't get logged out because the authentication state lives on the client's browser securely and not in the server's memory.

### 6. Cloudinary vs Local Storage
Instead of storing auction images directly on the server's hard drive, I upload them to Cloudinary. Storing images locally eats up server storage fast and creates massive bandwidth bottlenecks when users load the images. Cloudinary automatically compresses/optimizes the images and serves them via a global CDN (Content Delivery Network), ensuring they load instantly for users anywhere in the world.

## 🔌 Socket Events

Since this is a real-time app, here are the core WebSocket events we use:
- `join_room` / `leave_room`: Manage user presence in an auction.
- `place_bid`: Client sends a new bid.
- `receive_bid`: Server broadcasts the new bid to everyone in the room.
- `user_joined` / `user_left`: Broadcasts when the user count changes.

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (Clears HTTP-only cookie)
- `GET /api/auth/verify` - Check session

### Auctions
- `POST /api/auction/create` - Start a new auction
- `GET /api/auctions` - Get all active auctions
- `GET /api/auction/:roomId` - Get single auction data
- `GET /api/auction/:roomId/bids` - Get bid history
- `DELETE /api/auction/:roomId` - Delete auction (Owner only)

### User Profile
- `GET /api/users/profile` - Basic user info
- `GET /api/users/watchlist` - Get watched items
- `GET /api/users/my-auctions` - Auctions created by user
- `GET /api/users/joined-auctions` - Auctions the user participated in

## 💻 Getting Started

1. **Clone & Install**
   ```bash
   git clone https://github.com/ayushpatel2508/auction--hub
   cd auction-sockets
   
   # Install server deps
   cd server
   npm install
   
   # Install client deps
   cd ../client
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `server` directory. Check `server/.env.example` for the required keys (MongoDB URI, JWT secret, Cloudinary keys).

3. **Run Locally**
   ```bash
   # Terminal 1 (Server)
   cd server
   npm run dev
   
   # Terminal 2 (Client)
   cd client
   npm run dev
   ```
