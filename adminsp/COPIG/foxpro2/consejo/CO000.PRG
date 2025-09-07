procedure co000
clear
set talk off
set date to french
set deleted on
WFCONT=2449750
*if val(sys(1))<wfcont
   do pie3
   @03,03,03,78 box repl(chr(219),9)
   set talk off
   define menu pant013   
   define pad recibe     of pant013 prompt '\<Recepci¢n'   at 03,02
   define pad consulta   of pant013 prompt '\<Consultas'   at 03,26
   define pad listados   of pant013 prompt '\<Listados'    at 03,47
   define pad rubros     of pant013 prompt 'R\<ubros  '    at 03,60

   on selection pad recibe  of pant013 do comr

   on selection pad consulta of pant013 activate popup cons 
   define popup cons from 04,26
   define bar 1 of cons prompt 'Por \<Comisi¢n  '  
   define bar 2 of cons prompt 'Por \<Rubro'
   on selection popup cons do comc with bar()

   on selection pad listados of pant013 activate popup list
   define popup list from 04,47
   define bar 1 of list promp 'Lista por \<Comisi¢n'
   define bar 2 of list promp 'Lista por \<Rubro '
   on selection popup list do coml with bar()

   on selection pad rubros   of pant013 activate popup rubr
   define popup rubr from 04,60
   define bar 1 of rubr promp 'Ingresa \<Rubros    '
   define bar 2 of rubr promp '\<Consulta Rubros '
   on selection popup rubr do comru with bar()
   
   activate menu pant013
   @10,29 say 'Tipee QUIT para salir' color n*/w
*endif
return


procedure pie3
do fondo
@00,01 to 24,79 double
@01,27 say 'DOCUMENTACION RECIBIDA POR COMISIONES'
@01,70 say date()
@02,02 to 02,78
@22,13 clear to 22,69
@21,12 say 'Seleccione una opci¢n y oprima <ENTER> o <ESC> para salir';
           color n/w
return

procedure fondo
@03,02,24,79 box repl (chr(176),9)
return