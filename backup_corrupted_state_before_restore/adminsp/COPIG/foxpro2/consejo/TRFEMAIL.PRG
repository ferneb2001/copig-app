procedure trfemail
* saca comas entre apellido y nombre en archivo con emails
set talk off
select 1
use sptemail
go top
do while not eof()
	@10, 10 say nombre
		CHRTRAN(nombre,',',' ')
	@12, 10 say nombre
	skip
enddo
close all
return