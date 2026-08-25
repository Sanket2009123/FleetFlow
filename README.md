# FleetFlow

FleetFlow is a modern fleet and logistics management system designed to manage vehicles, drivers, trips, maintenance, expenses and daily fleet operations from a single dashboard.

## Live Website

[Open FleetFlow](https://fleet-flow-mauve-six.vercel.app/)

## Main Features

* Fleet command dashboard
* Vehicle registration and management
* Driver profile management
* Trip planning and dispatch
* Live dispatch status
* Vehicle maintenance alerts
* Fuel and expense tracking
* Fleet utilization monitoring
* Cargo and shipment management
* Secure authentication
* Responsive design
* Interactive 3D fleet visualization

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express
* REST API

### Database

* SQLite

### Deployment

* Vercel
* Render
* GitHub

## Project Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sanket2009123/FleetFlow.git
```

### 2. Open the Project Folder

```bash
cd FleetFlow
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create the Environment File

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

For macOS or Linux:

```bash
cp .env.example .env
```

Open the `.env` file and add the required environment variables.

Never upload your real API keys, passwords or database credentials to GitHub.

### 5. Start the Development Server

```bash
npm run dev
```

After starting the server, open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Commands

| Command            | Purpose                          |
| ------------------ | -------------------------------- |
| `npm install`      | Install project dependencies     |
| `npm run dev`      | Start the development server     |
| `npm run build`    | Create a production build        |
| `npm run preview`  | Preview the production build     |
| `npm run lint`     | Check TypeScript and code errors |
| `npm run test:api` | Test the API and database        |

## Project Structure

```text
FleetFlow/
├── components/
├── services/
├── public/
├── App.tsx
├── index.html
├── index.tsx
├── server.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Deployment

The FleetFlow frontend is deployed on Vercel. Backend services can be deployed on Render.

Before deployment:

1. Add all required environment variables.
2. Run `npm run lint`.
3. Run `npm run test:api`.
4. Run `npm run build`.
5. Confirm that the build completes without errors.

## Security

* Environment variables are used for sensitive configuration.
* Secret keys must never be committed to GitHub.
* Authentication is required for protected operations.
* User and admin data should be handled separately.
* Input data should be validated by the backend.

## Author

Developed by **Sanket Prajapati**.

## License

This project is created for educational and portfolio purposes.
