procedure com000
* Menu principal de control de Servicios por Comisi¢n
clear
set talk off
set date to dmy
set deleted on
   do pie
   @03,03,03,78 box repl(chr(219),9)
   set talk off
   define menu pant01   
   define pad recibe     of pant01 prompt '\<Ingreso '   at 03,02
   define pad consulta   of pant01 prompt '\<Consultas '   at 03,11
   define pad listados   of pant01 prompt '\<Listados '    at 03,22
*   define pad seguridad  of pant01 prompt '\<Seguridad '   at 03,30
   
*   on selection pad recibe  of pant01 do comr
   on selection pad recibe of pant01 activate popup reci
   define popup reci from 04,02
   define bar 1 of reci prompt 'Servicios    '
   define bar 2 of reci prompt 'Codigos de Servicios'
   on selection popup reci do comr0 with bar()

   on selection pad consulta of pant01 activate popup cons 
   define popup cons from 04,11
   define bar 1 of cons prompt 'Por \<Servicio '  
   define bar 2 of cons prompt 'Por \<Rtte.    '
   define bar 3 of cons prompt 'Por \<Nota     '
   DEFINE bar 4 of cons prompt 'Codigos de Servicios '
   on selection popup cons do comc with bar()

   on selection pad listados of pant01 activate popup list
   define popup list from 04,21
   define bar 1 of list promp 'Lista por \<Servicio'
   define bar 2 of list promp 'Lista por \<Rttes.  '
   define bar 3 of list promp 'Lista por \<Nota    '
   define bar 4 of list promp 'Lista \<c¢digos de Servicios'
   on selection popup list do coml with bar()
*   on selection pad seguridad of pant01 do exnoimp

   activate menu pant01
   @10,29 say 'Tipee QUIT para salir' color n*/w
*endif
return


procedure pie
*do fondo
@00,01 to 24,79 double
@01,29 say 'CONTROL DE SERVICIOS'
@01,70 say date()
@02,02 to 02,78
@22,13 clear to 22,69
@23,12 say 'Seleccione una opci¢n y oprima <ENTER> o <ESC> para salir';
           color n/w
return

procedure fondo
@03,02,24,79 box repl (chr(176),9)
return