PROCEDURE exl
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   do exln
   *do mnoimp
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do mnoimp
ENDIF
IF LTRIM(STR(mbar)) = "3"
   do exlu
   *do mnoimp
ENDIF
IF LTRIM(STR(mbar)) = "4"
   do exlc
ENDIF

@19,02 clear to 19,78
show menu pant01
do pie
close all
RETURN
