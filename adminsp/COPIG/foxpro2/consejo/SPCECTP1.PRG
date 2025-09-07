procedure spcectp1 
* Cuenta Certificados por  Profesional
@04,01 clear to 23,78
@04,24 say "CONTEO DE CERTIFICADOS PRO PROFESIONAL"
wsigue='S'
close all
set console on
SET TALK OFF
set exclusive off
set deleted on
close all
FILA=1
contador=0
wnumero=0
set date TO DMY
wcatego=space(2)
wnom=space(30)
wtit=0
woficii=0
woficif=99
wmatri=0
wcateg=space(2)
wfeini={  /  /    }
wfefin={  /  /    }
wfecha={  /  /    }
wkey=space(9)
wkey1=space(7)
SELECT 2
use spcetpf index spcetpf.idx
select 1
use cer1617a order cefecha
@10,15 say "Fecha inicial :"
@12,15 say "Fecha final   :"
@10,31 get wfeini
@12,31 get wfefin
read
wcuenta=0
select 1
use cer1617a order cefecha
do while not eof()
   if wfeini <= cefecha .and. cefecha <= wfefin
      if cecateg<>'EM'
         wkey1=str(cematri,5)+cecateg
         wcuenta=wcuenta+1
         @14,15 say wcuenta pict '999999'
         select 2
         seek(wkey1)
         if found()
         	replace certif with certif+1
         endif
      endif
   endif
   select 1
   skip
enddo
close all
return


