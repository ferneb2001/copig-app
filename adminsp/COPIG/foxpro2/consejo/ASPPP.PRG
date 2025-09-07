procedure spaap
* Actualizacion archivo de asociados
wsigue='S'
contii='s'
wnumero=0
set exclusive off
*set multilocks on
wcatego=space(2)
wnom=space(30)
westado=space(15)
wtit=0
wfincr={  /  /  }
wftit={  /  /  }
wpago={  /  /  }
wfecb=0
wfeccert={  /  /  }
wcurso=0
wkey=space(7)
@04,01 clear to 23,78
@04,25 say 'ACTUALIZACION DE ASOCIADOS '
do while contii='s'
do while wsigue='S'
   @05,01 clear to 23,78
   @06,02 say 'Matr¡cula'
   @06,20 say 'Categ.:'
   do panta01
   wnumero=0
   @23,01 say 'Indique el nro.de matr¡cula, <F1> para obtener ayuda o <ESC> para salir'
   @06,13 get wnumero pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>28
   if lastkey()<> 27
   if wnumero<>0
   	  @23,01 say 'Indique la categoria'
      @06,28 get wcatego pict '!!'
      read
      wxcat= 0
      do contrcat
      if wxcat = 0
      wkey=str(wnumero,5)+wcatego
      select 2
      use fmat1 index fmat1x
*      use spmatri1 index spmatri2
      seek(wkey)
      if found()
         wqtitulo=titulo
         wkey1=str(dctipo,1)+str(dcnro,8)
         select 1
         use fprof1 index fprof1x, fprof1n
*         use spprof1 index spprof2, spprofn1
         seek(wkey1)
         if found()
            do pant01
            @06,31 say nombre
            do case
               case b.condic='1'
                    westado= 'Activo'
               case b.condic='2'
                    westado='Carnet Dep.'
               case b.condic='3'
                    westado= 'Fallecido'
               case b.condic='4'
                    westado= 'Suspendido'
               case b.condic='5'
               	    westado= 'Baja de Matr¡cula'
               case b.condic='6'
                    westado= 'Comunica Inactividad'	         
               case b.condic=' '
                    westado= '                 '
            endcase
            @21,02 say 'Estado      : '
            @21,21 say westado            
*  se relaciona matri con titu para poner descrip.del titulo
             select 3
             use sptitu order titulo
             select 2
             set relation to titulo into sptitu            
             wtitdesc=c.titdesc
             wotorga=b.otorga
             @08,23 say c.titulo
             @08,27 say c.titdesc
             @09,23 say b.otorga
             @11,22 say b.inscr
             @12,22 say b.fectit
             @13,22 say b.fechab
             @14,22 say b.pago
             @16,22 say b.habili pict '9999'
             @17,22 say b.vtohab
             @18,22 say b.feccert
             if b.fectit <> {  /  /  }
                @20,22 say 'definitiva'
             else
                @20,22 say 'provisoria'
             endif
             select 4
             use spente order codigo
             seek(b.otorga)
             if found()
                wnoment=nombre
             else
                wnoment=space(15)
             endif
             @09,25 say wnoment 
             do spotti
             wop=2
             do while wop<>1
                @23,01 say 'normal'
                @23,25 get wop picture '@*H \<Salir;\<Modificar;\<Otros Datos';
                       size 1,1 
                read
                @23,01 clear to 23,78
                if wop=2
                   do modifica1
                else
                   if wop=3
                      save screen to pant1
                      do otros
                      restore screen from pant1
                      wop=3
                   endif
                endif         
                @23,01 clear to 23,78
             enddo       
         else
            @06,60 SAY 'SIN DATOS PERSONALES'
         endif      
      else
         *@06,60 say 'No encontro'
         wencon=0
         do BUSCAVIE
         if wencon<>0 
        	 DO INGRESNU with wnumero, wcatego
         endif
      endif
      else
         @23, 01 say 'Mal codigo de grupo '
      endif
      else
***************  agregar rutina por numero de documento y por nombre      
      endif   
   else
      wsigue='N'
   endif
   else
      save screen to wscr01
      do spay01
      restore screen from wscr01
   endif
   close all   
