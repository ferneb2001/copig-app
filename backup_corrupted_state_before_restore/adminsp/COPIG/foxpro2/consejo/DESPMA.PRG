procedure despma
set talk off
@04,03 clear to 23,77
@04,27 say 'ANULA PASES DE DESPACHOS'
wletra="J"
wnro=0
wano=0
wsigue='S'
wop=space(1)
select 1
use dspcho index dspchoi
select 2
use dspmov index dspmov
select 3
use psecc index psecn
do while wsigue='S'
   wletra='J'
   wnro=0
   wano=0
   @06,03 say '         Nro.:         A¤o:'
*   @06,10 get wletra pict '!'
*   read
*   if lastkey()<>27
      @06,18 get wnro pict '99999'
      read
      if lastkey()<>27 
      @06,31 get wano pict '9999'
      read
      wkey=wletra+str(wnro,5)+str(wano,4)
      select 1
      seek (wkey)
      if found()
         @06,36 say dpsrtte
         select 2
         select 3
         select 2
         set relation to dspsecc into psecc
         @23,02 say 'Para anular un pase seleccionelo y oprima CTRL+T, ESC para salir'
         define window pmov from 08,02 to 22,77
         activate window pmov
         brow fields b.dspfecha, b.dsphora, c.nom, b.dspobs;
              for dspcod=wletra and dspnro=wnro and dspano=wano;
              in window pmov
         deactivate window pmov
      else
         @06,35 say 'No lo encontre'   
      endif
   else
      wsigue='N'
   endif   
enddo
close all
@03,02 clear to 23,77
show menu pant01d
return