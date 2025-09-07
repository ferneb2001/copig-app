procedure desp000
* Menu principal del sistema de control de despachos
clear
set talk off
set date to dmy
set deleted on
*WFCONT=2449800
*if val(sys(1))<wfcont
   do pied
   @03,03,03,78 box repl(chr(219),9)
   set talk off
   define menu pant01d  
   define pad recibe     of pant01d prompt '\<Ingreso'   at 03,02
   define pad mueve      of pant01d prompt '\<Movimientos' at 03,13
   define pad consulta   of pant01d prompt '\<Consultas'   at 03,26
   define pad informes   of pant01d prompt '\<Informes'    at 03,37 
   define pad listados   of pant01d prompt '\<Listados'    at 03,47
   define pad seguridad  of pant01d prompt '\<Seguridad'   at 03,57
   
   on selection pad recibe  of pant01d do despr

   on selection pad mueve   of pant01d activate popup movsd
   define popup movsd from 04,13
   define bar 1 of MOVSd prompt '\<Mueve Despachos  '  
   define bar 2 of movsd prompt '\<Anula un movimiento'
   on selection popup movsd do despm with bar()
      
   on selection pad consulta of pant01d activate popup consd 
   define popup consd from 04,26
   define bar 1 of consd prompt 'Por \<Nro.de Despacho  '  
   define bar 2 of consd prompt 'Por \<Rtte.'
   define bar 3 of consd prompt 'M\<odifica Despachos  '
   on selection popup consd do despc with bar()

   on selection pad informes of pant01d activate popup infd 
   define popup infd from 04,37
   define bar 1 of infd prompt '\<Por Nro.de Despacho  '  
   define bar 2 of infd prompt '\<Por Rtte.'
   define bar 3 of infd prompt '\<Por Secciones' 
   on selection popup infd do despnoim

   on selection pad listados of pant01d activate popup listd
   define popup listd from 04,47
   define bar 1 of listd promp 'Lista Despachos por \<N£mero'
   define bar 2 of listd promp 'Lista Despachos por \<Rttes.'
   define bar 3 of listd promp 'Lista \<un Desp. '
   on selection popup listd do despl with bar()
  * on selection popup listd do despnoim
   
   on selection pad seguridad of pant01d do despnoim

   activate menu pant01d
   @10,29 say 'Tipee QUIT para salir' color n*/w
*endif
return


procedure pied
*do fondo
@00,01 to 24,79 double
@01,29 say 'CONTROL DE DESPACHOS'
@01,70 say date()
@02,02 to 02,78
@22,13 clear to 22,69
@23,12 say 'Seleccione una opci¢n y oprima <ENTER> o <ESC> para salir';
           color n/w
return

procedure fondo
@03,02,24,79 box repl (chr(176),9)
return