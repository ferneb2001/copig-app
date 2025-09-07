procedure spaea
*  Ingreso de certificados nuevo dise¤o Oct/94
set talk off
@04,01 clear to 23,78
wsigue = 's'
wcontinua = 's'
wcatego=space(2)
wnom=space(30)
wfecha={  /  /    }
wvtohab={  /  /    }
wcomit=space(30)
wcerti=0
wlabor=space(23)
wlabor1=space(69)
wlabor2=space(69)
wlabor3=space(69)
wmatri=0
wkey=space(7)
wkey1=space(9)
wop=0
wop1=0
select 1
use spprof index spprof.idx
select 2
use spmatri index spmatri.idx
select 3
use spprofe index spprofe.idx
select 4
use spmatrie index spmatrie.idx
select 5
use spcerxx index spcerxof, spcerxmc, spcerxcm
wtermina='s'
do while wtermina = 's'
   @03,01 clear to 23,78
   @03,24 say 'INGRESO DE CERTIFICADOS '
   @03,50 SAY '01'
   wofici=0
   @04,15 say 'Oficina    :'
   @04,60 say '01=Mitre 617  '
   @05,60 say '02=San Rafael '
   @06,60 say '03=Gral.Alvear'
   @07,60 say '04=San Mart¡n'
   @23,01 say 'Ingrese c¢digo de Oficina ¢ <ESC> para terminar'
   @04,28 get wofici pict '99'
   read
   @04,60 clear to 06,78
   @23,01 clear to 23,78
   if lastkey() <> 27
      do case
         case wofici=1
              @04,31 say 'Mitre 617'
         case wofici=2
              @04,31 say 'San Rafael'
         case wofici=3
              @04,31 say 'Gral.Alvear'
         case wofici=4
         	  @04,31 say 'San Martin'     
      endcase                  
      wsigue='s'
      do while wsigue = 's'
         wcatego=space(2)
         wnom=space(30)
         wcomit=space(30)
         wtitdesc=space(60)
         wcerti=0
         wlabor1=space(69)
         wlabor2=space(69)
         wlabor3=space(69)
         wlabor=space(23)
         wobra=space(40)
         wnumdoc=0
         wdcnro=0
         wdomobr=space(40)
         wobdpto=0
         wsupf=space(10)
         wplant=0
         wbocas=0
         wpotkw=space(10)
         wkmbtmt=0.000
         wmatri=0
         wcontinua = 's'
         @05,15 say 'Fecha      :'
         @23,04 say 'Indique la fecha o <esc> para salir'
         @05,28 get wfecha
         read
         @23,01 clear to 23,78
         if lastkey() <> 27
            werror=0
            wano=year(wfecha)
            do while wcontinua = 's'
               wcatego=space(2)
               wnom=space(30)
               wcomit=space(30)
               wcerti=0
               wlabor=space(23)
               wred=space(14)
               wmatri=0
               wtitdesc=space(60)
               wlabor1=space(69)
               wlabor2=space(69)
               wlabor3=space(69)
               wobra=space(40)
               wnumdoc=0
               wdcnro=0
               wdomobr=space(40)
               wobdpto=0
               wsupf=space(10)
               wplant=0
               wbocas=0
               wpotkw=space(10)
               wkmbtmt=0.000
               werror=0
               wvtohab={  /  /    }
               @06,01 clear to 18,78
               @19,01 clear to 23,78
               @06,15 say 'Matricula  :'
               @06,35 say 'Categoria:'
               @09,15 say 'Labor Prof.:'
               @13,15 say 'Obra       :'
               @14,10 say 'Domicilio  :'
               @14,63 say 'Depart.:'
               @15,10 say 'Comitente  :'
               @15,60 say 'Doc.Id.   :'
               @16,15 say 'Sup.Cub.m2 :'
               @16,39 say 'Plantas     :'
               @16,60 say 'Bocas     :'
               @17,15 say 'Potenc.Kw. :'
               @17,39 say 'Km.Lin.MT/BT:'
               @17,62 say 'Red:'
               @18,15 say 'Certificado:'
               @23,04 say 'Indique Matr¡cula o <ESC> para volver'
               @06,28 get wmatri pict '99999'
               read
               @23,01 clear to 23,78
               if lastkey() <> 27
                  do apertura
                  @23,04 say 'Indique Categor¡a'
                  @06,46 get wcatego pict '!!'
                  read
                  @23,01 clear to 23,78
                  wkey=str(wmatri,5)+wcatego
                  if wcatego = 'EM'
                     select 4
                     seek(wkey)
                     if found()
                        wkey1=str(dctipo,1)+str(dcnro,8)
                        select 3
                        seek(wkey1)
                        if found()
                           @07,24 say nombre
                           wnom=substr(nombre,1,30)
                           werror=0
                           if estado = 'C'
                              @19,50 say 'Comunic¢ Inactividad '
                              werror=1
                           else
                              if estado = 'F'
                                 @19,50 say 'Dada de Baja por el Consejo'
                                 werror=1
                              else
                                 if estado = 'S' 
                                    @19,50 say 'Suspendida          '
                                    werror=1
                                 else
                                  if estado = 'B' 
                                     @19,50 say 'Baja solic.por Empresa'
                                     werror=1
                                  endif
                                 endif
                              endif
                           endif               
                           @19,15 say 'Habilitada a¤o '
                           @19,31 say d.habili
                           if d.habili<wano
                             	werror=1
                            	@20,15 say 'NO HABILITADA '
                            	@20,31 GET wop1 
                            	read
                           endif
                           if werror=0	
                             do buscrep
                             do buscsanc
                             @23,01 say 'Ingrese Labor profesional o <ESC> para otro'
                             @09,28 get wlabor pict '@!'
                             read
                             if trim(wlabor)='AAA'
                             	wlabor='EJEC. Y CERTIF.ENSAYOS '
                             	wlabor1='PERIODICOS DE PRUEBA HIDRAULICA,CONTROL ULTRAS.DE ESPESORES,CONTROL Y'
                             	wlabor2='CALIBRAC.DE LOS ELEM.DE SEGURIDAD,CONTROL VISUAL INTERNO-EXTERNO Y   '
                             	wlabor3='VIDA UTIL REMANENTE DE RECIPIENTES A PRESION CON Y SIN FUEGO.-       '
                             	@09,28 say wlabor 
                             	@10,09 say wlabor1
                             	@11,09 say wlabor2
                             	@12,09 say wlabor3 
                             else
                             	@10,09 get wlabor1 pict '@!'
                             	@11,09 get wlabor2 pict '@!'
                             	@12,09 get wlabor3 pict '@!'
                             endif
                             @23,01 clear to 23,78
                             @13,28 get wobra   pict '@!'
                             @14,23 get wdomobr pict '@!'
                             @14,71 get wobdpto pict '99'
                             @15,23 get wcomit  pict '@!'
                             @15,71 get wnumdoc pict '99999999'
                             @16,28 get wsupf 
                             @16,56 get wplant  pict '99'
                             @16,71 get wbocas  pict '99999'
                             @17,28 get wpotkw
                             @17,52 get wkmbtmt pict '999999.999'
                             @17,66 get wred    pict '@!'
                             @18,28 get wcerti
                             read
                             if lastkey() <> 27
                             else
                               werror=1
                             endif
                           endif     
                        else
                           @22,01 say 'No existe Empresa'
                           @22,78 get wop
                           read
                           werror = 1
                           @22,01 clear to 22,78
                        endif   
                     else
                        @22,01 say 'No existe Empresa'
                        @22,78 get wop
                        read
                        werror = 1
                        @22,01 clear to 22,78
                     endif   
                  else
                     select 2
                     seek(wkey)
                     if found()
                        wkey1=str(dctipo,1)+str(dcnro,8)
                        select 1
                        seek(wkey1)
                        if found()
                           @07,24 say nombre
                           wnom=nombre
                           wdcnro=a.dcnro
                           wop99=' '
                           werror=0
                           if b.condic > '1'
                              if b.condic = '2'
                                 @18,50 say 'carnet depositado'
                                 werror=1
                              else
                                 if b.condic = '3'
                                    @18,50 say 'Fallecido '
                                    werror=1
                                 else
                                    if b.condic = '4'
                                       @18,50 say 'Suspendido '
                                       werror = 1
                                    else
                                       if b.condic = '5'
                                          @18,50 say 'Baja matr¡cula '
                                          werror=1
                                       else
                                          @18,50 say 'alguna restriccion '
                                           werror=1
                                       endif
                                    endif
                                 endif   
                              endif   
                           endif
                           if werror = 0
                              @19,15 say 'Habilitado a¤o: '
                              @19,31 say b.habili
                              @19,40 say 'Hasta: '
                              @19,49 say b.vtohab
                              if b.habili>=year(wfecha)
                              	if b.vtohab<wfecha
                              		@20,49 say 'No habilitado a la fecha'
                              		werror=1
                              	endif
                              else
                              	werror=1	
                              endif
                              if werror=0
                             	 wop99=' '
	                              if b.fectit={  /  /    }
    	                          	if b.feccert<>{  /  /    }
        	                      		@20,45 say 'Certif.Provisorio: '
            	                  		@20,66 say b.feccert
                	              		@20,78 get wop99
                    	          		read
                        	      	endif
                            	  endif
					              do buscatit
					              do buscacur
					              do buscadom
					              do buscsanc
                	              @23,01 say 'Ingrese labor profesional o <esc> para otro profesional'
                    	          @09,28 get wlabor pict '@!'
                    	          read
                                  if trim(wlabor)='AAA'
                             		wlabor='EJEC. Y CERTIF.ENSAYOS '
                             		wlabor1='PERIODICOS DE PRUEBA HIDRAULICA,CONTROL ULTRAS.DE ESPESORES,CONTROL Y'
                             		wlabor2='CALIBRAC.DE LOS ELEM.DE SEGURIDAD,CONTROL VISUAL INTERNO-EXTERNO Y   '
                             		wlabor3='VIDA UTIL REMANENTE DE RECIPIENTES A PRESION CON Y SIN FUEGO.-       '
                            	 	@09,28 say wlabor 
                             		@10,09 say wlabor1
                             		@11,09 say wlabor2
                             		@12,09 say wlabor3 
                             	  else
                             		@10,09 get wlabor1 pict '@!'
                             		@11,09 get wlabor2 pict '@!'
                             		@12,09 get wlabor3 pict '@!'
                             	  endif
    	                          @23,01 clear to 23,78
        	                      @13,28 get wobra   pict '@!'
            	                  @14,23 get wdomobr pict '@!'
                	              @14,71 get wobdpto pict '99'
                    	          @15,23 get wcomit  pict '@!'
                        	      @15,71 get wnumdoc pict '99999999'
	                              @16,28 get wsupf 
    	                          @16,56 get wplant  pict '99'
        	                      @16,71 get wbocas  pict '99999'
            	                  @17,28 get wpotkw
                	              @17,52 get wkmbtmt pict '999999.999'
                    	          @17,66 get wred    pict '@!'
                        	      @18,28 get wcerti
	                              read
    	                          if lastkey() <> 27
        	                      else
            	                     werror=1
                	              endif
                	         else
                	         	@21,78 get wop99 pict '9'     
                	         	read
                	         endif
                	         	@21,78 get wop99 pict '9'
                	         	read     
                           endif
                        else
                           @22,01 say 'No existe Profesional'
                           @22,78 get wop
                           read
                           werror = 1
                           @22,01 clear to 22,78
                        endif
                     else
                        @22,01 say 'No existe Profesional'
                        @22,78 get wop
                        read
                        werror = 1
                        @22,01 clear to 22,78
                     endif
                  endif
                  if werror = 0
                     wop=1
                     @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
                     read
                     @23,01 clear to 23,78
                     if wop=2
                        do ingrecer
                        wimp=1
                        @23,01 clear to 23,78
                        @23,30 get wimp pict '@*H \<Salir;\<Imprimir' size 1,1
                        read
                        @23,01 clear to 23,78
                        if wimp=2
                           do imprime
                        endif
                     endif   
                  endif
               else
                  wcontinua = 'n'      
               endif
               do cierra
            enddo   
         else
            wsigue = 'n'   
         endif
      enddo
   else
      wtermina='n'
   endif   
