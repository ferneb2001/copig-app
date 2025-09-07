procedure mlu
*consulta por nro de nota
hide menu pant01
@03,02,23,78 box repl(chr(176),9)
@04,23 clear to 04,60
@03,22 say 'CONSULTA DE CORRESPONDENCIA POR NUMERO' color n/w
@06,04 clear to 06,42

@05,03 say 'Nro.Nota  de fecha  recibida  Remitente' color n/w
wsigue='S'
wnro=0
wletra=space(1)
wano=0
wop=0
do while wsigue='S'
   @22,11 clear to 22,72
   @21,10 say 'Indique el nro.de nota que quiere consultar o <ESC> para salir';
          color n/w
   @07,02 get wletra pict '!'
   @07,04 get wnro pict '99999'
   @07,10 get wano pict '9999'
   read
   @07,09,23,78 box repl(chr(176),9)
   *@23,02 clear to 23,78
   if lastkey()<>27
      wkey=wletra+str(wnro,5)+str(wano,4)
      select 1
      use mail index maili
      seek(wkey)
      if found()
         @07,13 say fecha color n/w
         @07,23 say recep color n/w
         @07,33 say rtrim(rtte) color n/w
         *@09,35 say 'Concepto' color n/w
         @10,04 clear to 12,78
         @09,03 say cpto color n/w
         @10,03 say cpto2 color n/w
         @11,03 say cpto3 color n/w
         *@14,02 say 'Paso a seccion         el d¡a                  Observaciones'
         select 2
         use movmail index movmaili
         select 3
         use psecc index psecn
         select 2
         set relation to secc into psecc
         locate for letra = wletra .and. nro = wnro .and. ano = wano
         if found()
            wlin=16
            do while letra = wletra .and. nro=wnro .and. ano = wano
               @wlin+1,04 clear to wlin+1,33
               @wlin+1,35 clear to wlin+1,78
               @wlin,03 say c.nom color n/w
               @wlin,24 say fecha color n/w
               @wlin,34 say obs pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
                        color n/w 
               wlin=wlin+1
               if wlin>22
                  @23,15 say 'hay m s l¡neas, oprima cualquier tecla para seguir' color w/n*
                  read
                  @16,02 clear to 22,78
                  wlin=16
                  @23,02 clear to 23,78
               endif
               skip   
            enddo
            @23,28 get wop picture '@*H \<Otra;\<Imprimir;\<Salir';
                   size 1,1 color scheme 4
            *@23,25 say 'Oprima cualquier tecla para salir'
            read
            if wop=3
               wsigue='N'
            else
               if wop=2
                  do imprima
               endif
            endif
            @07,02,23,78 box repl(chr(176),9)          
            *@07,02 clear to 07,78
            **11,02 clear to 11,78
            *16,02 clear to 23,78
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
do pie
return

procedure imprima
@23,05 say 'Verifique que la impresora est‚ lista para imprimir y oprima <ENTER>'
read
select 1
set console off
set printer on
set device to print
?'Nota Nro:'
??wnro pict '99999' at 11
??'Remitida por:' at 18
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
use movmail index movmaili
select 3
use psecc index psecn
select 2
set relation to secc into psecc
locate for nro = wnro .and. ano = wano
if found()
   do while nro=wnro .and. ano = wano
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