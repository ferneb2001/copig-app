procedure despr
hide menu pant01d
@03,02 clear to 23,78
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
@03,28 say 'RECEPCION DE DESPACHOS ' color n/w 
@05,03 say ' Desp. Numero  Fecha Inicio      Detalle de quien inicia el despacho';
       color n/w
@10,02 say 'Matricula/categoria'
@10,29 say 'Car tula del despacho' color n/w
wsigue='S'
wnro=0
select 2
use dspcho index dspchoi
do while wsigue='S'
   wmatri=0
   wcateg=space(2)
   wrtte=space(40)
   wrtte2=space(40)
   wfecha=date()
   wdiain=date()
   wcpto1=space(75)
   wcpto2=space(75)
   wcpto3=space(75)
   wcpto4=space(75)
   @21,12 say 'Indique la fecha de inicio del desp. o <ESC> para salir' color n/w
   @08,18 get wfecha
   read
   @21,02 clear to 21,78
   if lastkey()<>27
         IF YEAR(WFECHA) = 2021
            SELECT 1
            USE DESPAR21
            wnro=exptes+1
         ELSE
         	IF YEAR(WFECHA) = 2023
            	SELECT 1
           		USE DESPAR23
           		wnro=exptes+1
         	else
             	IF YEAR(WFECHA) = 2024
                 	SELECT 1
            		USE DESPAR24
            		wnro=exptes+1
         	    else
         	    	if YEAR(WFECHA) = 2025
         	    	   select 1
         	    	   use despar25
         	    	   wnro=exptes+1
         	    	else
         	    	   if YEAR(WFECHA) = 2026
         	    	      select 1
         	    	      use despar26
         	    	      wnro=exptes+1
         	    	   else
         		          select 1   
    	    	          use despar
        		          wnro=exptes+1
        		       endif   
        		    endif
        		endif    
        	endif 
         endif
         select 2      
         @21,08 say 'Quien inicia el despacho';
                color n/w
         @08,33 get wrtte pict '@!'
         @09,33 get wrtte2 pict '@!'
         read
         @21,02 clear to 21,78
         @23,02 say 'Indique matr¡cula y categor¡a del profesional si corresponde'
         @12,04 get wmatri pict '99999'
         @12,15 get wcateg pict '!!'
         read
         @23,02 clear to 23,78
                  
         @23,12 say 'Indique la car tula del desp. u oprima <ESC> para salir'
         @14,03 get wcpto1 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         @15,03 get wcpto2 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         @16,03 get wcpto3 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         @17,03 get wcpto4 pict '@X'
         read
         @23,02 clear to 23,78
         werr='S'
         wop='N'
         wcod='J'
*         @22,02 say 'Indique la letra '
*         @22,19 get wcod pict '!'
*         read
         @08,03 say wcod color n/w
         @08,05 SAY wnro pict '99999' color n/w
         @22,32 get wop picture '@*H \<Ingresa;\<No Ingresa' size 1,1;
                color scheme 4
         read
         @22,02 clear to 22,78
         if wop='Ingresa'
            werr='N'
            select 2
            append blank
            replace dspcod   with wcod
            replace dspnro   with wnro
            replace dspano   with year(wfecha)
            replace dsprecep with wfecha
            replace dsprtte  with wrtte
            replace dsprtte2 with wrtte2
            replace dspcpto  with wcpto1
            replace dspcpto2 with wcpto2
            replace dspcpto3 with wcpto3 
            replace dspcpto4 with wcpto4
            replace dspmatri with wmatri
            replace dspcat   with wcateg
            select 1
            replace exptes with wnro
         else
            werr='N'
         endif
*         wop1=1
*         @22,32 get wop1 picture '@*H \<Inprimir;\<No Inprimir' size 1,1
*         read
*         @22,02 clear to 22,78
*         if wop1=1
*            set printer to lpt1
*            set console off
*            set printer on
*            set device to printer
*            ?
*            ?chr(27)+chr(87)+'1'
**            ?chr(27)+chr(119)+'1'
*            ?chr(27)+chr(71)
*            ?'  CONSEJO PROFESIONAL DE'
*            ?'  INGENIEROS  Y GEOLOGOS'
*            ?chr(27)+chr(72)
**            ??chr(27)+chr(119)+'0'
*            ??chr(27)+chr(87)+'0'
*            ?
*            ?
*            ?
*            ?
*            ?
*            ?
*            ?
*            ?'               E x p e d i e n t e  N§:  '
*            ?? wnro  pict '99999'
*            ?'               L e t r a              :      '
*            ??wcod
*            ?'               A ¤ o                  :   '
*            ??year(wfecha) pict '9999'
*            ?
*            ?
*            ?
*            ?
*			?
*			?
*            ?
*            ?chr(27)+chr(71)
*            ??chr(27)+chr(87)+'1'
*            ??chr(27)+chr(119)+'1'
*            ?'C A R A T U L A D O' at 10
*            ?chr(27)+chr(72)
*            ??chr(27)+chr(119)+'0'
*            ??chr(27)+chr(87)+'0'
*            ?
*            ?
*            ?
*            ?wrtte  at 5
*            ?wrtte2 at 5
*            ?
*            ?
*            ?
*            ?wcpto1 at 5
*            ?
*            ?wcpto2 at 5
*            ?
*            ?wcpto3 at 5
*            ?
*            ?wcpto4 at 5
*            ?
*            ?
*            ?
*            ?
*            ?
*            ?
*            ?
*            ?
**            ?chr(27)+chr(87)+'1'
**            ?chr(27)+chr(119)+'1'
*            ?'                          Mendoza, '
**            ??chr(27)+chr(119)+'0'
**            ??chr(27)+chr(87)+'0'
*            ??day(wfecha) pict '99'
*            ??' de '
*            ??wmeses(month(wfecha))
*            ??' de '
*            ??year(wfecha)
*            eject
*            set printer off
*            set device to screen
*         endif   		
   else
      wsigue='N'
   endif
enddo      
close all
@04,02 clear to 23,78
do pied
SHOW MENU PANT01D
RETURN

