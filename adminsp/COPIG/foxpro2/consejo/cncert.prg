procedure cncert
*listado de cant.de certif. por profesional y por mes            
@04,01 clear to 23,78
@04,28 say 'CONTEO DE CERTIFICADOS  POR Profesional'
wfede={  /  /  }
wfeha={  /  /  }
set century on
set date to dmy
wfecha=date()
wofi=0
@06,10 say 'Indique Fecha Inicial: '
@07,10 say 'Indique Fecha Final  : '
@06,50 get wfede
@07,50 get wfeha
@08,10 say 'Oficina (0=todas 1,2,3,4):'
@08,50 get wofi pict '9'
read
wtemp=0
set talk off
select 3
set exclusive on
set safety off
use cncantma  
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(35)
whabi=' '
wcatego='  '
wcanca=0
wcancb=0
wcancd=0
wtitulo=space(3)
wnuind=0
@23,01 clear to 23,78
wkey=space(5)
wkey1=space(7)
select 2
use spce0210
go top
set clock on
do while .not. eof()
   @15, 20 say cefecha
   @15, 30 say cecerti
   if cefecha >= wfede
      if cefecha <= wfeha
	      wlista=0
    	   if wofi = 0
        	  wlista = 1
      	   else
          	if wofi = ceofici
            	 wlista = 1
         	endif
     	   endif
       if wlista = 1         
         if cecateg = 'EM'
            wtemp=wtemp+1
         else
           if cecateg='A ' or cecateg='CR'
            wkey=str(cematri,5)   
            select 3
            use cncantma order cnmatri
            seek(wkey)
            if found()
            	DO case
            		case month(b.cefecha)=1
            			replace cnene with cnene+1
            		case month(b.cefecha)=2
            			replace cnfeb with cnfeb+1
            		case month(b.cefecha)=3
            			replace cnmar with cnmar+1
            		case month(b.cefecha)=4
            			replace cnabr with cnabr+1
            		case month(b.cefecha)=5
            			replace cnmay with cnmay+1
            		case month(b.cefecha)=6
            			replace cnjun with cnjun+1
            		case month(b.cefecha)=7
            			replace cnjul with cnjul+1
            		case month(b.cefecha)=8
            			replace cnago with cnago+1
            		case month(b.cefecha)=9
            			replace cnset with cnset+1
            		case month(b.cefecha)=10
            			replace cnoct with cnoct+1
            		case month(b.cefecha)=11
            			replace cnnov with cnnov+1
            		case month(b.cefecha)=12
            			replace cndic with cndic+1
            	endcase
            ELSE
            	append blank
            	replace cnmatri  with b.cematri
            	replace cncateg  with b.cecateg
            	replace cnene    with 0
            	replace cnfeb    with 0
            	replace cnmar    with 0
            	replace cnabr    with 0
            	replace cnmay    with 0
            	replace cnjun    with 0
            	replace cnjul    with 0
            	replace cnago    with 0
            	replace cnset    with 0
            	replace cnoct    with 0
            	replace cnnov    with 0
            	replace cndic    with 0
            	DO case
            		case month(b.cefecha)=1
            			replace cnene with cnene+1
            		case month(b.cefecha)=2
            			replace cnfeb with cnfeb+1
            		case month(b.cefecha)=3
            			replace cnmar with cnmar+1
            		case month(b.cefecha)=4
            			replace cnabr with cnabr+1
            		case month(b.cefecha)=5
            			replace cnmay with cnmay+1
            		case month(b.cefecha)=6
            			replace cnjun with cnjun+1
            		case month(b.cefecha)=7
            			replace cnjul with cnjul+1
            		case month(b.cefecha)=8
            			replace cnago with cnago+1
            		case month(b.cefecha)=9
            			replace cnset with cnset+1
            		case month(b.cefecha)=10
            			replace cnoct with cnoct+1
            		case month(b.cefecha)=11
            			replace cnnov with cnnov+1
            		case month(b.cefecha)=12
            			replace cndic with cndic+1
            	endcase
            endif
           endif    
         endif
       endif     
      endif
   endif
   select 2
   skip         
enddo   
*@12,01 clear to 12,78       
@04,01 clear to 23,78
close all
return

