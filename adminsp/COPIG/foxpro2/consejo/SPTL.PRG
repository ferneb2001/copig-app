PROCEDURE sptl
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do sptln
ENDIF
*if mbar=2
*   do noimp
*ENDIF
*if mbar=3
*   DO noimp
*ENDIF
*if mbar=4
*   do spalc
*endif
*if mbar=5
**   do spale
*   do noimp
*endif
*if mbar = 6
*   do spald
*endif
*if mbar = 7
*   do spall
*endif       
show popup lista
show menu pant_01
do pie
close all
RETURN
