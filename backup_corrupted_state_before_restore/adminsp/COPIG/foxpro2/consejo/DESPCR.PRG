procedure despcr
*consulta por remitente
hide menu pant01d
@03,02 clear to 23,78
*@03,02,23,78 box repl(chr(176),9)
*@04,23 clear to 04,62
@03,22 say 'CONSULTA DE DESPACHOS  POR REMITENTE' color n/w
*@06,04 clear to 06,42
@05,03 say 'Nro.Desp. de fecha  recibida  Remitente' color n/w
wsigue='S'
do while wsigue='S'
   *@07,09 clear to 07,78
   *@23,02 clear to 23,78
   if lastkey()<>27
      select 1
      use dspcho order dsprtte
      @23,24 clear to 23,57
      @22,23 say 'Seleccione un desp. y oprima <ESC>' color n/w
      @11,21 clear to 21,61
      define window prtte from 10,20 to 20,60
      activate window prtte
      brow fields dspnro, dsprtte in window prtte
      deactivate window prtte
      *@11,21,21,61 box repl(chr(176),9)
      wnro=dspnro
      *@20,02,23,78 box repl(chr(176),9)
      *@23,02 clear to 23,78
      @07,04 say wnro pict '99999' color n/w
      *@07,13 say dspfecha color n/w
      @07,23 say dsprecep color n/w
      @07,33 say rtrim(dsprtte) color n/w
      @08,33 say rtrim(dsprtte2) color n/w
      @09,35 say 'Concepto'  color n/w
      @10,04 clear to 12,78
      @10,03 say dspcpto        color n/w
      @11,03 say dspcpto2       color n/w
      @12,03 say dspcpto3       color n/w
      @13,03 say dspcpto4       color n/w
      *@13,02 say 'Paso a seccion         el d¡a                  Observaciones'
      select 2
      use dspmov index dspmov
      select 3
      use psecc index psecn
      select 2
      set relation to dspsecc into psecc
      locate for dspnro = wnro
      if found()
         wlin=14
         do while dspnro=wnro
            *@wlin+1,3  clear to wlin+1,32
            *@wlin+1,36 clear to wlin+1,78
            @wlin,02 say c.nom color n/w
            @wlin,24 say dspfecha color n/w
            @wlin,35 say dspobs pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; 
                     color n/w
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
      endif
      @22,12 clear to 22,70
      @21,10 say 'Oprima cualquier tecla para otra consulta o <ESC> para salir';
             color n/w
      read
      *@23,02 clear to 23,78
      *@21,10,22,70 box repl(chr(176),9)
   else
      wsigue='N'
   endif
enddo               
@03,02 clear to 23,78
close all
do pied
return