/** Fetch the original CC0 furnished bed asset for the ECOM prototype.
 * Usage: npm run assets:fetch
 * This script is opt-in so npm install/build works without network access.
 */
import {mkdir,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('public/models/low-platform-bed.glb');
const source='https://www.innerscene.com/api/library/low-platform-bed-160-x-200-oak-20c5fc2e/download';
const cdn='https://files.innerscene.com/library/low-platform-bed-160-x-200-oak-20c5fc2e/3096ee8bd196d8b9ddb2/low-platform-bed-160-x-200-oak.glb';
try {
  if ((await stat(out).catch(()=>null))?.size > 100000) {
    console.log(`Model already present: ${out}`); process.exit(0);
  }
  let success=false;
  for (const url of [source,cdn]) {
    try {
      const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000)});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const bytes=Buffer.from(await r.arrayBuffer());
      if (bytes.subarray(0,4).toString('ascii')!=='glTF' || bytes.length<100000)throw new Error('Download is not a valid GLB file');
      await mkdir(path.dirname(out),{recursive:true});
      await writeFile(out,bytes);
      console.log(`Downloaded ${bytes.length} bytes to ${out}`);success=true;break;
    } catch(e){console.warn(`Download attempt failed: ${e.message}`)}
  }
  if(!success){console.error('Download manually from: https://www.innerscene.com/tools/library/3d-parts/low-platform-bed-160-x-200-oak-20c5fc2e');process.exitCode=1}
}catch(e){console.error(e);process.exitCode=1}
