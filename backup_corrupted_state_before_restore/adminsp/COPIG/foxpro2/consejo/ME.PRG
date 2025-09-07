procedure me
*altas, bajas y modificaciones de remitentes
hide menu pant01
*@03,02 clear to 23,78
*@04,20 clear to 04,63
@03,02,23,78 box repl (chr(176),9))
@04,20 clear to 04,63
@03,19 say 'ALTAS, BAJAS Y MODIFICACIONES DE REMITENTES';
       color n/w
@06,03 say 'Nro.Rtte' color n/w
wsigue='S'
wnom=space(30)
do while wsigue='S'
   *@22,20 clear to 22,61
   @21,19 say 'Indique el nro.del Rtte o <ESC> para salir' color n/w
   wnro=0
   @06,12 get wnro pict '99999'
   read
   @21,19,22,61 box repl(chr(176),9)
   if lastkey()<>27
      select 1
      use rtte index rttei
      seek(wnro)
      if found()
         wnom=nom
         @06,18 say rtrim(wnom) color n/w
         wop=0
         werr='S'
         @21,30 get wop picture '@*H \<Salir;\<Baja;\<Cambio';
                size 1,1 color scheme 4
         read
         werr='N'
         if wop=2
            do baja
         else
            if wop=3
               do cambios
            endif
         endif      
      else
         do altas
      endif
   else
      wsigue='N'
   endif
enddo
close all
show menu pant01
do pie
return               

procedure baja
delete
return

procedure cambios
@06,18 get wnom pict '@!'
read
replace nom with wnom
return

procedure altas
append blank
@06,18 get wnom pict '@!'
read
replace nro with wnro
replace nom with wnom
return