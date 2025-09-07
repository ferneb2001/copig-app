*:*********************************************************************
*:
*:        Program: PROCOMP.PRG
*:
*:         Author: Fox Software, Inc.
*:      Copyright (c) 1989, Fox Software, Inc.
*:  Last modified: 11/30/89     12:30
*:
*:			Notes:	This routine illustrates (1) how to use FLS.EXE
*:					to build a list of files, (2) how convenient
*:					the low-level I/O routines can be, (3) how to
*:					provide FoxPro with FoxBASE+ style batch
*:					compiling capabilities.
*:
*:      Documented 11/30/89 at 13:56               FoxDoc  version 2.0
*:*********************************************************************
SET TALK OFF
X = FOPEN("$files.lst")
IF X<0
   ? "Can't open $FILES.LST"
   DO setswx
   RETURN
ENDIF
DO WHILE ! FEOF(X)
   file = FGETS(X)
   compile (file)
ENDDO
X = FCLOSE(X)
CLOSE ALL
QUIT
