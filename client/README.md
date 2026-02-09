# AuctionHub Frontend

A modern, responsive auction platform frontend built with React, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

### ✅ **Complete Auction Platform**
- **Real-time Bidding**: Live bid updates with Socket.io
- **User Authentication**: Login/Register with JWT
- **Auction Management**: Create, view, and manage auctions
- **Advanced Search**: Filter by category, price, status
- **User Dashboard**: Track bids, auctions, and activity
- **Responsive Design**: Mobile-first, touch-friendly interface

### 🎨 **Modern UI/UX**
- **Shadcn/UI Components**: Professional, accessible components
- **Tailwind CSS**: Modern styling with custom animations
- **Dark/Light Mode Ready**: CSS variables for theming
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: Success/error/warning messages

### 📱 **Mobile Responsive**
- Touch-friendly bidding interface
- Mobile-optimized navigation
- Responsive grid layouts
- Mobile-first design approach

### 🔒 **Security & Performance**
- Protected routes for authenticated users
- Input validation and sanitization
- Error boundary handling
- Optimized API calls with caching

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality React components
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3001
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI base components
│   ├── layout/         # Layout components (Navbar, Layout)
│   ├── auction/        # Auction-specific components
│   └── common/         # Common components (Toast, ProtectedRoute)
├── pages/              # Page components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom hooks (useSocket, useToast)
├── lib/                # Utilities and API client
└── styles/             # Global styles
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### API Integration

The frontend is designed to work with the existing backend API:

- **Authentication**: `/api/auth/*`
- **Auctions**: `/api/auction/*` 
- **Users**: `/api/users/*`
- **Socket.io**: Real-time bidding and notifications

## 📱 Pages & Features

### 🏠 **Home Page**
- Hero section with call-to-action
- Featured auctions grid
- Platform statistics
- Feature highlights

### 🔍 **Auctions Page**
- Advanced search and filtering
- Category-based browsing
- Sort options (price, time, etc.)
- Grid/List view toggle

### 🎯 **Auction Detail Page**
- Real-time bidding interface
- Live bid history
- Online users display
- Countdown timer
- Image gallery

### 👤 **User Dashboard**
- Activity overview
- My auctions management
- Bid history tracking
- Won auctions display
- Statistics and analytics

### ➕ **Create Auction**
- Step-by-step auction creation
- Image upload with preview
- Form validation
- Duration presets

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (system fallback)
- **Headings**: Bold, various sizes
- **Body**: Regular weight, readable line height

### Components
- Consistent spacing (4px grid)
- Rounded corners (8px default)
- Subtle shadows and borders
- Smooth animations and transitions

## 🔌 Real-time Features

### Socket.io Integration
- **Bid Updates**: Live bid notifications
- **User Presence**: Online user tracking
- **Auction Events**: Start/end notifications
- **Outbid Alerts**: Instant notifications

### Event Handling
```javascript
// Example socket events
socket.on('bid-placed', handleBidUpdate)
socket.on('user-joined', handleUserJoined)
socket.on('auction-ended', handleAuctionEnd)
```

## 📊 State Management

### Context Providers
- **AuthContext**: User authentication state
- **ToastContext**: Notification management

### Custom Hooks
- **useSocket**: Socket.io connection management
- **useToast**: Toast notification system
- **useAuth**: Authentication utilities

## 🧪 Development

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Consistent naming conventions

### Component Structure
```jsx
// Example component structure
const ComponentName = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {}, [])
  
  // Handlers
  const handleAction = () => {}
  
  // Render
  return <div>...</div>
}
```

## 🚀 Deployment

### Build Optimization
- Vite build optimization
- Code splitting
- Asset optimization
- Tree shaking

### Deployment Options
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Shadcn/UI** for beautiful components
- **Tailwind CSS** for utility-first styling
- **Lucide** for consistent icons
- **React Team** for the amazing framework