enddo         
close all
@04,01 clear to 23,78
return

procedure ingrecer
   select 5
   use spcerxx index spcerxof, spcerxmc, spcerxcm
   append blank
   replace ceofici  with wofici
   replace cematri  with wmatri
   replace cecateg  with wcatego
   replace cenombre with wnom
   replace cefecha  with wfecha
   replace cecerti  with wcerti
   replace cecomit  with wcomit
   replace celabor  with wlabor
   replace celab1   with wlabor1
   replace celab2   with wlabor2
   replace celab3   with wlabor3
   replace ceobra   with wobra
   replace cedocco  with wnumdoc
   replace cedomob  with wdomobr
   replace cesupf   with wsupf
   replace ceplant  with wplant
   replace cebocas  with wbocas
   replace cepotkw  with wpotkw
   replace cekmbmt  with wkmbtmt 
   replace cered    with wred
   replace ceobdpto with wobdpto 
   replace crdcnro  with wdcnro
   @23,01 clear to 23,78
return


procedure buscatit 
wtitdesc=space(30)
select 6
use sptitu order titulo
select 2
set relation to titulo into sptitu
wtitdesc=substr(f.titdesc,1,30)
@08,15 say f.titdesc
wltiax=18
select 9
use sptiaux index sptiaux
locate for wkey = str(axnume,5)+axcate
do while found()
   @wltiax,45 say axtitu
   select 6
   seek(i.axtitu)
   if found()
      @wltiax,49 say titdesc
   else
      @wltiax,49 say '                              '
   endif
   wltiax=wltiax+1
   select 9
   continue
