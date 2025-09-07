procedure spalcoca
*Genera archivo concaj tomando spprof, spmatri y prfcaja1 para unir archivos con la caja previsional
set talk off
@04,01 clear to 23,78
@04,28 say 'genera archivo profes del consejo y caja previsionalLISTADO DE PROFESIONALES'
select 2
use spprof index spprof.idx
select 3
set exclusive on
set safety off
use concaj
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
      use spmatri index spmatri.idx
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
     		 @17,02 say catego
		      @17,06 say numero pict '99999'
		      if catego='A '
                 if wcatego='  ' or catego=wcatego
                    if wtitulo='   ' or titulo=wtitulo
                       if whabi=' '
*                          if condic = '3' or condic = '4' or condic = '5'
*	                      else 
                           do arma
*                          endif  
                       endif          
                    endif
                 endif   
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
wcateg=catego
wtitu=SPACE(3)
wtitux=space(3)
wop=1
wtitu=titulo
wop=0
wccurso=0
select 1
if wop=0		
  wcopost=space(4)
  select 5
  use sptitu order titulo
  seek(wtitu)
  if found()
    wnomtit=titdesc
    if tipadron<'7'
    	wpadron=val(tipadron)
    else
    	wpadron = 0
    endif		
  else
    wnomtit=space(30)
    wpadron=0
  endif
endif   
if wop=0
   wimpor=0
   wcpto=' '
   if wop=0
      wfcert={  /  /    }			 
      select 6
      use spente order codigo
      seek(a.otorga)
      if found()
    	wnoment=nombre
      else
    	wnoment=space(30)
      endif
      if a.fechab<>{  /  /    }
    	wfectit=a.fechab
      else
        if a.inscr<>{  /  /    }
   	   	  wfectit=a.inscr
        else
   	   	  wfectit={  /  /    }
      endif
   endif
******************** toma los que no tienen fecha titulo
   if a.fectit={  /  /    }
	 wfcert=a.feccert
   else
	 wfcert=a.fectit
   endif		
   if wop=0
     select 2
     use spprof index spprof.idx
     seek(str(a.dctipo,1)+str(a.dcnro,8))
     if found()
	    @18,30 say nombre
        if wop=0
	 	wnomesta=space(10)
	 	if a.condic=' ' or a.condic='0' or a.condic='1'
	  	   wnomesta='        '
	 	else
	  	   if a.condic='2'
	  		  wnomesta='Carn.Dep. '
	  	   else
	  		  if a.condic='3'
	  			 wnomesta='Fallecido'
	  		  else
	  			 if a.condic='4'
	  			   	wnomesta='Suspendido'
	  			 else
	  			    if a.condic='5' or a.condic='6'
	  				   wnomesta='Com.Inact.'
	  				else
	  				   wnomesta='Otros '
	  				endif
	  			 endif
	  		  endif
	  	   endif
	 	endif
	 	wapycaj=space(50)
	 	wdocaj =0
	 	wafcaj =0
	 	wndoc=0
*	 	if a.dcnro<10000000
*	 		wndoc='0'+str(a.dcnro,7)
*	 	else
	 		wndoc=a.dcnro	
*	 	endif	
	 	select 4
	 	use prfca21 order nrodoc
	 	seek(wndoc)
	 	if found()
	 		wapycaj = d.cayn
	 		wdocaj  = d.nrodoc
	 		wafcaj  = d.matr
	 	else
	 	endif
	 	@20,3 say 'prof'
	 	@20,8 say b.nombre
	 	@20,40 say b.dcnro
	 	@20,50 say a.numero
	 	@22,3 say 'prfcaja:'
	 	@22,12 say d.cayn
	 	@22,40 say d.nrodoc
*	 	@22,40 get wop pict '9'
*	 	read 
        if wdpto=0 or b.dpto=wdpto
*      	   @19,10 say a.numero
*      	   @19,20 say a.catego
      	   wedad=0
      	   if b.nacio<>{  /  /    }
      		  wedad=year(date())-year(b.nacio)
      		  if month(b.nacio)>month(date())
      			 wedad=wedad-1
      		  endif
      	   endif
              select 3
	          append blank
	          replace numero with a.numero
	          replace catego with a.catego
     	      replace titulo with a.titulo
	          replace titotorga with wnomtit
	          replace habili with a.habili
     	      replace condic with a.condic
	          replace dctipo with b.dctipo
     	      if b.dctipo=1
         		replace tipod with "DNI"
	          else
	         	if b.dctipo=2
					replace tipod with "LE"
				else
					if b.dctipo=3
						replace tipod with "LC"
					endif		         
	         	endif
    	      endif
	          replace dcnro  with b.dcnro
      	      replace nombre with b.nombre
	          replace testado with wnomesta
	          REPLACE tpadron with wpadron
	          REPLACE tcuil  with b.cuit
	          replace nombcaja with wapycaj
	          replace doccaja  with wdocaj
	          replace afcaja   with wafcaj
	       endif
 	    endif  
 	  endif
endif 
endif
endif
wop=1
select 1
return




