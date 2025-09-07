procedure spceti
*Graba titulos en spcerxx a quien se agregaron los campos cetitu, cetinom y cetipa
set talk off
@04,01 clear to 23,78
@04,28 say 'GRABA TITULOS EN SPCERXX'
select 2
use spprof index spprof.idx
select 3
set safety off
use spcerxx
wfecha=date()
set date dmy
@04,60 say wfecha
whabi=' '
waux1=0
waux2=0
waux3=0
wop=1
wcpto=' '
wnomtit=space(30)
wnoment=space(30)
whabi=' '
wcatego='A '
wtitulo='   '
   @23,01 clear to 23,78
   wop=1
   wopp=0
   @23,30 get wop pict '@*H \<Salir;\<Procesar'
   read
   wclave=space(7)
   if wop=2                   
      select 3
      use spcerxx order cefecha
      go top
      do while .not. eof()
           do arma
           select 3
           skip
      enddo
  endif   
@20,1 get wop
read
@04,01 clear to 23,78
close all
return

procedure arma
wkey=(str(c.cematri,5)+c.cecateg)
SELECT 1
USE SPMATRI INDEX SPMATRI.IDX
seek(wkey)
if found()
	replace c.cetitu with a.titulo
    wtitu=SPACE(3)
    wtitu=a.titulo
    select 5
    use sptitu order titulo
    seek(wtitu)
    if found()
      	wnomtit=titdesc
      	if tipadron<'7'
      		wpadron=val(tipadron)
      	else
      		wpadron = 0
      	endif		
    else
      wnomtit=space(30)
      wpadron=0
    endif
    replace c.cetinom with wnomtit
    replace c.cetipad with wpadron
else
endif
return    
    
    



