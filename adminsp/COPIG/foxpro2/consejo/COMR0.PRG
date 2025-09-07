PROCEDURE comr0
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   do comr
*   do noimp
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do comr2
*   do noimp
ENDIF
IF LTRIM(STR(mbar)) = "3"
  * do comc3
   do noimp
ENDIF

@19,02 clear to 19,78
show menu pant01
do pie
close all
RETURN
