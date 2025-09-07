procedure exr2
*   PROGRAMA PARA REIMPRIMIR CARATULA DE EXPEDIENTES
hide menu pant01
@03,02 clear to 23,78
*@03,02,23,78 box repl(chr(176),9)
*@04,27 clear to 04,54
dimension wmeses(12)
store  'enero'     to wmeses(1)
store  'febrero'   to wmeses(2)
store  'marzo'     to wmeses(3)
store  'abril  '   to wmeses(4)
store  'mayo '     to wmeses(5)
store  'junio  '   to wmeses(6)
store  'julio'     to wmeses(7)
store  'agosto '   to wmeses(8)
store  'setiembre' to wmeses(9)
store  'octubre'   to wmeses(10)
store  'noviembre' to wmeses(11)
store  'diciembre' to wmeses(12)
@03,28 say 'REIMPRIME CARATULA DE EXPEDIENTES' color n/w 
*@06,04 clear to 06,77
@05,03 say ' Expte.Numero  Fecha Inicio      ';
       color n/w
*@11,15 clear to 11,67
*@10,02 say 'Matricula/categoria'
*@10,29 say 'Car tula del expediente' color n/w
wsigue='S'
wop=0
wnro=0
wcod=space(1)
*select 1
*use cpar
*wnro=exptes+1
select 2
use exptes index exptesi, exptprf
do while wsigue='S'
   wmatri=0
   wcateg=space(2)
   wrtte=space(40)
   wrtte2=space(40)
   wfecha=date()
   wdiain=date()
   wano=0
   wcpto1=space(75)
   wcpto2=space(75)
   wcpto3=space(75)
   wcpto4=space(75)
   @21,12 say 'Indique Letra-Numero/a¤o del expte. o <ESC> para salir' color n/w
*   @08,18 get wfecha
   @08,2 get wcod PICT '!'
   @08,5 get wnro PICT '99999'
   @08,12 get wano pict '9999'
   read
   @21,02 clear to 21,78
   if lastkey()<>27
      select 2
*      wano=year(wfecha)
*      wano=wano+1900
      @20,01 say wano
      wkey=wcod+str(wnro,5)+str(wano,4)
      @20,30 say wkey
      @20,70 get wop
      read
      seek(wkey)
      if found()      
         wrtte  = rtte
         wrtte2 = rtte2
         wcpto1 = cpto
         wcpto2 = cpto2
         wcpto3 = cpto3
         wcpto4 = cpto4
         wfecha = recep
         @09,33 say wrtte
         @10,03 say wrtte2
         @11,03 say wcpto1
         @12,03 say wcpto2
         @13,03 say wcpto3
         @14,03 say wcpto4
         wop1=1
         @22,12 get wop1 picture '@*H \<Imprimir Epson;\<Micromarc;\<Laser;\<No Inprimir' size 1,1
         read
         @22,02 clear to 22,78
         if wop1=1
            set printer to lpt1
            set console off
            set printer on
            set device to printer
            ?
*           ?chr(27)+chr(87)+'1'
*            ?chr(27)+chr(119)+'1'
*           ?chr(27)+chr(71)
            ?'           CONSEJO PROFESIONAL DE'
            ?'           INGENIEROS  Y GEOLOGOS'
*           ?chr(27)+chr(72)
*            ??chr(27)+chr(119)+'0'
*           ??chr(27)+chr(87)+'0'
            ?
            ?
            ?
            ?
            ?
            ?
            ?
            ?'                    E x p e d i e n t e  N§:  '
            ?? wnro  pict '99999'
            ?'                    L e t r a              :      '
            ??wcod
            ?'                    A ¤ o                  :   '
            ??year(wfecha) pict '9999'
            ?
            ?
            ?
            ?
			?
			?
            ?
*           ?chr(27)+chr(71)
*           ??chr(27)+chr(87)+'1'
*           ??chr(27)+chr(119)+'1'
            ?'C A R A T U L A D O' at 20
*           ?chr(27)+chr(72)
*           ??chr(27)+chr(119)+'0'
*           ??chr(27)+chr(87)+'0'
            ?
            ?
            ?
            ?wrtte  at 10
            ?wrtte2 at 10
            ?
            ?
            ?
            ?wcpto1 at 5
            ?
            ?wcpto2 at 5
            ?
            ?wcpto3 at 5
            ?
            ?wcpto4 at 5
            ?
            ?
            ?
            ?
            ?
            ?
            ?
            ?
*            ?chr(27)+chr(87)+'1'
*            ?chr(27)+chr(119)+'1'
            ?'                               Mendoza, '
