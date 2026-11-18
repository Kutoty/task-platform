# Task platform

Nest.js API with PostgreSQL. Login returns a JWT. Admins see every task. Members see only their own. Docker Compose starts the database and the API.

## Run

```bash
docker compose up --build
```

Demo logins: `admin` / `admin`, `member` / `member`.

`npm test` checks the role rule without a database.
