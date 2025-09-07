PROCEDURE despc
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   do despce1
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do despcr
ENDIF
IF LTRIM(STR(mbar)) = "3"
   do despo 
ENDIF

@19,02 clear to 19,78
show menu pant01d
do pied
close all
RETURN
