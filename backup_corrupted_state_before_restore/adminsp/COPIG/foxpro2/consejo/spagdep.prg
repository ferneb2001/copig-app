procedure spagdep
*Graba departamento en padron
set talk off
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof.idx
select 3
*set exclusive on
set safety off
use padron
*zap
set exclusive off
wfecha=date()
set date dmy
@04,60 say wfecha
whabi=' '
waux1=0
waux2=0
waux3=0
wop=1
wkey=space(7)
wkey1=space(9)
wnomtit=space(30)
wnoment=space(30)
   @23,01 clear to 23,78
   wop=1
   wopp=0
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
   	  select 3
   	  use padron
   	  go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
      	if padseti=5
      		wkey=str(padmatri,5)+'A '
      		select 1
      		use spmatri index spmatri.idx
      		seek(wkey)
      		if found()
      			wkey1=str(dctipo,1)+str(dcnro,8)
      			select 2
      			use spprof index spprof.idx
      			seek(wkey1)
      			if found()
      				select 3
      				replace c.pasocia with b.dpto
      			endif
      		endif	
      	endif      
      	select 3
*         @05,05 get wopp
*         read
      	skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     ha terminado   ' color n/w*
  endif   
*endif
@20,1 get wop
read
@04,01 clear to 23,78
close all
return

