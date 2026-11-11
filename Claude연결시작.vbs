Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
root = files.GetParentFolderName(WScript.ScriptFullName)
Set env = shell.Environment("PROCESS")
env("CODEX_CLAUDE_BRIDGE_HOME") = root & "\.runtime"
shell.Run "node """ & root & "\src\server.js""", 0, False
