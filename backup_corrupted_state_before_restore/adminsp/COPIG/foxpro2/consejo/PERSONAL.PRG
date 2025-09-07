procedure personal  
parameter wkey
*actualizacion de datos personales
@07,01 clear to 23,78
@08,02 say 'Nacionalidad   :'
@08,32 say 'Fecha de Nacim.  :'
@09,02 say 'Dcto. Identidad:'
@09,32 say 'Estado Civil     :'
@09,60 say 'Sexo:'
@12,02 say 'Domicilio      :'
@13,02 say 'Localidad      :'
@13,38 say 'Dpto:'
@13,64 say 'Prov:'
@12,64 say 'C.Post:'
@14,02 say 'Tel‚fono       :'
@14,38 say 'Celular :'
@14,64 say 'Fax:'
@15,02 say 'e-mail         :'
@15,64 SAY 'Est.Domic.:'
@16,02 say 'Domicilio Leg. :'
@17,02 say 'Localidad Leg. :'
@17,38 say 'Dpto:'
@17,64 say 'Prov:'
@16,64 say 'C.Post:'
@18,02 say 'Tel‚fono       :'
@18,38 say 'Celular :'
@18,64 say 'Fax:'
@19,02 say 'e-mail Leg.    :'
@19,64 SAY 'Est.Domic.:'
@20,02 say 'Nro.C.U.I.T.   :'
@21,02 say 'Fecha Estado   :'
@21,40 say 'Estado :'
wprovp=a.provin
wlocap=a.locali
wdptop=a.dpto
select 4
use splocal order cod
seek(str(a.locali,3))
if found()
   wlocalidad=nombre
else
   wlocalidad=space(15)
endif      
select 4
use spdpto order dpto
seek(str(a.dpto,3))
if found()
   wdepartamento=nombre
else
   wdepartamento=space(15)
endif
select 4
use spprov order prov
seek(a.provin)
if found()
   wprovincia=nombre
else
   wprovincia=space(15)
endif
wprovl=a.spprovlg
wlocall=a.sploclg
wdptol=a.spdptolg            
select 4
use splocal order cod
seek(str(a.sploclg,3))
if found()
   wlocallg=nombre
else
   wlocallg=space(15)
endif      
select 4
use spdpto order dpto
seek(str(a.spdptolg,3))
if found()
   wdepartlg=nombre
else
   wdepartlg=space(15)
endif
select 4
use spprov order prov
seek(str(a.spprovlg,3))
if found()
   wprovinlg=nombre
else
   wprovinlg=space(15)
endif            
select 1
@09,18 say dctipo
@09,20 say dcnro
@12,18 say domici
@13,18 say locali pict '999'
@13,22 say wlocalidad pict 'XXXXXXXXXXXXXXX'
@13,44 say dpto pict '999'
@13,48 say wdepartamento
@13,69 say provin pict '99'
@13,71 say wprovincia pict 'XXXXXXXXX'
@12,72 say spcpos pict '9999'
@14,18 say telef
@14,47 say celular
@14,68 say spfax
@15,18 say spemail
@08,47 say nacio
@20,18 say cuit
@09,71 say sexo
@08,18 say nacion
@15,75 say tipo pict '9'
@16,18 say spdomlg
@17,18 say sploclg pict '999'
@17,22 say wlocallg
@17,44 say spdptolg pict '999'
@17,48 say wdepartlg
@17,69 say spprovlg pict '99'
@17,71 say wprovinlg pict 'XXXXXXXXX'
@16,72 say spcposlg pict '9999'
@18,18 say sptellg
@18,47 say spcellg
@18,68 say spfaxlg
@19,18 say spemailg
@19,75 say sptipolg pict '9'
@21,21 say fallec
westadi=0
westadu=space(1)
do case
   case estado='1'
      @21,56 say 'Activo'
      westadi= 1
   case estado='2'
      @21,56 say 'Carnet Dep.'
      westadi= 2
   case estado='3'
      @21,56 say 'Fallecido'
      westadi=3
   case estado='4'
      @21,56 say 'Baja/Reinscripcion'
      westadi=4
   case estado = '5'
      @21,56 say 'Baja Matr¡cula'
      westadi=5
   case estado = '6'
      @21,56 say 'Comunica Inactividad'
      westadi=6   
   case estado = ' '
      @21,56 say '              '
      westadi=7      
