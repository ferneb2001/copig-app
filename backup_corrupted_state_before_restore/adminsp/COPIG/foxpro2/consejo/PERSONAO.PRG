procedure personao  
parameter wkey
*actualizacion de datos personales de profesionales no inscriptos en Consejo
@07,01 clear to 23,78
@09,01 say 'Dcto.de Identidad:'
@10,01 say 'Domicilio        :'
@11,01 say 'Localidad        :'
@12,01 say 'Dpto/Partido     :'
@13,01 say 'Provincia        :'
@14,01 say 'Fecha de Nacim.  :'
@15,01 say 'Nro.C.U.I.T.     :'
@16,01 say 'Sexo             :'
@17,01 say 'Nacionalidad     :'
@18,01 say 'Telefono         :'
@18,40 SAY 'Estado Domic.:'
@19,01 say 'Fecha Estado     :'
@20,01 say 'Estado           :'
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
@14,21 say nacio
@15,21 say cuit
@16,21 say sexo
@17,21 say nacion
@18,21 say telef
@18,55 say tipo pict '9'
@19,21 say fallec
westadi=0
westadu=space(1)
do case
   case estado='A'
      @20,21 say 'Activo'
      westadi= 1
   case estado='C'
      @20,21 say 'Carnet Dep.'
      westadi= 2
   case estado='F'
      @20,21 say 'Fallecido'
      westadi=3
   case estado='S'
      @20,21 say 'Suspendido'
      westadi=4
   case estado = 'B'
      @20,21 say 'Baja Matr¡cula'
      westadi=5
   case estado = 'I'
      @20,21 say 'Comunica Inactividad'
      westadi=6   
   case estado = ' '
      @20,21 say '              '
      westadi=7      
endcase            
wsigue='S'
do while wsigue='S'   
wop=0
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
*   else
*      if wop=3
*         do otrosd
*         wsigue='N'
*      else
*         do spay02
*      endif      
   endif      
endif
enddo
@07,01 clear to 23,78   
return

procedure modi
wdctipo=dctipo
wdcnro=dcnro
wdomici=domici
wlocali=locali
wdpto=dpto
wprovin=provin
wnacio=nacio
wcuit=cuit
wsexo=sexo
wnacion=nacion
wtelef=telef
wfallec=fallec
wtipo=tipo
*westadi=estado
@22,60 say westadi PICT '9'
@22,66 say estado
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
   select 4
   use splocal order cod
   select 5
   use spdpto order  dpto
   select 4
*   set relation to dpto into spdpto
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
   select 5
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
   @12,21 say wdpto pict '999'
   @12,25 say wdptonom
   select 4
   use spprov order PROV
   @23,01 say 'Seleccione una provincia y oprima <ESC> para salir' color w/b*
   define window pprovi from 08,49 to 22,78 title 'PROVINCIAS'
   activate window pprovi
   brow fields prov, nombre nomodify in window pprovi
   deactivate window pprovi
   @23,01 clear to 23,78
   wprovin=prov
   wnomprov=nombre
   @13,22 say wprovin pict '99'
   @13,25 say wnomprov
endif   
@14,21 get wnacio
@15,21 get wcuit pict '99999999999'
@16,21 get wsexo
@17,21 get wnacion
@18,21 get wtelef
@18,55 get wtipo pict '9'
@21,40 say 'Tipo Dom: 0=Normal 1=No Actualizado'
@19,21 get wfallec
read
*westado=space(1)
westad=space(10)
@21,40 clear to 21,78
@13,50 get westadi picture '@*RTV \<Activo;\<Carnet Dep.;\<Fallecido;\<Suspendido;\<Baja;Comunica \<Inactividad;\< ' size 1,1
read
DO CASE
   CASE westadi=1
        westad='Activo'
        westadu='A'
   case westadi=2
        westad='Carnet Dep.'
        westadu='C'
   case westadi=3
        westad='Fallecido'
        westadu='F'
   case westadi=4
        westad='Suspendido'
        westadu='S'
   case westadi=5
        westad='Baja Matr¡cula'
        westadu='B'
   case westadi=6
        westad='Comunica Inactividad'
        westadu='I'     
   case westadi=7
        westad='              '
        westadu=' '             
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
replace nacio  with wnacio
replace cuit   with wcuit
replace sexo   with wsexo
replace nacion with wnacion
replace telef  with wtelef
replace tipo   with wtipo
replace fallec with wfallec
replace estado with westadu
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
        do cursos
     endif
  endif
endif                  
return
