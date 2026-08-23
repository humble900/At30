import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building main museum app...');
execSync('npx tsc -b && npx vite build', { stdio: 'inherit' });

console.log('Building admin portal...');
execSync('npm install && npx tsc -b && npx vite build', { cwd: 'admin', stdio: 'inherit' });

console.log('Copying admin build to main dist folder...');
fs.cpSync(
  path.join(process.cwd(), 'admin', 'dist'), 
  path.join(process.cwd(), 'dist', 'admin'), 
  { recursive: true }
);

console.log('Build complete!');
