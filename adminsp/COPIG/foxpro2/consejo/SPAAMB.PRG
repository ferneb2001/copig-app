procedure spaamb
* Actualizacion archivo de Empresas
set talk off
wsigue='S'
wnumero=0
set exclusive off
*set multilocks on
wcatego=space(2)
wnom=space(55)
wtit=0
wfincr={  /  /  }
wftit={  /  /  }
wpago={  /  /  }
wfecb=0
wfeccert={  /  /  }
wkey=space(7)
select 1
use spprofe index spprofe, spprofen 
select 2
use spmatrie index spmatrie
select 3
use spprofb index spprofb, spprofeb
select 4 
use spmatrib index spmatrib, spmatdob
select 5
use sprtcob order empresa
@04,01 clear to 23,78
go top
do while not eof()
	wmatri=empresa
	wcateg='EM'
	@06,02 say 'Matricula'
	@06,20 say 'Categ.:'
	@06,12 say wmatri pict '99999'
	@06,28 say wcateg 
	wkey=str(wmatri,5)+wcateg
	select 2
	seek(wkey)
	if found()
		wkey1=str(dctipo,1)+str(dcnro,8)
		select 1
		seek(wkey1)
		if found()
			select 3
			append blank
			replace dctipo  with a.dctipo
			replace dcnro   with a.dcnro
			replace nombre  with a.nombre
			replace domici  with a.domici
			replace provin  with a.provin
			replace dpto    with a.dpto
			replace locali  with a.locali
			replace nacio   with a.nacio
			replace cuit    with a.cuit
			replace sexo    with a.sexo
			replace estciv  with a.estciv
			replace nacion  with a.nacion
			replace telef   with a.telef
			replace tipo    with a.tipo
			replace fallec  with a.fallec
			replace estado  with a.estado
			replace domleg  with a.domleg
			select 4
			append blank
			replace numero  with b.numero
			replace catego  with b.catego
			replace dctipo  with b.dctipo
			replace dcnro   with b.dcnro
			replace titulo  with b.titulo
			replace otorga  with b.otorga
			replace inscr   with b.inscr
			replace fectit  with b.fectit
			replace fechab  with b.fechab
			replace feccert with b.feccert
			replace pago    with b.pago
			replace recibo  with b.recibo
			replace habili  with b.habili
			replace afilia  with b.afilia
			replace condic  with b.condic
		else
			@23,01 say 'No hay datos personales'
		endif
	else
		@23,50 say 'no existe empresa '
	endif
	select 5
	skip
enddo
close all
@04,01 clear to 23,78
return

procedure pant01
@ 08,01 clear to 23,78
@10,02 say 'Fecha Matric:'
@14,02 say 'Fecha Pago  :'
@16,02 say 'Fecha Hab.  :'
@20,02 say 'Cod.Inscrip.:'
@21,02 say 'Estado      :'

return

procedure modifica1
wnom=a.nombre
*wtit=b.titulo
wfincr=b.inscr
*wftit=b.fectit
westcon=b.condic
wpago=b.pago
wfecb=b.habili
@07,20 get wnom
@10,17 get wfincr
*@12,17 get wftit
@14,17 get wpago
@16,17 get wfecb
@21,17 get westcon
read
replace a.nombre  with wnom
*replace b.titulo  with wtit
replace b.inscr   with wfincr
*replace b.fectit  with wftit
replace b.pago    with wpago
replace b.habili  with wfecb
replace b.condic  with westcon
*replace b.feccert with wfeccert
@23,01 clear to 23,78
return

