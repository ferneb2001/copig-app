procedure spalgp4
*listado de profesionales
* Lista errores entre spmatri y spprof lee por documento
SET TALK OFF
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof
go top
select 1
set safety off
use spmatri index spmatdo
go top
set exclusive off
set date ymd
wfecha=date()
@22,50 say wfecha
whabi=' '
wop=1
wcuen=0
wnomtit=space(30)
@23,01 clear to 23,78
wop=1
select 2
set clock on
WLIN=0
DO TITULOS
@14,21 to 16,57
@15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
do while .not. eof()
   @17,03 say dctipo
   @17,06 say dcnro  pict '99999999'
   do arma
   select 2
   skip
enddo
@04,01 clear to 23,78
close all
return

procedure imprime
set date dmy
wop=1
@23,01 clear to 23,78
   set console off
   set printer on
   set device to printer
   set printer to 'LPT1'
   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
   ???chr(27)+chr(15)
   wlin=96
   whoja=0
   SELECT 2
   ? b.dctipo  pict '9'
   ??dcnro  pict '99999999' at 3
   ??nombre  at 15
   ??domici  at 56
   ?? telef  at 87
   ?? estado at 101
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   set printer off
   set device to screen
   set safety on
return

procedure titulos
if wlin > 85
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE PROFESIONALES con error ' AT 20
??'Fecha: ' at 80
?? wfecha  at 87 
?
? 'DOCUMENTO      NOMBRE'
*?? 'F.MATRIC'   AT 46
?? ' DOMICILIO' AT 56
?? ' TELEFONO ' AT 87
??  'ESTADO' AT 99
wlin = 5
return



procedure arma
select 1
seek(str(b.dctipo,1)+str(b.dcnro,8))
if found()
      @18,1 say a.numero
      @18,7 say a.catego
      @18,10 say b.nombre
      @18,60 say b.nacio
else
      do imprime      
endif
select 2 
return