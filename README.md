# CreatorOrbit

**Autonomous subscriptions for unstoppable creators.**

Built on Massa blockchain with DeWeb hosting. No bots, no cron jobs, no backend server needed for billing.

## Features

- 🚀 **Autonomous Billing**: Smart contracts handle all subscriptions automatically
- 🔒 **Fully Decentralized**: Built on Massa blockchain
- 🌐 **DeWeb Hosted**: Frontend deployed on Massa DeWeb
- 🎨 **Modern 3D UI**: Beautiful interface with Three.js and Framer Motion
- 🆓 **7-Day Free Trial**: New users get 7 days of free access
- 💰 **Creator Earnings**: Creators can withdraw earnings directly from smart contracts
- 📱 **Responsive Design**: Works on all devices

## Tech Stack

### Smart Contracts
- **Language**: AssemblyScript
- **Platform**: Massa Blockchain
- **Features**: 
  - UserRegistry (user/creator profiles)
  - SubscriptionManager (tiers, subscriptions, autonomous billing)
  - ContentRegistry (content metadata & access control)

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js + React Three Fiber
- **Animations**: Framer Motion
- **Routing**: React Router
- **Wallet**: Massa Wallet Provider
- **Blockchain**: Massa Web3 SDK

## Project Structure

```
CreatorOrbit/
├── contract/          # Smart contracts
│   ├── assembly/
│   │   └── contracts/
│   │       ├── main.ts              # Main contract entry
│   │       ├── UserRegistry.ts     # User & creator profiles
│   │       ├── SubscriptionManager.ts  # Subscriptions & billing
│   │       └── ContentRegistry.ts  # Content management
│   └── src/
│       └── deploy.ts               # Deployment script
│
└── frontend/          # React frontend
    ├── src/
    │   ├── pages/     # All pages
    │   ├── components/  # Reusable components
    │   ├── hooks/     # Custom hooks
    │   └── App.tsx    # Main app component
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Massa Station wallet

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CreatorOrbit
```

2. **Install contract dependencies**
```bash
cd contract
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables**
```bash
# In frontend directory
cp .env.example .env
# Update VITE_CONTRACT_ADDRESS with your deployed contract address
```

### Development

1. **Build and deploy smart contracts**
```bash
cd contract
npm run build
npm run deploy
# Copy the contract address and update frontend/.env
```

2. **Run frontend development server**
```bash
cd frontend
npm run dev
```

3. **Open browser**
Navigate to `http://localhost:5173`

## Smart Contract Deployment

1. Set up your Massa account in `contract/.env`:
```
PRIVATE_KEY=your_private_key
PUBLIC_KEY=your_public_key
```

2. Build the contract:
```bash
cd contract
npm run build
```

3. Deploy:
```bash
npm run deploy
```

4. Update `frontend/.env` with the deployed contract address.

## Features Overview

### For Users
- ✅ 7-day free trial on signup
- ✅ Browse creators and content
- ✅ Subscribe to creators with multiple tiers
- ✅ View subscription status and billing history
- ✅ Cancel subscriptions anytime

### For Creators
- ✅ Create creator profile
- ✅ Set up subscription tiers
- ✅ Upload content (posts, videos, audio, files)
- ✅ Mark up to 3 posts as free trial content
- ✅ View subscribers and earnings
- ✅ Withdraw earnings directly from smart contract

## Routes

### Public Routes
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/explore` - Browse creators
- `/creator/:handle` - Creator profile
- `/content/:id` - View content

### User Dashboard
- `/dashboard/user/overview` - User overview
- `/dashboard/user/subscriptions` - Manage subscriptions
- `/dashboard/user/billing` - Billing history
- `/dashboard/user/settings` - User settings

### Creator Dashboard
- `/dashboard/creator/overview` - Creator overview
- `/dashboard/creator/content` - Manage content
- `/dashboard/creator/subscribers` - View subscribers
- `/dashboard/creator/tiers` - Manage tiers
- `/dashboard/creator/payouts` - Withdraw earnings
- `/dashboard/creator/settings` - Creator settings

## Smart Contract Functions

### UserRegistry
- `registerUser(address, username, bio)` - Register new user
- `registerCreator(address, name, handle, bio, category, metadataURI)` - Register as creator
- `getUser(address)` - Get user profile
- `getCreator(address|handle)` - Get creator profile
- `isInTrial(address)` - Check if user is in trial
- `updateUserProfile(address, username, bio)` - Update profile

### SubscriptionManager
- `createTier(creator, name, pricePerMonth, metadataURI)` - Create subscription tier
- `getTier(creator, tierId)` - Get tier details
- `getCreatorTiers(creator)` - Get all tiers for creator
- `subscribe(creator, tierId)` - Subscribe to creator
- `cancelSubscription(creator)` - Cancel subscription
- `isSubscribed(subscriber, creator, tierId)` - Check subscription status
- `withdrawEarnings(amount)` - Withdraw creator earnings
- `getVaultBalance(creator)` - Get creator vault balance

### ContentRegistry
- `createContent(creator, tierIdRequired, visibility, contentCID, title, description, contentType)` - Create content
- `getContent(contentId)` - Get content details
- `getCreatorContent(creator)` - Get all content for creator
- `canViewContent(userAddress, contentId)` - Check access
- `getFreeTrialCount(creator)` - Get free trial content count
- `deleteContent(contentId)` - Delete content

## Building for Production

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist
```

### Deploy to DeWeb
1. Build the frontend
2. Upload `dist` folder to Massa DeWeb
3. Your app will be accessible via DeWeb

## Security Notes

- All access control is enforced on-chain
- Users can only view content they have access to
- Creators can only manage their own content
- Subscription billing is handled autonomously by smart contracts
- No backend server means no single point of failure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ on Massa Blockchain

