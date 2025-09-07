PROCEDURE thac
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do thacp
ENDIF
if mbar=2
   do thact
ENDIF
*if mbar=3
*   DO spacs
*ENDIF
*if mbar=4
*   do spacc
*endif
*if mbar=5
*   do spacr
*endif
*if mbar=6
*   do spact
*endif
*if mbar=7
*   do space
*endif
*if mbar=8
*   do spaci
*endif
*if mbar=9
*   do spacm
**   do noimp
*endif   
*if mbar = 10
*   do spacnmp
*endif   
*if mbar = 11
*   do sancon2 
*endif
*if mbar = 12
*   do spacse
*endif      
show popup consul
show menu pant_014
do pie4
close all
RETURN
