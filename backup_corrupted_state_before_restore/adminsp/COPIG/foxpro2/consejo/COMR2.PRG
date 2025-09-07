procedure comr2
*actualiza archivo de Codigos de Servicios
@04,01 clear to 23,78
@04,24 say 'ACTUALIZACION ARCHIVO DE CODIGOS DE SERVICIOS'
@08,02 say 'Codigo     Descripcion     '
select 1
use ptipos order rubro
wsigue='S'
wop=0
do while wsigue='S'
   wtitdesc=space(25)
   wcodigo=0
   @23,01 say 'Indique codigo de Servicio, <F1>  o <ESC> para salir'
   @10,03 get wcodigo pict '99999'
   read
   if lastkey()<>27
      if lastkey()=28
         do buscarub
      endif   
      seek(wcodigo)
      if found()
         wtitdesc=nom
         @10,11 say nom
         @23,01 clear to 23,78
         wop=1
         @23,35 get wop picture '@*H \<Modificar;\<Salir' size 1,1
         read
         @23,01 clear to 23,78
         if wop=1
            @12,11 get wtitdesc
            read
            replace nom with wtitdesc
            @20,01 clear to 20,78
            @21,01 clear to 21,78
         ELSE   
         endif         
      else
         @10,11 get wtitdesc
         read
         wop=1
         append blank
         replace rubro  with wcodigo
         replace nom    with wtitdesc
         @20,01 clear to 20,78
         @21,01 clear to 21,78
      endif 
   else
      wsigue='N'
   endif   
enddo
close all
@04,01 clear to 23,78
return

procedure buscarub
define window ptit from 08,20 to 21,60 title ' Rubros '
activate window ptit
select 1
brow in window ptit
deactivate window ptit
wcodigo=rubro
return
