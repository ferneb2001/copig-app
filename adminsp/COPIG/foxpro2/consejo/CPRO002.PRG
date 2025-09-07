procedure cpro002
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
use spmasor 
select 2
*use spprof index spprof
*use spprfpdr index spprfpdr
use spprof index spprof.idx
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
wopc=0
set date to ymd
wfedad={1994/09/30}
wfemat={2020/09/30}
wferesi={2023/09/30}
wopc=0
@18,10 say wfedad
@18,20 say wfemat
@18,30 say wferesi
select 1
GO TOP
do while not eof()
   @05,01 say numero
   @05,07 say titulo
   @05,12 say condic
   wasocia=0
   if catego='A '
  	 if condic < '2'
  		 wkey2=str(dctipo,1)+str(dcnro,8)
  		 select 2
	  	 seek(wkey2)
	     if found()
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
*				  if wpacod < '7'
*        	         select 4
*            	     append blank 
*                	 replace padcod  with wpacod
*	                 replace padtitu with wtitu
*    	             replace padseti with wpaseti
*        	         replace padayn  with wtidesc
*            	  endif   
    	       endif
    	       select 1
        	   wcateg=catego
          	   wmatri=numero
	           wtitu=titulo
    	       @10,10 say 'F.Inscrip:  '
        	   @10,20 say inscr
	           if inscr <> {    /  /  }
    	    	  IF FECHAB<> {    /  /  }
        	    	 IF INSCR < FECHAB
            	  		 winscr=inscr
	           	     else
    	          	     winscr=fechab
        	  	     endif
       	    	  else
          			  winscr=inscr         
	        	  ENDIF
    		   else
        	 	  winscr=fechab
		       endif
    	 	   @11,10 say 'winscr      '
	    	   @11,20 say winscr 
	           wpaseti=5
    	       wkey=str(numero,5)+catego
        	   wkey1=str(dctipo,1)+str(dcnro,8)
	           select 2
    	       seek(wkey1)
        	   if found()
	              wnombre=nombre
    	          wnacio =nacio
    	          wdocu=dcnro
        	      wnacion=nacion
        	      wasocia=numasoc
	              @12,10 say 'F.nacim.   '
    	          @12,20 say nacio
        	   else
	              wnombre=space(30)
    	          wnacio={    /  /  }
        	      wnacion='1'
	           endif
    	       @13,10 say 'wfedad      '
        	   @13,20 say  wfedad
	           if wnacio > wfedad
			      wpase2=' '
        	   else
	              wpase2=' '
    	       endif
        	   if wnacion <> 'A'
	              wpase3='o'
    	       else
        	      wpase3=' '
	           endif
	           @22,5 say winscr
	           @22,18 say wfemat
	           @22,70 get wopc pict ' '
	           read
    	       if winscr > wfemat
        	      wpase1='+'
	           else
    	          wpase1=' '
        	   endif
	           if winscr > wferesi
    	          wpase4= ' '
        	   else
	              wpase4= ' '
    	       endif
        	   do buscasan
	           if wsena = 1
    	          wpase5= '*'
        	   else
	              wpase5= ' '
    	       endif                                  
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
	         replace paddocu with wdocu
    	  endif   
      endif
      wop=0
*      @23,40 get wop pict '9'
*      read 	  
	  select 1     
	  skip
	else
      skip      
	endif
  else
  	skip 
  endif 
enddo
close all
*end

procedure buscasan
wsena=0
select 5
use spsanc index spsanc
*use spsncpdr index spsncpdr
locate for wkey = str(matric,5)+catego
do while found()
   if santipo = '1'
      if saninci = 'd' or saninci = 'D' or saninci = 'e' or saninci = 'E'
         wsena = 1
      endif
   endif
   continue      
enddo
return


procedure pie
@05,01 clear to 05,78
@20,03 clear to 20,78
@01,00 to 24,78 double
@03,01 to 03,78
@02,01 say 'CONSEJO PROF. DE INGENIEROS Y GEOLOGOS'
@02,63 SAY 'ADMINISTRACION' COLOR SCHEME 5
return