procedure exln9
*arma archivo con exptes sin archivo
wdesde={  /  /    }
whasta=date()
wcode=space(1)
wcoha=space(1)
wnrode=0
wnroha=0
wanode=0
wanoha=0
wkey=space(10)
wkey1=space(10)
wlin=99
set date to dmy
whoja=0
@03,02,23,78 box repl (chr(176),9)
@04,23 clear to 04,58
@03,22 say 'LISTADO DE EXPEDIENTES  ' color n/w
@06,19 clear to 06,62
@11,21 clear to 11,62
wlei=space(10)
select 1
use exptes
index on str(ano,4)+cod+str(nro,5) to exptesn
select 1
use exptes index exptesn
select 2
use expmov index expmov
select 3
use expmovp
do borramov
select 4
use expmovg
do borrgral
wcuenta=0
select 1
do while not eof()
	wusec=0
	@4,5 say 'exptes'
	@5,1 say a.cod pict 'X'
	@5,5 say a.nro pict '99999'
	@5,12 say a.ano pict '9999'
    select 2
    locate for cod=a.cod and nro=a.nro and ano=a.ano
    if found()
		do while cod=a.cod and nro=a.nro and ano=a.ano
			wusec=secc
			@6,1 say cod pict 'X'
			@6,5 say nro pict '99999'
			@6,12 say ano pict '9999'
			select 3
			append blank
			replace cod  with b.cod
			replace nro  with b.nro
			replace ano  with b.ano
			replace fecha with b.fecha
			replace hora  with b.hora
			replace secc  with b.secc
			replace obs   with b.obs
			replace mclase with b.mclase
			select 2
		    skip
		enddo
	endif
	if wusec<>0 and wusec<>15
		do grabamov
		do grabaexp
		wcuenta=wcuenta+1
		@7,5 say wcuenta pict '999999'
	endif
*	enddo	
    wusec=0
    do borramov
    select 1               
    skip
enddo 
@03,02,23,78 box repl (chr(176),9)
*@03,02 clear to 23,78
close all
RETURN

procedure borramov
select 3
set safety off
set exclusive on
use expmovp
zap
use
set safety on
set exclusive off
select 3
use expmovp
return

procedure borrgral
select 4
set safety off
set exclusive on
use expmovg
zap
use
set safety on
set exclusive off
select 4
use expmovg
return

procedure grabamov
select 4
append from expmovp
return      

procedure grabaexp
select 5
use exptesg
append blank
replace cod   with a.cod
replace nro   with a.nro
replace ano   with a.ano
replace recep with a.recep
replace matri with a.matri
replace cat   with a.cat
replace rtte  with a.rtte
replace rtte2 with a.rtte2
replace dest  with a.dest
replace cpto  with a.cpto
replace cpto2 with a.cpto2
replace cpto3 with a.cpto3
replace cpto4 with a.cpto4
replace clase with a.clase
replace inomb with a.inomb
return