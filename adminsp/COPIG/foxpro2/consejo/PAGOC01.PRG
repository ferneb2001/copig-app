procedure pagoc01
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
select 4
use spmatri index spmatri
select 5
use pagocaja
set exclusive off
set century on
wfecha=date()
set date dmy
@04,60 say wfecha
whabi=' '
waux1=0
waux2=0
waux3=0
wop=1
wnomtit=space(30)
wnoment=space(30)
@23,01 clear to 23,78
if wop=1
   whabi='S'
else
   if wop=2
      whabi='N'
   else
      whabi=' '
   endif      
endif      
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
      select 5
      go top
      do while not eof()
     	 wkey=str(cjmatri,5)+cjcateg
     	 select 4
     	 use spmatri index spmatri
     	 set clock on
	      @17,02 say e.cjcateg
    	  @17,06 say e.cjmatri pict '99999'
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
    	 select 3
    	 append blank
    	 replace pmatric  with e.cjmatri
    	 replace pcatego  with e.cjcateg
    	 replace pnombre  with wnombre
    	 replace pcerfec  with e.cjfecha
    	 replace pcertif  with e.cjcert
    	 replace pcerrec  with e.cjrecibo
    	 replace pcercpt  with 1
    	 replace pcerimp  with e.cjimpo
    	 if e.cjcpto = 6
    	 	replace pcecaj with 1
    	 else 
    	 	if e.cjcpto=7
    	 		replace pcecaj with 4
    	 	else
    	 		if e.cjcpto=8
    	 			replace pcecaj with 2
    	 		else
    	 			replace pcecaj with 0
    	 		endif
    	 	endif
    	 endif	
      select 5
      skip	  
      enddo
  endif   
*endif
@20,1 get wop
read
@04,01 clear to 23,78
close all
return

