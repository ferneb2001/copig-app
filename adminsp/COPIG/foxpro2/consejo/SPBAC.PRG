PROCEDURE spbac
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do clasi1
ENDIF
show popup actual
show menu pant_01
do pie
close all
RETURN
