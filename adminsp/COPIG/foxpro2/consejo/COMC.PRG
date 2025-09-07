PROCEDURE comc
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
  * do comc1
   do noimp
ENDIF
IF LTRIM(STR(mbar)) = "2"
  * do comc2
   do noimp
ENDIF
IF LTRIM(STR(mbar)) = "3"
  * do comc3
   do noimp
ENDIF
IF LTRIM(STR(mbar)) = "4"
  * do comc4
   do noimp
ENDIF

@19,02 clear to 19,78
show menu pant01
do pie
close all
RETURN
