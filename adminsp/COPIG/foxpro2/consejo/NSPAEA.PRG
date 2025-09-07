procedure nspaea
*  Ingreso de certificados nuevo dise¤o Febrero/2012
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
select 1
use spprof index spprof.idx
select 2
use spmatri index spmatri.idx
select 3
use spprofe index spprofe.idx
select 4
use spmatrie index spmatrie.idx
select 5
use spcernv index spcernof, spcernmc, spcerncm
wtermina='s'
do while wtermina = 's'
   @03,01 clear to 23,78
   @03,24 say 'INGRESO DE CERTIFICADOS '
   wofici=0
   @04,03 say 'Oficina    :'
   @04,60 say '01=Mitre 617  '
   @05,60 say '02=San Rafael '
   @06,60 say '03=Gral.Alvear'
   @07,60 say '04=San Mart¡n'
   @23,01 say 'Ingrese c¢digo de Oficina ¢ <ESC> para terminar'
   @04,28 get wofici pict '99'
   read
   @04,60 clear to 07,78
   @23,01 clear to 23,78
   if lastkey() <> 27
      do case
         case wofici=1
              @04,15 say 'Mitre 617'
         case wofici=2
              @04,15 say 'San Rafael'
         case wofici=3
              @04,15 say 'Gral.Alvear'
         case wofici=4
         	  @04,15 say 'San Martin'     
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
         wdomobr=space(40)
         wobdpto=0
         wsupf=space(10)
         wplant=0
         wbocas=0
         wpotkw=space(10)
         wkmbtmt=0.000
         wmatri=0
         wcontinua = 's'
         @04,31 say 'Fecha      :'
         @23,04 say 'Indique la fecha o <esc> para salir'
         @04,37 get wfecha
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
               wdomobr=space(40)
               wobdpto=0
               wsupf=space(10)
               wplant=0
               wbocas=0
               wpotkw=space(10)
               wkmbtmt=0.000
               wtset=space(7)
               wnset=0
               wperfd=0
               wperfp=0
               walted=0
               wtramite=0
               wnucond=0
               wcondic=space(21)
               wempresa=space(34)
               wmatrem=0
               wapoder=space(30)
               wapodcl=0
               wcomicl=0
               werror=0
               wvtohab={  /  /    }
               @05,01 clear to 18,78
               @19,01 clear to 23,78
               @05,03 say 'Matricula  :'
               @05,21 say 'Cat:'
               @06,03 say 'Titulo     :'
               @07,03 say 'Condicion  :'
               @08,03 say 'Labor Prof.:'
               @12,03 say 'Obra:'
               @13,03 say 'Domicilio:'
               @13,59 say 'Depart.:'
               @14,03 say 'Comitente:'
               @14,50 say 'CUIT/DU:'
               @15,03 say 'Sup.Cub.m2:'
               @15,26 say 'Plantas:'
               @15,38 say 'Bocas:'
               @15,50 say 'Red.m(G/CL/Ag):'
               @16,03 say 'Potenc.Kw. :'
               @16,26 say 'Km.Lin.MT/BT:'
               @16,50 say 'Tipo SET '
               @16,69 say 'Cant.'
               @17,03 say 'Perf.Diam(") '
               @17,24 say 'Perf.prof(m).'
               @17,45 say 'Dormit.(n§);'
               @18,03 say 'Certificado:'
               @18,26 say 'Tramite:'
               @23,04 say 'Indique Matr¡cula o <ESC> para volver'
               @05,15 get wmatri pict '99999'
               read
               @23,01 clear to 23,78
               if lastkey() <> 27
