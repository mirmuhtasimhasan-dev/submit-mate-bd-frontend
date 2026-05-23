# Fix for Tailwind / PostCSS build error

This frontend is pinned to stable versions:
- Next.js 14.2.23
- React 18.3.1
- Tailwind CSS 3.4.17

## Run cleanly

1. Stop frontend server with Ctrl+C.
2. Delete these from the frontend folder if they exist:
   - node_modules
   - package-lock.json
   - .next
3. Run:

```bash
npm install
npm run dev
```

Open: http://localhost:3000
