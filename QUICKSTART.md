# CreatorOrbit Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
# Install contract dependencies
cd contract
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Deploy Smart Contracts

1. **Set up your Massa account** in `contract/.env`:
```env
PRIVATE_KEY=your_private_key_here
PUBLIC_KEY=your_public_key_here
```

2. **Build the contracts**:
```bash
cd contract
npm run build
```

3. **Deploy**:
```bash
npm run deploy
```

4. **Copy the contract address** from the deployment output.

### Step 3: Configure Frontend

1. **Create `.env` file** in `frontend/`:
```bash
cd frontend
cp .env.example .env
```

2. **Update `.env`** with your contract address (current buildnet deployment: `AS1Q7xPV7EjGVLRw1JAeJo52JYUaJfhDgf7Yk4EMMZVT4k6F6jcZ`):
```env
VITE_CONTRACT_ADDRESS=AS_your_contract_address_here
```

### Step 4: Run the Application

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📱 Using the App

### As a User

1. **Sign Up**: Click "Get Started" → Connect wallet → Fill profile
2. **Browse**: Go to `/explore` to see creators
3. **Subscribe**: Visit a creator page → Choose tier → Subscribe
4. **View Content**: Access free trial content or subscribe for premium

### As a Creator

1. **Become Creator**: Click "Become Creator" → Fill creator profile
2. **Create Tiers**: Go to Dashboard → Tiers → Create subscription tiers
3. **Upload Content**: Dashboard → Content → Create content
4. **Earn**: View earnings in Payouts → Withdraw when ready

## 🔧 Troubleshooting

### Contract deployment fails
- Check your `.env` file has correct keys
- Ensure you have enough MASSA for deployment
- Check network connection to Massa buildnet

### Frontend can't connect to contract
- Verify `VITE_CONTRACT_ADDRESS` in `.env` is correct
- Make sure contract is deployed
- Check browser console for errors

### Wallet connection issues
- Install Massa Station or Bearby wallet
- Make sure wallet is unlocked
- Check network (should be buildnet)

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the smart contract code in `contract/assembly/contracts/`
- Customize the UI in `frontend/src/`
- Deploy to DeWeb for production

## 🎉 You're Ready!

Your CreatorOrbit app is now running. Start creating and subscribing!

