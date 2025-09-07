procedure ex000
* Menu principal del sistema de control de expedientes
clear
set talk off
set date to dmy
set deleted on
set century on
*WFCONT=2449800
*if val(sys(1))<wfcont
   do pie
   @03,03,03,78 box repl(chr(219),9)
   set talk off
   define menu pant01   
   define pad recibe     of pant01 prompt '\<Ingreso'   at 03,02
   define pad mueve      of pant01 prompt '\<Movimientos' at 03,13
   define pad consulta   of pant01 prompt '\<Consultas'   at 03,26
   define pad informes   of pant01 prompt '\<Informes'    at 03,37 
   define pad listados   of pant01 prompt '\<Listados'    at 03,47
   define pad seguridad  of pant01 prompt '\<Seguridad'   at 03,57

   on selection pad recibe  of pant01 activate popup recs
   define popup recs from 4,04
   define bar 1 of recs  prompt '\<Expedientes   '
   define bar 2 of recs  prompt '\<Secciones     '   
   define bar 3 of recs  prompt '\<Reimprime caratula exptes'
   on selection popup recs do exr0 with bar()

   on selection pad mueve   of pant01 activate popup movs
   define popup movs from 04,13
   define bar 1 of MOVS prompt '\<Mueve Expedientes'  
   define bar 2 of movs prompt '\<Anula un movimiento'
   on selection popup movs do exm with bar()
      
   on selection pad consulta of pant01 activate popup cons 
   define popup cons from 04,26
   define bar 1 of cons prompt 'Por \<Nro.de Expediente'  
   define bar 2 of cons prompt 'Por \<Rtte.'
   define bar 3 of cons prompt 'M\<odifica Expedientes'
   define bar 4 of cons prompt 'Por \<Profesional'
   define bar 5 of cons prompt '\<Ultimos exptes '
   define bar 6 of cons prompt 'Por No\<mbre referencia'
   define bar 7 of cons prompt 'Por \<CUIT '
   on selection popup cons do exc with bar()

   on selection pad informes of pant01 activate popup inf 
   define popup inf from 04,37
   define bar 1 of inf prompt '\<Por Nro.de Expediente'  
   define bar 2 of inf prompt '\<Por Rtte.'
   define bar 3 of inf prompt '\<Por Secciones' 
   on selection popup inf do exnoimp

   on selection pad listados of pant01 activate popup list
   define popup list from 04,47
   define bar 1 of list promp 'Lista Exptes. por \<N£mero'
   define bar 2 of list promp 'Lista Exptes. por \<Rttes.'
   define bar 3 of list promp 'Lista \<un Expte.'
   define bar 4 of list prompt '\<Por clase     '
   on selection popup list do exl with bar()
  * on selection popup list do exnoimp
   
   on selection pad seguridad of pant01 do exnoimp

   activate menu pant01
   @10,29 say 'Tipee QUIT para salir' color n*/w
*endif
return


procedure pie
*do fondo
@00,01 to 24,79 double
@01,29 say 'CONTROL DE EXPEDIENTES'
@01,70 say date()
@02,02 to 02,78
@22,13 clear to 22,69
@23,12 say 'Seleccione una opci¢n y oprima <ENTER> o <ESC> para salir';
           color n/w
return

procedure fondo
@03,02,24,79 box repl (chr(176),9)
return