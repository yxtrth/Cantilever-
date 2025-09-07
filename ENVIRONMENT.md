Environment variables required for local development and production

Server (.env)
- MONGO_URI - MongoDB connection string (do NOT commit credentials to source control). Example: mongodb+srv://user:pass@cluster0.mongodb.net/tasks?retryWrites=true&w=majority
- JWT_SECRET - Secret key for signing JWT tokens. Use a long random string.
- PORT - (optional) Port for the server to listen on. Defaults to 5000.

Client (.env)
- REACT_APP_API_URL - Base URL for the API (e.g. http://localhost:5000)

Security notes
- Rotate any database credentials accidentally committed to the repo.
- Add `.env` to your local .gitignore (already added) and use secure secret storage in production (Heroku config vars, Netlify env vars, GitHub Secrets, etc.).

Deployment
- Backend: Heroku is supported. Add a `Procfile` with `web: node server/index.js` and set MONGO_URI & JWT_SECRET in Heroku config vars.
- Frontend: Netlify or Vercel. Set `REACT_APP_API_URL` in their environment variable UI.