enddo         
return

procedure buscacur
wdesccur=space(30)
select 6
use spcursos index spcursos.idx
select 7
use spdescur order curso
select 6
seek(wkey)
if found()
   wkeycu=str(curso,3)
   select 7
   seek(wkeycu)
   if found()
      @20,1 say 'Curso efectuado: '
      @20,18 say descrip
   else
      @20,18 say 'curso sin descripcion '
   endif
else
   @20,18 say  '                             '
endif
return            

procedure buscadom
@22,1 clear to 22,78
wlocali=space(15)
wdpto=space(15)
wpcia=space(10)
select 6
use splocal order cod
seek(str(a.locali,3))
if found()
   wlocali=nombre
else
   wlocali=space(15)
endif
select 6
use spdpto order dpto
seek(str(a.dpto,3))
if found()
   wdpto=nombre
else
   wdpto=space(15)
endif
select 6
use spprov order prov
seek(a.provin)
if found()
   wpcia=nombre
else
   wpcia=space(10)
endif
WACTUALIZA=SPACE(20)
if a.tipo <>0
   @22,1 say 'Domicilio NO ACTUALIZADO' color n/w*
endif   
@21,1 say "Domicilio:"
@21,12 say a.domici
@22,3 say wlocali
@22,20 say wdpto
@22,37 say wpcia
return                  

