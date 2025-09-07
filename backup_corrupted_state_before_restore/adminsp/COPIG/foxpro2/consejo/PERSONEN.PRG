procedure personen  
parameter wkey
*actualizacion de datos personales entidades
@07,01 clear to 23,78
@09,01 say 'Dcto.de Identidad:'
@10,01 say 'Domicilio        :'
@11,01 say 'Localidad        :'
@12,01 say 'Dpto/Partido     :'
@13,01 say 'Provincia        :'
*@14,01 say 'Fecha de Nacim.  :'
@15,01 say 'Nro.C.U.I.T.     :'
*@16,01 say 'Sexo             :'
*@17,01 say 'Nacionalidad     :'
@18,01 say 'Telefono         :'
@19,01 say 'Fecha Estado     :'
@20,01 say 'Estado           :'
select 2
use splocal order cod
seek(str(a.locali,3))
if found()
   wlocalidad=nombre
else
   wlocalidad=space(15)
endif      
select 2
use spdpto order dpto
seek(str(a.dpto,3))
if found()
   wdepartamento=nombre
else
   wdepartamento=space(15)
endif
select 2
use spprov order prov
seek(a.provin)
if found()
   wprovincia=nombre
else
   wprovincia=space(15)
endif            
select 1
@09,21 say dctipo
@09,25 say dcnro
@10,21 say domici
@11,21 say locali
@11,25 say wlocalidad
@12,21 say dpto
@12,25 say wdepartamento
@13,22 say provin pict '99'
@13,25 say wprovincia
*@14,21 say nacio
@15,21 say cuit
*@16,21 say sexo
*@17,21 say nacion
@18,21 say telef
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
endcase            
wsigue='S'
do while wsigue='S'   
wop=0
@23,20 get wop picture '@*H \<Salir;\<Modificar;<F1> Ayuda';
           size 1,1 
read
@23,01 clear to 23,78
if wop=1
   @07,01 clear to 23,78
   wsigue='N'
else
   if wop=2
      do modie
      wsigue='N'
   else
      do spay02
   endif      
endif
enddo
@07,01 clear to 23,78   
return

procedure modie
wdctipo=dctipo
wdcnro=dcnro
wdomici=domici
wlocali=locali
wdpto=dpto
wprovin=provin
*wnacio=nacio
wcuit=cuit
*wsexo=sexo
*wnacion=nacion
wtelef=telef
wfallec=fallec
westado=estado
*@23,01 say 'Seleccione un tipo de dcto y oprima <ENTER>' color w/b*
*@08,49 to 13,58
*@09,50 get wdctipo pict '@* \<D.N.I.;\<L.E.;\<L.C.;\<C.I.';
*           size 1,1
*read
@23,01 clear to 23,78
@08,49 clear to 13,58
@09,21 say wdctipo pict '9'
*@09,25 get wdcnro
@10,21 get wdomici
@11,21 get wlocali pict '999'
read
if wlocali<>locali
   select 3
   use splocal order cod
   select 4
   use spdpto order  dpto
   select 3
   set relation to dpto into spdpto
   @23,01 say 'Seleccione una localidad y oprima <ESC> para salir' color w/b*
   define window plocal from 08,49 to 22,78 title 'LOCALIDADES'
   activate window plocal
   brow fields cod, nombre nomodify in window plocal
   deactivate window plocal
   wlocali=cod
   wnomlocali=nombre
   @23,01 clear to 23,78
   @11,21 say wlocali pict '999'
   @11,25 say wnomlocali
   select 4
   wdpto=d.dpto
   wdptonom=d.nombre
   @12,21 say wdpto pict '999'
   @12,25 say wdptonom
   select 2
   *use spprov order PROV
   @23,01 say 'Seleccione una provincia y oprima <ESC> para salir' color w/b*
   define window pprovi from 08,49 to 22,78 title 'PROVINCIAS'
   activate window pprovi
   brow fields prov, nombre nomodify in window pprovi
   deactivate window pprovi
   @23,01 clear to 23,78
   wprovin=prov
   wnomprov=nombre
   @13,21 say wprovin pict '99'
   @13,25 say wnomprov
endif   
*@14,21 get wnacio
@15,21 get wcuit pict '99999999999'
*@16,21 get wsexo
*@17,21 get wnacion
@18,21 get wtelef
@19,21 get wfallec
read
westado=space(1)
westad=space(20)
@15,55 get westado picture '@*RTV \<Activa;\<Comunic¢ Inactividad;\<F        ;\<Suspendida;' size 1,1
read
DO CASE
   CASE westado='A'
        westad='Activa'
   case westado='C'
        westad='Comunic¢ Inactividad'
   case westado='F'
        westad='F        '
   case westado='S'
        westad='Suspendida'   
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
*replace nacio  with wnacio
replace cuit   with wcuit
*replace sexo   with wsexo
*replace nacion with wnacion
replace telef  with wtelef
replace fallec with wfallec
replace estado with westado
return

