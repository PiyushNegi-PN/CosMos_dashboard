# CosMos_dashboard (RoShu)

A small web project with a starfield background and a simple Firebase-based authentication (register / login). Intentionally lightweight and front-end only — uses Firebase Authentication and Firestore via CDN modules.

## Project structure

- `index.html` — main entry page containing Sign In / Sign Up forms and includes `script.js`, `star.js`, and `firebaseauth.js`.
- `style.css` — styling for the forms and the page.
- `script.js` — UI toggles (switch between Sign In and Sign Up forms).
- `star.js` — canvas-based animated starfield and meteor effect.
- `firebaseauth.js` — Firebase initialization and authentication logic (email/password sign-up, email verification, sign-in). Contains the Firebase config object.
- `homepage/` — folder with the authenticated user's landing page:
  - `main.html`
  - `main.css`
  - `main.js`

## Features

- Register with email & password and store user profile (first/last name) in Firestore.
- Email verification required before successful sign-in.
- Lightweight animated star/meteor background.

## Quick start (developer)

1. Clone or download the repository and open the project folder in your editor.
2. Because `firebaseauth.js` uses ES modules imported from CDN URLs, serve the folder over HTTP (some browsers restrict module imports from the `file://` scheme). You can use any simple local server. Example using Python (works on Windows if Python is installed):

```powershell
# from the project root (where index.html lives)
# start a simple HTTP server on port 5500
python -m http.server 5500
```

Then open your browser to:

```
http://localhost:5500/index.html
```

Alternatively, you can use the "Live Server" VS Code extension or any static file server.

## Firebase setup notes

- The project already contains a Firebase config in `firebaseauth.js`. If you want to use your own Firebase project, replace the `firebaseConfig` object in `firebaseauth.js` with your project's settings.
- Make sure to enable the following in the Firebase Console for your project:
  - Authentication -> Sign-in method -> Email/Password
  - Firestore Database (in appropriate rules/mode for your testing)

## How authentication works in this project

- Users register via the Sign Up form; after account creation an email verification is sent.
- Sign-in will be blocked until the user verifies their email (the app checks `user.emailVerified`).
- On successful login the user's UID is saved to `localStorage` under `loggedInUserId` and the app redirects to `homepage/main.html`.

## Troubleshooting

- If modules fail to load or you see CORS/module errors, ensure you're serving the files over HTTP (see Quick start).
- If email verification emails are not received, check Firebase project's Email settings and the spam folder. In development, you can also use Firebase Authentication's Email Templates and console to inspect sent emails.
- If Firestore writes fail, examine the browser console for errors and verify Firestore rules and billing plan (if required by your rules).

## Security note

This project includes Firebase client config (required for client SDK). Do not store sensitive server secrets in client code. For production, secure your backend and Firestore rules appropriately.

