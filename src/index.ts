import * as fs from 'fs-extra';
import * as path from 'path';
import walk from 'walk-sync';
import stripJsonComments from 'strip-json-comments';
const officegen = require('officegen');
const config = JSON.parse(stripJsonComments(fs.readFileSync('src/config.json','utf-8')));


const root = config.project;//提取路径
const globs = config.globs;//提取范围
const temp = 'out/temp.txt';
const excludeFileName:string[] = config.excludeFileName;//排除的文件，文件名
const excludeFilePath:string[] = config.excludeFilePath;//排除的行，字符串包含
const excludeLineText:string[] = config.excludeLineText;//排除的行，字符串包含
const headerText = 'XXXXV1.0  源代码';
const fontFace = config.fontFace;
const fontSize = config.fontSize;
async function run() {
    if(!fs.existsSync(root))return;
    let paths = await getAllFiles(root,globs);
    paths = filterFileName(paths,excludeFileName);
    paths = filterFilePath(paths,excludeFilePath);
    fs.removeSync(temp);
    fs.ensureFileSync(temp);
    let lines:string[] = [];
    for (const e of paths) {
        const ct = formatFile2Content(e);
        lines = lines.concat(filterLines(ct.split('\n'),excludeLineText));
        fs.appendFileSync(temp,ct);

    }
    const r1 = lines.slice(0,3101).join('\n');
    genDoc(r1);
}
///按特征文字过滤行数据
export function filterLines(src:string[],ext:string[]){
    return src.filter((e)=>ext.every((ee)=>!e.includes(ee)));
}
///按文件名排除
export function filterFileName(paths:string[],exc:string[]){
    return paths.filter((e)=>exc.indexOf(path.basename(e))===-1);
}
///按文件路径排除
export function filterFilePath(paths:string[],exc:string[]){
    return paths.filter((e)=>exc.indexOf(e)===-1);
}
///获取文件列表
async function getAllFiles(root:string,globs:string[]){
    const paths = walk(root,{ globs: globs}).map((e)=>path.join(root,e)).map((e)=>e.split(path.sep).join('/')); 
    return paths;
}
///读取文件并返回过滤空行和注释的内容
function formatFile2Content(path:string){
    let content = fs.readFileSync(path,'utf-8');
    content = replaceNote(content);
    content = replaceBlank(content);
    return content;
}
function replaceBlank(src:string){
    const reg = /\n(\n)*( )*(\n)*\n/g;
    return src.replace(/(\n[\s\t]*\r*\n)/g, '\n').replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '');//src.replace(reg,'');
}
function replaceNote(src:string){
    const reg = /(\/\/.*)|(\/\*[\s\S]*?\*\/)/g;
    return src.replace(reg,'');
}
///生成doc
function genDoc(src:string){
    const docx = officegen({
        type:'docx'
    });
    docx.on('finalize', function(written: any) {
        console.log(
          'Finish to create a Microsoft Word document.'
        );
      });
    docx.on('error', function(err:any) {
        console.log(err);
    });
    const pObj = docx.createP();
    pObj.addText(src,{ font_face: fontFace, font_size: fontSize });

    const header = docx.getHeader().createP();
    header.addText ( headerText);
    //TODO:页眉加入页码
    header.options.align = 'left';
    const out = fs.createWriteStream('out/out.docx');
    docx.generate(out);
}
run().catch((e) => {
    console.log(e);
});
