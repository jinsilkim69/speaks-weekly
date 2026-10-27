import {spawn,execFile} from 'node:child_process';
// A downloader can spawn FFmpeg. Stop its process tree on timeout, not only the parent.
export function runCommand(command,args,{timeout=180000,maxBuffer=4*1024*1024,...options}={}){
 return new Promise((resolve,reject)=>{
  const child=spawn(command,args,{...options,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='',failure=null,bytes=0,timer;
  const stop=error=>{if(failure)return;failure=error;if(child.pid&&process.platform==='win32')execFile('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true},()=>{});else child.kill('SIGKILL');};
  const append=(chunk,isError)=>{bytes+=chunk.length;if(bytes>maxBuffer){stop(Error(command+' 출력 한도 초과'));return;}if(isError)stderr+=chunk;else stdout+=chunk;};
  child.stdout.on('data',c=>append(c,false));child.stderr.on('data',c=>append(c,true));
  child.on('error',error=>{clearTimeout(timer);reject(error);});
  child.on('close',code=>{clearTimeout(timer);if(failure)reject(failure);else if(code!==0)reject(Error(`${command} 실행 실패 (${code}): ${stderr.slice(-2000)}`));else resolve({stdout,stderr});});
  timer=setTimeout(()=>stop(Error(command+' 실행 시간 초과')),timeout);
 });
}
