procedure pagoc02
*Genera archivo pagocert desde pagocaja
set talk off
@04,01 clear to 23,78
@04,28 say 'Graba Pagos PROFESIONALES'
select 2
use spprof index spprof
select 3
set exclusive on
set safety off
use pagocert
zap
select 1
use spmatri index spmatri
select 4
use caja2309 order matric
set exclusive off
set century on
wfecha=date()
set date dmy
@04,60 say wfecha
whabi=' '
waux1=0
waux2=0
waux3=0
wimpro=0
wmatric=0
wop=1
wnomtit=space(30)
wnoment=space(30)
@23,01 clear to 23,78
   wop=1
   wcatego='  '
      @23,01 clear to 23,78
   wop=1
   wtitulo=space(3)
   wnomtit=space(30)
   wdpto=0
   wnomdpto=space(14)
   @23,01 clear to 23,78
   wop=1
   wopp=0
   @23,30 get wop pict '@*H \<Salir;\<Grabar'
   read
   @14,21 to 16,57
   @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
   if wop=2                   
      select 4
      go top
      wmatric=matric
      do while not eof()
      	if wmatric=matric
      		wimpro=wimpro+importe
     	 	wkey=str(matric,5)+catego
     		 select 1
     		 use spmatri index spmatri
     		 set clock on
	     	 @17,02 say d.catego
    	 	 @17,06 say d.matric pict '99999'
    		 seek(wkey)
    		 if found()
    		 	wkey1=str(dctipo,1)+str(dcnro,8)
    		 	select 2
    		 	seek(wkey1)
    	  		if found()
    	   		 	wnombre=nombre
    	   		else
    	    		@12,10 say 'No se encuentra profesional'
    	    		@13,10 say wkey1
    	    		@13,70 get wop
    	    		read
    	    		wnombre=space(30)
    	   		endif
    		 else
    	 		@14,10 say 'no se encuentra matricula '
    	 		@15,10 say wkey
    	 		@15,70 get wop
    	 		read
    	 		wnombre=space(30)
    	 	 endif
    	 else
    	 select 3
    	 append blank
    	 replace pmatric  with wmatric
    	 replace pcatego  with wcatego
    	 replace pnombre  with wnombre
    	 replace pcerimp  with wimpro
    	 wimpro=wimpro+d.importe
    	 wmatric=d.matric
    	 wcatego=d.catego
    	endif 
      select 4
      skip	  
   enddo
  endif   
*endif
@20,1 get wop
read
@04,01 clear to 23,78
close all
return

