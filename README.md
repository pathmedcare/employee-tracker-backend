# Employee Tracker Backend (`employee-tracker-backend`)

Clean, modular Node.js backend directory structure.

## 📁 Directory Architecture

```
employee-tracker-backend/
├── src/
│   ├── config/          # Database, S3, Firebase, Mail & ENV configs
│   ├── controllers/     # Request handlers
│   │   └── admin/       # Admin-specific request handlers
│   ├── models/          # Database models & schemas
│   ├── services/        # Core business logic
│   ├── routes/          # API route definitions
│   ├── middlewares/     # Auth, validation & error handling middlewares
│   ├── validators/      # Request input validation rules
│   ├── jobs/            # Background & scheduled cron jobs
│   └── utils/           # Geo, date & response helper functions
├── migrations/          # DB schema migration scripts
├── tests/               # Unit & integration tests
│   ├── unit/
│   └── integration/
├── docs/                # OpenAPI / Swagger documentation
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