*                  do apertura
*                 @23,04 say 'Indique Categor¡a'
*                  @05,27 get wcatego pict '!!'
*                  read
				  wcatego='A '	
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
                        	wnomb1=space(38)
                        	wnomb1=substr(nombre,1,38)
                           @05,34 say wnomb1
                           wnom=substr(wnomb1,1,30)
                           werror=0
                           if estado = 'C'
                              @19,50 say 'Comunic¢ Inactividad '
                           else
                              if estado = 'F'
                                 @19,50 say 'Dada de Baja por el Consejo'
                              else
                                 if estado = 'S' 
                                    @19,50 say 'Suspendida          '
                                 else
                                 if estado = 'B' 
                                    @19,50 say 'Baja solic.por Empresa'
                                 endif
                                 endif
                              endif
                           endif               
                           @19,15 say 'Habilitada a¤o '
                           @19,31 say d.habili
                           if d.habili<wano
                              werror=1
                              @20,15 say 'NO HABILITADA'
                              @20,31 GET wop1
                              read
                           endif
                           if werror=0
	                           do buscrep
    	                       do buscsanc
        	                   @23,01 say 'Ingrese Labor profesional o <ESC> para otro'
            	               @08,15 get wlabor pict '@!'
                	           @09,09 get wlabor1 pict '@!'
                    	       @10,09 get wlabor2 pict '@!'
                        	   @11,09 get wlabor3 pict '@!'
	                           @23,01 clear to 23,78
    	                       @12,15 get wobra   pict '@!'
        	                   @13,15 get wdomobr pict '@!'
            	               @13,73 get wobdpto pict '99'
                	           @14,15 get wcomit  pict '@!'
                    	       @14,58 get wnumdoc pict '99999999'
	                       	   @15,15 get wsupf 
    	                       @15,35 get wplant  pict '99'
        	                   @15,44 get wbocas  pict '99999'
                    	       @15,65 get wred    pict '@!'
            	               @16,15 get wpotkw
                	           @16,41 get wkmbtmt pict '999999.999'
	                       	   @18,15 get wcerti
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
***********profesionales                     
                  else
                     select 2
                     seek(wkey)
                     if found()
                        wkey1=str(dctipo,1)+str(dcnro,8)
                        select 1
                        seek(wkey1)
                        if found()
                           @05,30 say nombre
                           wnom=nombre
                           wop99=' '
                           werror=0
                           if b.condic > '1'
                              if b.condic = '2'
                                 @19,50 say 'carnet depositado'
                                 werror=1
                              else
                                 if b.condic = '3'
                                    @19,50 say 'Fallecido '
                                    werror=1
                                 else
                                    if b.condic = '4'
                                       @19,50 say 'Suspendido '
                                       werror = 1
                                    else
                                       if b.condic = '5'
                                          @19,50 say 'Baja matr¡cula '
                                          werror=1
                                       else
                                          @19,50 say 'Inactividad       '
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
                             	  @19,01 clear to 20,78
	                              if b.fectit={  /  /    }
    	                          	if b.feccert<>{  /  /    }
        	                      		@20,45 say 'Certif.Provisorio: '
            	                  		@20,66 say b.feccert
                	              		@20,78 get wop99
                    	          		read
                        	      	endif
                            	  endif
                            	  @20,01 clear to 20,78
					              do buscatit
					              do buscacur
					              do buscadom
					              do buscsanc
					              @23,01 say 'Ingrese Condicion Profesional'
					              @06,50 to 12,76
					              @07,51 say '1- INDEPENDIENTE '
					              @08,51 say '2- RELAC.DE DEPEND.'
					              @09,51 say '3- CONTRATADO '
					              @10,51 SAY '4- REPRES.TECNICO '
					              @11,53 GET wnucond pict '9'
					              read
					              @06,50 clear to 12,76
					              if wnucond=1
					              		wcondic='INDEPENDIENTE'
					              ELSE
					              	IF WNUCOND=2
					              		WCONDIC='RELAC.DE DEPENDENCIA'
					              	ELSE
					              		if wnucond=3
					              			wcondic='CONTRATADO'
					              		else
					              			if wnucond=4
					              				wcondic='REPRES.TECNICO'
					              			else
					              				wcondic=space(21)
					              			endif
					              		endif
					              	ENDIF
					              ENDIF
					              public werro1 werro2
					              werro1=0
					              werro2=0		
					              @07,15 say wcondic pict '@!'
					              if wcondic<>'INDEPENDIENTE'
					                 @07,37 get wmatrem pict '99999'
					                 read
					                 if wmatrem<>0
					                 	do buscaem
