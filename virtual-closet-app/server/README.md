## Start

npm install
cp .env.example .env

# Edit .env with your MongoDB connection string

npm run dev

### Environment Variables

Create a `.env` file in the server directory:

env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-closet?retryWrites=true&w=majority
