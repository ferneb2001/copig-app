procedure spalpj3
*Genera archivo juprofto  para Informe de Peritos Judiciales
* agregado control de pago desde 26/4/2006.
* desde un archivo juprof
set talk off
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof.idx
select 3
set exclusive on
set safety off
use juprofto
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
wnomtit=space(30)
wnoment=space(30)
   whabi='S'
   wcatego='A '
   wtitulo='   '
   wdpto=0
   wnomdpto=space(14)
   @23,01 clear to 23,78
   wop=1
   wkey=space(7)
   wopp=0
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
   	  select 4
   	  use juprof
   	  go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
		wkey=str(jumatr,5)+jucate
      	select 1
      	use spmatri index spmatri
      	seek(wkey)
      	if found()
		    @17,02 say catego
		    @17,06 say numero pict '99999'
      		do arma
      	 endif	
         select 4
         skip
      enddo
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
wop=1
   waux2=waux2+1
   wtitu=titulo
   wcopost=space(4)
   select 5
   use sptitu order titulo
   seek(wtitu)
   if found()
      	wnomtit=titdesc
   		wop=0
   else
      wnomtit=space(30)
      wpadron=0
   endif
   if wop=0
	wpjti=d.juesp			 
   select 6
   use spjuti order tijunum
   seek(wpjti)
   if found()
   	wnoment=tijunom
   else
   	wnoment=space(30)
   endif
   if wop=0
   select 2
   use spprof index spprof.idx
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
      @18,30 say nombre
      select 7
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
      select 8
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
*         WOP=1
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
	      if b.provin<= 1
			  if wcopost='    '
	  			if b.spcpos<>0
	  				wcopost=str(b.spcpos,4)
	  			endif
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
      if wdpto=0 or dpto=wdpto
      	@19,10 say a.numero
      	@19,20 say a.catego
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
*	     replace tfenac  with a.feccert
         replace fecha  with date()
*	     replace fecha  with  b.fallec
         replace testado with wnomesta
         replace tjucirc with d.jucirc
         replace tjuesta with d.juesta
         replace tju5    with ' '
         replace tipodom with wtipodom
         replace temail with b.spemail
         replace tasocia with wedad
         replace sptmatr with 0
         replace curso   with 0
         replace tcelular with b.celular
         REPLACE tcuil  with b.cuit
      endif
    endif  
   endif
endif 
endif
*endif
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