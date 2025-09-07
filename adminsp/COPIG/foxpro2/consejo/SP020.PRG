procedure sp020
**Menu De Estadisticas de Certificados del Consejo Profesional
**de Ingenieros, Agrimensores y Geologos - Mendoza
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
   DEFINE MENU pant_02 
   DEFINE PAD listados      OF pant_02 PROMPT "\<Listados" AT 04,01
   do pie
   USE
   SET DATE FRENCH
   @02,70 SAY DATE()

     
   ON SELECTION PAD listados  OF pant_02 ACTIVATE POPUP listo
   DEFINE POPUP listo       FROM 6,01 TITLE "Listados"
   DEFINE BAR 1 OF listo    PROMPT "\<Conteo por titulo"
   define bar 2 of listo    prompt "           "        
*   define bar 3 of lista    prompt "\<Titulos"
*   define bar 4 of lista    prompt "\<Curso"
*   define bar 5 of lista    prompt "\<Empresas"
*   define bar 6 of lista    prompt "\<Departamentos"
*   define bar 7 of lista    prompt "\<Localidades"
   ON SELECTION POPUP listo   do spcee with popup(), bar()
   ACTIVATE MENU pant_02
   clear
*endif
return
procedure pie
@05,01 clear to 05,78
@20,03 CLEAR TO 20,78
@01,00 TO 24,79 DOUBLE
@03,01 to 03,78
@02,01 say 'CONSEJO PROF.DE INGENIEROS, AGRIM., Y GEOLOGOS'
@02,50 Say 'T E C N I C O ' COLOR SCHEME 5

@23,03 say "Seleccione una opci¢n y oprima <ENTER>, o <ESC> para salir" &&color n/w
return

