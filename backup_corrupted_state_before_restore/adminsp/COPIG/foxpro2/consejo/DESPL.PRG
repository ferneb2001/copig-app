PROCEDURE despl
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
   do despln
   *do despnoim
ENDIF
IF LTRIM(STR(mbar)) = "2"
   do despnoim
ENDIF
IF LTRIM(STR(mbar)) = "3"
   *do exlu
   do despnoim
ENDIF

@19,02 clear to 19,78
show menu pant01d
do pied
close all
RETURN
