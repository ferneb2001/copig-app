procedure spaal
* actualizacion del archivo de localidades
@04,01 clear to 23,78
@04,20 say 'ACTUALIZACION DEL ARCHIVO DE LOCALIDADES'
wsigue='S'
@06,02 say 'CODIGO  NOMBRE           DEPARTAMENTO           PROVINCIA'
do while wsigue = 'S'
   wcodloc=0
   wnomloc=space(15)
   wcoddpto=0
   wnomdpto=space(15)
   wcodprov=0
   wnomprov=space(15)
   wcodpost=space(4)
   @08,01 clear to 23,78
   select 1
   use splocal order cod
   select 2
   use spdpto order dpto
   select 3
   use spprov order prov
   @23,01 say 'Indique el c¢digo de localidad, <F1> para ayuda o <ESC> para salir'
   @08,04 get wcodloc pict '999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      if lastkey()=28
         do buscaloc
      endif   
      select 1
      seek(wcodloc)
      if found()
         wnomloc=nombre
         wcoddpto=dpto
         @08,10 say wnomloc
         @08,70 say cpost pict '9999'
         select 2
         seek(wcoddpto)
         if found()
            wnomdpto=nombre
            wcodprov=prov
            @08,27 say wnomdpto
            select 3
            seek(wcodprov)
            if found()
               wnomprov=nombre
               @08,50 say wnomprov
            else
               @08,50 say 'No existe'
            endif
         else
            @08,27 say 'No existe'
         endif
         wop=1
         @23,25 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar';
                color scheme 4
         read
         @23,01 clear to 23,78
         if wop=2
            do comun
            do modloc
         else
            if wop=3
               do bajaloc
            endif
         endif         
      else
         @08,10 say 'No existe'
         wop=1
         @23,35 get wop pict '@*H \<Salir;\<Ingresar';
                color scheme 4
         read
         @23,01 clear to 23,78
         if wop=2
            do comun
            do ingrloc
         endif   
      endif   
   else
      wsigue='N'
   endif   
enddo
@04,01 clear to 23,78
close all
return

procedure modloc
wop=1
@23,35 get wop pict '@*H \<Salir;\<Aceptar' size 1,1 color scheme 4
read
@23,01 clear to 23,78
if wop=2
   select 1
   replace nombre with wnomloc
   replace cpost  with wcodpost
   replace dpto   with wcoddpto
endif   
return

procedure bajaloc
select 1
delete
return

procedure comun
@23,01 say 'Indique el nombre de la localidad'
@08,10 get wnomloc pict '@!'
read
@08,70 get wcodpost pict '9999'
read
@23,01 clear to 23,78
select 2
use spdpto order nombre
select 3
use spprov order prov
select 2
set relation to prov into spprov
@23,01 say 'Seleccione un departamento y oprima <ESC>'
define window pdpto from 10,25 to 20,60 title 'DEPARTAMENTOS'
activate window pdpto
brow fields dpto,nombre, c.nombre in window pdpto
deactivate window pdpto
@23,01 clear to 23,78
wcoddpto=dpto
wnomdpto=nombre
*wcodpost=cpost
wcodprov=c.prov
wnomprov=c.nombre
@08,27 say wnomdpto
@08,50 say wnomprov
@08,70 say wcodpost pict '9999'
return

procedure ingrloc
wop=1
@23,35 get wop pict '@*H \<Salir;\<Aceptar' size 1,1 color scheme 4
read
@23,01 clear to 23,78
if wop=2
   select 1
   append blank
   replace cod with wcodloc
   replace nombre with wnomloc
   replace cpost  with wcodpost  
   replace dpto   with wcoddpto
endif   
return

procedure buscaloc
select 1
set relation to dpto into spdpto
@23,01 say 'Seleccione una localidad y oprima <ESC>'
define window ploc from 10,20 to 20,60 title 'LOCALIDADES'
activate window ploc
select 1
brow fields cod, nombre, b.nombre, cpost in window ploc
deactivate window ploc
wcodloc=cod
@08,04 say wcodloc pict '999'
@23,01 clear to 23,78
return