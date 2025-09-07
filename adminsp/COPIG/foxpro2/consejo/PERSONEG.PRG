procedure personeg  
parameter wkey
*actualizacion de datos personales empresas
@08,01 clear to 23,78
@08,01 say 'Rubro            :' 
@09,01 say 'Dcto.de Identidad:'
@10,01 say 'Domicilio        :'
@11,01 say 'Localidad        :'
@11,35 say 'Dpto:'
@11,58 say 'Prov:'
@10,69 say 'No act=1:'
@12,01 say 'Tel‚fono         :'
@12,35 say 'Fax :'
@12,55 say 'Celular:'
@13,01 say 'Email            :'
@13,59 say 'C.Post.:'
@14,01 say 'Domicilio Legal  :'
@14,69 say 'No Act=1:'
@15,01 say 'Localid. Legal   :'
@15,35 say 'Dpto:'
@15,58 say 'Prov:'
@16,01 say 'Tel‚fono Legal   :'
@16,35 say 'Fax :'
@16,55 say 'Celular:'
@17,01 say 'Email legal      :'
@17,59 say 'C.Post.:'
@18,01 say 'Nro.C.U.I.T.     :'
@19,01 say 'Fecha Estado     :'
@20,01 say 'Estado           :'
select 3
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
select 5
use spprov order prov
seek(a.provin)
if found()
   wprovincia=nombre
else
   wprovincia=space(15)
endif            
select 1
@09,18 say dctipo
@09,20 say dcnro
@10,18 say domici
@11,14 say locali
@11,18 say wlocalidad
@11,40 say dpto
@11,43 say wdepartamento
@11,63 say provin pict '99'
@11,65 say wprovincia
@10,78 say tipo pict '9'
@13,68 say emcpost pict '9999'
@12,18 say telef
@12,41 say efax
@12,63 say ecelular
@13,18 say eemail
@14,18 say edomlg
@14,78 say etipolg
@15,18 say elocalg
@15,41 say edptolg
@15,63 say eprovlg
@16,18 say etellg
@16,41 say efaxlg
@16,63 say ecellg
@17,18 say emailg
@17,68 say ecposlg
@18,18 say cuit
@19,21 say fallec
do case
   case estado='A'
      @20,21 say 'Activa'
   case estado='C'
      @20,21 say 'Comunic¢ Inactividad'
   case estado='F'
      @20,21 say 'Baja por Consejo'
   case estado='S'
      @20,21 say 'Suspendida'
   case estado='B'
   	  @20,21 say 'Baja solic.x Empresa'   
endcase            
wsigue='S'
do while wsigue='S'   
wop=0
@23,20 get wop picture '@*H \<Salir;\<Modificar;\<Otros Datos;<F1> Ayuda';
           size 1,1 
read
@23,01 clear to 23,78
if wop=1
   @08,01 clear to 23,78
   wsigue='N'
else
   if wop=2
      do modie
      wsigue='N'
   else
      if wop=3
         do otrosd
         wsigue='N'
      else
         do spay02
      endif      
   endif      
endif
enddo
@08,01 clear to 23,78   
return

procedure modie
wdctipo=dctipo
wdcnro=dcnro
wdomici=domici
wlocali=locali
wdpto=dpto
wprovin=provin
wcpost=emcpost
wcuit=cuit
wtipo=tipo
wtelef=telef
wefax=efax
wecelular=ecelular
weemail=eemail
wfallec=fallec
westado=estado
wdpost1=emcpos1
wdpost2=emcpos2
wdrubro=erubro
wdomleg=edomleg
wprovlg=eprovlg
wdptolg=edptolg
wlocalg=elocalg
wtellg=etellg
wcposlg=ecposlg
wemailg=eemailg
wfaxlg=efaxlg
wtipolg=etipolg
wcelulg=ecellg
@23,01 clear to 23,78
@08,18 get wdrubro
@10,18 get wdomici
@11,14 get wlocali pict '999'
read
if wlocali<>locali
   select 3
   use splocal order cod
   @23,01 say 'Seleccione una localidad y oprima <ESC> para salir' color w/b*
   define window plocal from 08,59 to 22,78 title 'LOCALIDADES'
   activate window plocal
   brow fields cod, nombre nomodify in window plocal
   deactivate window plocal
   wlocali=cod
   wnomlocali=nombre
   if cpost<>0
   	  wcpost=cpost
   endif
   @23,01 clear to 23,78
   @11,14 say wlocali pict '999'
   @11,18 say wnomlocali
   @13,68 say wcpost
