
PROCEDURE atiaa
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do at000
ENDIF
if mbar=2
*   do at100
ENDIF
if mbar = 3
*   do at000
endif
if mbar = 4
*   do am000
endif
if mbar = 5
*   do aco000
endif         
if mbar = 6
*   do ape000
endif         
show popup sele1
show menu pant_012
do pie2
close all
RETURN
