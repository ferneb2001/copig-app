PROCEDURE spta
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do spstcer
ENDIF
if mbar=2
   do sptap
ENDIF
*if mbar=3
*   do spaad
*endif   
*if mbar=4
*   DO spaas
*ENDIF
*if mbar=5
*   do spaac
*endif
*if mbar=6
*   do noimp
*   *do spaar
*endif
*if mbar=7
*   do spaat
*endif
*if mbar=8
*   do spaae
*endif
*if mbar=9
*   do noimp
*endif
*if mbar=10
*   do spaan
*endif
*if mbar=11
**   do noimp
*   do spaam
*endif      
show popup actual
show menu pant_01
do pie
close all
RETURN
