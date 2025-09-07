procedure spalemrt
*listado de empresas con sus representantes t‚cnicos
@04,01 clear to 23,78
@04,28 say 'LISTADO DE EMPRESAS CON REPRES.TCOS. '
select 2
use spprofe index spprofe
select 3
set exclusive on
set safety off
use emprtco1
zap
set exclusive off
whabi=' '
wcont=0
wdpto=0
wnomdpto=space(15)
wanhabi=0
wfecha=date()
@06,10 say 'Fecha del listado: '
@06,40 say wfecha
wop=1
wenro=0
wnomtit=space(30)
if wenro<>99999
   wcatego='EM'
   @08,05 get wenro pict '99999'
   read
   if wenro<>99999
      wkeye=str(wenro,5)+wcatego
      select 1
      use spmatrie index spmatrie
      seek(wkeye)
      if found()
         set clock on
         if whabi=' ' and condic < '3'
            do arma
         else
            if whabi='S' 
               if habili >=  wanhabi .and. condic < '2'
                  do arma
               endif   
            else
               if habili < wanhabi and condic < '2'
                  do arma
               endif   
            endif
         endif
         do imprime          
         select 1
      endif
   endif   
endif   
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
@23,01 clear to 23,78
@21,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 3
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
       set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
   ???chr(15)
   wlin=96
   whoja=0
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=wcatego
   do while .not. eof()
      if catego<>wkey
         if catego<>wcatego
            wcatego=catego
            wcateg=catego
            wlin=96
         endif
         wkey=wcatego      
         if wlin > 85
            do titulos
         endif   
      endif
      WNOMLOCALI=SPACE(15)
      wnomdpto=space(15)
      wprovc=space(15)   
      select 5
      use splocal order cod
      seek(a.llocali)
      if found()
         wnomlocali=nombre
      else
         wnomlocali=space(15)
      endif
      select 4
      use spdpto order dpto
      seek(a.ldpto)
      if found()
         wnomdpto=nombre
      else   
         wnomdpto=space(15)
      endif
      wprovc=space(15)
      if str(a.provin,3)<>'  1'
         select 7
         use spprov order prov
         seek(a.lprovin)
         if found()
            wprovc=nombre
         else
            wprovc=space(15)
         endif
      endif        
      select 3         
      ?numero pict '99999'
      ??catego at 7 
      ??nombre  at 10
      ??domici  at 67
      ? habili at 59
      ??fecha at 65
      ??alltrim(telef) at 77
      ??' '+rtrim(wnomlocali)+' -'+rtrim(wnomdpto)+' '+rtrim(wprovc)
      if condic > '1'
      	?? "INACTIVA" AT 115
      endif	
      wcont=wcont+1
      wlin=wlin+2
      if wlin > 80
         do titulos
      endif
      do buscarep
      select 1
   skip
   enddo
   ?
   ?
   ?
   ? 'Total empresas: ' at 15
   ?? wcont pict '999999'
   ???chr(18)
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if wlin > 80
   if whoja <> 0
      eject
   endif   
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE EMPRESAS  ' AT 20
if whabi='S'
   ??' (habilitadas) ' at 44
   ?? wanhabi pict '9999'
else
   if whabi='N'
      ??' (no habilitadas)' at 44
   endif      
endif
?? 'Fecha: ' at 65
?? wfecha    at 72   
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC.CAT.   NOMBRE'
*?? 'DOCUMENTO' AT 62
?? 'DOMICILIO' AT 72
?" Hab.Emp. Inscrip.   Tel‚fono   " at 59
?'----------------------------------------------------------------------------------------------------------------------------------------'
?'T¡tulo' at 18
??'Apellido y Nombre' at 48
??'Matr.Cat.  Relaci¢n' at 78
??'            Hab.   Inicio   Finaliza'
?'========================================================================================================================================'
wlin = 8
return

procedure arma
select 2
seek(str(a.dctipo,1)+str(a.dcnro,8))
if found()
   if wdpto=0 or dpto=wdpto
      wfora=space(3)
      if local = '1'
      	wfora='for'
      endif
   	  wnomlocali=space(15)
   	  wnomdpto=space(15)
   	  wprovc=space(15)
   	  select 5
   	  use splocal order cod
   	  seek(b.locali)
   	  if found()
   	  	wnomlocali=nombre
   	  else
   	  	wnomlocali=space(15)
   	  endif	
   	  select 4
   	  use spdpto order dpto
   	  seek(b.dpto)
   	  if found()
   	  	wnomdpto=nombre
   	  else
   	  	wnomdpto=space(15)
   	  endif
   	  select 7
   	  use spprov order prov
   	  seek(b.provin)
   	  if found()
   	  	wprovc=nombre
   	  else
   	  	wprovc=space(15)
   	  endif
   	  wcondic=space(15)
   	  if a.condic>'1'
   	  	if a.condic='3'
   	  		wcondic='baja'
   	  	else 
   	    	wcondic='INACTIVA '
   	    endif	
   	  endif
      select 3
      append blank
      replace numero with a.numero
      replace catego with a.catego
      replace regord with 1
      replace habili with a.habili
      replace condic with a.condic
      replace dctipo with b.dctipo
      replace dcnro  with b.dcnro
      replace nombre with b.nombre
      replace domici with b.domici
      replace lprovin with wprovc
      replace ldpto   with wnomdpto
      replace llocali with wnomlocali
      replace telef  with b.telef
      replace fecha  with a.inscr
      replace econdic with wcondic
      replace tforan  with wfora
      replace temail  with b.eemail
      replace tcuit   with b.cuit
      wconta=1
      do buscarep
   endif
