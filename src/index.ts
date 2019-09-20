import * as fs from 'fs-extra';
import * as path from 'path';
import walk from 'walk-sync';
const officegen = require('officegen');

const root = "C:/Users/pc/Desktop/code";//提取路径
const globs = ['src/**/*.ts','src/**/*.tsx'];//提取范围
const temp = 'out/temp.txt';
const excludeFile:string[] = [];//排除的文件，文件名
const excludeLine:string[] = [];//排除的行，字符串包含
const headerText = 'XXXXV1.0  源代码';
async function run() {
    let paths = await getAllFiles(root,globs);
    paths = excludeFiles(paths,excludeFile);
    fs.removeSync(temp);
    fs.ensureFileSync(temp);
    let lines:string[] = [];
    for (const e of paths) {
        const ct = formatFile2Content(path.join(root,e));
        lines = lines.concat(filterLines(ct.split('\n'),excludeLine));
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
function excludeFiles(paths:string[],exc:string[]){
    return paths.filter((e)=>exc.indexOf(path.basename(e))===-1);
}
///获取文件列表
async function getAllFiles(root:string,globs:string[]){
    const paths = walk(root,{ globs: globs}); 
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
        type:'docx',
        author:'leeyang1990@gmail.com',
        creator:'leeyang1990@gmail.com',
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
    pObj.addText(src,{ font_face: 'Arial', font_size: 10 });

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
