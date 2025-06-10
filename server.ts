import {exec} from "node:child_process";

const build = async ()=>{
    exec('pwd')
}


const startServer = async ()=>{
    exec('pwd', (error, stdout, stderr)=>{
        console.error(error);
        console.log(stdout)
        console.error(stderr)
    })
    try {
        await build()
    } catch (error) {
        
    }
}

startServer()