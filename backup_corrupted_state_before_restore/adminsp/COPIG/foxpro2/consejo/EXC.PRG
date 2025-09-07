PROCEDURE exc
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   do exce1
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do excr
ENDIF
IF LTRIM(STR(mbar)) = "3"
   do exo 
ENDIF
IF LTRIM(STR(mbar)) = "4"
   do excprf
ENDIF
IF LTRIM(STR(mbar)) = "5"
   do excbrw
ENDIF
IF LTRIM(STR(mbar)) = "6"
   do excnom
ENDIF
IF LTRIM(STR(mbar)) = '7'
	do excct
ENDIF	

@19,02 clear to 19,78
show menu pant01
do pie
close all
RETURN
