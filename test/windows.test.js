import { test } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { once } from 'node:events';
import { CodexToolServer } from '../src/codexTools.js';
import { processTable } from '../src/processControl.js';

test('local MCP transport accepts and returns JSON-RPC on Windows', async () => {
  const server = new CodexToolServer(new Map(), () => {});
  const address = await server.listen();
  const client = net.createConnection(address);
  try {
    await once(client, 'connect');
    const reply = once(client, 'data');
    client.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }) + '\n');
    assert.deepEqual(JSON.parse(String((await reply)[0])), { jsonrpc: '2.0', id: 1, result: {} });
  } finally { client.destroy(); server.close(); }
});

test('process table identifies the current process for owned-tree cancellation', async () => {
  const table = await processTable();
  assert.ok(table?.get(process.pid)?.started);
  assert.equal(table.get(process.pid).ppid, process.ppid);
});
