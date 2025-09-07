procedure copiacer
*  Copia parte del archivo certificados para enviar a Mza.
set talk off
@04,01 clear to 23,78
wsigue = 's'
wcontinua = 's'
wcatego=space(2)
wnom=space(30)
set date to dmy
wfecha={  /  /    }
wcomit=space(30)
wcerti=0
wlabor=space(23)
wlabor1=space(69)
wlabor2=space(69)
wlabor3=space(69)
wmatri=0
wkey=space(7)
wkey1=space(9)
wop=0
select 1
use spcerxx index spcerxof, spcerxmc, spcerxcm
set exclusive on
select 2
use spcernue
zap
set exclusive off
wtermina='s'
wfechd={  /  /    }
wfechas=date()
do while wtermina = 's'
   @04,01 clear to 23,78
   @04,24 say 'COPIA CERTIFICADOS EMITIDOS ENTRE FECHAS '
   wofici=0
   @05,15 say 'Fecha inicial ddmmaaaa '
   @06,15 say 'Fecha final   ddmmaaaa '
   @05,35 get wfechd
   @06,35 get wfechas
   read
   @23,01 clear to 23,78
   if lastkey() <> 27
   		select 1
   		do while not eof()
   		@12,10 say cecerti
   			wtoma=1
   			if cefecha<wfechd
   				wtoma=1
   			else
   				if cefecha>wfechas
   					wtoma=1
   				else
   					wtoma=0
   				endif
   			endif
   			if wtoma=0
   				do ingrecer
   			endif
   		select 1
   		skip	
   		enddo
   			wtermina='n'
   	else
   		wtermina='n'
   	endif					
enddo
close all
@04,01 clear to 23,78
return

procedure ingrecer
   select 2
   use spcernue
   append blank
   replace ceofici  with a.ceofici
   replace cematri  with a.cematri
   replace cecateg  with a.cecateg
   replace cenombre with a.cenombre
   replace cefecha  with a.cefecha
   replace cecerti  with a.cecerti
   replace cecomit  with a.cecomit
   replace celabor  with a.celabor
   replace celab1   with a.celab1
   replace celab2   with a.celab2
   replace celab3   with a.celab3
   replace ceobra   with a.ceobra
   replace cedocco  with a.cedocco
   replace cedomob  with a.cedomob
   replace cesupf   with a.cesupf
   replace ceplant  with a.ceplant
   replace cebocas  with a.cebocas
   replace cepotkw  with a.cepotkw
   replace cekmbmt  with a.cekmbmt
   replace cered    with a.cered
   replace ceobdpto with a.ceobdpto
   @23,01 clear to 23,78
return
