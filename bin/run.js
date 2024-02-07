#!/usr/bin/env node
import path from 'path'

const __dirname = path.resolve();

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  const oclif = await import('@oclif/core')
  await oclif.execute({development: false, dir: __dirname})
})()
