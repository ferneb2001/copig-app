*:*********************************************************************
*:
*:        Program: DBLCLICK.PRG
*:
*:         System: How To Detect Double-Clicks
*:         Author: Fox Software, Inc.
*:      Copyright (c) 1989, Fox Software, Inc.
*:  Last modified: 10/08/89     13:23
*:
*:			Notes:	This routine illustrates the use of the new
*:					options of INKEY and use of the new
*:					_DBLCLICK system variable.  The main points
*:					illustrated are (1) use of SECONDS() and
*:					_DBLCLICK to implement a timed loop, (2) use
*:					of the new MROW and MCOL functions to detect
*:					the current mouse pointer position, and (3)
*:					the necessity of capturing the mouse position
*:					when the first click is detected.
*:
*:      Documented 10/08/89 at 13:28               FoxDoc  version 2.0
*:*********************************************************************
SET TALK OFF
SET ESCAPE ON
CLEAR
X = 0
DO WHILE .T.				&& Exit by pressing Esc
   X = INKEY("MH")			&& INKEY detecting mouse-downs, no cursor
   IF X=0					&& Nothing there,  try again.
      LOOP
   ENDIF
   IF X = 27				&& Exit if it's Esc.
      EXIT
   ENDIF
   IF X = 151				&& It's a mouse-down
      ROW = MROW()			&& Record row/column immediately
      COL = MCOL()
      timelimit = SECONDS()+_DBLCLICK	&& Note: New system variable
      y = 0
      DO WHILE SECONDS() < timelimit
         y = INKEY("MH")
         IF y = 151			&& Another click was just seen.
            @ 10,10 SAY "Double click at"
            EXIT
         ENDIF
      ENDDO
      IF y = 0				&& Here, if no further clicks seen.
         @ 10,10 SAY "Single click at"
      ENDIF
      ?? ROW, COL
   ENDIF
   IF X # 151				&& Here, if it wasn't a mouse-down
      @ 10,10 SAY "Character typed: "
      ?? "'"+CHR(X)+"'", TRANSFORM(X, "(999)"), SPACE(10)
   ENDIF
ENDDO
SET TALK ON
SET ESCAPE ON
*: EOF: DBLCLICK.PRG
