procedure cpco00
* Menu principal del sistema de notas por comisiones
clear
set talk off
set date to dmy
set deleted on
   do pie
*   @03,03,03,78 box repl(chr(219),9)
   set talk off
   define menu pant01   
   define pad recibe     of pant01 prompt '\<Ingreso   '   at 03,02
   define pad consulta   of pant01 prompt '\<Consultas'   at 03,14
   define pad listados   of pant01 prompt '\<Listados'    at 03,25
   
   on selection pad recibe  of pant01 do cpcna

   on selection pad consulta of pant01 activate popup cons 
   define popup cons from 04,14
   define bar 1 of cons prompt 'Por \<Secc. y Tipo '  
   define bar 2 of cons prompt 'Por \<Rtte.        '
   define bar 3 of cons prompt 'M\<odifica Registros'
   on selection popup cons do cpcc with bar()

   on selection pad listados of pant01 activate popup list
   define popup list from 04,25
   define bar 1 of list promp 'Lista por \<Secci¢n'
   define bar 2 of list promp 'Lista por \<Rttes. '
   on selection popup list do cpcl with bar()
   
   activate menu pant01
   @10,29 say 'Tipee QUIT para salir' color n*/w
*endif
return


procedure pie
@00,01 to 24,79 double
@01,29 say 'NOTAS POR COMISIONES'
@01,70 say date()
@02,02 to 02,78
@22,13 clear to 22,69
@23,12 say 'Seleccione una opci¢n y oprima <ENTER> o <ESC> para salir';
           color n/w
return

procedure fondo
@03,02,24,79 box repl (chr(176),9)
return