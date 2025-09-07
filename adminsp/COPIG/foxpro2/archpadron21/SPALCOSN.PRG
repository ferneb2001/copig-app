procedure spalcosn
*Genera archivo concaj tomando spprof, spmatri y prfcaja1 para unir archivos con la caja previsional
*genera sinprf desde prca21 busca en spmatri y graba los que no encuentra
set talk off
@04,01 clear to 23,78
@04,28 say 'genera archivo profes del consejo y caja previsionalLISTADO DE PROFESIONALES'
select 2
use spprof index spprof.idx
select 3
set exclusive on
set safety off
use sinprf
zap
set exclusive off
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
@23,01 clear to 23,78
whabi=' '
wcatego='A '
wtitulo=space(3)
wtitulo='   '
wdpto=0
wnomdpto=space(14)
whabili=2021
   @19,01 say 'a¤o habilitacon a listar '
   @19,40 get whabili pict '9999'
   read
   @23,01 clear to 23,78
   wop=1
   wopp=0
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   wclave=space(7)
   if wop=2                   
      select 1
*      use spmatri index spmatri.idx
	  use prfca21 order nrodoc
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
	      @17,06 say nrodoc pict '99999999'
          do arma
          select 1
          skip
      enddo
  endif   
@20,1 get wop
read
@04,01 clear to 23,78
close all
return

procedure arma
wtitu=SPACE(3)
wtitux=space(3)
wop=0
wccurso=0
select 1
if wop=0		
  wcopost=space(4)
    wnomtit=space(30)
    wpadron=0
endif   
if wop=0
   wimpor=0
   wcpto=' '
   wdtipo='A'
	select 4
	use spmatri order dcnro
	locate for a.nrodoc = dcnro
*	seek(wdtipo+str(a.nrodoc,8))
	if found()
		@18,20 say dcnro pict '99999999'
	else
		select 3
		append blank
		replace sayn  with a.cayn
		replace stdoc  with a.tdoc
		replace snrodoc with a.nrodoc
		replace smatr   with a.matr   
    endif
endif
wop=1
select 1
return




