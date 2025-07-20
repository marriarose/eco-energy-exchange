# GridXchange - Peer-to-Peer Solar Power Sharing Platform

A modern web application that enables rural households with solar panels to share surplus electricity with neighbors in real-time using a smart, decentralized microgrid system.

## 🌟 Features

- **Real-time Energy Trading**: Accept energy requests and offers with instant trade creation
- **Smart Matching**: Automatic validation of energy availability and home compatibility
- **Trade Management**: Complete trades and track energy transfers in real-time
- **Solar Dashboard**: Monitor generation, consumption, and surplus in real-time
- **Community Marketplace**: Post energy offers and requests with custom pricing
- **Trade History**: Track all energy transactions and payments
- **Active Trades**: Manage ongoing energy transfers with completion tracking
- **Trading Notifications**: Get notified of new trading opportunities
- **Location-based Trading**: View trading opportunities on a map with distance calculations
- **Proximity Filtering**: Filter energy requests and offers by distance radius
- **Multi-home Support**: Manage multiple properties with solar installations
- **Mobile-first Design**: Responsive interface for all devices
- **Real-time Updates**: Live data updates using Supabase subscriptions

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui components (minimal set)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Charts**: Recharts
- **State Management**: React Query + Context API
- **Routing**: React Router v6
-✔️  Deployment complete! Visit your project at https://vercel.com/marria-rose-k-bs-projects/eco-energy-exchange

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gridxchange
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - The database schema will be automatically created via migrations
   - Configure authentication providers in Supabase dashboard

4. **Environment Setup**
   - Supabase configuration is automatically managed
   - No additional environment variables needed

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:5173 in your browser
   - Sign up for a new account or sign in
   - Add your first home to start energy trading

## 📊 Database Schema

The application uses the following main tables:

- **homes**: Store property information and current energy data
- **energy_requests**: Manage energy purchase requests
- **energy_offers**: Handle energy sale offers
- **trades**: Record completed energy transactions
- **profiles**: Store additional user information

## 🏠 Usage Guide

### 1. **Account Setup**
- Create an account using email/password
- Verify your email address
- Complete your profile

### 2. **Add Your Home**
- Register your property with solar panel details
- Input current generation and consumption data
- Set solar capacity and location

### 3. **Energy Trading**
- **Offer Energy**: Share surplus energy with the community
- **Request Energy**: Purchase energy when you have a deficit
- **Accept Trades**: Accept energy requests or offers from other users
- **Manage Active Trades**: Complete trades when energy transfer is finished
- **View Marketplace**: Browse active offers and requests
- **Trading Map**: View all trading opportunities on an interactive map
- **Distance Filtering**: Filter opportunities by proximity to your location
- **Trade History**: Monitor your transaction history
- **Trading Notifications**: Get notified of new trading opportunities

### 4. **Dashboard Features**
- Real-time energy charts
- Home performance metrics
- Community activity overview
- Trade statistics

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and types
├── pages/              # Route components
├── integrations/       # Supabase integration
└── App.tsx             # Main application component
```

### Key Components
- **Dashboard**: Main energy monitoring interface
- **EnergyChart**: Visualization of energy data
- **HomeCard**: Individual home information display
- **EnergyRequestForm**: Create energy purchase requests
- **EnergyOfferForm**: Create energy sale offers
- **TradeHistory**: Transaction history display

### Custom Hooks
- **useAuth**: Authentication state management
- Real-time data subscriptions via Supabase

## 🔐 Security

- Row Level Security (RLS) policies protect user data
- Authentication required for all operations
- Users can only access their own homes and related trades
- Secure API endpoints with proper authorization

## 🌍 Future Enhancements

- **IoT Integration**: ESP32 sensors for automated energy readings
- **ML Predictions**: AI-powered energy surplus forecasting
- **Smart Contracts**: Blockchain-based automated trading
- **Mobile App**: Native iOS/Android applications
- **Payment Integration**: Real money transactions
- **Grid Integration**: Utility company partnerships

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**GridXchange** - Building the future of distributed renewable energy 🌱⚡


[![💻 Built at TinkerSpace](https://img.shields.io/badge/Built%20at-TinkerSpace-blueviolet?style=for-the-badge&label=%F0%9F%92%BBBuilt%20at&labelColor=turquoise&color=white)](https://tinkerhub.org/tinkerspace)
