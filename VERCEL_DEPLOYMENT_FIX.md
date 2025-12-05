# Vercel Deployment Fix Guide

## Problem
Vercel fails with: `sh: line 1: vite: command not found`

## Root Cause
Vercel couldn't find the `vite` command because it was in `devDependencies` instead of `dependencies`.

## ✅ Fixes Applied

### 1. **package.json** - Moved Vite to Dependencies
```json
"dependencies": {
  ...
  "vite": "^7.2.6"  // ← Moved from devDependencies
}
```

### 2. **vercel.json** - Explicit Build Configuration
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Why these settings:**
- `"framework": null` - Prevents auto-detection issues
- `"buildCommand": "npm run build"` - Uses your package.json script
- `"outputDirectory": "dist"` - Where Vite outputs built files
- `"rewrites"` - Enables client-side routing (React Router)

### 3. **index.html** - Updated Favicon & Title
- Changed favicon from Vite logo to NDDV logo
- Updated page title to "National Digital Document Vault - NDDV"

---

## 🚀 Deployment Steps

### Step 1: Verify Local Files
Your local files are already updated with the fixes. Verify:
```bash
# Check package.json has vite in dependencies (line 30)
# Check vercel.json exists with correct config
# Check index.html has /favicon.png
```

### Step 2: Commit & Push Changes
```bash
# Stage the changes
git add package.json vercel.json index.html public/favicon.png

# Commit
git commit -m "fix: configure Vercel deployment for Vite"

# Push to your repository
git push origin main
```

### Step 3: Vercel Auto-Deploy
Vercel will automatically detect the push and redeploy with the new configuration.

---

## 🔧 Alternative: Manual Vercel Configuration

If you can't push via Git, configure directly in Vercel Dashboard:

1. Go to your project on Vercel
2. **Settings** → **General** → **Build & Development Settings**
3. Set:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Save** and trigger a manual redeploy

---

## ✅ Verification Checklist

After deployment succeeds:

- [ ] Site loads correctly
- [ ] NDDV logo appears in browser tab (favicon)
- [ ] Page title shows "National Digital Document Vault - NDDV"
- [ ] All routes work (React Router)
- [ ] No console errors

---

## 🐛 Troubleshooting

### If build still fails:

1. **Check Vercel Logs**
   - Go to Deployments → Click failed deployment → View logs
   - Look for specific error messages

2. **Verify package.json on GitHub**
   - Ensure `vite` is in `dependencies` (not `devDependencies`)
   - Check the file on GitHub matches your local version

3. **Clear Vercel Cache**
   - Deployments → ⋯ (three dots) → Redeploy → Check "Use existing Build Cache" OFF

4. **Check Node Version**
   - Vercel uses Node 18 by default
   - Your project should work with Node 18+

### If favicon doesn't update:
- Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache completely

---

## 📝 Summary

**What was wrong:**
- `vite` was in `devDependencies` (Vercel skips these in production)
- No explicit Vercel configuration file

**What was fixed:**
- Moved `vite` to `dependencies`
- Created `vercel.json` with explicit build settings
- Updated favicon and page title

**Next action:**
Push the changes to trigger a new deployment!
