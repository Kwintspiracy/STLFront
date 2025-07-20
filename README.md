# STLFront

**STLFront** is a web platform built with [Next.js](https://nextjs.org), designed to explore, search, and purchase 3D printable STL files from independent creators.

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## 🚀 Getting Started

### 1. Install dependencies

Make sure you're using the correct Node and npm versions (see below), then install:

```bash
npm ci
```

> This uses `package-lock.json` to ensure identical installs across machines.

### 2. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Start editing

Modify the content in `app/page.tsx` — the app will hot-reload automatically.

---

## 🧱 Technologies Used

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)

---

## 🛠️ Recommended Development Environment

To ensure all developers use exactly the same setup, this project defines specific versions for Node.js and npm.

- **Node.js**: `v22.17.0`
- **npm**: `v11.4.2`

A `.nvmrc` file is included to help with version control.

### 📦 Set up using `nvm` or `nvm-windows`

Install and use the correct versions:

```bash
nvm install 22.17.0
nvm use 22.17.0
npm install -g npm@11.4.2
```

Or simply:

```bash
nvm install
nvm use
```

> Make sure to run `npm ci` (not `npm install`) to ensure dependency consistency.

---

### 🔎 Check your environment

Run the included PowerShell script to verify your Node/npm versions:

```powershell
.\check-env.ps1
```

---

## 📁 Project Structure

```
.
├── app/                # Next.js app directory
├── components/         # Reusable components
├── public/             # Static assets
├── styles/             # Global styles (Tailwind)
├── .nvmrc              # Node version hint
├── package.json        # Project metadata and scripts
└── check-env.ps1       # Version validation script
```

---

## 🚀 Deploy on Vercel

The easiest way to deploy this app is to use [Vercel](https://vercel.com), the creators of Next.js:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

More details: [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)

---

## 🧪 Useful Commands

| Command          | Description                         |
|------------------|-------------------------------------|
| `npm run dev`    | Start local dev server              |
| `npm run build`  | Build for production                |
| `npm run lint`   | Run ESLint                         |
| `npm ci`         | Clean install from lockfile         |
| `.\check-env.ps1`| Check Node/npm versions match       |

---

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 🤝 Contributions

Contributions are welcome!  
Please fork the repo and open a pull request on a separate branch.

---

## 📄 License

This project is licensed under the MIT License.