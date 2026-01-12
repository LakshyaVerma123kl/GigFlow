# GigFlow - Freelance Marketplace Platform

GigFlow is a full-stack freelance marketplace where users can post jobs (Gigs), apply for them (Bids), and manage the hiring process securely.

## 🚀 Features

- **Fluid Roles**: Every user can act as both a Client and a Freelancer.
- **Gig Management**: Post, browse, and search for open gigs [cite: 17-20].
- **Secure Auth**: JWT Authentication with HttpOnly cookies.
- **Hiring System**:
  - **Atomic Transactions**: Uses MongoDB Sessions to ensure hiring integrity (prevents race conditions)[cite: 37].
  - **Real-Time Updates**: Freelancers receive instant notifications via Socket.io when hired[cite: 40].
- **Dark Mode**: Fully responsive UI with toggleable dark/light themes.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS v4, Redux Toolkit, Socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.

## ⚙️ Installation & Setup

### 1. Clone the Repository

````bash
git clone [https://github.com/LakshyaVerma123kl/GigFlow](https://github.com/LakshyaVerma123kl/GigFlow)
cd gigflow
2. Backend Setup
Navigate to the server folder and install dependencies:

Bash

cd server
npm install
Create a .env file in the server directory with the following variables:

Code snippet

PORT=5000
MONGO_URI=mongodb+srv://<your_db_user>:<your_db_password>@cluster.mongodb.net/gigflow
JWT_SECRET=your_super_secret_key
NODE_ENV=development
Start the backend server:

Bash

npm run dev
3. Frontend Setup
Open a new terminal, navigate to the client folder, and install dependencies:

Bash

cd client
npm install
Start the frontend development server:

Bash

npm run dev
🧪 Testing the Bonus Features
Transactional Integrity (Bonus 1)
The hireFreelancer controller uses mongoose.startSession() to ensure that when a freelancer is hired:

The Gig status updates to assigned.  

The Winning Bid updates to hired.  

All other bids are automatically marked as rejected. If any step fails, the entire operation rolls back.  

Real-Time Notifications (Bonus 2)
Open the app in two different browsers (or one Incognito window).

Log in as User A (Client) and User B (Freelancer).

User A posts a job.

User B places a bid on that job.

User A clicks "Hire" on the bid.

Result: User B will instantly see a "Congratulations" toast notification without refreshing the page.


---

### 2. `.env.example`

```env
# Server Configuration
PORT=5000

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gigflow?retryWrites=true&w=majority

# Security
JWT_SECRET=replace_this_with_a_secure_random_string

# Environment
NODE_ENV=development
3. .gitignore
Plaintext

# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
dist
build

# Environment Variables (CRITICAL: Do not upload real keys)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories
.vscode
.idea
*.suo
*.ntvs
*.njsproj
*.sln
*.sw?
````
