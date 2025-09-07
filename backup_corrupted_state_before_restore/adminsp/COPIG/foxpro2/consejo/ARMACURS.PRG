procedure armacurs
set date to ymd
set talk off
select 1
use cpcompl
select 2
use spcursos
select 1
go top
do while not eof()
   if a.postgr = 1
      select 2
      append blank
      @10,10 say a.matricula
      replace numero with val(a.matricula)
      replace catego with a.categoria
      replace titulo with a.codtit
      replace curso  with a.postgr
   endif
   select 1
   skip 
enddo
@23,01 clear to 23,78
close all 
return

    