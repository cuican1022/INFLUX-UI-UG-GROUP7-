# ATSYS No-code solution for InfluxDB Frontend

To run locally (port 5173):

```bash
cd apps/frontend
npm i
npm run dev
```

Should be running using docker anyway. IMPORTANT: When running using docker, make sure to npm install packages in the docker container (using the terminal provided by docker desktop) otherwise it will just install locally (not to the container itself)

### Implementation style

**Vue 3 composition API [docs](https://vuejs.org/guide/introduction#single-file-components)**
- Regular CSS
- Components implemented in order: `<script>` -> `<template>` -> `<styles>`
- Using `<script setup lang="ts">`

**Typescript**
- Do not use the following types: `any`, `never`, or `// @ts-ignore` when running into type errors

### Documentation

Documentation is found in the ```/docs``` directory.

### Environment Variables

There is a sample .env file named .env.example
The docker compose setup exposes these values