endcase            
wsigue='S'
do while wsigue='S'   
wop=1
@23,20 get wop picture '@*H \<Salir;\<Modificar';
           size 1,1 
read
@23,01 clear to 23,78
if wop=1
   @07,01 clear to 23,78
   wsigue='N'
else
   if wop=2
      do modi
      wsigue='N'
   else
      if wop=3
         do otrosd
         wsigue='N'
      else
      	if wop=4
         do spay02
        endif 
         wsigue='N'
*        endif 
      endif      
   endif      
endif
enddo
@07,01 clear to 23,78   
return

procedure modi
select 13
use modiprof
go bottom
	append blank
	replace dctipo   with a.dctipo
	replace dcnro    with a.dcnro
	replace nombre   with a.nombre
	replace domici   with a.domici
	replace provin   with a.provin
	replace dpto     with a.dpto  
	replace locali   with a.locali
	replace nacio    with a.nacio
	replace cuit     with a.cuit  
	replace sexo     with a.sexo  
	replace estciv   with a.estciv
	replace nacion   with a.nacion
	replace telef    with a.telef 
	replace tipo     with a.tipo 
	replace fallec   with a.fallec
	replace estado   with a.estado
	replace domleg   with a.domleg
	replace celular  with a.celular
	replace numasoc  with a.numasoc
	replace feasoc   with a.feasoc
	replace spcpos   with a.spcpos
	replace spemail  with a.spemail
	replace spcpos1  with a.spcpos1
	replace spcpos2  with a.spcpos2
	replace spfax    with a.spfax 
	replace spdomlg  with a.spdomlg
	replace spprovlg with a.spprovlg
	replace spdptolg with a.spdptolg
	replace sploclg  with a.sploclg
	replace sptellg  with a.sptellg
	replace spcpos1g with a.spcpos1g
	replace spcposlg with a.spcposlg
	replace spcpos2g with a.spcpos2g
	replace spemailg with a.spemailg
	replace spfaxlg  with a.spfaxlg
	replace spcellg  with a.spcellg
	replace sptipolg with a.sptipolg
	replace spmfecha with date()
	replace spmcodm  with 1
	replace spmoprdr with space(10)
	use
select 1	
wdctipo=dctipo
wdcnro=dcnro
wdomici=domici
wlocali=locali
wdpto=dpto
wprovin=provin
wdcpost=spcpos
wnacio=nacio
wcuit=cuit
wsexo=sexo
wnacion=nacion
wtelef=telef
wemail=spemail
wcelular=celular
wfallec=fallec
wtipo=tipo
wdscpos1=spcpos1
wdscpos2=spcpos2
wdfax=spfax
wdomleg=spdomlg
wdprovl=spprovlg
wddptol=spdptolg
wdlocl=sploclg
wtelg=sptellg
wcpos1g=spcpos1g
wcposlg=spcposlg
wcpos2g=spcpos2g
wemailg=spemailg
wfaxlg=spfaxlg
wcellg=spcellg
wtipolg=sptipolg
*westadi=estado
@21,48 say westadi PICT '9'
@21,52 say estado
*@23,01 say 'Seleccione un tipo de dcto y oprima <ENTER>' color w/b*
*@08,49 to 13,58
*@09,50 get wdctipo pict '@* \<D.N.I.;\<L.E.;\<L.C.;\<C.I.';
*           size 1,1
*read
@23,01 clear to 23,78
*@08,49 clear to 13,58
@08,18 get wnacion
@08,47 get wnacio
@09,72 get wsexo
@09,18 say wdctipo pict '9'
@09,20 say wdcnro  pict '99999999' 
read
@12,18 get wdomici
@13,18 get wlocali pict '999'
read
if wlocali<>a.locali
   select 4
   use splocal order cod
