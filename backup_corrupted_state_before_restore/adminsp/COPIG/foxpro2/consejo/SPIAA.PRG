PROCEDURE spiaa
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do sp000
ENDIF
if mbar=2
   do sp100
ENDIF
if mbar = 3
   do ex000
endif
if mbar = 4
   do m000
endif
if mbar = 5
   do co000
endif         
if mbar = 6
   do pe000
endif
if mbar = 7
   do sp002
endif         
if mbar = 8
   do desp000
endif         
if mbar = 9
   do as000
endif         
if mbar = 10
   do sp003
endif         
show popup sele1
show menu pant_012
do pie2
close all
RETURN
