import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const build=path.dirname(fileURLToPath(import.meta.url));
const workspace=path.dirname(build);
const deck=path.join(build,'企业知识库与数据看板调研');
const candidate=path.join(deck,'企业知识库与数据看板调研.pptx');
const final=path.join(workspace,'交付','企业知识库与数据看板调研_codex-ppt重制版.pptx');
const skill='/Users/linhe/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const python='/Users/linhe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')));
await fs.mkdir(path.dirname(final),{recursive:true});
const result=await finalizePresentation({workspaceDir:workspace,candidatePath:candidate,finalPath:final,
 pythonExecutable:python,
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','9144000,5143500'],
 explicitTotalSlideCount:12,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
 verifyArtifactToolImport:true,receiptPath:path.join(build,'final.validation.json')});
console.log(JSON.stringify({final,result}));
const presentation=await PresentationFile.importPptx(await FileBlob.load(final));
const render=path.join(build,'final-render');
await fs.mkdir(render,{recursive:true});
for(let i=0;i<presentation.slides.items.length;i++){
 const b=await presentation.export({slide:presentation.slides.items[i],format:'png',scale:1.6});
 await fs.writeFile(path.join(render,`slide_${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await b.arrayBuffer()));
}
console.log(JSON.stringify({render,slides:presentation.slides.items.length}));
