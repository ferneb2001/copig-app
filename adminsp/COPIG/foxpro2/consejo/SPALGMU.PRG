procedure spalgmu
*Genera archivo sptlmu y sptlmus para Municipalidad y otros
* agregado control de pago desde 26/4/2006.
set talk off
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof.idx
*use svprof index svprof.idx
select 3
set exclusive on
set safety off
use sptlmu1
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
   whabili=2016
   @19,01 say 'a¤o habilitacon a listar '
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
   	  select 8
   	  use spcursos index spcursos.idx
      select 1
      use spmatri index spmatri.idx
*      use svmatri index svmatri.idx
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
*                          else 
                             do arma
*                          endif  
                       else
                          if whabi='S' 
                        if habili = whabili and condic <'2'
*			                 if habili >= whabili  and condic < '2'
	    	                    do arma
 	    	                 endif   
                          else
                              if habili < whabili 
                              	 if condic = '3' or condic = '5' or condic = '7'
                              	 else
	                                 do arma
	                             endif    
                              endif   
                          endif
                       endif          
                    endif
                 endif   
               endif
*            endif         
         select 1
*         @05,05 get wopp
*         read
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0 .and. wtitulo='   ' 
         sort to sptlmus  on titulo, nombre 
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to sptlmus  on titulo, nombre
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to sptlmus  on titulo, nombre
            else
               sort to sptlmus  on titulo, nombre
            endif      
         endif   
     endif
  endif   
*endif
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
wr92=0
wr92h=0
winach=0
if a.r92aut<>0
	wr92=1
	wr92h=a.r92aut
endif
if a.inacano<>0
	winach=a.inacano
endif		
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
   select 9
   use caja2309 order matric
   go top
   locate for matric=a.numero 
   do while found()
   	 if  anhabil=2025
   	   		if cpto='2' or cpto>'6'
   		    else
   			  wcpto=cpto
   			  wimpor=wimpor+importe
   		endif
   	 endif
   	 continue
   enddo
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
*    use svprof index svprof.idx
     seek(str(a.dctipo,1)+str(a.dcnro,8))
     if found()
	    @18,30 say nombre
    	select 6
	    use splocal order cod
    	seek(b.locali)
	    if found()
    	   wnomlocali=nombre
	         if cpost<>'    '
    	     	wcopost=cpost
	         endif
    	else
	      wnomlocali=space(14)
    	endif
	    select 4
    	use spdpto order dpto
	    seek(b.dpto)
    	if found()
	       wnomdpto=nombre
    	   if wcopost='    '
	         if cpost<>'    '
    	     	wcopost=cpost
	         endif
    	   endif	
	    else   
    	   wnomdpto=space(14)
	    endif
	    wprovc=space(10)
    	  if str(b.provin,3)<>'  1'
	         select 7
    	     use spprov order prov
        	 seek(b.provin)
	         if found()
    	        wprovc=nombre
        	    if wcopost='    '
	            	if cpost<>'    '
    	        		wcopost=cpost
        	    	endif
	            endif		
    	     else
        	    wprovc=space(10)
	         endif
    	  else
        	 wprovc='Mendoza   '   
	      endif         
     if wop=0
		if wcopost='    '
	  	   if b.spcpos<>0
	  		  wcopost=str(b.spcpos,4)
	  	   endif
	 	endif
		wtipodom=b.tipo
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
	  			   	wnomesta='Baja-Reinscr'
	  			 else
	  			    if a.condic='5'
	  			       wnomesta='Baja Matric.'
	  			    else   
	  			       if a.condic='6'
	  				      wnomesta='Com.Inact.'
	  				   else
	  				      wnomesta='Otros '
	  				   endif
	  				endif
	  			 endif
	  		  endif
	  	   endif
	 	endif
        if wdpto=0 or b.dpto=wdpto
      	   @19,10 say a.numero
      	   @19,20 say a.catego
      	   wedad=0
      	   if b.nacio<>{  /  /    }
      		  wedad=year(date())-year(b.nacio)
      		  if month(b.nacio)>month(date())
      			 wedad=wedad-1
      		  endif
      	   endif
      	   wcumple=space(5)
      	   wcumpd=space(2)
      	   wcumpm=space(2)
      	   if day(b.nacio)<10
      	   		wcumpd='0'+str(day(b.nacio),1)
      	   else
      	   		wcumpd=str(day(b.nacio),2)
      	   endif
      	   if month(b.nacio)<10
      	   		wcumpm='0'+str(month(b.nacio),1)
      	   else
      	   		wcumpm=str(month(b.nacio),2)
      	   endif
      	   wcumple=wcumpm+' '+wcumpd
      	   if b.nacio<>{  /  /    }
                    	      if month(b.nacio)<1 or month(b.nacio)>12
     	                      else
     		                     if day(b.nacio)<1 
      		                     else
      		    	wcumple=str(month(b.nacio))+' '+str(day(b.nacio))
      		                     endif
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
	          replace domici with b.domici
     	      replace provin with wprovc
	          replace dpto   with wnomdpto
     	      replace locali with wnomlocali
	          replace telef  with ltrim(b.telef)
              replace cpost  with wcopost
	          replace titotent with wnoment
	          replace tfenac  with b.nacio
	          replace fecha  with wfectit
	          replace testado with wnomesta
     	      replace tjucirc with b.sexo
	          replace tipodom with wtipodom
     	      replace temail with b.spemail
	          replace tasocia with b.numasoc
	          REPLACE tpadron with wpadron
     	      replace sptmatr with wimpor
     	      replace tju5    with b.nacion