*  select 5
*  use spdpto order  dpto
*  select 4
*   set relation to dpto into spdpto
   @23,01 say 'Seleccione una localidad y oprima <ESC> para salir' color w/b*
   define window plocal from 08,49 to 22,78 title 'LOCALIDADES'
   activate window plocal
   brow fields cod, nombre nomodify in window plocal
   deactivate window plocal
   wlocali=cod
   wnomlocali=nombre
   @23,01 clear to 23,78
   @13,18 say wlocali pict '999'
   @13,22 say wnomlocali
endif
@13,44 get wdpto pict '999'
read
if wdpto<>a.dpto   
   select 5
   use spdpto order dpto
*   wdpto=d.dpto
   @23,01 say 'Seleccione un departamento y oprima <ESC> para salir' color w/b*
   define window plocal from 08,49 to 22,78 title 'DEPARTAMENTOS'
   activate window plocal
   brow fields DPTO, nombre nomodify in window plocal
   deactivate window plocal
   wdpto=dpto
   wdptonom=nombre
   @23,01 clear to 23,78
*   wdptonom=d.nombre
   @13,44 say wdpto pict '999'
   @13,48 say wdptonom pict 'XXXXXXXXXXXXXXX'
endif
@13,69 get wprovin pict '99'
read
if wprovin<>a.provin   
   select 4
   use spprov order prov
   @23,01 say 'Seleccione una provincia y oprima <ESC> para salir' color w/b*
   define window pprovi from 08,49 to 22,78 title 'PROVINCIAS'
   activate window pprovi
   brow fields prov, nombre nomodify in window pprovi
   deactivate window pprovi
   @23,01 clear to 23,78
   wprovin=prov
   wnomprov=nombre
   @13,69 say wprovin pict '99'
   @13,72 say wnomprov pict 'XXXXXXXX'
endif
@12,72 get wdcpost pict '9999'   
@14,18 get wtelef
@14,48 get wcelular
@14,68 get wdfax
@15,18 get wemail
@15,72 get wtipo pict '9'
@23,40 say 'Tipo Dom: 0=Normal 1=No Actualizado'
read
@16,18 get wdomleg
@17,18 get wdlocl pict '999'
read
if wdlocl<>a.sploclg
   select 4
   use splocal order cod
*  select 5
*  use spdpto order  dpto
*  select 4
*   set relation to dpto into spdpto
   @23,01 say 'Seleccione una localidad y oprima <ESC> para salir' color w/b*
   define window plocal from 08,49 to 22,78 title 'LOCALIDADES'
   activate window plocal
   brow fields cod, nombre nomodify in window plocal
   deactivate window plocal
   wdlocl=cod
   wlocallg=nombre
   @23,01 clear to 23,78
   @17,18 say wdlocl pict '999'
   @17,22 say wlocallg
endif
@17,44 get wddptol pict '999'
read
if wddptol<>a.spdptolg   
   select 5
   use spdpto order dpto
*   wdpto=d.dpto
   @23,01 say 'Seleccione un departamento y oprima <ESC> para salir' color w/b*
   define window plocal from 08,49 to 22,78 title 'DEPARTAMENTOS'
   activate window plocal
   brow fields DPTO, nombre nomodify in window plocal
   deactivate window plocal
   wddptol=dpto
   wdepartlg=nombre
   @23,01 clear to 23,78
*   wdptonom=d.nombre
   @17,44 say wddptol pict '999'
   @17,48 say wdepartlg pict 'XXXXXXXXXXXXXXX'
endif
@17,69 get wdprovl pict '99'
	read
if wdprovl<>a.spprovlg   
   select 4
   use spprov order prov
   @23,01 say 'Seleccione una provincia y oprima <ESC> para salir' color w/b*
   define window pprovi from 08,49 to 22,78 title 'PROVINCIAS'
   activate window pprovi
   brow fields prov, nombre nomodify in window pprovi
   deactivate window pprovi
   @23,01 clear to 23,78
   wdprovl=prov
   wprovinlg=nombre
   @17,69 say wdprovl pict '99'
   @17,72 say wprovinlg pict 'XXXXXXXX'