*					                	buscar empresa y verificar si prof es rtco.
					                 else
					                   @23,01 say 'Ingrese Nombre Empresa       '
					                   @07,43 get wempresa pict '@!'
					                   read
					                 endif
					              endif
					              if werror=0 and werro1=0
	                	              @23,01 say 'Ingrese labor profesional o <esc> para otro profesional'
    	                	          @08,15 get wlabor pict '@!'
        	                	      @09,09 get wlabor1 pict '@!'
            	                	  @10,09 get wlabor2 pict '@!'
	            	                  @11,09 get wlabor3 pict '@!'
    	            	              @23,01 clear to 23,78
        	            	          @12,15 get wobra   pict '@!'
            	            	      @13,15 get wdomobr pict '@!'
                	            	  @13,73 get wobdpto pict '99'
	                    	          @14,15 get wcomit  pict '@!'
    	                    	      @14,59 get wcomicl pict '99999999999'
        	                	      read
            	            	      @22,03 say 'Apoderado:'
                	        	      @22,46 say 'CUIT/DU:'
                    	    	      @22,14 get wapoder pict '@!'
                        		      @22,55 get wapodcl pict '99999999999'
                        		      read
	                            	  @15,15 get wsupf 
	    	                          @15,35 get wplant  pict '99'
    	    	                      @15,44 get wbocas  pict '99999'
        	            	          @15,65 get wred    pict '@!'
            		                  @16,15 get wpotkw
                		              @16,41 get wkmbtmt pict '999999.999'
                		              @16,60 get wtset
                	    	          @16,75 get wnset pict '9999'
	               	        	      @17,18 get wperfd pict '99999'
    	            	              @17,37 get wperfp pict '9999,99'
        	        	              @17,57 get walted pict '9999'
            	            	      @18,15 get wcerti pict '9999999'
                	        	      @18,35 get wtramite pict '99999999'
	                	              read
    	                	          if lastkey() <> 27
        	                	      else
            	                	     werror=1
	                	              endif
	                	           else
	                	           	  @21,78 get wop99 pict '9'
	                	              read
	                	           endif   
                	           else
                	         	  @21,78 get wop99 pict '9'     
                	         	  read
                	           endif
                	       else    
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
*               do cierra
            enddo   
         else
            wsigue = 'n'   
         endif
      enddo
   else
      wtermina='n'
   endif   
enddo
do cierra         
close all
@04,01 clear to 23,78
return

**********************busca empresa *********************************
procedure buscaem
wope=0
wkey1e=space(9)
wkeye=space(7)
wkeye=str(wmatrem,5)+'EM'
select 4
seek(wkeye)
if found()
	wkey1e=str(dctipo,1)+str(dcnro,8)
	select 3
	seek(wkey1e)
	if found()
		wempresa=space(34)
		wempresa=substr(nombre,1,34)
		@07,43 say wempresa
		werror=0
		werro1=0
		define window busca from 12,01 to 23,78
		activate window busca
		if estado = 'C'
			@05,50 say 'Comunico Inactividad'
			werror=1
		else
			if estado = 'F'
				@05,50 say 'Dada de baja por Consejo'
				werror=1
			else
				if estado = 'S'
					@05,50 say 'Suspendida'
					werror=1
				else
					if estado = 'B'
						@05,50 say 'Baja solicitada por Empresa'
						werror=1
					endif
				endif
			endif
		endif
		if d.habili<wano
			werror=1
			@05,7 say 'Empresa No Habilitada'
			@05,31 say d.habili
			@05,41 get wop
			read
		else	
			@05,7 say 'Empresa Habilitada : '
			@05,31 say d.habili
		endif
		if werror=0
			werro1=0
			do buscrep1
			if werro2=0
			else
				@07,30 say 'No Figura como R.Tco. en esta Empresa'
				@07,70 get wope
				read
				@07,30 clear to 07,72
			endif
		else
			werror=1
		endif
		deactivate window busca
	else
		@22,01 say 'No existe Empresa'
		@22,78 get wop
		read
		werror=1
		@22,01 clear to 22,78
	endif
else
	@22,01 say 'No existe Empresa'
	@22,78 get wop
	read
	werror=1
	@22,01 clear to 22,78
endif
@19,01 clear to 19,78
return



procedure ingrecer
   select 5
   use spcernv index spcernof, spcernmc, spcerncm
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
   replace cetset   with wtset
   replace cenuset  with wnset
   replace ceperfd  with wperfd
   replace ceperfp  with wperfp
   replace cealtedi with walted
   replace cetramit with wtramite
   replace cecondic with wcondic
   replace cecuilco with wcomicl
   replace ceempres with wempresa
   replace cematemp with wmatrem
   replace ceapoder with wapoder
   replace ceapodcl with wapodcl
   @23,01 clear to 23,78
