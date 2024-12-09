# Survey Discount App for Shopify

A Shopify app that incentivizes customers to complete surveys by offering discount codes.

## Features
- Customer survey collection
- Automatic discount code generation
- Shopify Admin interface for survey management
- MongoDB integration for data storage
- Secure authentication using JWT

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (v6.0 or higher)
- ngrok for local development
- Shopify Partner account
- npm or yarn package manager

## Installation
1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd survey-discount-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/survey-discount-app
   JWT_SECRET=your_jwt_secret
   SHOPIFY_API_KEY=your_shopify_api_key
   SHOPIFY_API_SECRET=your_shopify_api_secret
   SCOPES=write_products,read_products,write_customers,read_customers,write_discounts,read_discounts
   HOST=your_ngrok_url
   ```

## Development Setup
1. Start MongoDB:
   ```bash
   brew services start mongodb-community@6.0
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Start ngrok:
   ```bash
   ngrok http 3000
   ```

4. Update the ngrok URL in:
   - `.env` file
   - Shopify Partner Dashboard (App URL and Callback URL)

## Shopify Setup

### 1. App Creation
In your Shopify Partner Dashboard:
1. Navigate to "Apps"
2. Click "Create app"
3. Choose "Public App"
4. Fill in app details:
   - App name
   - App URL: `https://your-ngrok-url/`
   - Allowed redirection URL(s): `https://your-ngrok-url/auth/callback`

### 2. API Credentials
1. Once created, get your API credentials:
   - API key
   - API secret key
2. Add these to your `.env` file:
   ```env
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   ```

### 3. Development Store
1. Create a development store:
   - Go to "Stores" in Partner Dashboard
   - Click "Add store"
   - Choose "Development store"
   - Fill in the store details
2. Install your app on the development store:
   - Go to your app in Partner Dashboard
   - Click "Select store"
   - Choose your development store
   - Complete installation process

### 4. App Scopes
The app requires the following scopes:
SCOPES=write_products,read_products,write_customers,read_customers,write_discounts,read_discounts


## Database
The app uses MongoDB to store:
- Survey responses
- Customer information
- Discount codes
- App settings

