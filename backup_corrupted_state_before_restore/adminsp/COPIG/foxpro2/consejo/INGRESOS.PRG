procedure ingresos
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
wprovp=0
wdptop=0
wlocap=0
wwnloc=space(15)
wwndpto=space(15)
wwnprov=space(10)
wprovl=0
wdptol=0
wlocall=0
wwprov=0
wwdpto=0
wwlocal=0
wcuit=0
wtel=space(12)
wcelular=space(15)
wemail=space(40)
wgtel=space(12)
wgcel=space(15)
wgmail=space(40)
wfax=space(12)
wgfax=space(12)
wtipodom=0
wtipodol=0
wsigue='S'
whabili=0
whabil=0
wcpost=5500
wwpost=0
wcpos1=space(1)
wcpos2=space(3)
wwpos1=space(1)
wwpos2=space(3)
@08,02 say 'Nacionalidad  :'
@08,32 say 'Fecha Nacim.  :'
@09,02 say 'Dcto.Identidad:'
@09,32 say 'Estado Civil  :'
@09,60 say 'Sexo:'
@10,02 say 'Titulo        :'
@11,02 say 'Expedido por  :'
@11,60 say 'En fecha:'
@12,02 say 'Domicilio     :'
@12,64 say 'C.Post:'
@13,02 say 'Localidad     :'
@13,38 say 'Dpto:'
@13,64 say 'Prov:'
@14,02 say 'Tel‚fono      :'
@14,38 say 'Celular       :'
@14,64 say 'Fax:'
@15,02 say 'e-mail        :'
@15,64 say 'Tipo:'
@16,02 say 'Domicilio leg.:'
@16,64 say 'C.Post:'
@17,02 say 'Localidad leg :'
@17,38 say 'Dpto:'
@17,64 say 'Prov:'
@18,02 say 'Tel‚fono leg  :'
@18,38 say 'Celular leg   :'
@18,64 say 'Fax:'
@19,02 say 'e-mail leg    :'
@19,64 say 'Tipo:'
@20,02 say 'C.U.I.T.      :'
@21,02 say 'Recibo Pago   :'
@21,30 say 'Fecha Pago :'
@21,52 say 'Importe :'
@21,70 say 'A¤o:'
@22,02 say 'Fecha Inscripcion:'
do while wsigue='S'
   @23,01 say 'Indique apellidos y nombres del profesional o <ESC> para salir'
   @06,31 get wnombre pict '@!'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @05,62 to 08,78
      @06,63 say 'A=Argentina'
      @07,63 say 'E=Extranjero'
      @08,18 get wnacion pict '!'
      read
      @05,62 clear to 08,78
      @08,47 get wnacio
      read
      @03,62 to 08,78
      @04,63 say '1=D.N.I.'
      @05,63 say '2=L.E.  '
      @06,63 say '3=L.C.  '
      @09,18 get wdctipo pict '9' range 1, 3
      @09,20 get wdcnro  pict '99999999'
      read
      @03,62 clear to 08,78
      @09,48 get wcivil  pict '!'
      @09,71 get wdsexo  pict '!'
      read
      select 3
      use sptitu order titdesc
      @23,01 say 'Seleccione un titulo y oprima <ESC> '
      define window ptit from 09,20 to 20,78 title 'Titulos'
      activate window ptit
      brow fields titdesc nomodify in window ptit for tipadron<'6'
      deactivate window ptit
      @23,01 clear to 23,78
      wtitulo=titulo
      wtitdesc=titdesc
      @10,14 say wtitulo pict 'XXX'
      @10,17 say wtitdesc
      select 3
      use spente 
      @23,01 say 'Seleccione una Entidad y oprima <ESC> '
      define window pent from 09,30 to 20,70 title 'Entidad Educativa'
      activate window pent
      brow fields codigo, nombre nomodify in window pent for univer<2
      deactivate window pent
      @23,01 clear to 23,78
      wotorga=codigo
      wnoment=nombre
      @11,18 say wotorga pict '9999'
      @11,23 say wnoment
      @11,70 get wfecotor
      read
      @12,18 get wdomici pict '@!'
      read
      do locdptopro
      wnloc=wwnloc
      wndpto=wwndpto
      wnprov=wwnprov
      wlocap=wlocal
      wprovp=wprov
      wdptop=wdpto
      @13,18 say wlocap pict '999'
      @13,44 say wdptop pict '999'
      @13,69 say wprovp pict '999'
      @13,22 say wnloc
      @13,48 say wndpto
      @13,72 say wnprov PICT 'XXXXXXXXX'
      wdomleg=wdomici
      wnlocl=wnloc
      wndptol=wndpto
      wnprovl=wnprov
      @12,71 get wcpos1
      @12,72 get wcpost pict '9999'
      @12,76 get wcpos2
      read
      @14,18 get wtel
      @14,47 get wcelular
      @14,68 get wfax
      read
      @15,18 get wemail
      @15,70 get wtipodom pict '9'
      read
      @16,18 get wdomleg pict '@!'
      read
