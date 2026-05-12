//node ServerControlModdule.js
const fs = require("fs");
const express = require("express");
const path = require("path");
const app = express();
const port = 6969;
const hostname = '127.0.0.1';

app.use(express.static(path.join(__dirname,'front-end')));

app.get('{/:address}',(req,res)=>{   
    let filePath
    switch (req.params.address) {
        case undefined:
            filePath = 'index.html'
            console.log("The following was requested: *undefined*");
            break;
        default:
            filePath = req.params.address
            console.log("The following was requested: "+req.params.address);
            break;
    }

    if (!fs.existsSync(path.join(__dirname,"front-end",filePath))){
        filePath= filePath+'.html'

        if (!fs.existsSync(path.join(__dirname,"front-end",filePath))){
        filePath= '404.html'
        }
    }

    console.log("returned the following file: "+filePath);


    res.sendFile(path.join(__dirname,'front-end',filePath));
});

app.listen(port,hostname,()=>{
    console.log(`server is running at port: ${port} \n and URL: http://${hostname}:${port}/`);
}) 