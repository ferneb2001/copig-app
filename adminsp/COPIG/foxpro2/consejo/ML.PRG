PROCEDURE ml
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   do mln
   *do mnoimp
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do mnoimp
ENDIF
IF LTRIM(STR(mbar)) = "3"
   *do mlu
   do mnoimp
ENDIF

@19,02 clear to 19,78
show menu pant01
do pie
close all
RETURN