return


procedure buscatit 
wtitdesc=space(30)
select 6
use sptitu order titulo
select 2
set relation to titulo into sptitu
wtitdesc=substr(f.titdesc,1,30)
@06,15 say f.titdesc
wltiax=21
select 9
use sptiaux index sptiaux
locate for wkey = str(axnume,5)+axcate
do while found()
   @wltiax,03 say 'Otro t¡tulo'
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
      @22,1 say 'Curso efectuado: '
      @22,18 say descrip
   else
      @22,18 say 'curso sin descripcion '
   endif
else
   @22,18 say  '                             '
endif
return            

procedure buscadom
@22,1 clear to 23,78
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
@22,1 say "Domicilio:"
@22,12 say a.domici
@23,3 say wlocali
@23,20 say wdpto
@23,37 say wpcia
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

procedure buscrep1
wrtfecha={  /  /    }
wcatrt=space(2)
wnomrt=space(30)
wmatrt=0
wkeyrt=space(7)
wkeyrt1=space(9)
wrtntit=space(23)
select 7
use sprtcos order empresa
go top
wlin=2
wsiesta=0
locate for str(empresa,5)=str(wmatrem,5)
do while found()
	if matprof=wmatri
	   wsiesta=1
	   @wlin,01 say 'Matric.Prof'
	   @wlin,13 say 'Fecha Final'
	   wlin=wlin+1	
	   @wlin,01 say matprof
   	   @wlin,7 say categor
	   wrtfecha=rtfinal
	   @wlin,13 say wrtfecha
	   if wrtfecha<>{  /  /    }
	   		if wrtfecha<wfecha
	   			@wlin,24 say 'Contrato Vencido'
	   			werro1=1
	   		endif
	   endif
	   if wnucond=2 and rtvinculo=3
	   	@wlin,40 say 'Prof en Relacion de Dependencia'
	   else
	    if wnucond=2 and rtvinculo<>3
	      @wlin,40 say 'Prof NO esta en Relacion de Dep.'
	      @wlin,75 get wop pict '9'
	      read
	    endif  
	   endif
	   wlin=wlin+1
	   @wlin,1 say 'El v¡nculo del Profesional es de '
	   wvinc=space(18)
	   if rtvinculo=1
	   	  wvinc='Contrato '
	   else
	   	if rtvinculo=2
	   		wvinc='Socio'
	   	else
	   		if rtvinculo=3
	   			wvinc='Rel.de Dependencia'
	   		else
	   			if rtvinculo=4
	   				wvinc='Acta de Directorio'
	   			else
	   				if rtvinculo=5
	   					wvinc='Apoderado'
	   				else
	   					if rtvinculo=6
	   						wvinc='Contr.Por Obra'
	   					else
	   						if rtvinculo=7
	   							wvinc='Contr.Renov.Automat.'
	   						else
	   							if rtvinculo=8
	   								wvinc='Propietario'
	   							else
	   								if rtvinculo=9
	   									wvinc='Contr.Ren.Aut.det'
	   								else
	   									if rtvinculo=10
	   										wvinc='Otro tipo contrato'
	   									else
	   										if rtvinculo=11
	   											wvinc='Contrato sin vto.'
	   										else
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
	   @wlin,35 say wvinc
	   @wlin,75 get wop pict '9'
	   read
	   exit
	else
*		werro2=1   
	   if wlin < 4
	      wlin = wlin+1
	   else
*	      @23,01 say 'Oprima cualquier tecla para continuar'
*	      read
	      wlin=2
*      @23,01 clear to 23,78
	   endif
	endif   
	select 7               
	continue
enddo
if wsiesta=0
	werro2=1
