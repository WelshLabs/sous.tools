const fs = require('fs');
const path = require('path');

const domains = [
  'domain-inventory',
  'domain-pos',
  'domain-recipes',
  'domain-settings',
  'domain-signage'
];

const designPackageJsonPath = path.join(__dirname, 'packages/design-system/package.json');
const designPkg = JSON.parse(fs.readFileSync(designPackageJsonPath, 'utf8'));
const vitestVersion = designPkg.devDependencies['vitest'];
const reactTestingLib = designPkg.devDependencies['@testing-library/react'];
const jestDom = designPkg.devDependencies['@testing-library/jest-dom'];
const vitePluginReact = designPkg.devDependencies['@vitejs/plugin-react'];
const jsdom = designPkg.devDependencies['jsdom'];
const typesReact = designPkg.devDependencies['@types/react'];
const typesReactDom = designPkg.devDependencies['@types/react-dom'];

domains.forEach(domain => {
  const pkgPath = path.join(__dirname, 'packages', domain, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  // Add test script
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.test = "vitest run";

  // Add devDependencies
  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies['vitest'] = vitestVersion;
  pkg.devDependencies['@testing-library/react'] = reactTestingLib;
  pkg.devDependencies['@testing-library/jest-dom'] = jestDom;
  pkg.devDependencies['@vitejs/plugin-react'] = vitePluginReact;
  pkg.devDependencies['jsdom'] = jsdom;
  pkg.devDependencies['@types/react'] = typesReact;
  pkg.devDependencies['@types/react-dom'] = typesReactDom;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // Copy vitest.config.ts and vitest.setup.ts
  const configSource = path.join(__dirname, 'packages/design-system/vitest.config.ts');
  const setupSource = path.join(__dirname, 'packages/design-system/vitest.setup.ts');
  
  const configDest = path.join(__dirname, 'packages', domain, 'vitest.config.ts');
  const setupDest = path.join(__dirname, 'packages', domain, 'vitest.setup.ts');

  fs.copyFileSync(configSource, configDest);
  fs.copyFileSync(setupSource, setupDest);
});

console.log('Phase 1 script complete');
