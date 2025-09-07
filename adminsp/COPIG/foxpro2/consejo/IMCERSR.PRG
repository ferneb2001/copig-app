procedure imcersr
*  Copia archivo certificados de Mendoza en S.Rafael.
set talk off
@04,01 clear to 23,78
wsigue = 's'
wcontinua = 's'
set date to dmy
wfecha={  /  /    }
wcerti=0
wop=0
select 1
use spcerxx index spcerxof, spcerxmc, spcerxcm
*select 2
*use certmza1
set exclusive off
wtermina='s'
wfechd={  /  /    }
wfechas=date()
   @04,01 clear to 23,78
   @04,24 say 'IMPORTA CERTIFICADOS EMITIDOS EN MENDOZA '
   wofici=0
   @06,35 get wop
   read
   @23,01 clear to 23,78
select 1
go bottom
APPEND FROM certmza2
close all
@04,01 clear to 23,78
return

