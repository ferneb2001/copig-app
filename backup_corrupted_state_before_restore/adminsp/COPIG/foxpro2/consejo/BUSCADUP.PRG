procedure buscadup
* busca profesionales con dos matriculas
set talk off
set date dmy
select 2
use spdupli
select 1
use spmatri order dcnro
wcampo=space(8)
wop=0
do while not eof()
	wcampo=str(dcnro,8)
	skip
	do while wcampo=str(dcnro,8)
	 @10, 2 say numero
	 @10, 12 say catego
	 select 2
	 append blank
	 replace b.numero with a.numero
	 replace b.catego with a.catego
	 replace b.dcnro with a.dcnro
	 replace b.dctipo with a.dctipo
	 select 1
	 @10,40 get wop
	 read
	 if lastkey()=27
	 	exit
	 endif	
	 skip
	enddo
*	skip
enddo
close all
clear all
return