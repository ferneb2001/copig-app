procedure spalgley
*Genera archivo nley8171 para subir a web
* agregado control de pago desde 26/4/2006.
set talk off
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof.idx
select 3
set exclusive on
set safety off
use cpig8171.dbf
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
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitados;\<No habilitados;\<Todos';
       color scheme 5
read
@23,01 clear to 23,78
*if wop<>1
if wop=1
   whabi='S'
else
   if wop=2
      whabi='N'
   else
      whabi=' '
   endif      
endif      
   wop=1
   @08,25 say 'Categor¡a'
   @10,25 get wop pict '@*RVT \<Una categoria;\<Todas' color scheme 4
   read
   @23,01 clear to 23,78
   wcatego='  '
   if wop<>2
      @23,01 say 'Indique la categoria a listar'
      @23,31 get wcatego pict '!!'
      read
      @23,01 clear to 23,78
   endif
   @08,45 say 'Titulos'
   wop=1
   wtitulo=space(3)
   wnomtit=space(30)
   @10,45 get wop pict '@*RVT \<Un t¡tulo;\<Todos' color scheme 4
   read
   if wop=2
      wtitulo='   '
   else   
      @23,01 say 'Seleccione titulo a listar y oprima <ESC>'   
      define window ptitu from 06,25 to 22,55
      activate window ptitu
      select 5
      use sptitu order titulo
      brow in window ptitu
      deactivate window ptitu
      wtitulo=titulo
      wnomtit=titplur
      @23,01 clear to 23,78
   endif
   wop=1
   wdpto=0
   wnomdpto=space(14)
   @08,60 say 'Departamentos'
   @10,60 get wop pict '@*RVT \<Un departamento;\<Todos' color scheme 4
   read
   if wop=2
      wdpto=0
   else      
      @23,01 say 'Seleccione departamento a listar y oprima <ESC>'
      define window pdpto from 06,30 to 22,50
      activate window pdpto
      select 4
      use spdpto order dpto
      brow in window pdpto
      deactivate window pdpto
      @23,01 clear to 23,78
      wdpto=dpto
      wnomdpto=nombre
   endif
   whabili=2011
   @19,01 say 'a¤o habilitacion a listar '
   @19,40 get whabili pict '9999'
   read
   @20,01 say 'Se listar n todos los profesionales '
   if wcatego<>'  '
      @20,37 say wcatego
      @20,39 say ', '
   endif   
   if wtitulo<>'   '
      @20,40 say rtrim(wnomtit)
   endif
   if whabi='S'
      @21,01 say '   habilitados'
   else
      if whabi='N'
         @21,01 say 'no habilitados'
      endif
   endif
   if wdpto>0
      @21,16 say 'del departamento '
      @21,33 say wnomdpto
   endif
   @23,01 clear to 23,78
   wop=1
   wopp=0
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   wclave=space(7)
   if wop=2                   
   	  select 1
      use spmatri index spmatri.idx
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
     		 @17,02 say catego
		      @17,06 say numero pict '99999'
              if condic = '3' or condic = '5'
              else 
                   do arma
              endif  
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
@18,03 say catego
@18,06 say numero pict '99999' 
wmatri=0
westado=space(2)
wobserv=space(150)
wcateg=catego
wtitu=SPACE(3)
wtitux=space(3)
wop=0
if condic='3' or condic='4' or condic='5'
else
	if condic>'1'
		wobserv='Segun nuestros registros, Ud. no puede continuar con la tramitacion iniciada. Por favor, dirigirse a las Oficinas del CoPIGMZA.'
		westado='NO'
		wmatri=numero
	else
		if habili>=whabili
			westado='SI'
			wobserv='Habilitado'
			wmatri=a.numero
		else
			westado='NO'
     		wobserv='Segun nuestros registros, Ud. no puede continuar con la tramitacion iniciada. Por favor, dirigirse a las Oficinas del CoPIGMZA.'
			wmatri=numero
		endif
	endif
	do graba
endif	
return



procedure graba
select 3
append blank
replace nmatric with wmatri
replace nestado with westado
replace nobserv with wobserv
wop=1
select 1
return

