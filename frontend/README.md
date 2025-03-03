# Mapping For Social Justice Frontend

This directory contains the frontend for the Mapping For Social Justice Archiving Platform, built with [Vite](https://vite.dev/), [React](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/). It is currently hosted at https://mfsj.netlify.app/

## Getting Started with Development

Before you begin, make sure you have [Node.js](https://nodejs.org/en) installed on your system. It is recommended that you use a Node.js version manager such as [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm#installing-and-updating) or [Fast Node Manager (fnm)](https://github.com/Schniz/fnm#installation).
  - Check the [Node.js download instructions](https://nodejs.org/en/download) for additional installation options.

After installing either nvm or fnm, go to the `frontend` directory:
```shell
cd frontend
```

Install the Node.js version specified in the .nvmrc if that version isn't installed on your system:
```shell
# If using nvm
nvm install

# If using fnm
fnm install
```

Once the installation is complete, switch to that version:
```shell
# If using nvm
nvm use

# If using fnm
fnm use
```

Within the `frontend` directory, install the necessary NPM packages:
```shell
npm install
```

When that's done, you need to setup your `.env` file. On the `frontend` directory, you should see a file called `.env.example`. That file already contains a written guide to get the variables you need.

Finally, start the live server:
```shell
npm run dev
```
This will launch the frontend, and you can access it at http://localhost:5173/.