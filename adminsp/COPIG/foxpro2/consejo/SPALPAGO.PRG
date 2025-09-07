procedure spalpago
*listado de profesionales por titulo (cantidades)
@04,01 clear to 23,78
@04,28 say 'CONTEO DE PAGOS POR PADRON'
set talk off
select 1
use sppagos index sppagos.idx 
set exclusive off
wop=1
wnomtit=space(35)
wcatego='  '
wcata=0
wcatb=0
mat1=0
mat2=0
mat3=0
mat5=0
cert1=0
cert2=0
cert3=0
cert5=0
wtitulo=space(3)
wnuind=0
set date to dmy
set century on
wfecha=date()
select 5
use sptitu order titulo
select 2
use spmatri index spmatri.idx
set clock on
@14,21 to 16,57
@15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
select 1
go top
do while .not. eof()
	if fecha>{30/09/2001} and anhabil>2001
		wkey=str(matric,5)+catego
		select 2
		seek(wkey)
		if found()
			select 5
			seek(b.titulo)
			if found()
				if tipadron='1'
					if a.cpto='1'
						mat1=mat1+a.importe
					else
						if a.cpto='5'
							cert1=cert1+a.importe
						endif	
					endif
				else
					if tipadron='2'
						if a.cpto='1'
							mat2=mat2+a.importe
						else
							if a.cpto='5'
								cert2=cert2+a.importe
							endif	
						endif
					else	
						if tipadron='3'
							if a.cpto='1'
								mat3=mat3+a.importe
							else
								if a.cpto='5'
									cert3=cert3+a.importe
								endif	
							endif
						else	
							if tipadron='5'
								if a.cpto='1'
									mat5=mat5+a.importe
								else
									if a.cpto='5'
										cert5=cert5+a.importe
									endif	
								endif
							endif
						endif
					endif			
				endif
			endif
		endif
	endif	
   	select 1
   	skip
enddo
*@12,01 clear to 12,78       
@15,10 say '     Totales acumulados   ' 
@16,05 say 'Tipo    	Ing. Civil  Ing. Espec.   Ing. Agr.   Geologia '
@18,05 say 'Matricula'
@20,05 say 'Certif   '
@18,20 say mat1 pict '999999.99'
@18,32 say mat2 pict '999999.99'
@18,46 say mat3 pict '999999.99'
@18,59 say mat5 pict '999999.99'
@20,20 say cert1 pict '999999.99'
@20,32 say cert2 pict '999999.99'
@20,46 say cert3 pict '999999.99'
@20,59 say cert5 pict '999999.99'
@23,01 get wop
read
@04,01 clear to 23,78
close all
return

procedure arma
do while .not. eof()
   wnuind=recno()
   wnomtit=titplur
   wtitulo=titulo
*   if tipadron <> 'A'
      select 3
      append blank
      replace numind  with wnuind
      replace codtit with wtitulo
      replace nomtit with wnomtit
      replace inscri with 0
      replace habili with 0
      replace carnde  with 0
      replace fallec with 0
*   endif   
   select 5
   skip
enddo
select 3
use spestad
index on codtit to spestai
return

procedure armasu
@10,10 say numero
@10,15 say catego
@10,20 say titulo
wkey2=str(dctipo,1)+str(dcnro,8)
if catego='A '
	select 5
	use spprof index spprof.idx
	seek(wkey2)
	if found()
*		if provin=0 or provin=1
*		   if dpto=0 or dpto=1
		   		select 1
				wtitulo=titulo
				whabili=0
				wcarne=0
				wfallec=0
				winscri=1
					*if habili > 1992
					*   whabili=0
					*else
			   if habili > 1991 .and. condic < '2' 
			      whabili=1
			      if catego='A '
			      	wcata=wcata+1
			      else
			      	if catego='B1'
			      		wcatb=wcatb+1
			      	endif
			      endif
			   endif
			*endif   
			if condic = '2'
			   wcarne=1
			endif
			if condic = '3'
			   wfallec=1
			endif
			select 3
			use spestad index spestai
			seek(wtitulo)
			if found()
			   replace inscri with inscri+winscri
			   replace habili with habili+whabili
			   replace carnde  with carnde+wcarne
			   replace fallec with fallec+wfallec
			endif
		endif	
*	endif		
*endif
endif
select 1
return            