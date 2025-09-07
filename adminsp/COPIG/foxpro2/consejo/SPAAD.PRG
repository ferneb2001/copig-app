procedure spaad
* actualizacion del archivo de departamentos
@04,01 clear to 23,78
@04,19 say 'ACTUALIZACION DEL ARCHIVO DE DEPARTAMENTOS'
wsigue='S'
@06,02 say 'CODIGO  NOMBRE           COD.POST  PROVINCIA'
do while wsigue = 'S'
   wcoddpto=0
   wnomdpto=space(15)
   wcodprov=0
   wnomprov=space(15)
   wcodpost=space(4)
   @08,01 clear to 23,78
   select 2
   use spdpto order dpto
   select 3
   use spprov order prov
   @23,01 say 'Indique el c¢digo de departamento, <F1> para ayuda o <ESC> para salir'
   @08,04 get wcoddpto pict '999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      if lastkey()=28
         do buscadpto
      endif   
      select 2
      seek(wcoddpto)
      if found()
         wnomdpto=nombre
         wcodprov=prov
         wcodpost=cpost
         @08,10 say wnomdpto
         @08,29 say wcodpost
         select 3
         seek(wcodprov)
         if found()
            wnomprov=nombre
            @08,37 say wnomprov
         else
            @08,37 say 'No existe'
         endif
         wop=1
         @23,25 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar';
                color scheme 4
         read
         @23,01 clear to 23,78
         if wop=2
            do comun
            do moddpto
         else
            if wop=3
               do bajadpto
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
            do ingrdpto
         endif   
      endif   
   else
      wsigue='N'
   endif   
enddo
@04,01 clear to 23,78
close all
return

procedure moddpto
wop=1
@23,35 get wop pict '@*H \<Salir;\<Aceptar' size 1,1 color scheme 4
read
@23,01 clear to 23,78
if wop=2
   select 2
   replace nombre with wnomdpto
   replace cpost  with wcodpost
   replace prov   with wcodprov
endif   
return

procedure bajadpto
select 2
delete
return

procedure comun
@23,01 say 'Indique el nombre del departamento'
@08,10 get wnomdpto pict '@!'
read
@23,01 clear to 23,78
@23,01 say 'Indique el C¢digo Postal'
@08,29 get wcodpost pict '9999'
read
@23,01 clear to 23,78
select 3
use spprov order prov
@23,01 say 'Seleccione una provincia y oprima <ESC>'
define window pdpto from 10,25 to 20,60 title 'PROVINCIAS'
activate window pdpto
brow fields prov,nombre, cpost in window pdpto
deactivate window pdpto
@23,01 clear to 23,78
wcodprov=prov
wnomprov=nombre
@08,10 say wnomdpto
@08,37 say wnomprov
return

procedure ingrdpto
wop=1
@23,35 get wop pict '@*H \<Salir;\<Aceptar' size 1,1 color scheme 4
read
@23,01 clear to 23,78
if wop=2
   select 2
   append blank
   replace dpto   with wcoddpto
   replace nombre with wnomdpto
   replace cpost  with wcodpost
   replace prov   with wcodprov
endif   
return

procedure buscadpto
select 3
use spprov order prov
select 2
set relation to prov into spprov
@23,01 say 'Seleccione una departamento y oprima <ESC>'
define window ploc from 10,20 to 20,60 title 'DEPARTAMENTOS'
activate window ploc
brow fields dpto, nombre, cpost, c.nombre in window ploc
deactivate window ploc
wcoddpto=dpto
@08,04 say wcoddpto pict '999'
@23,01 clear to 23,78
return