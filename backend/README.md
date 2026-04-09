# Backend Directory Structure

```bash
/backend
    ├── src
    │   ├── controllers
    │   ├── middlewares
    │   ├── models
    │   ├── routes
    │   ├── services
    │   ├── config
    │   ├── app.ts
    │   └── server.ts
    ├── tests
    ├── package.json
    ├── tsconfig.json
    └── .env
```

# Key Files

### package.json
```json
{
  "name": "aurelia-private-concierge",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.17.1",
    "dotenv": "^8.2.0",
    "mongoose": "^5.12.3",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "typescript": "^4.2.3",
    "jest": "^26.6.3"
  }
}
```

### .env
```
PORT=3000
MONGO_URI=mongodb://<username>:<password>@localhost:27017/aurelia-private-concierge
```

### src/app.ts
```typescript
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);

export default app;
```

### src/server.ts
```typescript
import app from './app';
import { connect } from './config/db';

const PORT = process.env.PORT || 3000;

connect();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

# Documentation
- This directory structure provides a clear organization for controllers, middlewares, models, routes, and services within the application.
- The application is configured to use TypeScript with Express, a MongoDB connection, and is test-ready with Jest.