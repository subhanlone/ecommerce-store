# E-Commerce Store — Order Management & Admin Panel

Full-stack e-commerce store built with Next.js (App Router), MongoDB/Mongoose,
Tailwind CSS, and Auth.js (NextAuth v5). Includes a customer storefront and a
separate role-protected admin panel.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Database | MongoDB + Mongoose |
| Styling | Tailwind CSS v4 |
| Font | Poppins |
| Auth | Auth.js v5 (`next-auth@beta`), Credentials provider, JWT sessions |
| Image storage | Cloudinary |
| State management | Zustand (cart & wishlist) |
| Forms | react-hook-form + zod |
| Notifications | react-hot-toast |
| Payment | Cash on Delivery (Stripe not wired up yet) |

## Prerequisites

- Node.js 20.9+ (project developed on Node 24)
- A MongoDB instance — either:
  - **Local**: install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and run it as a service, or
  - **Atlas** (no install): create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) and copy its connection string
- A free [Cloudinary](https://cloudinary.com) account (for product image uploads)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` (already present in this repo with a
   generated `AUTH_SECRET`) and fill in the values:

   ```bash
   MONGODB_URI=mongodb://localhost:27017/ecommerce-store   # or your Atlas URI
   AUTH_URL=http://localhost:3000                           # local canonical URL
   AUTH_SECRET=...                                          # already generated
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

   Cloudinary credentials are on your dashboard at
   `https://console.cloudinary.com` after signup.

3. Create an admin account (registration through the UI always creates
   `customer` role accounts — this is the only way to get an admin):

   ```bash
   npm run create-admin -- admin@example.com yourpassword "Admin Name"
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   - Storefront: [http://localhost:3000](http://localhost:3000)
   - Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Project Structure

```
app/
├── (customer)/     # Storefront routes — home, products, cart, wishlist, checkout, orders, login, register
├── admin/
│   ├── login/      # Admin login (outside the sidebar layout)
│   └── (dashboard)/  # Sidebar-wrapped, role-protected admin routes
└── api/            # Route handlers for auth, products, categories, cart, orders, reviews, users, upload

components/         # customer/, admin/, ui/ — shared UI pieces
models/             # Mongoose schemas: User, Product, Category, Order, Cart, Review
lib/                # db.js (connection), validation.js (zod schemas), utils.js, cloudinary.js, auth-helpers.js
store/              # Zustand stores: cartStore, wishlistStore
scripts/            # createAdmin.mjs — administrator account creation
auth.js             # Auth.js v5 config (root-level, per Auth.js convention)
proxy.js            # Route protection for /admin, /checkout, /orders (Next.js 16's replacement for middleware.js)
```

## Notes on scope

- **Payment**: Cash on Delivery only for now. Stripe was left out of this pass
  to prioritize the core flow — the brief marks it optional.
- **Reviews & Ratings** (brief §3.7) is implemented — customers can leave a
  star rating + comment on a product's detail page, one review per user per
  product (resubmitting edits it), and `Product.ratingAvg`/`ratingCount` is
  recomputed on every submit and shown on both the product card and detail
  page.
- **Coupons/Discounts, Notifications**: still marked optional/extra in the
  project brief and not implemented.
- **Wishlist** is client-side only (Zustand + localStorage) — the brief does
  not define a Wishlist database model, so it does not sync across devices or
  survive a cleared browser.
- **Cart** persists to MongoDB for logged-in users (synced on login and on
  every change) and to `localStorage` for guests; a guest cart merges into the
  account cart on login.
