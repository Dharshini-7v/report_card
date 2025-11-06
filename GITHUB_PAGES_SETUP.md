# GitHub Pages Setup Instructions

## Quick Setup for GitHub Pages

To host the frontend on GitHub Pages, you need to use the standalone version that works without a backend.

### Step 1: Update HTML files to use standalone script

Replace `script.js` with `script-standalone.js` in all HTML files:

**For each HTML file (index.html, signup.html, dashboard.html, reportEntry.html, profile.html):**

Change:
```html
<script src="assets/script.js"></script>
```

To:
```html
<script src="assets/script-standalone.js"></script>
```

### Step 2: Upload to GitHub

1. Create a new repository on GitHub
2. Upload all files from the `frontend` folder
3. Go to repository Settings → Pages
4. Select branch (usually `main` or `master`)
5. Select folder (usually `/root`)
6. Save

### Step 3: Access your site

Your site will be available at:
`https://yourusername.github.io/repository-name/index.html`

## Features in Standalone Version

- ✅ Works entirely client-side (no backend needed)
- ✅ Uses localStorage for data storage
- ✅ All functionality preserved (login, signup, reports, dashboard)
- ✅ Default admin user: `admin` / `1234`
- ✅ Data persists in browser localStorage

## Note

The standalone version uses localStorage, so data is stored in the user's browser. Each user will have their own separate data storage.


