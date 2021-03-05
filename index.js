const http = require('http');
const fs = require('fs');
const readline = require('readline');
const sourceFolder = 'source';

async function processLineByLine(fileName){
    const fileStream = fs.createReadStream(sourceFolder+"/"+fileName);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let lines = [];
    for await (const line of rl) {
        lines.push(line.split(","));
    }
    return lines;
}

async function getLinks(currentFile){
    let res = "";
    let files = fs.readdirSync(sourceFolder+"/");

    res = files.filter(f=>f.match(/\.csv$/)).map(f=>{
        let active = currentFile===f?" active":"";
        return `<a href="/${f}" class="btn btn-primary${active}" role="button">${f.replace(/\.csv$/,"")}</a>\n`;
    }).join("");
    return res;
}

function render(req, res, fileName){
    fs.readFile('./index.mustache', async function (error, content) {
        if (error) {
            res.writeHead(500);
            res.end('Error\n'+error);
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            const render = (template,data)=>{
                template.match(/\{\{([^\{\}]*)\}\}/g).map(key=>{
                    let key_ = key.replace(/^\{\{([^\{\}]*)\}\}$/,"$1");
                    template = template.replace(key,data[key_]);
                });
                return template;
            }
            let data = fileName? await processLineByLine(fileName):{};
            let links = await getLinks(fileName||"");

            let d = render(content.toString("utf-8"),{links:links,fileName:fileName,data:JSON.stringify(data)});
            res.end(d);
        }
    });
}

const requestListener = function (req, res) {
    try {

        if (fs.existsSync("./"+sourceFolder+req.url)) {
            let currentFile = req.url.split("/")[1];
            //file exists
            render(req, res, currentFile);
        }else if(req.url==="/"||req.url==="index"){
            render(req, res, currentFile);
        }else{
            res.writeHead(404);
            res.end('Not Found');
        }
    } catch(err) {
        console.error(err)
    }

}

const server = http.createServer(requestListener);
const port  = process.env.HTTP_PORT?process.env.HTTP_PORT*1:8082;

server.listen(port);