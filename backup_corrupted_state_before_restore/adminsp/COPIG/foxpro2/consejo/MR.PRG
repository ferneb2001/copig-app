procedure mr
hide menu pant01
@03,02,23,78 box repl(chr(176),9)
@04,27 clear to 04,54
@03,26 say 'RECEPCION DE CORRESPONDENCIA' color n/w 
@06,04 clear to 06,77
@05,03 say 'Nro.de orden     Fecha     D¡a ingreso                 Remitente          ';
       color n/w
@11,15 clear to 11,67
@10,14 say 'Somera descripci¢n del Concepto de la Correspondencia' color n/w
wsigue='S'
wnro=0
*select 1
*use cpar
select 2
use mail index maili
do while wsigue='S'
   wrtte=space(40)
   wfecha=date()
   wdiain=date()
   wcpto1=space(75)
   wcpto2=space(75)
   wcpto3=space(75)
   @07,02,20,78 box repl(chr(176),9)
   @11,15 clear to 11,67
   @10,14 say 'Somera descripci¢n del Concepto de la Correspondencia' color n/w
   @22,13 clear to 22,69
   @21,12 say 'Indique la fecha de la correspondencia o <ESC> para salir' color n/w
   @08,18 get wfecha
   read
   if lastkey()<>27
      @22,06 clear to 22,75
      @21,05 say 'Indique la fecha de recepci¢n de la correspondencia o <ESC> para salir';
             color n/w
      @08,32 get wdiain
      read
      if lastkey()<>27
         if year(wdiain) = 2017
            select 1
            use cpar2017
          else
            if year(wdiain) = 2018
               select 1
               use cpar2018
            else
               if year(wdiain) = 2019
                  select 1
                  use cpar2019
               else
                  if year(wdiain) = 2020
                     select 1
                     use cpar2020
	               else
    	              if year(wdiain) = 2021
        	             select 1
            	         use cpar2021
            	      else
            	      		if year(wdiain) = 2022
            	      			select 1
            	      			use cpar2022
            	      		else	
            	      			if year(wdiain) = 2023
            	      				select 1
            	      				use cpar2023
            	      			else 	
            	      				if year(wdiain) = 2024
            	      					select 1
            	      					use cpar2024
            	      				else
            	      					if year(wdiain) = 2025
            	      						select 1
            	      						use cpar2025
            	      					else	
            	      						if year(wdiain) = 2026
            	      							select 1
            	      							use cpar2026
            	      						else
            	      							if year(wdiain) = 2016
            	      								select 1
            	      								use cpar2016
            	      							endif		
            	      						endif	
            	      					endif		
            	      				endif	
            	      			endif	
*            	      		endif	
            	      	endif   
               		  endif
                  endif
               endif
            endif   
         endif
         select 2      
         wsocio=0
         @21,02,22,78 box repl(chr(176),9)
         @22,09 clear to 22,28
         @21,08 say 'Indique el remitente';
                color n/w
            @08,43 get wrtte pict '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
            read         
            @21,08,22,78 box repl(chr(176),9)
         @15,04 clear to 17,78
         @23,12 say 'Indique el concepto de la nota u oprima <ESC> para salir'
         @14,03 get wcpto1 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         @15,03 GET Wcpto2 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         @16,03 get wcpto3 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         read
         @23,02,23,78 box repl(chr(176),9)
         werr='S'
         wop='N'
         wcod=space(1)
         @22,02 say 'Indique la letra '
         @22,19 get wcod pict '!'
         read
         @08,03 say wcod color n/w
         do numero 
         @18,02,23,78 box repl(chr(176),9)
         @22,32 get wop picture '@*H \<Ingresa;\<No Ingresa' size 1,1;
                color scheme 4
         read
         @15,02,23,78 box repl(chr(176),9)
         if wop='Ingresa'
            werr='N'
            select 2
            append blank
            replace cod   with wcod
            replace nro   with wnro
            replace ano   with year(wdiain)
            replace fecha with wfecha
            replace recep with wdiain
            *replace socio with wsocio
            replace rtte  with wrtte
            replace cpto  with wcpto1
            replace cpto2 with wcpto2
            replace cpto3 with wcpto3 
            select 1
            if wcod='A'
               replace A with wnro
            endif   
            if wcod='B'
               replace B with wnro
            endif   
            if wcod='C'
               replace C with wnro
            endif   
            if wcod='D'
               replace D with wnro
            endif   
            if wcod='E'
               replace E with wnro
            endif   
            if wcod='F'
               replace F with wnro
            endif   
            if wcod='G'
               replace G with wnro
            endif   
            if wcod='H'
               replace H with wnro
            endif   
            if wcod='I'
               replace I with wnro
            endif   
            if wcod='J'
               replace J with wnro
            endif   
            if wcod='K'
               replace K with wnro
            endif   
            if wcod='L'
               replace L with wnro
            endif   
            if wcod='M'
               replace M with wnro
            endif   
            if wcod='N'
               replace N with wnro
            endif   
            if wcod='O'
               replace O with wnro
            endif   
            if wcod='P'
               replace P with wnro
            endif   
            if wcod='Q'
               replace Q with wnro
            endif   
            if wcod='R'
               replace R with wnro
            endif   
            if wcod='S'
               replace S with wnro
            endif   
            if wcod='T'
               replace T with wnro
            endif   
            if wcod='U'
               replace U with wnro
            endif   
            if wcod='V'
               replace V with wnro
            endif   
            if wcod='W'
               replace W with wnro
            endif   
            if wcod='X'
               replace X with wnro
            endif   
            if wcod='Y'
               replace Y with wnro
            endif   
            if wcod='Z'
               replace Z with wnro
            endif   
         else
            werr='N'
         endif
      else
         wsigue='N'
      endif      
   else
      wsigue='N'
   endif
enddo      
close all
@03,02,23,78 box repl(chr(176),9)
do pie
SHOW MENU PANT01
RETURN

procedure numero
select 1
if wcod='A'
   wnro=A+1
else
if wcod='B'
   wnro=B+1
else
if wcod='C'
   wnro=C+1
else
if wcod='D'
   wnro=D+1
else
if wcod='E'
   wnro=E+1
else
if wcod='F'
   wnro=F+1
else
if wcod='G'
   wnro=G+1
else
if wcod='H'
   wnro=H+1
else
if wcod='I'
   wnro=I+1
else
if wcod='J'
   wnro=J+1
else
if wcod='K'
   wnro=K+1
else
if wcod='L'
   wnro=L+1
else
if wcod='M'
   wnro=M+1
else
if wcod='N'
   wnro=N+1
else
if wcod='O'
   wnro=O+1
else
if wcod='P'
   wnro=P+1
else
if wcod='Q'
   wnro=Q+1
else
if wcod='R'
   wnro=R+1
else
if wcod='S'
   wnro=S+1
else
if wcod='T'
   wnro=T+1
else
if wcod='U'
   wnro=U+1
else
if wcod='V'
   wnro=V+1
else
if wcod='W'
   wnro=W+1
else
if wcod='X'
   wnro=X+1
else
if wcod='Y'
   wnro=Y+1
else
if wcod='Z'
   wnro=Z+1
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
endif
endif

@08,05 SAY wnro pict '9999' color n/w
return