procedure mma
* anula movimientos de notas
set talk off
@04,03 clear to 23,77
@04,27 say 'ANULA PASES DE NOTAS'
wletra=space(1)
wnro=0
wano=0
wsigue='S'
wop=space(1)
select 1
use mail index maili
select 2
use movmail 
select 3
use psecc index psecn
do while wsigue = 'S'
   wletra=space(1)
   wnro=0
   wano=0
   @06,03 say 'Letra:   Nro.:         A¤o:'
   @06,10 get wletra pict '!'
   read
   if lastkey()<>27
      @06,18 get wnro pict '99999'
      @06,31 get wano pict '9999'
      read
      wkey=wletra+str(wnro,5)+str(wano,4)
      select 1
      seek (wkey)
      if found()
         @06,36 say rtte
         select 2
         select 3
         select 2
         set relation to secc into psecc
         @23,02 say 'Para eliminar un pase selecci¢nelo y oprima CTRL+T, ESC para salir'
         define window pmov from 08,02 to 22,77
         activate window pmov
         brow fields b.fecha, b.hora, c.nom, b.obs;
              for letra=wletra and nro=wnro and ano=wano;
              in window pmov
         deactivate window pmov
      else
         @06,35 say 'No lo encontr‚'
      endif
   else
      wsigue = 'N'
   endif
enddo
close all
@03,02 clear to 23,77
show menu pant01
return                     