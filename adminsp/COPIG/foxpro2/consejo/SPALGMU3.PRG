procedure spalgmu3
*Genera archivo sptlmu y sptlmus para Municipalidad y otros
* agregado control de pago desde 26/4/2006.
* profesionales digitados.
set talk off
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof.idx
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
wop=3
wnomtit=space(30)
wnoment=space(30)
@08,02 say 'Clases'
@23,01 clear to 23,78
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
   wcatego='  '
   wop=1
   wtitulo=space(3)
   wnomtit=space(30)
   wtitulo='   '
   wop=1
   wdpto=0
   wnomdpto=space(14)
   @23,01 clear to 23,78
   wop=1
   wopp=0
   wmatri=0
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
*   	  select 8
*   	  use spcursos index spcursos.idx
      select 1
      use spmatri index spmatri
      go top
      set clock on
      @14,21 to 16,57
      do while .not. eof()
      	do while wmatri<>99999
      		@17,06 get wmatri pict '99999'
      		read
      		if wmatri<>99999
      		     @17,12 say catego
*     			 @17,06 say numero pict '99999'
			   wkey=str(wmatri,5)+'A '
			   seek(wkey)
               if found()
			   		do arma
			   else	
                   do arma1
               endif
            else
            	go bottom     
            endif   
	     enddo
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
wtitux=space(3)
wop=1
wtitu=titulo
   wccurso=0
   select 1
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
   		wop=0
   else
      wnomtit=space(30)
      wpadron=0
   endif
if wop=0
   wimpor=0
   select 9
   use caja2309 order matric
   go top
   locate for matric=a.numero 
   do while found()
   	 if anhabil=2007
   		if cpto='2' or cpto>'6'
   		else
   			wimpor=wimpor+importe
   		endif
   	 endif
   	 continue
   enddo
			*   if wimpor<120
			*   	wop=0
			*   else
			*   	wop=0
			*   endif
			*   if a.condic='3'
			*   wop=0
			*   else
			*   wop=1
			*   endif
			*wop=0   
if wop=0			 
   select 6
   use spente order codigo
   seek(a.otorga)
   if found()
   	wnoment=nombre
   else
   	wnoment=space(30)
   endif
   if a.inscr<>{  /  /    }
   	wfectit=a.inscr
   else
   	if a.fechab<>{  /  /    }
   		wfectit=a.fechab
   	else
   		wfectit={  /  /    }
   	endif
   endif
   if wop=0
   select 2
   use spprof index spprof.idx
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
*      if b.provin< 2
*   	if b.sexo='F' or b.sexo='f' 
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
         replace fecha  with wfectit
*	     replace fecha  with  b.fallec
         replace testado with wnomesta
         replace tjucirc with b.sexo
         replace tipodom with wtipodom
         replace temail with b.spemail
         replace tasocia with wpadron
         replace sptmatr with wimpor
         replace curso   with wccurso
         replace tcelular with b.celular
         REPLACE tcuil  with b.cuit
         replace totrot  with wtitux
      endif
    endif  
   endif
endif 
endif
endif
wop=1
select 1
return

procedure arma1
wnombre=space(30)
@18,02 say 'Ingrese nombre'
@18,20 get wnombre pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
read
select 3
append blank
replace nombre with wnombre
replace testado with 'No Inscripto'
select 1
return