*      if wdomleg<>wdomici
		wlocal=0
		wdpto=0
		wprov=0
         do locdptopro
         wnlocl=wwnloc
         wndptol=wwndpto
         wnprovl=wwnprov
         wprovl=wprov
         wdptol=wdpto
         wlocall=wlocal
*      endif   
      @17,18 say wnlocl
      @17,44 say wndptol
      @17,69 say wnprovl pict 'XXXXXXXXX'
      @16,71 get wwpos1
      @16,72 get wwpost pict '9999'
      @16,76 get wwpos2
      read
      @18,18 get wgtel
      @18,47 get wgcel
      @18,68 get wgfax
      read
      @19,18 get wgmail
      @19,70 get wtipodol pict '9'
      read
      @20,18 get wcuit pict '99999999999'
      read
*      @23,01 say 'Indique datos del pago de matriculaci¢n'
*      @21,18 get wrecibo  pict '9999999'
*      @21,43 get wpago
*      @21,62 get wimporte pict '99999.99'
      @21,75 get whabili  pict '9999'
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
         @22,21 get winscr
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
use splocal ORDER cod
select 5
use spdpto order dpto
*select 4
*set relation to dpto into spdpto
select 4
*use splocal
define window ploc from 09,30 to 20,63 title 'Localidades'
activate window ploc
brow fields cod, nombre, cpost nomodify in window ploc
deactivate window ploc
wwnloc=d.nombre
wlocal=d.cod
select 5
define window ploc from 09,30 to 20,63 title 'Departamentos'
activate window ploc
brow fields nombre, dpto, cpost nomodify in window ploc
deactivate window ploc
wwndpto=e.nombre
wdpto=e.dpto
use
select 5
use spprov order prov
define window ploc from 09,30 to 20,63 title 'Provincias'
activate window ploc
brow fields nombre, prov nomodify in window ploc
deactivate window ploc
wwnprov=e.nombre
wprov=e.prov
return

procedure ingresa
select 1
use spprof index spprof.idx, spprofn
append blank
replace dctipo with wdctipo
replace dcnro  with wdcnro
replace nombre with wnombre
replace domici with wdomici
replace provin with wprovp
replace dpto   with wdptop
replace locali with wlocap
replace nacio  with wnacio
replace cuit   with wcuit
replace nacion with wnacion
replace sexo   with wdsexo
replace estciv with wcivil
replace telef  with wtel
replace celular with wcelular
replace spemail with wemail
replace spcpos  with wcpost
replace spcpos1 with wcpos1
replace spcpos2 with wcpos2
replace spfax   with wfax
replace spdomlg with wdomleg
replace spprovlg with wprovl
replace spdptolg with wdptol
replace sploclg  with wlocall
replace sptellg  with wgtel
replace spcpos1g with wwpos1
replace spcposlg with wwpost
replace spcpos2g with wwpos2
replace spemailg with wgmail
replace spfaxlg  with wgfax
replace spcellg  with wgcel
replace sptipolg with wtipodol
replace tipo     with wtipodom
replace estado   with '1'
select 2
use spmatri index spmatri, spmatdo 
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
*replace pago    with wpago
*replace recibo  with wrecibo
replace habili  with whabil
replace condic  with wcondic
*select 3
*use sppagos index sppagos
*go bottom
*wcpto='1'
*append blank
*replace matric  with wmatri
*replace catego  with wcat
*replace cpto    with wcpto
*replace fecha   with wpago
*replace importe with wimporte
*replace recibo  with wrecibo
return
