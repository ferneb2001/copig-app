PROCEDURE spape
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do spjuac1
ENDIF
if mbar=2
   do spjuat
ENDIF
if mbar=3
   do noimp
endif   
show popup actual3
show menu pant_013
do pie3
close all
RETURN
