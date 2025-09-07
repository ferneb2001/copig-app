procedure despce1
*consulta por nro de despacho
hide menu pant01d
@03,02 clear to 23,78
@03,23 say 'CONSULTA DE DESPACHOS POR NUMERO' color n/w 
@04,02 clear to 23,78
@05,03 say 'Nro.Desp. de fecha  recibido  Remitente' color n/w
wsigue='S'
wnro=0
wletra='J'
wano=0
wop=0
do while wsigue='S'
   @22,11 clear to 22,72
   @21,10 say 'Indique el nro.de Desp. a consultar o <ESC> para salir';
          color n/w
*  @07,02 get wletra pict '!'
   @07,04 get wnro pict '99999'
   @07,10 get wano pict '9999'
   read
   @21,02 clear to 21,78
   if lastkey()<>27
*      wano=wano+1900
      wkey=wletra+str(wnro,5)+str(wano,4)
      select 1
      use dspcho index dspchoi
      seek(wkey)
      if found()
         @07,23 say dsprecep color n/w
         @07,33 say rtrim(dsprtte) color n/w
         @08,33 say rtrim(dsprtte2) color n/w
         @09,35 say 'Concepto' color n/w
         @10,03 say dspcpto color n/w
         @11,03 say dspcpto2 color n/w
         @12,03 say dspcpto3 color n/w
         @13,03 say dspcpto4 color n/w
         @14,02 say 'Paso a seccion         el d¡a                  Observaciones'
         define window pmov from 16,02 to 23,78
         activate window pmov
         select 2
         use dspmov index dspmov
         select 3
         use psecc index psecn
         select 2
         set relation to dspsecc into psecc
         *brow fields b.fecha, b.hora c.nom in window pmov
         brow fields b.dspfecha, b.dsphora, c.nom, b.dspobs;
              for b.dspcod=wletra and dspnro=wnro and dspano=wano;
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
            endif
         endif   
      else
         @07,11 say 'error'
      endif
   else
      wsigue='N'
   endif
enddo               
@03,02 clear to 23,78
close all
do pied
return

procedure imprima
@23,05 say 'Verifique que la impresora est‚ lista para imprimir y oprima <ENTER>'
read
select 1
set console off
set printer on
set device to print
?'Desp.Nro:'
??wnro pict '99999' at 11
??'Remitido por:' at 18
??dsprtte            at 32
 ?
 ?'Concepto:'
??dspcpto            at 11
 ?dspcpto2           at 11
 ?dspcpto3           at 11
 ?
 ?'Pas¢ a Seccion'
??'el d¡a' at 25
??'Observaciones' at 35
 ? 
select 2
use dspmov index dspmov
select 3
use psecc index psecn
select 2
set relation to dspsecc into psecc
locate for dspnro = wnro
if found()
   do while dspnro=wnro
      ?c.nom
      ?? dspfecha at 24
      ??dspobs    at 35 
      skip
   enddo
endif
?
eject       
set printer off
set device to screen  
return