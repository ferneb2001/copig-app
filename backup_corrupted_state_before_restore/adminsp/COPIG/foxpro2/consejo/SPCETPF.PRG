procedure spcetpf
*Genera archivo spcetpf para acumulacion de certificados por profesional
* 27/10/2015.
set talk off
@04,01 clear to 23,78
@04,28 say 'ARMA ARCHIVO TOTALES CERTIFICADOS'
select 2
use spprof index spprof.idx
select 3
set exclusive on
set safety off
use spcetpf index spcetpf.idx
zap
set exclusive off
wfecha=date()
set date dmy
@04,60 say wfecha
whabi=' '
waux1=0
waux2=0
waux3=0
wop=1
wcpto=' '
wnomtit=space(60)
wnoment=space(30)
wop=1
@23,01 clear to 23,78
@23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   wclave=space(7)
   if wop=2                   
      select 1
      use spmatri index spmatri.idx
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
  		 @17,02 say catego
         @17,06 say numero pict '99999'
	     if catego='A '
            if condic = '3' or condic = '5'
            else
              	wkey=str(numero,5)+catego
              	select 3
              	seek(wkey)
              	if found()
              		replace certif with 0
              	else	 
                   do arma
                endif
            endif
         endif  
         select 1
         skip
      enddo
  endif   
@20,1 get wop
read
@04,01 clear to 23,78
close all
return

procedure arma
select 1
@18,03 say catego
@18,06 say numero pict '99999' 
wcateg=catego
wtitu=a.titulo
wtitux=space(3)
wtitu=titulo
wop=0
   select 5
   use sptitu order titulo
   seek(wtitu)
   if found()
      	wnomtit=titdesc
      	if tipadron<'7'
      		wpadron=tipadron
      	else
      		wpadron = ' '
      	endif		
   else
      wnomtit=space(60)
      wpadron=' '
   endif
if wop=0
   select 2
   use spprof index spprof.idx
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
      @18,30 say nombre
       select 3
       append blank
       replace numero with a.numero
       replace catego with a.catego
       replace titulo with a.titulo
       replace titdesc with wnomtit
       replace dctipo with b.dctipo
       if b.dctipo=1
         replace tipod with "DNI"
	   else
	   	if b.dctipo=2
		   replace tipod with "LE"
		else
		   if b.dctipo=3
			  replace tipod with "LC"
		   endif		         
	    endif
       endif
	   replace dcnro  with b.dcnro
       replace nombre with b.nombre
       REPLACE padron with wpadron
    endif
endif
wop=1
select 1
return

