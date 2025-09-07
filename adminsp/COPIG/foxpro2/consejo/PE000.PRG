procedure pe000
**Menu Principal del Sistema del Consejo Profesional
**de Ingenieros y Geologos - Mendoza
* Tratamiento de peritos judiciales
CLEAR
SET EXCLUSIVE OFF
seT DELETED ON
close all
SET DEVICE TO SCREEN
SET TALK OFF
SET REPROCESS TO AUTOMATIC
set date dmy
WFCONT=2449345
   fup=CHR(24)
   fdw=CHR(25)
   DEFINE MENU pant_013 
   DEFINE PAD actualiza     OF pant_013 PROMPT "\<Peritos Judiciales" at 04,01
   do pie3
   USE
   SET DATE FRENCH
   @02,70 SAY DATE()

   ON SELECTION PAD actualiza OF pant_013 ACTIVATE POPUP actual3 
   DEFINE POPUP actual3      FROM 6,01 TITLE "Peritos Judiciales"
   DEFINE BAR  1 OF actual3   PROMPT "\<1 - Ingresa datos de Peritos    "
   DEFINE BAR  2 OF actual3   PROMPT '\<2 - Actualiza Especialidades    '
   define bar  3 of actual3   PROMPT '\<3 - Listado                     '
*   define bar  4 of actual1   prompt "\<4 - Modelo 4 (A Municip. prof.di¢ cumplimiento      )"    
*   define bar  5 of actual1   prompt "\<5 - Modelo 5 (A Municip. prof.presento cert.H.Prof. )" 
*   DEFINE BAR  6 OF actual1   PROMPT "\<6 - Modelo 6 (Falta cumplim ante nota Consejo:Boleta)"
*   define bar  7 of actual1   prompt "\<7 - Modelo 7 (A Municip. Fotocopia Resoluci¢n       )"    
*   define bar  8 of actual1   prompt "\<8 - Modelo 8 (A Municip. Cumplimiento Resol.        )" 
*   define bar  9 of actual1   prompt "\<9 - Modelo 9 (Inicio Exptes.Secc.Cert.Hab.Prof.     )" 
*   define bar 10 of actual1   prompt "\<10- Modelo 10 (Inicio Exptes.Sec.Cer.Hab.Prof.Empres)"
   
   ON SELECTION POPUP actual3  do spape with popup(), bar()

   ACTIVATE MENU pant_013
   clear
return
procedure pie3
@05,01 clear to 05,78
@20,03 CLEAR TO 20,78
@01,00 TO 24,79 DOUBLE
@03,01 to 03,78
@02,01 say 'CONSEJO PROF.DE INGENIEROS Y GEOLOGOS'
@02,50 Say 'PERITOS JUDICIALES' COLOR SCHEME 5

@23,03 say "Seleccione una opci¢n y oprima <ENTER>, o <ESC> para salir" &&color n/w
return

