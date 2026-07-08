# LegalEye Frontend Folder Structure

```text
src/
├── api/                # Mock API services and Axios instances
├── assets/             # Images, SVGs, and static assets
├── components/         # Shared UI components
│   ├── chat/           # Chat-specific components
│   ├── citations/      # Citation and reference components
│   ├── search/         # Search result components
│   ├── sidebar/        # Navigation sidebar components
│   ├── upload/         # Drag-and-drop upload components
│   └── ui/             # Atomic components (Button, Input, Card, etc.)
├── context/            # Global state (Auth, Theme)
├── hooks/              # Custom React hooks
├── layouts/            # Page shell layouts (DashboardLayout)
├── pages/              # Routed page components
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── ChatPage.jsx
│   ├── UploadPage.jsx
│   ├── LibraryPage.jsx
│   ├── SearchPage.jsx
│   ├── SettingsPage.jsx
│   └── NotFoundPage.jsx
├── routes/             # Route definitions
├── utils/              # Helper functions (cn utility, formatters)
├── App.jsx             # Main application entry and routing
├── index.css           # Global styles and Tailwind v4 config
└── main.jsx            # React root entry point
```
