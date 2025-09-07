procedure excnom
*consulta por nombre de referencia
hide menu pant01
@03,02 clear to 23,78
@03,23 say 'CONSULTA DE EXPEDIENTES POR NOMBRES REFERENCIA' color n/w 
@04,02 clear to 23,78
@05,03 say 'Matr. Cat.Nro.Nota  de fecha  recibida  Remitente' color n/w
wsigue='S'
wnro=0
wmatri=0
wcate=space(2)
wletra=space(1)
wnomb=space(30)
wano=0
wop=0
do while wsigue='S'
   @22,11 clear to 22,72
   @21,10 say 'Indique NOMBRE   a consultar o <ESC> para salir';
          color n/w
   @07,02 get wnomb pict '@!'
*   @07,08 get wcate  pict '!!'       
   read
   @21,02 clear to 21,78
   if lastkey()<>27
*      wano=wano+1900
*      wkey=str(wmatri,5)+wcate
      select 1
      use exptes index exptprno, exptesi
      GO TOP
      define window pnom from 08,05 to 22,75
      activate window pnom
*      brow all for inomb=rtrim(wnomb) in pnom
      brow fields cod, nro, ano, recep, inomb for inomb=rtrim(wnomb) in pnom
      deactivate window pnom
*      seek(wnomb)
*      do while found()
*       if found()
          wletra = cod             
          wnro   = nro
          wano   = ano
         @07,12 say nro pict '99999'
         @07,18 say cod pict '!'
         @07,20 say ano pict '9999'
         @07,33 say recep color n/w
         @07,43 say rtrim(rtte) color n/w
         @08,43 say rtrim(rtte2) color n/w
         @09,45 say 'Concepto' color n/w
         @10,03 say cpto color n/w
         @11,03 say cpto2 color n/w
         @12,03 say cpto3 color n/w
         @13,03 say cpto4 color n/w
         @14,02 say 'Paso a seccion         el d¡a                  Observaciones'
         define window pmov from 16,02 to 23,78
         activate window pmov
         select 2
         use expmov index expmov
         select 3
         use psecc index psecn
         select 2
         set relation to secc into psecc
         *brow fields b.fecha, b.hora c.nom in window pmov
         brow fields b.fecha, b.hora, c.nom, b.obs;
              for b.cod=wletra and nro=wnro and ano=wano;
              in window pmov
         deactivate window pmov
         @23,28 get wop picture '@*H \<Otra;\<Imprimir;\<Salir';
               size 1,1 color scheme 4
         read
         if wop=3
            wsigue='N'
         else
            if wop=2
               do imprima
            else
               select 1
               IF NOT EOF()
              	 skip 1
               ELSE
               	go top
               endif	   
            endif
         endif   
*       else
*         @07,11 say 'error'
*       endif
*      enddo 
   else
      wsigue='N'
   endif
enddo               
@03,02 clear to 23,78
close all
do pie
return

procedure imprima
@23,05 say 'Verifique que la impresora est‚ lista para imprimir y oprima <ENTER>'
read
select 1
set console off
set printer on
set device to print
?'Exp. Nro:'
??wnro pict '99999' at 11
??'Remitido por:' at 18
??rtte            at 32
 ?
 ?'Concepto:'
??cpto            at 11
 ?cpto2           at 11
 ?cpto3           at 11
 ?
 ?'Pas¢ a Seccion'
??'el d¡a' at 25
??'Observaciones' at 35
 ? 
select 2
use expmov index expmov
select 3
use psecc index psecn
select 2
set relation to secc into psecc
locate for nro = wnro
if found()
   do while nro=wnro
      ?c.nom
      ?? fecha at 24
      ??obs    at 35 
      skip
   enddo
endif
?
eject       
set printer off
set device to screen  
return