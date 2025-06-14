# Bookmarks and Code Snippets Manager

A web application for managing bookmarks and code snippets with MongoDB storage.

## Features

### Bookmarks Page

- Add, view, and delete bookmarks
- MongoDB storage for persistence
- Clean, minimalist interface

### Snippets Page

- Create, read, update, and delete code snippets
- Syntax highlighting for various programming languages
- Copy to clipboard functionality
- MongoDB storage for persistence
- Filter snippets by language
- Description support for each snippet

## Technology Stack

- Node.js and Express for the backend
- MongoDB and Mongoose for database
- Pure JavaScript for frontend functionality
- highlight.js for code syntax highlighting

## Setup Instructions

1. Install MongoDB on your system if not already installed

   - [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. Install dependencies:

   ```
   npm install
   ```

3. Create a .env file in the root directory with the following variables:

   ```
   MONGODB_URI=mongodb://localhost:27017/snippets_bookmarks_db
   PORT=3000
   ```

4. Start the server:

   ```
   npm start
   ```

5. For development with auto-reload:

   ```
   npm run dev
   ```

6. Access the application in your browser:
   - Bookmarks page: http://localhost:3000/
   - Snippets page: http://localhost:3000/snippets

## File Structure

- `server.js`: Express server and MongoDB connection
- `index.html`: Bookmarks page
- `snippets.html`: Code snippets page
- `public/`: Static assets
- `.env`: Environment configuration (not tracked in git)

## MongoDB Collections

- `bookmarks`: Stores user's saved bookmarks
- `snippets`: Stores code snippets with metadata

## License

MIT
