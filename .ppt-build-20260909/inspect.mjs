import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';
const ref='/Users/linhe/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-team-alignment/assets/reference.pptx';
const p=await PresentationFile.importPptx(await FileBlob.load(ref));
const snap=await p.inspect({kind:'slide,textbox,shape,image,table,chart,layout',maxChars:200000});
await fs.writeFile(new URL('reference-inspect.ndjson',import.meta.url),snap.ndjson);
for(const i of [0,3,5,8,10,12,13]){
 const s=p.slides.items[i];
 console.log('SLIDE',i+1,s.id,JSON.stringify(s.shapes.items.map(x=>({id:x.id,name:x.name,text:x.text?.toString(),position:x.position,style:x.text?.style}))),JSON.stringify(s.images.items.map(x=>({id:x.id,frame:x.frame,alt:x.alt}))));
}
console.log('METHODS',Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides)),Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides.items[0])),Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides.items[0].shapes.items[0])));
console.log('TABLE-METHODS',Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides.items[8].tables)),Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides.items[8].tables.items[0])));
console.log('REMOVE-SOURCE',String(p.slides.items[8].tables.remove));
