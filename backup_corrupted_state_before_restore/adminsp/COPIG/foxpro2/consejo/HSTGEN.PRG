procedure hstgen
*Genera archivo hstbasxx y hstbasxxs para Superintendencia de R.T.
set talk off
@04,01 clear to 23,78
@04,28 say 'GENERA ARCHIVO DE PROFESIONALES Y TCOS EN HIG.'
select 2
use spprof index spprof
select 9
use spente order codigo
wnoment=space(15)
wotorga=0
select 3
set exclusive on
set safety off
use hstbase
zap
set exclusive off
wfecha=date()
set date dmy
@04,60 say wfecha
whabi=' '
wop=1
wnomtit=space(30)
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
   if wop=2                   
      select 1
      use spmatri
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
      @17,02 say catego
      @17,06 say numero pict '99999'
         if wcatego='  ' or catego=wcatego
            if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
                  do arma
               else
                  if whabi='S' 
                     if habili > 1991 and condic < '2'
                        do arma
                     endif   
                  else
                     if habili < 1992 and condic < '2'
                        do arma
                     endif   
                  endif
               endif          
            endif
         endif      
         select 1
*         @05,05 get wopp
*         read
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0 .and. wtitulo='   ' 
         sort to hstbases on hstapell  
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to hstbases  on hstapell
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to hstbases  on hstapell
            else
               sort to hstbases  on hstapell
            endif      
         endif   
     endif
  endif   
*endif
@04,01 clear to 23,78
close all
return

procedure arma
@18,03 say catego
@18,06 say numero pict '99999' 
wcateg=catego
wtitu=SPACE(3)
if catego = 'CA' or catego='CR'
   wop=1
else 
	wop=0
   wtitu=a.titulo
   if a.titulo ='082' or a.titulo='083' or a.titulo='086' or a.titulo='212' or a.titulo = '707' or a.titulo='935';
   	 or a.titulo='022' or a.titulo='089'
	   wcopost=space(4)
	   WOTORGA=a.otorga
	   select 5
	   use sptitu order titulo
	   seek(wtitu)
	   if found()
*	   	  if tipadron ='1' or tipadron = '2'
	      	wnomtit=titdesc
	      	wop=0
	   else
	      wnomtit=space(30)
	      wop=1
	   endif
	   select 9
	   seek(wotorga)
	   if found()
	   		wnoment=nombre
	   else
	   		wnoment=space(15)		
	   endif
	   if wop=0
		   select 2
		   use spprof index spprof
		   seek(str(a.dctipo,1)+str(a.dcnro,8))
		   if found()
		      if wdpto=0 or dpto=wdpto
		         select 3
		         wtidocu='  '
		         if b.dctipo=1
		         	wtidocu='DU'
		         else
		         	if b.dctipo=2
		         		wtidocu='LE'
		         	else
		         		if b.dctipo=3
		         			wtidocu='LC'
		         		else
		         			if b.dctipo=4
		         				wtidocu='CI'
		         			else
		         				wtidocu='  '
		         			endif
		         		endif
		         	endif
		         endif
		         append blank
		         replace hstmatri with a.numero
		         replace hstcateg with a.catego
		         replace hsttitu1 with wnomtit
		         replace hsttitu2 with wnomtit
		         replace hsttdocu with wtidocu
		         replace hstdocum with str(b.dcnro,8)
		         replace hstapell with b.nombre
		         replace hstente  with wnoment
		      endif
		    endif
		endif      
   endif
endif 
wop=1
select 4
use sptiaux inde sptiaux
go top
locate for axnume=a.numero and axcate=a.catego
do while found()  
   wtitu=axtitu
   wtitu1=a.titulo
   if axtitu ='082' or axtitu='083' or axtitu='086' or axtitu='212' or axtitu = '707' or axtitu='935' or a.titulo='089'
	   WOTORGA=axotorg
	   select 5
	   use sptitu order titulo
	   seek(wtitu)
	   if found()
	      	wnomtit1=titdesc
	      	wop=0
	   else
	      wnomtit1=space(30)
	      wop=1
	   endif
	   seek(wtitu1)
	   if found()
	   	wnomtit=titdesc
	   else
	   	wnomtit=space(30)
	   endif
	   select 9
	   seek(wotorga)
	   if found()
	   		wnoment=nombre
	   else
	   		wnoment=space(15)		
	   endif
	   if wop=0
		   select 2
		   use spprof index spprof
		   seek(str(a.dctipo,1)+str(a.dcnro,8))
		   if found()
		      if wdpto=0 or dpto=wdpto
		         select 3
		         wtidocu='  '
		         if b.dctipo=1
		         	wtidocu='DU'
		         else
		         	if b.dctipo=2
		         		wtidocu='LE'
		         	else
		         		if b.dctipo=3
		         			wtidocu='LC'
		         		else
		         			if b.dctipo=4
		         				wtidocu='CI'
		         			else
		         				wtidocu='  '
		         			endif
		         		endif
		         	endif
		         endif
		         append blank
		         replace hstmatri with a.numero
		         replace hstcateg with a.catego
		         replace hsttitu1 with wnomtit
		         replace hsttitu2 with wnomtit1
		         replace hsttdocu with wtidocu
		         replace hstdocum with str(b.dcnro,8)
		         replace hstapell with b.nombre
		         replace hstente  with wnoment
		      endif
		    endif
		endif      
   endif
   select 4
   continue
enddo 
return