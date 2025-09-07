procedure sp100
**Menu Principal del Sistema del Consejo Profesional
**de Ingenieros y Geologos - Mendoza
* Emision de notificaciones
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
   DEFINE MENU pant_011 
   DEFINE PAD actualiza     OF pant_011 PROMPT "\<Notificaciones" at 04,01
   do pie
   USE
   SET DATE FRENCH
   @02,70 SAY DATE()

   ON SELECTION PAD actualiza OF pant_011 ACTIVATE POPUP actual1 
   DEFINE POPUP actual1      FROM 6,01 TITLE "Notificaciones"
   DEFINE BAR  1 OF actual1   PROMPT "\<1 - Modelo 1 (Falta cumplim ante nota Consejo:Certif)"
   DEFINE BAR  2 OF actual1   PROMPT '\<2 - Modelo 2 (Municip.informa falta Cert.H.Prof.    )'
   define bar  3 of actual1   PROMPT '\<3 - Modelo 3 (Municip.informa falta Boleta Dep¢s.   )'
   define bar  4 of actual1   prompt "\<4 - Modelo 4 (A Municip. prof.di¢ cumplimiento      )"    
   define bar  5 of actual1   prompt "\<5 - Modelo 5 (A Municip. prof.presento cert.H.Prof. )" 
   DEFINE BAR  6 OF actual1   PROMPT "\<6 - Modelo 6 (Falta cumplim ante nota Consejo:Boleta)"
   define bar  7 of actual1   prompt "\<7 - Modelo 7 (A Municip. Fotocopia Resoluci¢n       )"    
   define bar  8 of actual1   prompt "\<8 - Modelo 8 (A Municip. Cumplimiento Resol.        )" 
   define bar  9 of actual1   prompt "\<9 - Modelo 9 (Inicio Exptes.Secc.Cert.Hab.Prof.     )" 
   define bar 10 of actual1   prompt "\<10- Modelo 10 (Inicio Exptes.Sec.Cer.Hab.Prof.Empres)"
   define bar 11 of actual1   prompt "\<11- Modelo 11 (Comunicado a Munic.Mensual Suspens.  )"
   define bar 12 of actual1   prompt "\<12- Modelo 12 (Comunic.a Munic.Mensual Levanta Susp.)"
   define bar 13 of actual1   prompt "\<13- Modelo 13 (A munic.Empresa present¢ C.H.P.      )"
   define bar 14 of actual1   prompt "\<14- Modelo 14 (A Munic.inf.falta C.H.P.empresas     )"
   ON SELECTION POPUP actual1  do span with popup(), bar()

   ACTIVATE MENU pant_011
   clear
return
procedure pie
@05,01 clear to 05,78
@20,03 CLEAR TO 20,78
@01,00 TO 24,79 DOUBLE
@03,01 to 03,78
@02,01 say 'CONSEJO PROF.DE INGENIEROS Y GEOLOGOS'
@02,50 Say 'NOTIFICACIONES' COLOR SCHEME 5

@23,03 say "Seleccione una opci¢n y oprima <ENTER>, o <ESC> para salir" &&color n/w
return

