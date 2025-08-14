# Project Title: Google Authentication with Node.js and TypeScript

## Overview
This project implements Google authentication using Node.js and TypeScript. It sets up an Express server that allows users to authenticate via their Google accounts.

## Project Structure
```
server
├── src
│   ├── app.ts          # Entry point of the application
│   ├── auth
│   │   └── googleAuth.ts # Google authentication logic
│   └── types
│       └── index.ts    # Type definitions
├── package.json        # NPM dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Create Google Credentials**
   - Go to the [Google Developer Console](https://console.developers.google.com/).
   - Create a new project.
   - Navigate to "Credentials" and create OAuth 2.0 credentials.
   - Set the redirect URI to `http://localhost:3000/auth/google/callback`.

4. **Set Environment Variables**
   Create a `.env` file in the root of the project and add your Google Client ID and Client Secret:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

5. **Run the Application**
   ```bash
   npm start
   ```

## Usage
- Navigate to `http://localhost:3000/auth/google` to initiate the Google authentication process.
- After successful authentication, you will be redirected back to your application.

## Additional Information
This project uses the following libraries:
- Express: A web framework for Node.js.
- Google OAuth2: For handling Google authentication.

Feel free to explore the code in the `src` directory for more details on the implementation.