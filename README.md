# 🍽️ CQIS - Catering Quotations & Invoicing System

![Vue.js](https://img.shields.io/badge/vue-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

CQIS is a modern, responsive web application built to streamline the process of creating, managing, and sending catering quotations and invoices. It empowers catering businesses to generate professional PDF documents and email them directly to clients with ease.

## ✨ Features

- **📝 Professional Quotations:** Generate beautiful, customizable quotes for catering events.
- **📄 PDF Generation:** Instantly convert web-based quotes into professional PDF documents using `html2pdf.js`.
- **📧 Direct Email Integration:** Send quotes directly to clients' inboxes with personalized subjects and messages.
- **🔐 Secure Authentication:** User authentication and session management powered by Supabase.
- **🎨 Modern UI:** Built with Vue 3, Tailwind CSS, and Radix Vue for a highly interactive and accessible user experience.

## 🛠️ Tech Stack

- **Frontend Framework:** Vue 3 (Composition API, `<script setup>`)
- **State Management:** Pinia
- **Routing:** Vue Router
- **Styling:** Tailwind CSS
- **Icons:** Lucide Icons
- **Backend & Database:** Supabase
- **Email Service:** Resend (via Supabase Edge Functions)
- **PDF Generation:** html2pdf.js
- **Build Tool:** Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm
- A Supabase account and project
- A Resend account and API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kiavin/vue-quotation-app.git
   cd vue-quotation-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Deploying Edge Functions

To enable the email sending functionality, deploy the Supabase Edge Function:

1. **Link your project:**
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

2. **Set the Resend API Key:**
   ```bash
   npx supabase secrets set RESEND_API_KEY=your_resend_api_key
   ```

3. **Deploy the function:**
   ```bash
   npx supabase functions deploy send-quotation
   ```

## 📂 Project Structure

```text
├── src/
│   ├── components/   # Reusable Vue components (e.g., SendEmailModal)
│   ├── router/       # Vue Router configuration
│   ├── services/     # API and backend service interactions
│   ├── stores/       # Pinia state management stores
│   ├── templates/    # Document templates for PDFs
│   ├── App.vue       # Root component
│   └── main.ts       # Application entry point
├── supabase/
│   └── functions/    # Supabase Edge Functions
├── index.html        # Main HTML file
└── package.json      # Dependencies and scripts
```