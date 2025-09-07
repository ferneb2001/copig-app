PROCEDURE spal
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
         @10,10 clear to 23,78
         @10,10 get wop2 pict '@* \<Salir;\<Com£n;\<Alfab.por Categ.;A\<lfab.total;\<Numerico p/cat;\<Matric.x mes;\<Dom.no Act.';
                size 1,1
         read
         if wop2= 2       
            do spalg
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
         	         if wop2=6
         	            do spalg9
         	         else
         	            if wop2=7
         	               do spalgmd
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
   @23,01 CLEAR TO 23,78
   wop=1
   @23,20 get wop pict '@*H \<Profes.c/curso;\<C/curso y Domicilio;\<Salir' size 1,1
   read
   @23,01 clear to 23,78
   if wop < 3
      if wop=1
         do spalc
      else
         if wop=2
            do spalc1
         endif
      endif
   endif      
ENDIF
if mbar=4
      wop2=1
      @10,10 clear to 23,78
      @10,10 get wop2 pict '@* \<Salir;\<Com£n;\<Matric.x mes;\<Idem+pagos;Con \<Repr.Tcos';
                size 1,1
         read
         if wop2= 2       
            do spalem
         else
         	if wop2=3
         	   do spalem9
         	else   
         		if wop2=4
         	  	   do spalem9a
         	  	else
         	  	   if wop2=5
         	  	      do spalemr
         	  	   endif    
         		endif
         	endif	
         endif	   
endif
if mbar=5
    do spald
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
   @23,20 get wop pict '@*H Nota \<1;Nota \<2;Nota \<3;Nota \<4;Nota \<5;\<Salir' size 1,1
   read
   @23,01 clear to 23,78
   if wop < 6
      if wop=1
         do spaln1
      else
         if wop=2
            do spaln2
         else
            if wop = 3
               do spaln3a
            else
               if wop = 4
                  do spaln4
               else
                  do spaln5
               endif      
            endif      
         endif      
      endif
   endif                
endif      
if mbar=9
   do spalr
endif
if mbar = 10
   do spalrst1
endif   
if mbar = 11
   do spalsn
endif
if mbar = 12
   do spalnmp
endif      
if mbar = 13
   do sanlis 
endif      
if mbar = 14
   do spalsne
endif
if mbar = 15
   do ntfl02 
endif
show popup lista
show menu pant_01
do pie
close all
RETURN
