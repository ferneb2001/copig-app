procedure ingresoo
parameters wmatri, wcat
* Ingreso de nuevos profesionales
@07,01 clear to 23,78
wnombre=space(30)
wnacion=space(1)
wnacio={  /  /  }
winscr={  /  /  }
wfecotor={  /  /  }
wpago=DATE()
wimporte=0
wrecibo=0
wdctipo=0
wdcnro=0
wcivil=space(1)
wdsexo=space(1)
wtitulo=space(3)
wotorga=0
wnoment=space(30)
wdomici=space(44)
wdomleg=space(44)
wprov=0
wdpto=0
wlocal=0
wwnloc=space(15)
wwndpto=space(15)
wwnprov=space(15)
wprov=0
wdpto=0
wlocal=0
wprovl=0
wdptol=0
wlocall=0
wwprov=0
wwdpto=0
wwlocal=0
wcuit=0
wtel=space(12)
wsigue='S'
whabili=0
whabil=0
@08,02 say 'Nacionalidad  :'
@09,02 say 'Fecha Nacim.  :'
@10,02 say 'Dcto.Identidad:'
@11,02 say 'Estado Civil  :'
@11,35 say 'Sexo:'
@12,02 say 'Titulo        :'
@13,02 say 'Expedido por  :'
@13,60 say 'En fecha:'
@14,02 say 'Domicilio     :'
@15,02 say 'Localidad     :'
@15,35 say 'Dpto:'
@15,58 say 'Prov:'
@16,02 say 'Domic.Legal   :'
@17,02 say 'Localidad     :'
@17,35 say 'Dpto:'
@17,58 say 'Prov:'
@18,02 say 'C.U.I.T.      :'
@19,02 say 'Recibo Pago   :'
@19,30 say 'Fecha Pago :'
@19,52 say 'Importe :'
@19,70 say 'A¤o:'
@20,02 say 'Fecha Inscripcion:'
do while wsigue='S'
   @23,01 say 'Indique apellidos y nombres del profesional o <ESC> para salir'
   @06,31 get wnombre pict '@!'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @07,50 to 10,65
      @08,51 say 'A=Argentina'
      @09,51 say 'E=Extranjero'
      @08,18 get wnacion pict '!'
      read
      @07,50 clear to 10,65
      @09,18 get wnacio
      read
      @10,50 to 14,59
      @11,51 say '1=D.N.I.'
      @12,51 say '2=L.E.  '
      @13,51 say '3=L.C.  '
      @10,18 get wdctipo pict '9' range 1, 3
      @10,20 get wdcnro  pict '99999999'
      read
      @10,50 clear to 14,59
      @11,18 get wcivil  pict '!'
      @11,41 get wdsexo  pict '!'
      read
      select 3
      use sptitu order titdesc
      @23,01 say 'Seleccione un titulo y oprima <ESC> '
      define window ptit from 09,30 to 20,63 title 'Titulos'
      activate window ptit
      brow fields titdesc nomodify in window ptit
      deactivate window ptit
      @23,01 clear to 23,78
      wtitulo=titulo
      wtitdesc=titdesc
      @12,18 say wtitulo pict 'XXX'
      @12,22 say wtitdesc
      select 3
      use spente 
      @23,01 say 'Seleccione una Entidad y oprima <ESC> '
      define window pent from 09,30 to 20,70 title 'Entidad Educativa'
      activate window pent
      brow fields codigo, nombre nomodify in window pent
      deactivate window pent
      @23,01 clear to 23,78
      wotorga=codigo
      wnoment=nombre
      @13,18 say wotorga pict '9999'
      @13,23 say wnoment
      @13,70 get wfecotor
      read
      @14,18 get wdomici pict '@!'
      read
      do locdptopro
      wnloc=wwnloc
      wndpto=wwndpto
      wnprov=wwnprov
      @15,18 say wnloc
      @15,41 say wndpto
      @15,63 say wnprov
      wdomleg=wdomici
      wnlocl=wnloc
      wndptol=wndpto
      wnprovl=wnprov
      @16,18 get wdomleg pict '@!'
      read
      if wdomleg<>wdomici
         do locdptopro
         wnlocl=wwnloc
         wndptol=wwndpto
         wnprovl=wwnprov
      endif   
      @17,18 say wnlocl
      @17,41 say wndptol
      @17,63 say wnprovl
      @18,18 get wcuit pict '99999999999'
      read
      @23,01 say 'Indique datos del pago de matriculaci¢n'
      @19,18 get wrecibo  pict '99999999'
      @19,43 get wpago
      @19,62 get wimporte pict '99999999.99'
      @19,75 get whabili  pict '9999'
      read
      @23,01 CLEAR TO 23,78
      whabil=whabili
      wop=1
      @23,22 get wop pict '@*H \<Habilitado;\<No Habilitado';
             size 1,1 
      read
      @23,01 CLEAR TO 23,78
      if wop=1
         @23,01 say 'Indique fecha de inscripcion'
         @20,21 get winscr
         read
         @23,01 clear to 23,78
         wcondic='1'
      else
         winscr={  /  /  }
         wcondic='1'   
      endif   
      wop=1
      @23,30 get wop pict '@*H \<Ingresar;\<No ingresar';
             size 1,1  
      read
      if wop = 1
         do ingresa
         wsigue='N'
      endif           
   else
      wsigue='N'
   endif   
enddo
close all
@07,01 clear to 23,78
return

procedure locdptopro
select 4
use splocal
select 5
use spdpto order dpto
*select 4
*set relation to dpto into spdpto
select 4
*use splocal
define window ploc from 09,30 to 20,63 title 'Localidades'
activate window ploc
brow fields nombre nomodify in window ploc
deactivate window ploc
wwnloc=d.nombre
wlocal=d.cod
select 5
define window ploc from 09,30 to 20,63 title 'Departamentos'
activate window ploc
brow fields nombre, dpto nomodify in window ploc
deactivate window ploc
wwndpto=e.nombre
wdpto=e.dpto
use
select 4
use spdpto
select 5
use spprov order prov
select 4
set relation to prov into spprov
wwnprov=e.nombre
wprov=e.prov
return

procedure ingresa
select 1
use soprof index soprof.idx, soprofn.idx
append blank
replace dctipo with wdctipo
replace dcnro  with wdcnro
replace nombre with wnombre
replace domici with wdomici
replace provin with wprov
replace dpto   with wdpto
replace locali with wlocal
replace nacio  with wnacio
replace cuit   with wcuit
replace nacion with wnacion
replace sexo   with wdsexo
replace estciv with wcivil
select 2
use somatri index somatri.idx, somatdo.idx 
append blank
replace numero  with wmatri
replace catego  with wcat
replace dctipo  with wdctipo
replace dcnro   with wdcnro
replace titulo  with wtitulo
replace otorga  with wotorga
replace inscr   with winscr
replace fectit  with wfecotor
replace fechab  with winscr
*replace feccert with 
replace pago    with wpago
replace recibo  with wrecibo
replace habili  with whabil
replace condic  with wcondic
*select 3
*use sppagos index sppagos
*wcpto='1'
*append blank
*replace matric  with wmatri
*replace catego  with wcat
*replace cpto    with wcpto
*replace fecha   with wpago
*replace importe with wimporte
*replace recibo  with wrecibo
return