endif
@16,72 get wcposlg pict '9999'   
@18,18 get wtelg
@18,48 get wcellg
@18,68 get wfaxlg
@19,18 get wemailg
@19,72 get wtipolg pict '9'
@23,40 say 'Tipo Dom: 0=Normal 1=No Actualizado'
read
@20,18 get wcuit pict '99999999999'
@21,18 get wfallec
read
*westado=space(1)
westad=space(10)
@21,40 clear to 21,78
@13,50 get westadi picture '@*RTV \<Activo;\<Carnet Dep.;\<Fallecido;\<Baja/Reinsc;\<Baja;Comunica \<Inactividad;\< ' size 1,1
read
DO CASE
   CASE westadi=1
        westad='Activo'
        westadu='1'
   case westadi=2
        westad='Carnet Dep.'
        westadu='2'
   case westadi=3
        westad='Fallecido'
        westadu='3'
   case westadi=4
        westad='Baja/Reinscripcion'
        westadu='4'
   case westadi=5
        westad='Baja Matr¡cula'
        westadu='5'
   case westadi=6
        westad='Comunica Inactividad'
        westadu='6'     
   case westadi=7
        westad='              '
        westadu=' '             
endcase        
             
@21,56 say westad
select 1
read
*replace dctipo with wdctipo
*replace dcnro  with wdcnro
replace domici with wdomici
replace locali with wlocali
replace dpto   with wdpto
replace provin with wprovin
replace spcpos with wdcpost
replace nacio  with wnacio
replace cuit   with wcuit
replace sexo   with wsexo
replace nacion with wnacion
replace telef  with wtelef
replace tipo   with wtipo
replace fallec with wfallec
replace estado with westadu
replace celular with wcelular
replace spemail with wemail
replace spdomlg with wdomleg
replace spcpos1 with wdscpos1
replace spcpos2 with wdscpos2
replace spfax   with wdfax
replace spprovlg with wdprovl
replace spdptolg with wddptol
replace sploclg  with wdlocl
replace sptellg  with wtelg
replace spcpos1g with wcpos1g
replace spcposlg with wcposlg
replace spcpos2g with wcpos2g
replace spemailg with wemailg
replace spfaxlg  with wfaxlg
replace spcellg  with wcellg
replace sptipolg with wtipolg

select 13
use modiprof
go bottom
append blank
replace dctipo with a.dctipo
replace dcnro  with a.dcnro
replace nombre with a.nombre
replace estciv with a.estciv
replace numasoc with a.numasoc
replace feasoc  with a.feasoc
replace domleg  with a.domleg
replace domici with wdomici
replace locali with wlocali
replace dpto   with wdpto
replace provin with wprovin
replace spcpos with wdcpost
replace nacio  with wnacio
replace cuit   with wcuit
replace sexo   with wsexo
replace nacion with wnacion
replace telef  with wtelef
replace tipo   with wtipo
replace fallec with wfallec
replace estado with westadu
replace celular with wcelular
replace spemail with wemail
replace spdomlg with wdomleg
replace spcpos1 with wdscpos1
replace spcpos2 with wdscpos2
replace spfax   with wdfax
replace spprovlg with wdprovl
replace spdptolg with wddptol
replace sploclg  with wdlocl
replace sptellg  with wtelg
replace spcpos1g with wcpos1g
replace spcposlg with wcposlg
replace spcpos2g with wcpos2g
replace spemailg with wemailg
replace spfaxlg  with wfaxlg
replace spcellg  with wcellg
replace sptipolg with wtipolg
replace spmfecha with date()
replace spmcodm  with 2
replace spmoprdr with space(10)
use
select 1
return

procedure otrosd
wotro=1
@17,54 to 23,77
@17,60 say 'Otros datos'
@18,55 get wotro pict '@* \<Pagos;\<Sanciones;\<Cursos de Post.Grado;\<Salir';
       size 1,1 
read
if wotro = 1
   do pagos with wkey
else
   if wotro = 2
      do buscasan with wmatri, wcateg
   else
     if wotro = 3
        do cursos WITH WKEY
     endif
  endif
endif                  
return
