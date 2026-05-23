# Submit Mate BD Frontend

This is a ready Next.js frontend designed for your Submit Mate BD backend.

## Folder placement
Extract this frontend folder beside backend:

F:\submitmatebd\frontend
F:\submitmatebd\backend

## Run backend first
Go to backend folder and run:

```bash
php artisan serve
```

Backend should run at:
http://127.0.0.1:8000

## Run frontend
Open terminal inside frontend folder:

```bash
npm install
npm run dev
```

Frontend will run at:
http://localhost:3000

## API connection
The frontend uses this file:

.env.local

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_STORAGE_URL=http://127.0.0.1:8000/storage
```

## Demo login
Student:
email: student@submitmatebd.test
password: 12345678

Admin:
email: admin@submitmatebd.test
password: 12345678

## Important
For file upload to work, backend must have storage link:

```bash
php artisan storage:link
```
