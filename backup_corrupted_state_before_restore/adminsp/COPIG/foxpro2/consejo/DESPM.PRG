PROCEDURE despm
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   do despmm
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do despma
ENDIF
@19,02 clear to 19,78
show menu pant01d
do pied
close all
RETURN