*	          replace curso   with b.nacion
	          replace tcelular with b.celular
	          REPLACE tcuil  with b.cuit
     	      replace totrot  with wtitux
     	      replace tjuesta with wcpto
     	      replace r92     with wr92
     	      replace r92hab  with wr92h
     	      replace inahab  with winach
**     	      replace vdom    with b.vdom
**     	      replace vprov   with b.vprov
**     	      replace vdpto	  with b.vdpto
**     	      replace vlocal  with b.vlocal
**     	      replace vcpos   with b.vcpos
**     	      replace vtelef  with b.vtelef
**     	      replace vcelu   with b.vcelu
**     	      replace vmail   with b.vmail
**     	      replace vfecha  with b.vfecha
**     	      replace vsubfa  with b.vsubfa
**     	      replace vsubfe  with b.vsubfe
**			  replace cumple  with wcumple
	       endif
 	    endif  
 	  endif
endif 
endif
endif
wop=1
select 1
return




select 9
use sptiaux index sptiaux
go top
locate for axnume=a.numero and axcate=a.catego
do while found()
*	if axtitu='001' or axtitu='002' or axtitu='003' or axtitu='004' or axtitu='005' os axtitu='090' or axtitu='039' or axtitu='042'
*   if axtitu='022' or axtitu='082' or axtitu='083' or axtitu='086' or axtitu='089' or axtitu='212'
		wop=0
*   endif
   if wop=0	
       wtitu=axtitu
       waux1=waux1+1
  	   wcopost=space(4)
  	   select 5
  	   use sptitu order titulo
	   seek(wtitu)
	   if found()
 	      	wnomtit=titdesc
    	  	wop=0
	   else
    	  wnomtit=space(30)
	   endif
	   if wop=0
	   select 2
	   use spprof index spprof
	   seek(str(a.dctipo,1)+str(a.dcnro,8))
	   if found()
	      @18,30 say nombre
	      select 6
	      use splocal order cod
	      seek(b.locali)
	      if found()
	         wnomlocali=nombre
	         if cpost<>'    '
	         	wcopost=cpost
	         endif
	      else
	         wnomlocali=space(14)
	      endif
	      select 4
	      use spdpto order dpto
	      seek(b.dpto)
	      if found()
	         wnomdpto=nombre
	         if wcopost='    '
	         if cpost<>'    '
	         	wcopost=cpost
	         endif
	         endif	
	      else   
	         wnomdpto=space(14)
	      endif
	      wprovc=space(10)
	      if str(b.provin,3)<>'  1'
	         select 7
	         use spprov order prov
	         seek(b.provin)
	         if found()
	            wprovc=nombre
	            if wcopost='    '
	            	if cpost<>'    '
	            		wcopost=cpost
	            	endif
	            endif		
	         else
	            wprovc=space(10)
	         endif
	      else
	         wprovc='Mendoza   '   
	      endif         
	      if wdpto=0 or dpto=wdpto
	      	@19,10 say a.numero
	      	@19,20 say a.catego
	         select 3
	         append blank
	         replace numero with a.numero
	         replace catego with a.catego
	         replace titulo with wtitu
	         replace titotorga with wnomtit
	         replace habili with a.habili
	         replace condic with a.condic
	         replace dctipo with b.dctipo
	         replace dcnro  with b.dcnro
	         replace nombre with b.nombre
	         replace domici with b.domici
	         replace provin with wprovc
	         replace dpto   with wnomdpto
	         replace locali with wnomlocali
	         replace telef  with ltrim(b.telef)
	         replace cpost  with wcopost
	      endif
	    endif  
	   endif
	endif
	wop=1
	select 9
	continue 
enddo
@19,30 say waux2 pict '99999'
@19,36 say waux3 pict '99999'
@19,42 say waux1 pict '99999'
*endif
select 1
*endif	
return