enddo
wop=2
@23,25 get wop pict '@*H \<Salir;\<Continuar ' size 1,1
read
@23,01 clear to 23,78
if wop=1
   contii='n'
else
   wsigue='S'   
endif
enddo
close all
@04,01 clear to 23,78
return


procedure modifica1
wnom=a.nombre
wtit=b.titulo
wfincr=b.inscr
wftit=b.fectit
wfhabil=b.fechab
wpago=b.pago
wfecb=b.habili
wvtohab=b.vtohab
wfeccert=b.feccert
westcon=b.condic
@06,31 get wnom
@08,23 get wtit
read
if wtit<>b.titulo   
   @14,50 clear to 14,59
   select 3
   use sptitu order titdesc
   @23,01 say 'Seleccione un titulo y oprima <ESC> '
   define window ptit from 13,30 to 20,63 title 'Titulos'
   activate window ptit
   brow fields titdesc nomodify in window ptit
   deactivate window ptit
   @23,01 clear to 23,78
   wtit=titulo
   wtitdesc=titdesc
endif
wopent=2
@23,20 say 'Indique 1=Universidades 2=esc.Tecnicas 3=Municipalid.'
@09,19 get wopent pict '9'
read
wotorga=b.otorga
wnoment=space(25)
select 4
use spente order codigo
if wotorga<>0
   seek(wotorga)
   if found()
      wnoment=nombre
   else
      wnoment=space(25)
   endif
endif          
@23,01 say 'Seleccione una Entidad y oprima <ESC> '
define window pent from 10,30 to 22,77 title 'Entidad Educativa'
activate window pent
if wopent = 1
   brow fields codigo, nombre, univer nomodify in window pent for univer = 1
else
   if wopent = 2
      brow fields codigo, nombre, univer nomodify in window pent for univer = 2
   else
      brow fields codigo, nombre, univer nomodify in window pent for univer = 3
   endif
endif            
deactivate window pent
@23,01 clear to 23,78
if codigo <>0
   wotorga=codigo
   wnoment=nombre
else
*   wopent1=1
*   @23,01 clear to 23,78
*   @23,01 say 'Seleccione una Entidad y oprima <ESC> '
*   wotorga=codigo
*   wnoment=space(25)   
endif   
@08,23 say wtit pict 'XXX'
@08,25 say wtitdesc
@09,22 say wotorga
@09,25 say wnoment
@11,22 get wfincr
@12,22 get wftit
@13,22 get wfhabil
@14,22 get wpago
@16,22 get wfecb
@17,22 get wvtohab
@18,22 get wfeccert
@21,22 get westcon
*wcurso=0
*@22,16 get wcurso
read
select 1
replace nombre  with wnom
*replace estado  with westcon
select 2
replace b.titulo  with wtit
replace b.inscr   with wfincr
replace b.fectit  with wftit
replace b.fechab  with wfhabil
replace b.pago    with wpago
replace b.habili  with wfecb
replace b.feccert with wfeccert
replace b.otorga  with wotorga
replace b.vtohab  with wvtohab
if westcon = '1' 
   westado= 'Activo '
   replace b.condic with '1'
else
   if westcon = '5'
      westado = 'Baja '
      replace b.condic with '5'
   else
      if westcon = '2'
         westado = 'Carnet depositado'
         replace b.condic with '2'
      else
         if westcon='3'
            westado = 'Fallecido '
            replace b.condic with '3'
         else
            if westcon='4'
               westado= 'Suspendido'
               replace b.condic with '4'
            else
               if westcon='6'
                  westado='Comunica Inactividad'
                  replace b.condic with '6'
               else   
                  if westcon=' '
                     westado='          '
                     replace b.condic with '0'
                  endif   
               endif      
            endif
         endif
      endif
   endif
endif
@21,21 say westado                           
@23,01 clear to 23,78
return