*   endif
endif
return

procedure buscarep
wrtsigue='S'
wrtfecha={  /  /  }
wrtfechf={  /  /  }
wrtcpto=space(1)
wrtmat=0
wrtcat=space(2)
wrtnom=space(30)
wrttit=space(30)
wkeyrt=space(7)
wkeyrt1=space(9)
wsetit=0
select 8
use sprtcos order empresa
go top
locate for str(empresa,5)=str(a.numero,5)
do while found()
*	    wlin=wlin+1
   wrthab=0
   wrtnomb=space(30)
   wrttit=space(30)
   wkeyrt=str(matprof,5)+categor
   wrtvinc=rtvinculo
   wrtmat=matprof
   wrtcat=categor
   wrtfecha=rtinicio
   wrtfech=rtfinal
   if wrtcat='A ' or wrtcat='CR'
	   select 9
	   use spmatri index spmatri
	   seek(wkeyrt)
	   wsert=0
	   if found()
	      select 10
		  use sptitu order titulo
		  select 9
		  set relation to titulo into sptitu
		  wrttit=j.titdesc
		  wrthab=habili
		  wkeyrt1=str(dctipo,1)+str(dcnro,8)
		  wrtnomb='               '
		  select 6
		  use spprof index spprof.idx
		  seek(wkeyrt1)
		  if found()
		     wrtnomb=nombre
		     wsert=1
		  endif
*	   else
*	   	  	  
  	   endif
  else	   
	   select 9
	   use somatri index somatri
	   seek(wkeyrt)
	   wsert=0
	   if found()
	      select 10
	      use sptitu order titulo
		  select 9
		  set relation to titulo into sptitu
		  wrttit=j.titdesc
		  wrthab=habili
		  wkeyrt1=str(dctipo,1)+str(dcnro,8)
		  wrtnomb='               '
		  select 6
		  use soprof index soprof.idx
		  seek(wkeyrt1)
		  if found()
		     wrtnomb=nombre
		     wsert=1
		  endif
  	   endif
  endif	   
*	 if wsert=1
	 	wconta=wconta+1
	 	wlvinc=space(15)
	    if wrtvinc = 1
	    	wlvinc='Contrato '
	    else
	    	if wrtvinc=2
	    		wlvinc='Socio  '
	    	else
	    	   if wrtvinc = 3
	    	      wlvinc='Rel. Depend.'
	    	   else
	    	   		if wrtvinc=4
	    	   		   wlvinc='Gerente '
	    	   		else
	    	   		   if wrtvinc = 5
	    	   		      wlvinc='Apoderado '
	    	   		   else
	    	   		      if wrtvinc = 6
	    	   		         wlvinc='Por Obra '
	    	   		      else
	    	   		         if wrtvinc = 7
	    	   		            wlvinc='Contrato Ren.aut.'
	    	   		         else
	    	   		            if wrtvinc = 8
	    	   		               wlvinc='Propietario '
	    	   		            else
	    	   		               if wrtvinc = 9
	    	   		                  wlvinc='Contr.Renov.Aut.'
	    	   		               else
	    	   		               	  if wrtvinc = 10
	    	   		               	     wlvinc='Desconocido '
	    	   		               	  else
	    	   		               	     if wrtvinc = 11
	    	   		               	        wlvinc='Contr.Sin Vto. '
	    	   		               	     endif
	    	   		               	  endif
	    	   		               endif
	    	   		            endif
	    	   		         endif
	    	   		      endif
	    	   		   endif
	    	   		endif
	    	   	endif
	    	 endif
	    endif
   	  wnomlocali=space(15)
   	  wnomdpto=space(15)
   	  wprovc=space(15)
   	  select 5
   	  use splocal order cod
   	  seek(f.locali)
   	  if found()
   	  	wnomlocali=nombre
   	  else
   	  	wnomlocali=space(15)
   	  endif	
   	  select 4
   	  use spdpto order dpto
   	  seek(f.dpto)
   	  if found()
   	  	wnomdpto=nombre
   	  else
   	  	wnomdpto=space(15)
   	  endif
   	  select 7
   	  use spprov order prov
   	  seek(f.provin)
   	  if found()
   	  	wprovc=nombre
   	  else
   	  	wprovc=space(15)
   	  endif
	    select 3
	    append blank
	    replace numero with a.numero
	    replace catego with a.catego
	    replace regord with wconta
	    replace prfnum with wrtmat
	    replace prfcat with wrtcat
	    replace habili with wrthab
	    replace condic with i.condic
	    replace dctipo with f.dctipo
	    replace dcnro  with f.dcnro
	    replace nombre with wrtnomb
	    replace domici with f.domici
	    replace lprovin with wprovc
	    replace ldpto   with wnomdpto
	    replace llocali with wnomlocali
	    replace telef   with f.telef
	    replace fecha   with wrtfecha
	    replace titotorga with wrttit
	    replace fechaf  with wrtfech
	    replace rtvinc  with wlvinc
	    replace rtperi  with h.rtperiod
	    replace tcuit   with f.cuit
	    if a.catego = 'A '
	    replace temail  with f.spemail
	    endif
*     endif
	    select 8
	    continue
   enddo
   return   	   		               	                               		
	      