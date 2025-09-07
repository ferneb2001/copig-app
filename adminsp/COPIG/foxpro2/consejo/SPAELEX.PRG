PROCEDURE spaelex
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
   do spaele3
endif
if mbar=2
   do spaele1
endif
if mbar=3
   do spaele2
endif
if mbar=4
	do spaele4
endif	
if mbar=5
   do spaele
endif
show popup CERTi
show menu pant_01
do pie
close all
RETURN

