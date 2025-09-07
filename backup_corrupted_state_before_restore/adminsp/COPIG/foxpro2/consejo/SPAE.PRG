PROCEDURE spae
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
   do spaea
endif
if mbar=2
   do spaelx
endif
if mbar=3
   do spaecx
endif
if mbar=4
   do spscxr
endif
if mbar=5
   do spaelr
endif
if mbar=6
   do spcl01
endif
if mbar=7
   do spaecx4
endif
if mbar=8
   do spcl014
endif
if mbar = 9
   do spaelx4
endif   
if mbar = 10
   do spaelr4
endif   
if mbar=11
   do nspaea1
endif
if mbar=12
*   do spcl016
	do noimp
endif
if mbar = 13
*   do spaelx6
	do noimp
endif   
if mbar = 14
   do spaelea4
   do noimp
endif   
if mbar = 15
   do spaelem
endif   
show popup CERTi
show menu pant_01
do pie
close all
RETURN

