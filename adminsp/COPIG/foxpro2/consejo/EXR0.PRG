PROCEDURE exr0
PARAMETER mbar
hide popup all
hide menu all
IF LTRIM(STR(mbar)) = "1"
* if mbar = "1"
   do exr
 ENDIF
IF LTRIM(STR(mbar)) = "2"
* if mbar = "2"
   do spaasec
ENDIF
IF LTRIM(STR(mbar)) = "3"
* if mbar = "2"
*   do exr1
	do exr2
ENDIF
@19,02 clear to 19,78
show menu pant01
do pie
close all
RETURN
