# Food Delivery Frontend

A modern React.js frontend application for the Food Delivery Service, built with TypeScript, Material UI, and React Router.

## Features

- User authentication (Customer, Restaurant, Courier)
- Home page with restaurant listings
- Responsive design for all devices
- Restaurant search and filtering
- User profiles and order management

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## Getting Started

Follow these steps to get the project up and running on your local machine:

1. Clone the repository:
```
git clone <repository-url>
cd food-delivery-frontend
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
REACT_APP_API_URL=http://localhost:8080/api
```

4. Start the development server:
```
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
food-delivery-frontend/
├── public/                  # Static files
├── src/                     # Source code
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts
│   ├── interfaces/          # TypeScript interfaces
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── hooks/               # Custom React hooks
│   ├── assets/              # Images, fonts, etc.
│   ├── styles/              # Global styles
│   ├── App.tsx              # Main App component
│   └── index.tsx            # Entry point
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs tests
- `npm eject`: Ejects from Create React App

## Backend Integration

This frontend is designed to work with the Food Delivery Service Backend, which provides the following endpoints:

- `/api/customer/auth/register` - Customer registration
- `/api/customer/auth/login` - Customer login
- `/api/restaurant/auth/register` - Restaurant registration
- `/api/restaurant/auth/login` - Restaurant login
- `/api/courier/auth/register` - Courier registration
- `/api/courier/auth/login` - Courier login
- `/api/auth/logout` - Logout for all user types

Make sure the backend server is running and properly configured to connect with this frontend.

## License

This project is licensed under the MIT License. 