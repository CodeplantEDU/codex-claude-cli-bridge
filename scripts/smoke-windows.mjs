import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const model = process.argv[2];
assert.ok(['claude-opus-5-5', 'claude-fable-5-2'].includes(model));
const thread = crypto.randomUUID();
const input = [
  { type: 'message', role: 'user', content: [{type: 'input_text', text: '<environment_context><cwd>' + process.cwd() + '</cwd></environment_context>'}] },
  { type: 'message', role: 'user', content: [{type: 'input_text', text: 'Call bridge_probe with value "hello" exactly once. Then return the token from its result. Do nothing else.'}] }
];
const tools = [{ type: 'function', name: 'bridge_probe', description: 'A harmless connectivity test that returns a token.', parameters: {type: 'object', properties: {value:{type:'string'}}, required:['value'], additionalProperties:false} }];
async function turn() {
  const response = await fetch('http://127.0.0.1:18787/backend-api/codex/responses', {
    method: 'POST', headers: {'content-type':'application/json','thread-id':thread},
    body: JSON.stringify({model, input, tools, stream:true, reasoning:{effort:'low'}}), signal: AbortSignal.timeout(180000)
  });
  assert.equal(response.status, 200);
  const events = (await response.text()).split('\n').filter(line=>line.startsWith('data: {')).map(line=>JSON.parse(line.slice(6)));
  const completed = events.findLast(event=>event.type==='response.completed');
  assert.ok(completed, 'No completed response');
  return completed.response.output;
}
let output = await turn();
const call = output.find(item=>item.type==='function_call');
if (!call) {
  console.log(JSON.stringify({model,output}));
  throw new Error('Claude did not issue the requested connectivity test');
}
assert.equal(call.name, 'bridge_probe');
assert.equal(JSON.parse(call.arguments).value, 'hello');
input.push(...output,{type:'function_call_output',call_id:call.call_id,output:'{"token":"BRIDGE_PASS_732"}'});
output = await turn();
assert.ok(JSON.stringify(output).includes('BRIDGE_PASS_732'), 'Tool result was not returned');
console.log(JSON.stringify({model,toolLoop:'PASS',continuation:'PASS'}));
