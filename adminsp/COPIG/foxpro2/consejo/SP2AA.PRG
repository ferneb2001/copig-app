PROCEDURE sp2aa
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do spinfrp
ENDIF
if mbar=2
   do spinfem
ENDIF
if mbar=3
   do sprstnop
endif   
if mbar=4
   DO spaap2
ENDIF
if mbar=5
   do spinfce
endif
if mbar=6
   *do noimp
   do spinfcee
endif
*if mbar=7
*   do rtspaat
*endif
*if mbar=8
*   do spaae
*endif
*if mbar=9
*   do spaai
*endif
*if mbar=10
*   do spaan
*endif
*if mbar=11
*   do spaam
*endif
*if mbar=12
*   do spaau
*endif   
*if mbar=13
*   do spaarst
*endif
*if mbar = 14
*   do spemp1
*endif            
*if mbar = 15
*   do sanac 
*endif            
*if mbar = 16
*   do spaase 
*endif            
*if mbar = 17
*   do spdomic
*endif            
show popup actual
show menu pant2_01
do pi2e
close all
RETURN
