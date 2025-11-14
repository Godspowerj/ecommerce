markdown## Development Setup

### Prerequisites
- Node.js v16+ 
- npm or yarn
- Git

### Installation

1. Clone the repository
```bash
   git clone 
   cd express-basics
```

2. Install dependencies
```bash
   npm install
```
   Note: First install may take 5-10 minutes. MongoDB binaries will be downloaded automatically.

3. Set up environment variables
```bash
   cp .env.example .env
   # Edit .env with your credentials
```

4. Run the application
```bash
   npm run dev
```

### Important Notes

- **Never commit** `node_modules/`, `.env`, or `.mongodb-binaries/`
- These are excluded via `.gitignore`
- MongoDB binaries are downloaded automatically on first run
- See [CHALLENGES.md](./CHALLENGES.md) for troubleshooting common issues