procedure buscrep
wrtfecha={  /  /  }
wcatrt=space(2)
wnomrt=space(30)
wmatrt=0
wkeyrt=space(7)
wkeyrt1=space(9)
wrtntit=space(23)
select 7
use sprtcos order empresa
go top
wlin=20
locate for str(empresa,5)=str(wmatri,5)
do while found()
   @wlin,01 say matprof
   @wlin,7 say categor
   wrtfecha=rtfinal
   @wlin,43 say wrtfecha
   wkeyrt=str(matprof,5)+categor
   select 2
   use spmatri index spmatri
   seek(wkeyrt)
   if found()
      @wlin,52 say habili pict '9999'
      select 6
      use sptitu order titulo
      select 2
      set relation to titulo into sptitu
      wrtntit=substr(f.titdesc,1,30)
      @wlin,56 say wrtntit
      select 2
      wkeyrt1=str(dctipo,1)+str(dcnro,8)
      select 1
      use spprof index spprof
      seek(wkeyrt1)
      if found()
         @wlin,10 say nombre
      else
         @wlin,10 say 'no existe profesional en archivo'
      endif
   else
      @wlin,10 say 'No existe matricula en archivo'
   endif
   if wlin < 22
      wlin = wlin+1
   else
      @23,01 say 'Oprima cualquier tecla para continuar'
      read
      wlin=20
      @23,01 clear to 23,78
   endif
   select 7               
   continue
