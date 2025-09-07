* APPSHELL is part of the FoxApp system.
* This is a routine to display a list of APP files and prompt
* the user for the one to run.  It does not display the list of 
* files if a file name is passed as a parameter.

PARAMETERS fname
SET TALK OFF
IF PARAMETERS() = 1
   DO (fname)
ENDIF

more = .T.
DO WHILE more   
   fname = GETFILE('APP','Application to run')
   IF !EMPTY(fname) and !('FOXAPP.APP' $ UPPER(fname))
      DO (fname)
      CLEAR PROGRAM
      more = .T.
   ELSE
      more = .F.   
   ENDIF
ENDDO      
