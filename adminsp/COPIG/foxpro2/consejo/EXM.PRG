PROCEDURE exm
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   do exmm
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do exma
ENDIF
@19,02 clear to 19,78
show menu pant01
do pie
close all
RETURN
