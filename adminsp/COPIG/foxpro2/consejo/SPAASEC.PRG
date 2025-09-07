procedure spaasec
*actualiza archivo de secciones 
@04,01 clear to 23,78
@04,24 say 'ACTUALIZACION ARCHIVO DE SECCIONES'
@08,02 say 'Codigo   Descripci¢n           '
select 1
use psecc index psecn
wsigue='S'
wop=0
do while wsigue='S'
   wsecdesc=space(25)
   wcodigo=0
   @23,01 say 'Indique codigo de Secci¢n, <F1>  o <ESC> para salir'
   @10,03 get wcodigo pict '99'
   read
   if lastkey()<>27
      if lastkey()=28
         do buscasec
      endif   
      seek(wcodigo)
      if found()
         wsecdesc=nom
         @10,11 say nom
         @23,01 clear to 23,78
         wop=1
         @23,35 get wop picture '@*H \<Modificar;\<Salir' size 1,1
         read
         @23,01 clear to 23,78
         if wop=1
            @12,11 get wsecdesc
            read
            replace nom    with wsecdesc
            @20,01 clear to 20,78
            @21,01 clear to 21,78
         ELSE   
         endif         
      else
         @10,11 get wsecdesc
         read
         wop=1
         append blank
         replace secc    with wcodigo
         replace nom     with wsecdesc
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

procedure buscasec
define window psec from 08,40 to 21,78 title 'Secciones'
activate window psec
select 1
brow in window psec
deactivate window psec
wcodigo=secc
return
