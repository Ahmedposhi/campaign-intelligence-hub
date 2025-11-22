# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Deployment (GitHub Actions)

- Build: The site is built on GitHub Actions (the runner executes `npm ci` and `npm run build`). The CI creates the `./dist` artifact during the workflow run — do not commit or rely on a checked-in `dist/` directory for deployments.
- Deployment: The workflow uploads the built `./dist` artifact and uses the Pages-native actions (`actions/upload-pages-artifact` + `actions/deploy-pages`) to publish to GitHub Pages.
- Local `dist/`: You can build locally for development preview, but the production deployment is performed by Actions. Keep `dist/` ignored in the repo (it's already listed in `.gitignore`).

## Repository history cleaned (dist/ removed)

I removed build artifacts (`dist/`) from the repository history to reduce repository size. This rewrote the Git history and was force-pushed to `main`.

If you have a local clone, you must update it to match the rewritten history. Recommended options:

- Re-clone (simplest and safest):

```bash
git clone git@github.com:Ahmedposhi/campaign-intelligence-hub.git
```

- Or, reset your existing local clone to the new remote `main` (destructive for local changes):

```bash
git fetch origin
git checkout main
git reset --hard origin/main
git clean -fd
```

Note: any local branches or references to old commit SHAs will no longer match the remote. If you need data from the old history, the backup branch was pushed as `backup/remove-dist-<timestamp>` before the purge; contact the repo owner if you need access.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
