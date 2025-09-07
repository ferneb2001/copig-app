procedure cpro200
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
use spmatri index spmatri.idx 
select 2
use spprof index spprof
select 4
use padron
wkey1=str(9)
wkey=str(7)
wtitu='   '
wsena=0
set date to ymd
select 4
GO TOP
do while not eof()
   if padseti=5
	   @05,01 say padmatri
	   wkey=str(padmatri,5)+'A '
	   @06,01 say wkey
	   @06,15 get wsena pict '9'
	   read
	   select 1
	   seek(wkey)
	   if found()
  			 wkey2=str(dctipo,1)+str(dcnro,8)
  			 @07,01 say wkey2
  			 @07,12 get wsena pict '9'
  			 read
  			 select 2
		  	 seek(wkey2)
		     if found()
		     	@08,01 say d.padmatri
	    	 	select 4
	            replace padtel  with b.telef
    	     endif
   	   endif 	
    endif  
    select 4     
	skip
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