' Runs a command without a console window: wscript run-hidden.vbs <exe> <args...>
Set shell = CreateObject("WScript.Shell")
cmd = ""
For Each a In WScript.Arguments
  cmd = cmd & """" & a & """ "
Next
shell.Run cmd, 0, False