procedure otros
wotro=0
@15,40 to 23,78
@16,40 say 'Otros datos'
@16,55 get wotro picture '@* \<Datos Personales;\<Pagos;\<Sanciones;\<Cursos Post.Grado;\<Otr.Tit.;\<Observ;\<Salir';
                          size 1,1
read
@16,40 clear to 23,78
do case
   case wotro = 1
      do personal with wkey1
   case wotro = 2
      do pagos with wkey
   case wotro = 3
      do buscasan with wnumero, wcatego
   case wotro = 4
      do cursos with wkey
   case wotro = 5
      do spotti1
   case wotro = 6
      do spobser with wkey, wkey1    
endcase   
return

procedure buscavie

wkey=str(wnumero,5)+wcatego
select 12
use spmatri1 index spmat1x, spmatdo1 
seek(wkey)
if found()
   wqtitulo=titulo
   wkey1=str(dctipo,1)+str(dcnro,8)
   select 11
   use spprof1 index spprof1x, spprofn1
   seek(wkey1)
   if found()
	   do pant01
	   wencon=0
  	   @06,31 say nombre
  	   do case
     	 case spmatri1.condic='1'
        	 westado= 'Activo'
      	 case spmatri1.condic='2'
        	 westado='Carnet Dep.'
     	 case spmatri1.condic='3'
         	 westado= 'Fallecido'
      	 case spmatri1.condic='4'
     	    westado= 'Suspendido'
     	 case spmatri1.condic='5'
      	   westado= 'Baja de Matr¡cula'
     	 case spmatri1.condic='6'
        	 westado= 'Comunica Inactividad'	         
      	 case spmatri1.condic=' '
        	 westado= '                 '
   	   endcase
   @21,02 say 'Estado      : '
   @21,21 say westado            
*  se relaciona matri con titu para poner descrip.del titulo
   select 3
   use sptitu order titulo
   select 2
   set relation to spmatri1.titulo into sptitu            
   wtitdesc=c.titdesc
   wotorga=spmatri1.otorga
   @08,23 say c.titulo
   @08,27 say c.titdesc
   @09,23 say spmatri1.otorga
   @11,22 say spmatri1.inscr
   @12,22 say spmatri1.fectit
   @13,22 say spmatri1.fechab
   @14,22 say spmatri1.pago
   @16,22 say spmatri1.habili pict '9999'
   @17,22 say spmatri1.vtohab
   @18,22 say spmatri1.feccert
   if spmatri1.fectit <> {  /  /  }
      @20,22 say 'definitiva'
   else
      @20,22 say 'provisoria'
   endif
   select 4
   use spente order codigo
   seek(spmatri1.otorga)
   if found()
      wnoment=nombre
   else
      wnoment=space(15)
   endif
   @09,25 say wnoment
   select 2
   use fmat1 index fmat1x, fmatdo1
   append blank
   replace numero  with spmatri1.numero
   replace catego  with spmatri1.catego
   replace dctipo  with spmatri1.dctipo
   replace dcnro   with spmatri1.dcnro
   replace titulo  with spmatri1.titulo
   replace otorga  with spmatri1.otorga
   replace inscr   with spmatri1.inscr
   replace fectit  with spmatri1.fectit
   replace fechab  with spmatri1.fechab
   replace feccert with spmatri1.feccert
   replace pago    with spmatri1.pago
   replace recibo  with spmatri1.recibo
   replace habili  with spmatri1.habili
   replace vtohab  with spmatri1.vtohab
   replace afilia  with spmatri1.afilia
   replace condic  with spmatri1.condic
   select 1
   use fprof1 index fprof1x, fprof1n
   append blank
   replace dctipo  with spprof1.dctipo
   replace dcnro   with spprof1.dcnro
   replace nombre  with spprof1.nombre
   replace apepater with spprof1.apepater
   replace apemater with spprof1.apemater
   replace nombre1  with spprof1.nombre1
   replace adiciona with spprof1.adiciona
   replace domici   with spprof1.domici
   replace provin   with spprof1.provin
   replace dpto     with spprof1.dpto
   replace locali   with spprof1.locali
   replace nacio    with spprof1.nacio
   replace cuit     with spprof1.cuit
   replace sexo     with spprof1.sexo
   replace estciv   with spprof1.estciv
   replace nacion   with spprof1.nacion
   replace telef    with spprof1.telef
   replace tipo     with spprof1.tipo
   replace fallec   with spprof1.fallec
   replace estado   with spprof1.estado
   replace domleg   with spprof1.domleg
   replace celular  with spprof1.celular
   replace telef1   with spprof1.telef1
   replace celular1 with spprof1.celular1
   replace email    with spprof1.email
   replace email1   with spprof1.email1
   replace cedula   with spprof1.cedula
   replace cedprov  with spprof1.cedprov
   replace cartciud with spprof1.cartciud
   replace naclugar with spprof1.naclugar
   replace telfax   with spprof1.telfax
   replace telfax1  with spprof1.telfax1
   replace factual  with date()
