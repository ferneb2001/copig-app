procedure as000
**Menu Principal del Sistema de Asociados del CPIG 
**de Ingenieros y Geologos - Mendoza
CLEAR
SET EXCLUSIVE OFF
seT DELETED ON
close all
SET DEVICE TO SCREEN
SET TALK OFF
SET REPROCESS TO AUTOMATIC
set date dmy
WFCONT=2449345
*if val(sys(1))<wfcont
   fup=CHR(24)
   fdw=CHR(25)
   *select 1
   *use carpar
   *WUSU=rtrim(usuario)
    DEFINE MENU pant_01 
   DEFINE PAD actualiza     OF pant_01 PROMPT "\<Actualizaci¢n" at 04,01
   DEFINE PAD listados      OF pant_01 PROMPT "\<Listados" AT 04,17
   DEFINE PAD consultas     OF pant_01 PROMPT "\<Consultas" AT 04,28
*   define pad backups       of pant_01 prompt "Clasif.\<Seguridad" at 04,40
*   define pad certif        of pant_01 prompt 'C\<ertificados' at 04,59
   do pie
   USE
   SET DATE FRENCH
   @02,70 SAY DATE()

   ON SELECTION PAD actualiza OF pant_01 ACTIVATE POPUP actual 
   DEFINE POPUP actual      FROM 6,01 TITLE "Actualizaci¢n"
   DEFINE BAR  1 OF actual   PROMPT "\<Asociados     "
   define bar  2 of actual   prompt '\<Modificaciones Asociados '
   ON SELECTION POPUP actual  do asaa with popup(), bar()

   ON SELECTION PAD consultas OF pant_01 ACTIVATE POPUP consul 
   DEFINE POPUP consul      FROM 6,28 TITLE "Consultas"
   DEFINE BAR 1 OF consul   PROMPT "\<Asociados    "
   define bar 2 of consul   prompt "\<Ultimos n£meros utilizados"
   ON SELECTION POPUP consul  do asac with popup(), bar()

     
   ON SELECTION PAD listados  OF pant_01 ACTIVATE POPUP lista
   DEFINE POPUP lista       FROM 6,17 TITLE "Listados"
   DEFINE BAR 1 OF lista    PROMPT "\<Asociados    "
   ON SELECTION POPUP lista   do asal with popup(), bar()

*   on selection pad backups OF pant_01 activate popup clasi
*   define popup clasi       from 6,40 title 'CLASIFIC/COP'
*   define bar 1 of clasi    prompt '\<Clasifica'
*   on selection popup clasi do spbac with popup(), bar()
*
*    on selection pad certif of pant_01 activate popup certi
*   define popup certi       from 06,59 title 'CERTIFICADOS'
*   define bar 1 of certi    prompt '\<Nuevo Ingreso'
*   define bar 2 of certi    prompt 'L\<istado nuevo'
*   define bar 3 of certi    prompt 'C\<onsulta nuevo'
*   define bar 4 of certi    prompt 'C\<lasifica nuevo'
*   define bar 5 of certi    prompt '\<Reimprime certificaci¢n'
*   define bar 6 of certi    prompt '\<Estadisticas'
*   define bar 7 of certi    prompt '\<Consultas 94/95'
*   define bar 8 of certi    prompt 'E\<stadisticas 94/95'
*   define bar 9 of certi    prompt 'Lis\<tado 94/95     '
*   define bar 10 of certi   prompt 'Rei\<mprime certif. 94/95 '
*   define bar 11 of certi    prompt '\<Consultas 96/97'
*   define bar 12 of certi    prompt 'E\<stadisticas 96/97'
*   define bar 13 of certi    prompt 'Lis\<tado 96/97     '
*   define bar 14 of certi   prompt 'Re\<imprime certif. 96/97 '
*   on selection popup certi do spae with popup(), bar()

   ACTIVATE MENU pant_01
   clear
*endif
return
procedure pie
@05,01 clear to 05,78
@20,03 CLEAR TO 20,78
@01,00 TO 24,79 DOUBLE
@03,01 to 03,78
@02,01 say 'CONSEJO PROF.DE INGENIEROS Y GEOLOGOS'
@02,50 Say 'ASOCIADOS     ' COLOR SCHEME 5

@23,03 say "Seleccione una opci¢n y oprima <ENTER>, o <ESC> para salir" &&color n/w
return

