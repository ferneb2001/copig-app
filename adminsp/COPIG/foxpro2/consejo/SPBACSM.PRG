PROCEDURE spbacsm
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do clasi1
ENDIF
if mbar=2
	do cpcersm
endif	
if mbar=3
	do imcersm
endif	
show popup actual
show menu pant_01
do pie
close all
RETURN
