# Blood Bank Management System

A comprehensive, scalable, full-stack Blood Bank Management System that connects donors, blood banks, hospitals, and administrative staff through a unified platform. 

## Features
- **Donors**: Find nearby blood camps, book appointments, track donation history, and claim milestone rewards.
- **Hospitals**: Request blood units, track real-time inventory, and manage medical deliveries.
- **Blood Banks**: Manage inventory, track blood unit lifecycles (Testing -> Approved -> Issued), and manage laboratory sessions.
- **Camps & Campaigns**: Administrators can create mobile donation camps with dedicated slots and capacities.
- **Laboratory & Medical Validation**: Integrated module for medical screening, barcode label generation, and blood testing.

## Architecture & Technology Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS (v4), React Router DOM, React Hook Form
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL (hosted on Supabase)
- **Authentication**: JWT, bcrypt

## Folder Structure
```text
project-root/
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── layouts/      # Application layouts
│   │   ├── pages/        # Feature-based pages (donor, admin, lab, hospital)
│   │   └── services/     # Axios API integration
│   └── .env.example
├── server/               # Express API
│   ├── src/
│   │   ├── controllers/  # API business logic
│   │   ├── middleware/   # Authentication & Authorization
│   │   ├── routes/       # Express routers
│   │   └── utils/        # PDF generation, etc.
│   ├── prisma/           # Prisma schema
│   ├── scripts/          # Database seed scripts
│   └── .env.example
└── README.md
```

## Installation & Setup

1. **Clone the repository**
2. **Setup the Database**
   Configure your PostgreSQL connection in `server/.env` based on `server/.env.example`.
3. **Backend Setup**
   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma db push
   npm run seed      # Optional: Populates dummy data via scripts/seed.ts
   npm run dev
   ```
4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Roles & Permissions
- `Admin`: Full system access, camp management, inventory oversight.
- `Receptionist`: Donor check-in, queue management, basic verification.
- `CollectionStaff`: Oversees the physical donation process and records vital signs.
- `LabTechnician`: Processes blood units, manages test results, and finalizes lab reports.
- `Hospital`: Requests blood units from banks.
- `Donor`: Books appointments and accesses personal donation history.

## Development Guidelines
- **Database Changes**: Always update `server/prisma/schema.prisma` and run `npx prisma db push`.
- **New API Routes**: Create a controller in `server/src/controllers/`, map it in `server/src/routes/`, and attach it in `server/src/server.ts`.
- **Environment Variables**: Never commit real `.env` files. Ensure placeholders are provided in `.env.example`.

## Responsive Web Architecture
The frontend web application employs a fluid layout design supporting arbitrary screen widths and ratios without user-agent hacks.
- **Fluid Layouts**: Tables and internal content use `overflow-x-auto` to protect flex boundaries.
- **Tailwind Grid Constraints**: Heavy use of `sm:` and `md:` prefixes seamlessly stack navigation components and forms from Desktop to Tablet/Mobile orientations.
- **Viewport Heights**: Modals and full-screen layouts use dynamic viewport heights (`dvh`) to bypass overlapping issues with mobile Safari/Chrome address bars.

Supported device classes tested and maintained:
* Phones (Portrait/Landscape): Small (<375px), Large (up to 430px)
* Foldables & Tablets: iPads, Samsung Tabs (600px - 1024px)
* Web: Laptops (720p/1080p), Ultra-wides (1440p+)

## Mobile Application
A native mobile application is located inside the `mobile/` directory, built on **React Native (Expo)** to closely align with the existing TypeScript + Tailwind (NativeWind) web architecture.

### Shared Backend
The web and mobile applications operate on **the same backend API and database**. The mobile application maintains authentication sessions exactly as the web application does using the same Node.js infrastructure. 

### Mobile Setup
1. **Navigate to the directory**:
   ```bash
   cd mobile
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set API URL**: Ensure `src/services/api.js` points to your backend IP (e.g. `http://10.0.2.2:5000/api` for emulator or physical machine IP for devices).
4. **Run Expo Server**:
   ```bash
   npm start
   ```
5. Choose your target (press `a` for Android Emulator or scan QR for physical device testing).