*   wop=2
*   do while wop<>1
*      @23,01 say 'nuevo '
*   	  @23,25 get wop picture '@*H \<Salir;\<Modificar;\<Otros Datos';
*   	  size 1,1 
*   	  read
*   	  @23,01 clear to 23,78
*      if wop=2
*         do modifica1
*      else
*         if wop=3
*            save screen to pant1
*            do otros
*            restore screen from pant1
*            wop=3
*          endif
*       endif         
*       @23,01 clear to 23,78
*    enddo       
  else
  	wencon=1
  endif 
else
  wencon=1
endif
return


procedure contrcat
if wcatego = '22'
	wxcat=0
else
  if wcatego = '33'
      wxcat=0
   else
      if wcatego = '44'
         wxcat = 0
      else
         if wcatego = '55'
            wxcat = 0
         else
            if wcatego = '66'
               wxcat = 0
            else
               if wcatego = 'E '
                  wxcat = 0
               else
                  if wcatego = '11'
                  	wxcat = 0
                  else	
                 	 wxcat = 1
                 endif	 
               endif
            endif
         endif
      endif
   endif
endif                                 	
return

procedure spotti
wltiax=10
select 9
use sptiaux index sptiaux
locate for wkey = str(axnume,5)+axcate
do while found()
  @wltiax,22 say axtitu
  select 3
  use sptitu order titulo
  seek(i.axtitu)
  if found()
     @wltiax,25 say titdesc
  else
     @wltiax,25 say '                        '
  endif
  wltiax=wltiax+1
  select 9
  continue
enddo
return

procedure spotti1
wltiax=10
select 9
use sptiaux index sptiaux
locate for wkey = str(axnume,5)+axcate
do while found()
  @wltiax,22 say axtitu
  select 3
  use sptitu order titulo
  seek(i.axtitu)
  if found()
     @wltiax,25 say titdesc
  else
     @wltiax,25 say '                        '
  endif
  wltiax=wltiax+1
  select 9
  continue
enddo
WOPT1=1
@23,01 clear to 23,78
@23,15 get wopt1 pict '@*H \<Salir;\<Ingresar' size 1,1
read
@23,01 clear to 23,78
if wopt1 = 2
   wconti ='s'
   do while wconti='s'
      wxnume = wnumero
      wxcate = wcatego
      wxdcti= a.dctipo
      wxdcnro= a.dcnro
      wxtitu=space(3)
      wxotorga=0
      wxfecti={  /  /  }
      wxfecce={  /  /  }
      @23,01 say 'Ingrese codigo de titulo o <esc> para salir'
      @wltiax,17 get wxtitu
      read
      @23,01 clear to 23,78
      if lastkey()<>27
         @wltiax,52 get wxfecti
         @wltiax,61 get wxfecce
         @wltiax,70 get wxotorga pict '999'
         wltiax=wltiax+1
         read
         select 9
         append blank
         replace axnume  with  wxnume
         replace axcate  with  wxcate
         replace axdcti  with  wxdcti
         replace axdcnro with  wxdcnro
         replace axtitu  with wxtitu
         replace axfecti with wxfecti
         replace axfecce with wxfecce
         replace axotorg with wxotorga
      else
         wconti='n'
      endif
   enddo   
endif
return