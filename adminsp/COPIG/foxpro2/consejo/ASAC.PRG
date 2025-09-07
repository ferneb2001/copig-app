PROCEDURE asac
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do asacp
ENDIF
if mbar=2
   do ascon
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
show menu pant_01
do pie
close all
RETURN
