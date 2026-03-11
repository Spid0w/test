# unpocoloco - Vercel Deployment Instructions

This project is a Next.js (App Router) application configured out-of-the-box for seamless deployment on Vercel.

## Prerequisites

1.  A [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or [Bitbucket](https://bitbucket.org/) account.
2.  A [Vercel](https://vercel.com/) account (free tier is perfect).
3.  Node.js installed locally (to push to your repository).

## Step 1: Push the Code to a Git Repository

Initialize the git repository and push it to GitHub (or your preferred provider):

```bash
cd unpocoloco
git init
git add .
git commit -m "Initial commit of unpocoloco mystery site"
```

Create a new repository on GitHub, then add the remote and push:

```bash
git branch -M main
git remote add origin https://github.com/your-username/unpocoloco.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1.  Log in to your Vercel Dashboard at [vercel.com](https://vercel.com/dashboard).
2.  Click the **"Add New..."** button and select **"Project"**.
3.  Connect your GitHub/GitLab account if you haven't already.
4.  Find your `unpocoloco` repository in the list and click **"Import"**.

## Step 3: Configure Project Setup

Vercel will automatically detect that this is a Next.js project and pre-fill the build settings:

-   **Framework Preset:** Next.js
-   **Build Command:** `next build`
-   **Output Directory:** `.next`
-   **Install Command:** `npm install` (or `yarn install` / `pnpm install`)

*You do not need to change any of these settings.*

Click the **Deploy** button.

## Step 4: Watch the Build

Vercel will build the project. This usually takes 1-2 minutes. Once finished, you will be redirected to a success screen with preview URLs.

## Step 5: Custom Domain (Optional)

1.  Go to your project's **Settings** on Vercel dashboard.
2.  Navigate to the **Domains** section.
3.  Enter your custom domain (e.g., `are-you-sure-about-this.com`) and follow the DNS verification steps provided by Vercel.

That's it! Your mysterious troll site is now live on the internet. Share the link carefully.