endif
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
	? 'EL CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE  MENDOZA  CERTIFICA'
	? 'que el Profesional:'
	?? rtrim(wnom)
	   wocup=len(rtrim(wnom))
	   wvece=30-wocup
	?? replicate('*',wvece)
	?? 'Matricula:' at 50
	?? wmatri pict '9999'
	?? ' Cate-' at 64
	?  'goria:'
	?? wcatego
	?? 'Titulo:' at 9
	?? rtrim(wtitdesc)
	   wocup=len(rtrim(wtitdesc))
	   wvece=30-wocup
	   if wvece>0
		?? replicate('*',wvece)
	   endif
	?? ' que desarrolla su acti-'   	
	?  'vidad como '
	?? rtrim(wcondic)
		wocp=len(rtrim(wcondic))
		wvece=21-wocup
		if wvece>0
	??  replicate('*',wvece)
	    endif
	if wcondic='INDEPENDIENTE'
		wvece=38
		??replicate('*',wvece)
	else
	    ?? ' de '
		??rtrim(wempresa)
		wocup=len(rtrim(wempresa))
		wvece=35-wocup
		if wvece>0
			??replicate('*',wvece)
		endif	
	endif
	? 'se encuentra habilitado y tiene alcance en su titulo para realizar las'
	?  'siguientes labores profesionales:'
	?? rtrim(wlabor)
	   wocup=len(rtrim(wlabor))
	   wvece=24-wocup
	?? replicate('*',wvece)
	?? replicate('*',13)
	?  rtrim(wlabor1)
	   wocup=len(rtrim(wlabor1))
	   wvece=70-wocup
    ?? replicate('*',wvece)     
	?  rtrim(wlabor2)
	   wocup=len(rtrim(wlabor2))
	   wvece=70-wocup
	?? replicate('*',wvece)     
	?  rtrim(wlabor3)
	   wocup=len(rtrim(wlabor3))
	   wvece=70-wocup
    ?? replicate('*',wvece)
    ?  'de la obra:'
    ?? rtrim(wobra)
       wocup=len(rtrim(wobra))
       wvece=40-wocup
    ?? replicate('*',wvece)
    ?? replicate('*',19)
    ? 'Sita en : '
    ?? rtrim(wdomobr)
       wocup=len(rtrim(wdomobr))
       wvece=44-wocup
    ?? replicate('*',wvece)
    ?? replicate('*',16)
*    ?? ' S.E.T.(n):'
*    ?? wnset pict '99999'
*    ?? replicate('*',1)
    ?  'cuyo comitente es:'
    ?? rtrim(wcomit)
       wocup=len(rtrim(wcomit))
       wvece=33-wocup
    ?? replicate('*',wvece)
    ?? 'CUIT/DU:'
    ?? wcomicl pict '99999999999'
*    ?? replicate('*',19)
*    ?? ' Tipo SET '
*    ?? rtrim(wtset)
*       wocup=len(rtrim(wtset))
*       wvece=9-wocup
*    ?? replicate('*',wvece)
    	if wapoder<>'         '
    	    ? 'Apoderado: '
    		?? rtrim(wapoder)
    		wocup=len(rtrim(wapoder))
    		wvece=40-wocup
    		??replicate('*',wvece)
    		??'CUIT/DU '
    		??wapodcl pict '99999999999'
    	endif
    ? 'Sup.cubierta (m2):'
    ?? rtrim(wsupf)
       wocup=len(rtrim(wsupf))
       wvece=10-wocup
    ?? replicate('*',wvece)           
    ?? ' Bocas:'
    ?? wbocas pict '99999'
    ??  ' Plantas:'
    ?? wplant pict '99'
    ?? ' Dormit.(n§)'
    ?? walted pict '9999'
    ?? '***'
    ?  'Red agua/cl/gas (m):'
    ?? rtrim(wred)
       wocup=len(rtrim(wred))
       wvece=10-wocup
       if wvece>0
          ?? replicate('*',wvece)
        endif  
    ?? ' Lin.MT/BT (Km):'
    ?? wkmbtmt pict '999999.999'
    ?? replicate('*',14)
    ?  'Perf("); '
    ?? wperfd pict '99999'
    ?? ' Prof(m):'
    ?? wperfp pict '999999'
    ?? ' Tipo S.E.T.:'
    ?? rtrim(wtset)
    	wocup=len(rtrim(wtset))
    	wvece=9-wocup
    ?? replicate('*',wvece)
    ?? ' S.E.T.(n):'
    ?? wnset pict '99999'
    ?? replicate('*',3)
    ? 'Certificado COPIG n§: '
    ?? wcerti pict '9999999'
    ?? ' Tramite n§: '
    ?? wtramite pict '99999999'
    ?? ' '
    ?? replicate('*',19)
*    ?? ' Prof(m) '
*    ?? wperfp pict '99999'
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
   use spcernv index spcernof, spcernmc, spcerncm
return 

procedure cierra
   close all
return      