endif   
@11,40 get wdpto pict '999'
read
if wdpto<>dpto
   select 4
   use spdpto order dpto
   @23,01 say 'Seleccione un Departamento y oprima ESC para salir' color w/b*
   define window pdpto from 08,59 to 22,78 title 'DEPARTAMENTOS'
   activate window pdpto
   brow fields dpto, nombre nomodify in window pdpto
   deactivate window pdpto
   wdpto=d.dpto
   wdptonom=d.nombre
   if cpost<>0
   	 if wcpost=0
   	 	wcpost=cpost
   	 endif
   endif
   @11,40 say wdpto pict '999'
   @11,43 say wdptonom
   @13,68 say wcpost
endif   
   select 5
   use spprov order PROV
   @23,01 say 'Seleccione una provincia y oprima <ESC> para salir' color w/b*
   define window pprovi from 08,59 to 22,78 title 'PROVINCIAS'
   activate window pprovi
   brow fields prov, nombre nomodify in window pprovi
   deactivate window pprovi
   @23,01 clear to 23,78
   wprovin=prov
   wnomprov=nombre
   @11,63 say wprovin pict '99'
   @11,65 say wnomprov
   @13,68 say wcpost
@10,78 get wtipo pict '9'   
@12,18 get wtelef
@12,41 get wefax
@12,63 get wecelular
@13,18 get weemail
@13,68 get wcpost pict '9999'
@10,18 get wdomici
@11,14 get wlocali pict '999'
read
if wlocali<>locali
   select 3
   use splocal order cod
   @23,01 say 'Seleccione una localidad y oprima <ESC> para salir' color w/b*
   define window plocal from 08,59 to 22,78 title 'LOCALIDADES'
   activate window plocal
   brow fields cod, nombre nomodify in window plocal
   deactivate window plocal
   wlocali=cod
   wnomlocali=nombre
   if cpost<>0
   	  wcpost=cpost
   endif
   @23,01 clear to 23,78
   @11,14 say wlocali pict '999'
   @11,18 say wnomlocali
   @13,68 say wcpost
endif   
@11,40 get wdpto pict '999'
read
if wdpto<>dpto
   select 4
   use spdpto order dpto
   @23,01 say 'Seleccione un Departamento y oprima ESC para salir' color w/b*
   define window pdpto from 08,59 to 22,78 title 'DEPARTAMENTOS'
   activate window pdpto
   brow fields dpto, nombre nomodify in window pdpto
   deactivate window pdpto
   wdpto=d.dpto
   wdptonom=d.nombre
   if cpost<>0
   	 if wcpost=0
   	 	wcpost=cpost
   	 endif
   endif
   @11,40 say wdpto pict '999'
   @11,43 say wdptonom
   @13,68 say wcpost
endif   
   select 5
   use spprov order PROV
   @23,01 say 'Seleccione una provincia y oprima <ESC> para salir' color w/b*
   define window pprovi from 08,59 to 22,78 title 'PROVINCIAS'
   activate window pprovi
   brow fields prov, nombre nomodify in window pprovi
   deactivate window pprovi
   @23,01 clear to 23,78
   wprovin=prov
   wnomprov=nombre
   @11,63 say wprovin pict '99'
   @11,65 say wnomprov
   @13,68 say wcpost
@10,78 get wtipo pict '9'   
@12,18 get wtelef
@12,41 get wefax
@12,63 get wecelular
@13,18 get weemail
@13,68 get wcpost pict '9999'
@15,21 get wcuit pict '99999999999'
@19,21 get wfallec
read
westado=a.estado
westad=space(20)
@15,55 get westado picture '@*RTV \<Activa;\<Comunic¢ Inactividad;\<F(Baja x Consejo);\<Suspendida;\<Baja solic.xEmpresa' size 1,1
read
DO CASE
   CASE westado='A'
        westad='Activa'
   case westado='C'
        westad='Comunic¢ Inactividad'
   case westado='F'
        westad='Baja por Consejo'
   case westado='S'
        westad='Suspendida'
   case westado='B'
   	    westad='Baja solic.Empresa'        
endcase        
             
@20,21 say westad
select 1
read
*replace dctipo with wdctipo
*replace dcnro  with wdcnro
replace domici with wdomici
replace locali with wlocali
replace dpto   with wdpto
replace provin with wprovin
replace emcpost with wcpost
replace cuit   with wcuit
*replace sexo   with wsexo
*replace nacion with wnacion
replace telef  with wtelef
replace fallec with wfallec
replace estado with westado
replace tipo   with wtipo
replace eemail with weemail
replace efax   with wefax
replace ecelular with wecelular 
return

procedure otrosd
wotro=1
@17,54 to 23,77
@17,60 say 'Otros datos'
@18,55 get wotro pict '@* \<Pagos;\<Sanciones;\<Rep.Tecnicos;\<Salir';
       size 1,1 
read
if wotro = 1
   do pagos with wkey
else
   if wotro = 2
      do buscasan with wmatri, wcateg
   else
     if wotro = 3
        do buscart
     endif
  endif
endif                  
return