enddo
return


procedure buscsanc
wop99=' '
wdesccur=space(30)
wsena=1
select 6
use spsanc index spsanc
locate for wkey=str(matric,5)+catego
do while found()
      if santipo = '1'
         if saninci = 'a' or saninci = 'A' or saninci = 'b' or saninci = 'B'
            wsena=1
         else
            if saninci = 'c' or saninci = 'C' or saninci = 'd' or saninci = 'D'
               if sancpag = 0
                  wsena = 0
			   else
			      wsena = 1
			   endif
			else
			   if saninci = 'e' or saninci = 'E'
			      if sanvigha < wfecha
*			         wsena = 1
			      else
			         wsena = 0
			      endif      
			   else
			      if sancpag = 0
			         wsena = 0
			      endif
			   endif
			endif         	                                          
         endif
      else
         if santipo = '0' or santipo = ' '
            if sancpag = 0
               wsena = 0
*            else
*               wsena = 1
            endif      
         else
            if santipo = '2'
               if saninci = 'a' or saninci = 'A' or saninci = 'b' or saninci = 'B'
*                  wsena = 1
               else
                  if saninci = 'c' or saninci = 'C' or saninci = 'd' or saninci = 'D'
                     if sanvigha < wfecha
*                        wsena = 1
                     else
                        wsena = 0
                     endif      
                  else
                     if saninci = 'e' or saninci = 'E'
                        if sanvigha < wfecha
*                           wsena = 1
                        else
                           wsena = 0
                        endif
                     endif      
                  endif
               endif   
            else
               if santipo = '3'
                  if sancpag = 0
                     wsena = 0
*                  else
*                     wsena = 1
                  endif
               else
                  if santipo = '4'
                     if sancpag = 0
                        wsena = 0
*                     else
*                        wsena = 1
                     endif
                  else
                     if santipo = '5'
                        if sancpag = 0
                           wsena = 0
                        else
                           wsena = 1
                        endif
                     else
                        wsena = 0
                     endif            
                  endif
               endif
            endif
         endif
      endif
      if wsena = 0   
         @21,50 say 'Existe sanc.     ' color n/w*
         @21,78 get wop99
         read
      endif
      CONTINUE   
enddo
select 6
use sprestri index sprestri
locate for  wkey=str(matric,5)+catego
DO WHILE found()
	if restrotr <  1
*   if restfactu = {  /  /  } or restfactu > wfecha
      @22,50 say 'Existe Restriccion ' color n/w*
      @22,78 get wop99
      read
    endif
    CONTINUE
ENDDO      
return            

procedure imprime
wocup=0
wvece=0
do imprim1
wcontimp='S'
do while wcontimp = 'S'
   wimp=1
   @23,01 clear to 23,78
   @23,30 get wimp pict '@*H \<Salir;\<Imprimir de nuevo' size 1,1
   read
   @23,01 clear to 23,78
   if wimp=2
      do imprim1
   else   
      wcontimp='N'
   endif
