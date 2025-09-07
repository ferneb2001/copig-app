procedure cpro002a
* Arma archivo de padrones PADRON.DBF
clear
set century on
set delete on
set exclusive off
set device to screen
set talk off
do pie
set date to ymd
select 1
*use spmasor 
use sptempoa
select 2
*use spprof index spprof
*use spprfpdr index spprfpdr
use spprof index spprof
select 3
use sptitu order titulo
select 4
set exclusive on
use padron
zap
set exclusive off
wkey1=str(9)
wkey=str(7)
wtitu='   '
wsena=0
set date to ymd
wfedad={1970/09/30}
wfemat={1998/09/30}
wferesi={2000/09/30}
@18,10 say wfedad
@18,20 say wfemat
@18,30 say wferesi
select 1
GO TOP
do while not eof()
   @05,01 say numero
   @05,07 say titulo
*  @05,12 say condic
   wasocia=0
   wpase1=' '
   wpase2=' '
   wpase3=' '
   wpase4=' '
   wpase5=' '
   if catego='A '
* 	 if condic < '2'
* 		 wkey2=str(dctipo,1)+str(dcnro,8)
* 		 select 2
*	  	 seek(wkey2)
*	     if found()
*  			if numasoc<>0
			   if wtitu <> a.titulo
        		  wtitu = a.titulo
		          wpaseti=1
		          select 3
     		      locate for titulo = wtitu
		    	  if found()
	        	     wtidesc=titplur
		             wpacod = tipadron
     		      else
          		     wtidesc=space(35)
	            	 wpacod ='Z'
	     	      endif
*                            if wpacod < 'A'		* debe cambiarse cada dos a¤os 1999 no constructores
				  if wpacod < '7'
        	         select 4
            	     append blank 
                	 replace padcod  with wpacod
	                 replace padtitu with wtitu
    	             replace padseti with wpaseti
        	         replace padayn  with wtidesc
            	  endif   
    	       endif
    	       select 1
        	   wcateg=catego
          	   wmatri=numero
	           wtitu=titulo
*    	       @10,10 say 'F.Inscrip:  '
*        	   @10,20 say inscr
	           wpaseti=5
    	       wkey=str(numero,5)+catego
	              wnombre=a.nombre
        	   select 3
	           locate for titulo = wtitu
    	       if found()
        	      wtidesc=titplur
	              wpacod = tipadron
    	       else
        	      wtidesc=space(35)
	              wpacod ='Z'     
    	       endif
		   if wpacod < '7'
    	     select 4
        	 append blank 
	         replace padcod  with wpacod
    	     replace padtitu with wtitu
        	 replace padseti with wpaseti
	         replace padayn  with wnombre
    	     replace padmatri with wmatri
        	 replace padse1  with wpase1
	         replace padse2  with wpase2
    	     replace padse3  with wpase3
        	 replace padse4  with wpase4
	         replace padse5  with wpase5
	         replace pasocia with wasocia
    	  endif   
*    	endif
      endif 	  
	  select 1     
	  skip
*      wait
*	else
*      skip      
*	endif
*  else
*  	skip 
*  endif 
enddo
close all
*end



procedure pie
@05,01 clear to 05,78
@20,03 clear to 20,78
@01,00 to 24,78 double
@03,01 to 03,78
@02,01 say 'CONSEJO PROF. DE INGENIEROS Y GEOLOGOS'
@02,63 SAY 'ADMINISTRACION' COLOR SCHEME 5
return