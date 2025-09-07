procedure ingresen
parameters wmatri, wcat
* Ingreso de nuevas empresas
@08,01 clear to 23,78
wnombre=space(55)
winscr={  /  /  }
wpago=DATE()
wimporte=0
wrecibo=0
wdctipo=0
wdcnro=0
wnoment=space(30)
wdomici=space(50)
wdomleg=space(50)
wecelular=space(15)
wecelulg=space(15)
wefax=space(12)
weemail=space(40)
wwnloc=space(15)
wwndpto=space(15)
wgnloc=space(15)
wgndpto=space(15)
wwnprov=space(15)
wgnprov=space(15)
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
wtelg=space(12)
wfaxg=space(12)
wemailg=space(40)
wcpos1=space(1)
wcpos2=space(3)
wcpost=0
wcpostg=0
wrubro=space(4)
wsigue='S'
whabili=0
whabil=0
@08,02 say 'Rubro         :'
@09,02 say 'Dcto.Identidad:'
@10,02 say 'Domicilio     :'
@11,02 say 'Localidad     :'
@11,35 say 'Dpto:'
@11,58 say 'Prov:'
@12,02 say 'Telefono      :'
@12,35 say 'Fax:'
@12,55 say 'Celular:'
@13,02 say 'Email         :'
@13,59 say 'C.Post.:'
@14,02 say 'Domic.Legal   :'
@15,02 say 'Localidad     :'
@15,35 say 'Dpto:'
@15,58 say 'Prov:'
@16,02 say 'Tel‚fono.Legal:'
@16,35 say 'Fax.:'
@16,58 say 'Prov:'
@17,02 say 'Email.Legal   :'
@17,59 say 'C.Post.:'
@18,02 say 'C.U.I.T.      :'
@19,02 say 'Recibo Pago   :'
@19,27 say 'Fecha:'
@19,47 say 'Importe :'
@19,68 say 'A¤o:'
@20,02 say 'Fecha Inscripcion:'
do while wsigue='S'
   @23,01 say 'Indique Razon Social  o <ESC> para salir'
   @07,20 get wnombre pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @21,10 to 21,79
      @21,10 say '1=D.N.I.'
      @21,20 say '2=L.E.  '
      @21,30 say '3=L.C.  '
      @21,40 say '8=Corresp a cuit'
      @09,18 get wdctipo pict '9' range 1, 8
      @09,20 get wdcnro  pict '99999999'
      read
      if wdcnro <> 0
     	 @21,01 clear to 23,79
     	 @10,18 get wdomici pict '@!'
     	 read
     	 do locdptopro
     	 wnloc=wwnloc
     	 wndpto=wwndpto
     	 wnprov=wwnprov
     	 wcpost=wbpost
     	 @11,18 say wnloc
     	 @11,41 say wndpto
     	 @11,63 say wnprov
     	 @13,68 say wcpost
     	 @13,68 get wcpost pict '9999'
     	 read
     	 wdomleg=wdomici
     	 wnlocl=wnloc
     	 wndptol=wndpto
     	 wnprovl=wnprov
     	 wcpostg=wcpost
         wtelef=space(12)
     	 @12,18 get wtelef
     	 @12,41 get wefax
     	 @12,63 get wecelular
     	 @13,18 get weemail
     	 read
     	 @14,18 get wdomleg pict '@!'
     	 read
     	 if wdomleg<>wdomici
        	 do locdptopro
        	 wnlocl=wwnloc
        	 wndptol=wwndpto
        	 wnprovl=wwnprov
        	 wcpostg=wbpost
     	 endif   
     	 @15,18 say wnlocl
     	 @15,41 say wndptol
     	 @15,63 say wnprovl
     	 @17,68 say wcpostg
         wteleg=space(12)
     	 @16,18 get wteleg
     	 @16,41 get wefaxg
     	 @16,63 get wecelulg
     	 @17,18 get weemailg
     	 read
     	 @18,18 get wcuit pict '99999999999'
     	 @23,01 say 'Indique datos del pago de matriculaci¢n'
     	 @19,18 get wrecibo  pict '99999999'
     	 @19,34 get wpago
     	 @19,56 get wimporte pict '9999999.99'
     	 @19,74 get whabili  pict '9999'
     	 read
     	 @23,01 CLEAR TO 23,78
     	 whabil=whabili
     	 wop=1
     	 @23,22 get wop pict '@*H \<Habilitada;\<No Habilitada';
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
       	 	 winscr={  /  /    }
        	 wcondic='0'   
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
         @23,01 say 'mal numero documento'
      endif              
   else
      wsigue='N'
   endif   
enddo
close all
@07,01 clear to 23,78
return

procedure locdptopro
wbpost=0
select 4
use splocal
select 5
use spdpto order dpto
select 4
define window ploc from 12,30 to 22,63 title 'Localidades'
activate window ploc
brow fields nombre nomodify in window ploc
deactivate window ploc
wwnloc=d.nombre
wlocal=d.cod
wbpost=d.cpost
select 5
define window pdpto from 12,30 to 22,70 title 'Departamentos'
activate window pdpto
brow fields dpto, nombre nomodify in window pdpto
deactivate window pdpto
wwndpto=e.nombre
wdpto=e.dpto
if wbpost=0
	wbpost=e.cpost
endif
select 6
use spprov order prov
define window ppcia from 12,30 to 22,70 title 'Provincias'
activate window ppcia
brow fields prov, nombre nomodify in window ppcia
deactivate window ppcia
wwnprov=f.nombre
wprov=f.prov
if wbpost=0
	wbpost=f.cpost
endif
return

procedure ingresa
select 1
use spprofe index spprofe.idx, spprofen
append blank
replace dctipo with wdctipo
replace dcnro  with wdcnro
replace nombre with wnombre
replace domici with wdomici
replace provin with wprov
replace dpto   with wdpto
replace locali with wlocal
replace cuit   with wcuit
replace telef  with wtelef
replace eemail with weemail
replace ecelular with wecelular
replace efax     with wefax
replace estado   with wcondic
replace emcpost  with wcpost
replace erubro   with wrubro
replace edomlg   with wdomleg
replace eprovlg  with wcnprov
replace edptolg  with wcndpto
replace elocalg  with wcnloc
replace etellg   with wtelg
replace ecposlg  with wcpostg
replace eemailg  with wemailg
replace efaxlg   with wfaxg
replace ecellg   with wcelulg
select 2
use spmatrie index spmatrie, spmatdoe 
append blank
replace numero  with wmatri
replace catego  with wcat
replace dctipo  with wdctipo
replace dcnro   with wdcnro
replace inscr   with winscr
replace fechab  with winscr
replace pago    with wpago
replace recibo  with wrecibo
replace habili  with whabil
replace condic  with wcondic
select 3
use sppagos index sppagos
append blank
replace matric  with wmatri
replace catego  with wcat
replace fecha   with wpago
replace importe with wimporte
replace recibo  with wrecibo
replace anhabil with whabil
replace cpto    with "1"
return
