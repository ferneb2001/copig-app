procedure separa
wsigue='S'
do while wsigue='S'
select 1
use spmatrb index spmatrb.idx
go top
	do while not eof()
		wkey2=str(dctipo,1)+str(dcnro,8)
		select 2
		use spprofv index spprofv.idx
		seek(wkey2)
		if found()
		    @06,31 say b.nombre pict '@!'
			do ingresa
		endif
		select 1
		skip
	enddo 
	wsigue='N'
enddo
close all
@07,01 clear to 23,78
return


procedure ingresa
select 3
use spprob 
append blank
replace dctipo with b.dctipo
replace dcnro  with b.dcnro
replace nombre with b.nombre
replace domici with b.domici
replace provin with b.provin
replace dpto   with b.dpto
replace locali with b.locali
replace nacio  with b.nacio
replace cuit   with b.cuit
replace nacion with b.nacion
replace sexo   with b.sexo
replace estciv with b.estciv
replace telef  with b.telef
replace celular with b.celular
replace spemail with b.spemail
replace spcpos  with b.spcpos
replace spcpos1 with b.spcpos1
replace spcpos2 with b.spcpos2
replace spfax   with b.spfax
replace spdomlg with b.spdomlg
replace spprovlg with b.spprovlg
replace spdptolg with b.spdptolg
replace sploclg  with b.sploclg
replace sptellg  with b.sptellg
replace spcpos1g with b.spcpos1g
replace spcposlg with b.spcposlg
replace spcpos2g with b.spcpos2g
replace spemailg with b.spemailg
replace spfaxlg  with b.spfaxlg
replace spcellg  with b.spcellg
replace sptipolg with b.sptipolg
replace tipo     with b.tipo
replace estado   with b.estado
return
