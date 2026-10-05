import fs from 'node:fs';
const [version,build]=process.argv.slice(2);
if(!/^\d+\.\d+(?:\.\d+)?$/.test(version)||!/^\d+$/.test(build)||+build<1)throw Error('Expected VERSION BUILD');
fs.writeFileSync('app/release.mjs',`export const RELEASE = Object.freeze({ version: '${version}', build: ${build} });\n`);
const file='ios/App/App.xcodeproj/project.pbxproj';
fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace(/MARKETING_VERSION = [\d.]+;/g,`MARKETING_VERSION = ${version};`).replace(/CURRENT_PROJECT_VERSION = \d+;/g,`CURRENT_PROJECT_VERSION = ${build};`));
console.log(`Configured VORO ${version} (${build})`);
