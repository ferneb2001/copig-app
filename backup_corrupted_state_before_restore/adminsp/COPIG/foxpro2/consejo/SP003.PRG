procedure sp003
**Menu de T‚cnicos en Higiene y Seg.en el Trabajo
** Ingenieros y Geologos - Mendoza
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
    DEFINE MENU pant_014 
   DEFINE PAD actualiza     OF pant_014 PROMPT "\<Actualizaci¢n" at 04,01
   DEFINE PAD listados      OF pant_014 PROMPT "\<Listados" AT 04,17
   DEFINE PAD consultas     OF pant_014 PROMPT "\<Consultas" AT 04,28
*   define pad backups       of pant_01 prompt "Clasif.\<Seguridad" at 04,40
*   define pad certif        of pant_01 prompt 'C\<ertificados' at 04,59
   do pie4
   USE
   SET DATE FRENCH
   @02,69 SAY DATE()

   ON SELECTION PAD actualiza OF pant_014 ACTIVATE POPUP actual 
   DEFINE POPUP actual      FROM 6,01 TITLE "Actualizaci¢n"
   DEFINE BAR  1 OF actual   PROMPT "\<Tecnicos en Hig. y Seg."
   DEFINE BAR  2 OF ACTUAL   PROMPT "T\<¡tulos T‚cnicos "
   ON SELECTION POPUP actual  do thaa with popup(), bar()

   ON SELECTION PAD consultas OF pant_014 ACTIVATE POPUP consul 
   DEFINE POPUP consul      FROM 6,28 TITLE "Consultas"
   DEFINE BAR 1 OF consul   PROMPT "\<T‚cnicos en Hig. y Seg."
   define bar 2 of consul   prompt "T\<¡tulos t‚cnicos"
   ON SELECTION POPUP consul  do thac with popup(), bar()

     
   ON SELECTION PAD listados  OF pant_014 ACTIVATE POPUP lista
   DEFINE POPUP lista       FROM 6,17 TITLE "Listados"
   DEFINE BAR 1 OF lista    PROMPT "\<T‚cnicos en Hig. y Seg."
   define bar 2 of lista    prompt "T\<¡tulos T‚cnicoa "
   ON SELECTION POPUP lista   do thal with popup(), bar()



   ACTIVATE MENU pant_014
   clear
*endif
return
procedure pie4
@05,01 clear to 05,78
@20,03 CLEAR TO 20,78
@01,00 TO 24,79 DOUBLE
@03,01 to 03,78
@02,01 say 'CONSEJO PROF.DE INGENIEROS Y GEOLOGOS'
@02,50 Say 'TECNICOS EN HIG.' COLOR SCHEME 5

@23,03 say "Seleccione una opci¢n y oprima <ENTER>, o <ESC> para salir" &&color n/w
return

