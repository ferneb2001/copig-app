procedure exr
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
@03,28 say 'RECEPCION DE EXPEDIENTES' color n/w 
*@06,04 clear to 06,77
@05,03 say ' Expte.Numero  Fecha Inicio      Detalle de quien inicia el expediente';
       color n/w
*@11,15 clear to 11,67
@10,02 say 'Matricula/categoria'
@10,29 say 'Car tula del expediente' color n/w
wsigue='S'
wnro=0
*select 1
*use cpar
*wnro=exptes+1
select 2
use exptes index exptesi, exptprf, exptprno
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
   wnomp=space(30)
   wcuit=space(11)
   wclase=0
   @21,12 say 'Indique la fecha de inicio del expte. o <ESC> para salir' color n/w
   @08,18 get wfecha
   read
   @21,02 clear to 21,78
   if lastkey()<>27
		IF YEAR(WFECHA) = 2019
        	SELECT 1
            USE CPAR2019
            wnro=exptes+1
        ELSE
        	IF YEAR(WFECHA) = 2018
               select 1
               use cpar2018
               wnro=exptes+1
            ELSE
            	IF YEAR(WFECHA) = 2020
                	SELECT 1
	  	            USE CPAR2020
         	        wnro=exptes+1
            	ELSE
                	IF YEAR(WFECHA) = 2021
                    	SELECT 1
                   		USE CPAR2021
	                    wnro=exptes+1
	 	            ELSE
    		            IF YEAR(WFECHA) = 2022
        			        SELECT 1
            	    	    USE CPAR2022
                	    	wnro=exptes+1
                	    else
                	    	if YEAR(WFECHA)= 2023
                	    		SELECT 1
                	    		USE CPAR2023
                	    		wnro=exptes+1
                	    	else	
                	    		if YEAR(WFECHA)= 2024
                	    			SELECT 1
                	    			USE CPAR2024
                	    			wnro=exptes+1
                	    		else		
                	    			if YEAR(WFECHA)= 2025
                	    				SELECT 1
                	    				USE CPAR2025
                	    				wnro=exptes+1
                	    			else
                	    				if YEAR(WFECHA)=2026
                	    					SELECT 1
                	    					USE CPAR2026
                	    					WNRO=EXPTES+1
                	    				else		
                	    					if YEAR(WFECHA)=2015
                	    						SELECT 1
                	    						USE CPAR2015
                	    						WNRO=EXPTES+1
                	    					else
                	    						if year(wfecha)=2017
                	    							select 1
                	    							use cpar2017
                	    							wnro=exptes+1
                	    						else
                	    						  if year(wfecha)=2016
                	    						    select 1
                	    						    use cpar2016
                	    						    wnro=exptes+1
                	    						  endif	
                	    						endif		
                	    					endif	
                	    				endif		
                	    			endif	
                	    		endif		
                	    	endif		
             	     	endif
                 	endif
             	endif   
            endif         
         endif
         select 2      
         @21,08 say 'Quien inicia el expediente';
                color n/w
         @08,33 get wrtte pict '@!'
         @09,33 get wrtte2 pict '@!'
         read
         @21,02 clear to 21,78
         @23,02 say 'Indique matr¡cula y categor¡a del profesional si corresponde'
         @11,04 get wmatri pict '99999'
         @11,15 get wcateg pict '!!'
         read
         @12,02 say 'CUIT '
         @12,09 GET wcuit pict '@!'
         read
         @23,02 clear to 23,78
         @23,01 say 'Ingrese nombre Empresa/Prof para b£squeda alfab‚tica '
         @12,29 get wnomp pict '@!'
         read
         @23,02 clear to 23,78         
         @23,12 say 'Indique la car tula del expte. u oprima <ESC> para salir'
         @14,03 get wcpto1 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         @15,03 get wcpto2 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         @16,03 get wcpto3 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         @17,03 get wcpto4 pict '@X'
         read
         @23,02 clear to 23,78
         werr='S'
         wop='N'
         wcod=space(1)
         @20,02 say 'Indique la letra '
         @20,19 get wcod pict '!'
         @21,02 say 'Indique clase 1=De Oficio 2=Por Denuncia 3=Por Inspectores 0=otros'
         @21,72 get wclase pict '9'
         read
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
            replace cod   with wcod
            replace nro   with wnro
            replace ano   with year(wfecha)
            replace recep with wfecha
            replace rtte  with wrtte
            replace rtte2 with wrtte2
            replace cpto  with wcpto1
            replace cpto2 with wcpto2
            replace cpto3 with wcpto3 
            replace cpto4 with wcpto4
            replace matri with wmatri
            replace cat   with wcateg
            replace clase with wclase
            replace inomb with wnomp
            replace excuit with wcuit
            select 1
            replace exptes with wnro
         else
            werr='N'
         endif
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
**           ?chr(27)+chr(119)+'1'
*           ?chr(27)+chr(71)
            ?'  CONSEJO PROFESIONAL DE'
            ?'  INGENIEROS  Y GEOLOGOS'
*           ?chr(27)+chr(72)
**           ??chr(27)+chr(119)+'0'
*           ??chr(27)+chr(87)+'0'
            ?
            ?
            ?
            ?
            ?
            ?
            ?
            ?'               E x p e d i e n t e  N§:  '
            ?? wnro  pict '99999'
            ?'               L e t r a              :      '
            ??wcod
            ?'               A ¤ o                  :   '
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
            ?'C A R A T U L A D O' at 10
*           ?chr(27)+chr(72)
*           ??chr(27)+chr(119)+'0'
*           ??chr(27)+chr(87)+'0'
            ?
            ?
            ?
            ?wrtte  at 5
            ?wrtte2 at 5
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
            ?'                          Mendoza, '
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
               ?
               ?chr(027)+chr(038)+chr(108)+chr(051)+chr(065)
               ??chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
               ??chr(027)+chr(040)+chr(115)+chr(049)+chr(080)
               ??chr(027)+chr(040)+chr(115)+'6'+chr(072)
               ??chr(027)+chr(040)+chr(115)+'16'+chr(086)
*               ??chr(027)+chr(040)+chr(115)+'18'+chr(086)
               ?'       CONSEJO PROFESIONAL DE'
               ?'       INGENIEROS  Y GEOLOGOS'
               ?chr(027)+chr(040)+chr(115)+'10'+chr(072)
               ??chr(027)+chr(040)+chr(115)+'12'+chr(086)
               ?chr(027)+chr(040)+chr(115)+chr(048)+chr(080)
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
               ?
               ?chr(027)+chr(040)+chr(115)+'5'+chr(072)
               ??chr(027)+chr(040)+chr(115)+'36'+chr(086)
               ?'C A R A T U L A D O' at 11
               ?chr(027)+chr(040)+chr(115)+'10'+chr(072)
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
               ?chr(027)+chr(038)+chr(108)+chr(055)+chr(054)+chr(065)
               set printer off
               set device to screen
*                 codigos para imprimir en Xerox laser      
               endif
            endif   
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

