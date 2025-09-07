PROCEDURE thal
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
   @23,01 clear to 23,78
         wop2=1
         @10,10 clear to 23,78
         @10,10 get wop2 pict '@* \<Salir;\<Com£n;A\<lfab.total';
                size 1,1
         read
         if wop2= 2       
            do thalg
         else
         	if wop2=3
         	   do thalg2
         	endif
         endif	      	
ENDIF
if mbar=2
   do thalt
ENDIF
show popup lista
show menu pant_014
do pie4
close all
RETURN
