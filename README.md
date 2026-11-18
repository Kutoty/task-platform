# Task platform

A small task board with signed login tokens and a role check. Data stays in memory, so it resets when the process stops.

## Run

```bash
npm test
npm start
```

Open http://localhost:3000

| User | Password | Sees |
| --- | --- | --- |
| admin | admin | Every task |
| member | member | Only tasks they added |
