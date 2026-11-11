import { spawn } from 'node:child_process';
import readline from 'node:readline';
import assert from 'node:assert/strict';
const exe = process.env.CODEX_EXE || process.env.APPDATA + '\\npm\\node_modules\\@openai\\codex\\node_modules\\@openai\\codex-win32-x64\\vendor\\x86_64-pc-windows-msvc\\bin\\codex.exe';
const child = spawn(exe, ['-c','openai_base_url="http://127.0.0.1:18787/backend-api/codex"','app-server'], {windowsHide:true,stdio:['pipe','pipe','pipe']});
const send = value => child.stdin.write(JSON.stringify(value)+'\n');
const timer = setTimeout(()=>{console.error('Model discovery timed out');child.kill();process.exitCode=1;},45000);
child.stderr.resume();
readline.createInterface({input:child.stdout}).on('line', line=>{
  const message=JSON.parse(line);
  if(message.id===1){
    assert.ok(!message.error,JSON.stringify(message.error));
    send({method:'initialized'});
    send({id:2,method:'model/list',params:{includeHidden:false}});
  }
  if(message.id===2){
    try {
      assert.ok(!message.error,JSON.stringify(message.error));
      const models=message.result.data;
      const names=models.map(x=>x.model||x.id);
      console.log(JSON.stringify({models:names}));
      assert.ok(names.includes('claude-opus-5-5'));
      assert.ok(names.includes('claude-fable-5-2'));
      assert.ok(names.some(x=>x.startsWith('gpt-')));
    } catch(error){console.error(error.message);process.exitCode=1;}
    clearTimeout(timer);child.stdin.end();child.kill();
  }
});
send({id:1,method:'initialize',params:{clientInfo:{name:'codex_cli_rs',version:'0.166.0'},capabilities:{experimentalApi:true}}});
