procedure m000
clear
set talk off
set date to french
set deleted on
WFCONT=2449750
*if val(sys(1))<wfcont
   do pie
   @03,03,03,78 box repl(chr(219),9)
   set talk off
   define menu pant01   
   define pad recibe     of pant01 prompt '\<Recepci¢n'   at 03,02
   define pad mueve      of pant01 prompt '\<Movimientos' at 03,13
   define pad consulta   of pant01 prompt '\<Consultas'   at 03,26
   define pad informes   of pant01 prompt '\<Informes'    at 03,37 
   *define pad remitentes of pant01 prompt 'R\<emitentes'  at 03,47
   *define pad envios     of pant01 prompt 'E\<nvios'      at 03,58
   define pad listados   of pant01 prompt '\<Listados'    at 03,47

*   on selection pad recibe  of pant01 do mr
   on selection pad recibe  of pant01 activate popup recibs
   define popup  recibs from 04,02
   define bar 1 of recibs prompt '\<Recibe notas   '
   define bar 2 of recibs prompt '\<Modifica Notas ' 
   on selection popup recibs do mrm with bar()  

   on selection pad mueve of pant01 activate popup movs
   define popup movs from 04,13
   define bar 1 of movs prompt '\<Mueve notas       '
   define bar 2 of movs prompt '\<Anula movimientos '	
   on selection popup movs do mmm with bar() 

   on selection pad consulta of pant01 activate popup cons 
   define popup cons from 04,26
   define bar 1 of cons prompt 'Por \<Nro.de Nota'  
   define bar 2 of cons prompt 'Por \<Rtte.'
   on selection popup cons do mc with bar()

   on selection pad informes of pant01 activate popup inf 
   define popup inf from 04,37
   define bar 1 of inf prompt '\<Por Nro.de Nota'  
   define bar 2 of inf prompt '\<Por Rtte.'
   define bar 3 of inf prompt '\<Por Secciones' 
   on selection popup inf do mnoimp

   *on selection pad remitentes of pant01 do me 
   *on selection pad remitentes of pant01 do mnoimp

   *on selection pad envios of pant01 do mn

   on selection pad listados of pant01 activate popup list
   define popup list from 04,47
   define bar 1 of list promp 'Lista notas por \<N£mero'
   define bar 2 of list promp 'Lista notas por \<Rttes.'
   define bar 3 of list promp 'Lista \<una Nota'
   on selection popup list do ml with bar()

   activate menu pant01
   @10,29 say 'Tipee QUIT para salir' color n*/w
*endif
return


procedure pie
do fondo
@00,01 to 24,79 double
@01,27 say 'CONTROL DE CORRESPONDENCIA'
@01,68 say date()
@02,02 to 02,78
@22,13 clear to 22,69
@21,12 say 'Seleccione una opci¢n y oprima <ENTER> o <ESC> para salir';
           color n/w
return

procedure fondo
@03,02,24,79 box repl (chr(176),9)
return