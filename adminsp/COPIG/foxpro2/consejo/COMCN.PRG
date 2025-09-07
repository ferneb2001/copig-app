procedure comcn
*consulta por nro de nota
hide menu pant01
@03,02 clear to 23,78
@03,22 say 'CONSULTA DE SERVICIOS  POR NUMERO'
@05,03 say 'Nro.Nota  de fecha  recibida  Remitente'
wsigue='S'
wnro=0
wcod=space(1)
wkey=space(6)
do while wsigue='S'
   @23,10 say 'Indique el nro.de nota que quiere consultar o <ESC> para salir'
   @07,02 get wcod pict '!'
   @07,04 get wnro pict '99999'
   read
   @07,09 clear to 07,78
   @23,02 clear to 23,78
   if lastkey()<>27
      select 1
      use mail index maili
      wkey=wcod+str(wnro,5)
      seek(wkey)
      if found()
         @07,13 say fecha
         @07,23 say recep
         @07,33 say rtte
         @09,35 say 'Concepto'
         @11,02 say cpto
         @12,02 say cpto2
         @13,02 say cpto3
         @14,02 say 'Paso a seccion         el d¡a                  Observaciones'
         select 2
         use movmail index movmaili
         select 3
         use psecc index psecn
         select 2
         set relation to secc into psecc
         locate for nro = wnro and cod = wcod
         if found()
            wlin=16
            do while nro=wnro
               @wlin,02 say c.nom
               @wlin,24 say fecha
               @wlin,35 say obs pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' 
               skip
               wlin=wlin+1
               if wlin>22
                  @16,02 clear to 22,78
                  wlin=16
                  @23,15 say 'hay m s l¡neas, oprima cualquier tecla para seguir' color w/n*
                  read
                  @23,02 clear to 23,78
               endif   
            enddo
            @23,25 say 'Oprima cualquier tecla para salir'
            read
            @07,02 clear to 07,78
            @11,02 clear to 11,78
            @16,02 clear to 23,78
            
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