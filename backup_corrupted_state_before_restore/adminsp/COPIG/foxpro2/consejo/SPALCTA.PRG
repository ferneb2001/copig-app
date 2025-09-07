procedure spalcta
set talk off
*listado de cantidades de profesionales por departamento
*  utilizando sptempo creado
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
set exclusive on
set safety off
wfecha=date()
set exclusive off
whabi=' '
wop=1
wnomtit=space(30)
*do cuenta
*procedure cuenta
*wop=1
wgmza=0
wrmza=0
wotpcia=0
set device to screen
set console on
set printer off
@23,01 clear to 23,78
   select 1
   use sptempos
   go top
   do while .not. eof()
      if provin = 0 or provin = 1
         if dpto = 0 or dpto = 1 or dpto = 2 or dpto = 4 or dpto = 5 or dpto =6 or dpto = 7
            wgmza=wgmza+1
         else
            wrmza=wrmza+1   
         endif
      else
         wotpcia=wotpcia+1
      endif
      @10,5 say wgmza
      @11,5 say wrmza
      @12,5 say wotpcia     
*      select 1         
      skip
   enddo
*return
do imprime
close all
return


procedure imprime
   set console off
   set printer on
   set device to printer
whabi='S'
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE CANTIDADES DE PROFESIONALES POR DEPARTAMENTO' AT 20
?? wfecha  at 80 
? '       DEPARTAMENTO        CANTIDAD        POR ZONA  '
   ?
   ?'       Gran Mendoza:  '
   ?? wgmza  pict '99999' at 25
   ?'       Resto Mendoza: '
   ?? wrmza  pict '99999'  at 25
   ?'       Otras Pcias:  '
   ?? wotpcia pict '99999' at 25
   set printer off
   set device to screen
   set safety on
@04,01 clear to 23,78
return