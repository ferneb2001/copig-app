PROCEDURE coml
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   *do comls
    do mnoimp
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do mnoimp
  *do comlr  
ENDIF
IF LTRIM(STR(mbar)) = "3"
   *do comln
   do mnoimp
ENDIF

@19,02 clear to 19,78
show menu pant01
do pie
close all
RETURN
