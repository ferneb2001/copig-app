procedure exce
*consulta por nro de nota
hide menu pant01
@03,02 clear to 23,78
@03,23 say 'CONSULTA DE EXPEDIENTES POR NUMERO' color n/w 
@04,02 clear to 23,78
@05,03 say 'Nro.Nota  de fecha  recibida  Remitente' color n/w
wsigue='S'
wnro=0
wletra=space(1)
wano=0
wop=0
do while wsigue='S'
   @22,11 clear to 22,72
   @21,10 say 'Indique el nro.de Expte. a consultar o <ESC> para salir';
          color n/w
   @07,02 get wletra pict '!'
   @07,04 get wnro pict '99999'
   @07,10 get wano pict '99'
   read
   @21,02 clear to 21,78
   if lastkey()<>27
      wano=wano+1900
      wkey=wletra+str(wnro,5)+str(wano,4)
      select 1
      use exptes index exptesi
      seek(wkey)
      if found()
         @07,23 say recep color n/w
         @07,33 say rtrim(rtte) color n/w
         @08,33 say rtrim(rtte2) color n/w
         @09,35 say 'Concepto' color n/w
         @10,03 say cpto color n/w
         @11,03 say cpto2 color n/w
         @12,03 say cpto3 color n/w
         @13,03 say cpto4 color n/w
         @14,02 say 'Paso a seccion         el d¡a                  Observaciones'
         select 2
         use expmov index expmov
         select 3
         use psecc index psecn
         select 2
         set relation to secc into psecc
         locate for nro = wnro
         if found()
            wlin=16
            do while nro=wnro
               if not deleted()
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
               endif
               skip   
            enddo
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