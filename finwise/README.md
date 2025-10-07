# FinWise Personal Finance App

A modern, responsive personal finance app built with React, TypeScript, and Tailwind CSS, powered by Supabase for backend services.

## Deploying to Netlify

This project is ready to be deployed on [Netlify](https://www.netlify.com/). Follow these steps to get your own live version of FinWise.

### 1. Connect Your Git Repository

- Push your project code to a GitHub, GitLab, or Bitbucket repository.
- Go to your Netlify dashboard and click "Add new site" -> "Import an existing project".
- Connect Netlify to your Git provider and select the repository for this project.

### 2. Configure Build Settings

Netlify is smart and will likely auto-detect the correct settings. The `netlify.toml` file included in this project tells Netlify:
- The build output directory is `dist`.
- To handle client-side routing correctly for this single-page application (SPA).

You can typically leave the build settings on Netlify's UI as their defaults.

### 3. Add Environment Variables (Crucial!)

Your application needs to connect to your Supabase project. To do this securely, you must add your credentials as environment variables in the Netlify UI.

- In your Netlify site's dashboard, go to **Site configuration** > **Build & deploy** > **Environment**.
- Click **Edit variables** and add the following two variables:

| Key                 | Value                                               |
| ------------------- | --------------------------------------------------- |
| `SUPABASE_URL`      | Your Supabase project URL                           |
| `SUPABASE_ANON_KEY` | Your Supabase project `anon` (public) key           |

You can find your Supabase values in your Supabase project dashboard under **Project Settings** > **API**.

### 4. Deploy

Once the environment variables are set, trigger a deploy from your Netlify dashboard (usually by clicking "Trigger deploy" -> "Deploy site"). Your FinWise app will be built and deployed to a live URL!