enddo
return


procedure imprim1
wimpa4=2
   @23,30 get wimpa4 pict '@*H \<Oficio;\<A4-Carta' size 1,1
read
set console off
set printer on
set device to printer
set printer to 'LPT1'
	if wimpa4=1
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    else
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    endif
    if wofici=4
    	?
    	?
    endif
    if wofici=2
    	?
    	?
    endif
	? ' EL CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE  MENDOZA  CERTIFICA'
	? ' que el Profesional:'
	?? rtrim(wnom)
	   wocup=len(rtrim(wnom))
	   wvece=30-wocup
	?? replicate('*',wvece)
	?? 'Matr¡cula:' at 50
	?? wmatri pict '99999'
	?? 'Cate-' at 64
	?  ' gor¡a:'
	?? wcatego
	?? 'T¡tulo:' at 9
	?? rtrim(wtitdesc)
	   wocup=len(rtrim(wtitdesc))
	   wvece=30-wocup
	   if wvece>0
		?? replicate('*',wvece)
	   endif	
	?? replicate('*',3)
	?? ' esta habilitado para'
	?  ' realizar las siguientes labores profesionales:'
	?? rtrim(wlabor)
	   wocup=len(rtrim(wlabor))
	   wvece=24-wocup
	?? replicate('*',wvece)
	?  ' '
	?? rtrim(wlabor1)
	   wocup=len(rtrim(wlabor1))
	   wvece=70-wocup
    ?? replicate('*',wvece)     
	?  ' '
	?? rtrim(wlabor2)
	   wocup=len(rtrim(wlabor2))
	   wvece=70-wocup
	?? replicate('*',wvece)     
	?  ' '
	?? rtrim(wlabor3)
	   wocup=len(rtrim(wlabor3))
	   wvece=70-wocup
    ?? replicate('*',wvece)
    ?  ' cuyo comitente es:'
    ?? rtrim(wcomit)
       wocup=len(rtrim(wcomit))
       wvece=30-wocup
    ?? replicate('*',wvece)
    ?? replicate('*',22)
    ?  ' de la obra:'
    ?? rtrim(wobra)
       wocup=len(rtrim(wobra))
       wvece=40-wocup
    ?? replicate('*',wvece)
    ?? ' Sup.m2:'
    ?? rtrim(wsupf)
       wocup=len(rtrim(wsupf))
       wvece=10-wocup
    ?? replicate('*',wvece)           
    ?? '*'
    ? ' Sita en : '
    ?? rtrim(wdomobr)
       wocup=len(rtrim(wdomobr))
       wvece=60-wocup
    ?? replicate('*',wvece)
    ?  ' Plantas:'
    ?? wplant pict '99'
    ?? ' Bocas:'
    ?? wbocas pict '99999'
    ?? ' Potencia:'
    ?? rtrim(wpotkw)
       wocup=len(rtrim(wpotkw))
       wvece=10-wocup
    ?? replicate('*',wvece)
    ?? ' Red:'
    ?? rtrim(wred)
       wocup=len(rtrim(wred))
       wvece=14-wocup
    ?? replicate('*',wvece)
    ?? replicate('*',9)
    ? ' Certificado n£mero:'
    ?? wcerti pict '9999999'
    ?? replicate('*',1)
    ?? 'Doc:'
    ?? wdcnro pict '99999999'
    ?? replicate('*',3)
    ?? ' Km.:'
    ?? wkmbtmt pict '999999.999'
    ?? replicate('*',13)
eject
set device to screen
set printer off
*set device to screen
return

procedure apertura    
   select 1
   use spprof index spprof
   select 2
   use spmatri index spmatri
   select 3
   use spprofe index spprofe
   select 4
   use spmatrie index spmatrie
   select 5
   use spcerxx index spcerxof, spcerxmc, spcerxcm
return 

procedure cierra
   close all
return      