*            ??chr(27)+chr(119)+'0'
*            ??chr(27)+chr(87)+'0'
            ??day(wfecha) pict '99'
            ??' de '
            ??wmeses(month(wfecha))
            ??' de '
            ??year(wfecha) pict '9999'
            eject
            set printer off
            set device to screen
         else
            if wop1 = 2
            set printer to lpt1
            set console off
            set printer on
            set device to printer
            ?
            ?chr(27)+chr(40)+chr(115)+'6'+chr(072)
            ??chr(27)+chr(40)+chr(115)+'18'+chr(086)
            ?'       CONSEJO PROFESIONAL DE'
            ?'       INGENIEROS  Y GEOLOGOS'
            ?chr(27)+chr(40)+chr(115)+'10'+chr(072)
            ??chr(27)+chr(40)+chr(115)+'12'+chr(086)
            ?
            ?
            ?
            ?
            ?
            ?
            ?
            ?'                        E x p e d i e n t e  N§:  '
            ?? wnro  pict '99999'
            ?'                        L e t r a              :      '
            ??wcod
            ?'                        A ¤ o                  :   '
            ??year(wfecha) pict '9999'
            ?
            ?
            ?
            ?
			?
			?
            ?
            ?chr(27)+chr(40)+chr(115)+'5'+chr(072)
            ??chr(27)+chr(40)+chr(115)+'36'+chr(086)
            ?'C A R A T U L A D O' at 11
            ?chr(27)+chr(40)+chr(115)+'10'+chr(072)
            ??chr(27)+chr(40)+chr(115)+'12'+chr(086)
            ?
            ?
            ?
            ?
            ?
            ?
            ?wrtte  at 21
            ?wrtte2 at 21
            ?
            ?
            ?
            ?wcpto1 at 5
            ?
            ?wcpto2 at 5
            ?
            ?wcpto3 at 5
            ?
            ?wcpto4 at 5
            ?
            ?
            ?
            ?
            ?
            ?
            ?
            ?
            ?'                                        Mendoza, '
            ??day(wfecha) pict '99'
            ??' de '
            ??wmeses(month(wfecha))
            ??' de '
            ??year(wfecha) pict '9999'
            eject
            set printer off
            set device to screen
*                 codigos para imprimir en micromarc            
*            endif   
            else
               if wop1 = 3
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               ?chr(027)+chr(038)+chr(108)+chr(051)+chr(065)
               ?chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
               ?chr(027)+chr(040)+chr(115)+chr(049)+chr(080)
               ??chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
               ??chr(027)+chr(040)+chr(115)+'6'+chr(072)
               ??chr(027)+chr(040)+chr(115)+'16'+chr(086)
               ?'       CONSEJO PROFESIONAL DE'
               ?'       INGENIEROS  Y GEOLOGOS'
               ?chr(027)+chr(040)+chr(115)+'10'+chr(072)
               ??chr(027)+chr(040)+chr(115)+'12'+chr(086)
               ??chr(027)+chr(040)+chr(115)+chr(048)+chr(080)
               ?
               ?
               ?
               ?
               ?
               ?
               ?
               ?'                        E x p e d i e n t e  N§:  '
               ?? wnro  pict '99999'
               ?'                        L e t r a              :      '
               ??wcod
               ?'                        A ¤ o                  :   '
               ??year(wfecha) pict '9999'
               ?
               ?
               ?
               ?
			   ?
               ?
               ?chr(027)+chr(040)+chr(115)+chr(049)+chr(080)
               ??chr(027)+chr(040)+chr(115)+'5'+chr(072)
               ??chr(027)+chr(040)+chr(115)+'36'+chr(086)
               ?'C A R A T U L A D O' at 11
               ?chr(027)+chr(040)+chr(115)+'8'+chr(072)
               ??chr(027)+chr(040)+chr(115)+'12'+chr(086)
               ?
               ?chr(027)+chr(040)+chr(115)+chr(048)+chr(080)
               ?
               ?
               ?
               ?
               ?
               ?wrtte  at 21
               ?wrtte2 at 21
               ?
               ?
               ?wcpto1 at 6
               ?
               ?wcpto2 at 6             
               ?
               ?wcpto3 at 6
               ?
               ?wcpto4 at 6
               ?
               ?
               ?
               ?
               ?
               ?
               ?
               ?
               ?'                                           Mendoza, '
               ??day(wfecha) pict '99'
               ??' de '
               ??wmeses(month(wfecha))
               ??' de '
               ??year(wfecha) pict '9999'
               eject
               ??chr(027)+chr(038)+chr(108)+chr(050)+chr(054)+chr(065)
               set printer off
               set device to screen
*                 codigos para imprimir en Xerox laser      
               endif
            endif   
         endif
      else
        @21,01 say 'no existe expediente'
        @21,40 say wkey
        @23,70 get wop
        read   
      endif      		
   else
      wsigue='N'
   endif
enddo      
close all
@04,02 clear to 23,78
do pie
SHOW MENU PANT01
RETURN

