procedure mcr
*consulta por remitente
hide menu pant01
*@03,02 clear to 23,78
@03,02,23,78 box repl(chr(176),9)
@04,23 clear to 04,62
@03,22 say 'CONSULTA DE CORRESPONDENCIA POR REMITTE' color n/w
@06,04 clear to 06,42
@05,03 say 'Nro.Nota  de fecha  recibida  Remitente' color n/w
wsigue='S'
do while wsigue='S'
   *@07,09 clear to 07,78
   *@23,02 clear to 23,78
   if lastkey()<>27
      wnom=space(30)
      wano=2005
      @04, 01 say 'A¥O: '
      @04, 15 SAY 'REMITENTE:'
      @23,01 say 'Ingrese a¤o y remitente a buscar'
      @04, 07 GET wano PICT '9999'
      @04, 26 GET wnom pict '@X'
      read
      select 1
      use mail order rtte
      @23,24 clear to 23,57
      @22,23 say 'Seleccione una nota y oprima <ESC>' color n/w
      @09,05 clear to 21,76
      define window prtte from 10,06 to 20,75
      activate window prtte
      brow fields cod, nro, ano, recep, rtte for rtte=rtrim(wnom) and ano=wano in window prtte
      deactivate window prtte
      @09,05,21,76 box repl(chr(176),9)
      wnro=nro
      wano=ano
      wcod=cod
      @20,02,23,78 box repl(chr(176),9)
      *@23,02 clear to 23,78
      @07,04 say wnro pict '99999' color n/w
      @07,13 say fecha color n/w
      @07,23 say recep color n/w
      @07,33 say rtrim(rtte) color n/w
      *@09,35 say 'Concepto'  color n/w
      @10,04 clear to 12,78
      @09,03 say cpto        color n/w
      @10,03 say cpto2       color n/w
      @11,03 say cpto3       color n/w
      *@13,02 say 'Paso a seccion         el d¡a                  Observaciones'
      select 2
      use movmail index movmaili
      select 3
      use psecc index psecn
      select 2
      set relation to secc into psecc
      locate for letra = wcod .and. nro = wnro .and. ano = wano
      if found()
         wlin=14
         do while letra = wcod .and. nro=wnro .and. ano = wano
            @wlin+1,3  clear to wlin+1,32
            @wlin+1,36 clear to wlin+1,78
            @wlin,02 say c.nom color n/w
            @wlin,24 say fecha color n/w
            @wlin,35 say obs pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; 
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
      @21,10,22,70 box repl(chr(176),9)
   else
      wsigue='N'
   endif
enddo               
@03,02 clear to 23,78
close all
do pie
return