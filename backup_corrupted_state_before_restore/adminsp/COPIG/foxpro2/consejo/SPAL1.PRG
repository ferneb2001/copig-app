PROCEDURE spal1
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
   @23,01 clear to 23,78
   wop=1
   @23,15 get wop pict '@*H \<Salir; \<Un Profesional; \<Grupo de Profesionales';
          size 1,1 
   read
   if wop=2
      do spalu
   else
      if wop=3
         wop2=1
         @23,10 clear to 23,78
         @23,1 get wop2 pict '@*H \<Salir; \<Com£n; \<Alfab.p/Cat.; A\<lfab.tot; \<Num.p/cat; \<Rotul.; \<TIGRU.';
         size 1,1
         read
         if wop2= 2       
            do spalg6
         else
         	if wop2=3
         	   do spalg3
         	else
         	   if wop2=4
         	   	  do spalg2
         	   else
         	      if wop2 = 5
         	         do spalg4
         	      else
         	         if wop2 = 6
         	            do spalg5
         	         ELSE
         	            IF wop2 = 7
         	               do spalgp
         	            endif      
         	         endif      
         	      endif   	  
         	   endif
         	endif
         endif	      	
      endif
   endif                
ENDIF
if mbar=2
   do spalt
ENDIF
if mbar=3
   DO spalc
ENDIF
if mbar=4
   do spalem
endif
if mbar=5
    do spald
*   do noimp
endif
if mbar = 6
   do spall
endif
if mbar=7
   do spaln
endif
if mbar=8
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H Nota \<1;Nota \<2;\<Salir' size 1,1
   read
   if wop < 3
      if wop=1
         do spaln1
      else
         do spaln2
      endif
   endif      
endif                
show popup lista
show menu pant_01
do pie
close all
RETURN
