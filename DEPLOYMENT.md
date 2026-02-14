# SmartWarranty - Production Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites
- [x] GitHub account
- [x] Vercel account (free tier works)
- [x] Supabase project (already set up)
- [x] Gemini API key

---

## Step 1: Prepare Environment Variables

### Required Environment Variables
Create a `.env.production` file (or configure in Vercel):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Get Your Keys:

**Supabase:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Settings → API
4. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

**Gemini API:**
1. Go to [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Create API key
3. Copy to `VITE_GEMINI_API_KEY`

---

## Step 2: Test Production Build Locally

```bash
# Install dependencies (if not already)
npm install

# Create production build
npm run build

# Preview production build locally
npm run preview
```

**Expected Output:**
- ✅ Build completes without errors
- ✅ `dist/` folder created
- ✅ Preview server starts on http://localhost:4173

**Test the preview:**
1. Open http://localhost:4173
2. Add a product
3. Scan with camera/upload image
4. Verify notifications work
5. Test edit/delete/archive
6. Check product detail modal

---

## Step 3: Push Latest Code to GitHub

```bash
# Stage all changes
git add .

# Commit with deployment message
git commit -m "chore: Prepare for production deployment"

# Push to main branch
git push origin main
```

---

## Step 4: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Click "Add New Project"**

3. **Import your GitHub repository:**
   - Select your GitHub account
   - Find "SmartWarranty" repository
   - Click "Import"

4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./SmartWarranty` (if your project is in a subdirectory)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variables:**
   Click "Environment Variables" section and add:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   VITE_GEMINI_API_KEY = your_gemini_api_key
   ```

6. **Click "Deploy"**

7. **Wait 2-3 minutes** for deployment to complete

8. **Access your app** at `https://your-project.vercel.app`

### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? smartwarranty
# - Directory? ./SmartWarranty (or ./)
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## Step 5: Configure Supabase for Production

### 1. Update Supabase Allowed Origins

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to **Site URL**: `https://your-project.vercel.app`
3. Add to **Redirect URLs**:
   - `https://your-project.vercel.app/**`
   - `http://localhost:5173/**` (keep for local dev)

### 2. Configure Storage CORS

1. Go to Storage → Policies
2. Ensure `product-images` bucket exists
3. Verify public access policy is enabled

### 3. Verify RLS Policies

Check that Row Level Security is properly configured:
- Products: Users can CRUD their own products
- Notifications: Users can view their own notifications
- Service Centers: Public read access

---

## Step 6: Post-Deployment Verification

### ✅ Complete Checklist

Visit your deployed app and test:

- [ ] **App loads** without errors
- [ ] **Add Product** → Manual entry works
- [ ] **Camera/Upload** → Image upload works
- [ ] **AI Scanning** → Gemini extracts data from receipts
- [ ] **Product List** → Products display correctly
- [ ] **Product Details** → Modal opens with full info
- [ ] **Edit Product** → Form pre-fills correctly
- [ ] **Delete Product** → Confirmation and deletion works
- [ ] **Archive Product** → Product archived successfully
- [ ] **Notifications** → Panel shows notifications
- [ ] **Price Display** → Shows ₹ (Indian Rupees)
- [ ] **Charts** → Dashboard charts render
- [ ] **Mobile View** → Responsive on mobile devices

---

## 🔧 Troubleshooting

### Issue: "Blank page after deployment"

**Solution:**
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Ensure `vite.config.ts` has correct base path

### Issue: "Cannot connect to Supabase"

**Solution:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Check Supabase project is active
3. Verify RLS policies allow access

### Issue: "Camera not working"

**Solution:**
- HTTPS is required for camera access
- Vercel provides HTTPS by default
- Test on actual deployed URL, not preview

### Issue: "Images not uploading"

**Solution:**
1. Check Supabase Storage bucket exists
2. Verify storage policies allow uploads
3. Check file size limits (5MB default)

### Issue: "Gemini API errors"

**Solution:**
1. Verify `VITE_GEMINI_API_KEY` is correct
2. Check API key has no usage restrictions
3. Ensure billing is enabled in Google Cloud

---

## 🎯 Custom Domain (Optional)

1. In Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase redirect URLs

---

## 📊 Monitoring

### Vercel Analytics
- Go to Project → Analytics
- Track page views, performance, and errors

### Supabase Logs
- Dashboard → Logs
- Monitor API usage and errors

---

## 🔄 Continuous Deployment

**Automatic deployments are now enabled!**

Every time you push to `main` branch:
1. Vercel automatically builds and deploys
2. Takes 2-3 minutes
3. Live at your Vercel URL

To deploy:
```bash
git add .
git commit -m "feat: New feature"
git push origin main
```

---

## 🎉 Your App is Live!

**Production URL:** `https://your-project.vercel.app`

**Share your app:**
- WhatsApp
- Social media
- Demo to potential users

**Next Steps:**
- Add authentication for multi-user support
- Implement email notifications
- Add more AI features
- Collect user feedback

---

## 📝 Environment Variable Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous key | Supabase Dashboard → Settings → API |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Google AI Studio → API Keys |

---

## 🚨 Important Notes

1. **Never commit `.env` files** to Git
2. **API keys are public** in Vite (starts with `VITE_`)
   - Use Supabase RLS for security
   - Restrict Gemini API key by domain if possible
3. **Monitor usage** to avoid unexpected costs
4. **Regular backups** of Supabase database
