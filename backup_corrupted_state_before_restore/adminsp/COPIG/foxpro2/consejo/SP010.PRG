procedure sp010
**Menu Principal del Sistema del Consejo Profesional
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
   *select 1
   *use carpar
   *WUSU=rtrim(usuario)
   DEFINE MENU pant_01 
   DEFINE PAD actualiza     OF pant_01 PROMPT "\<Ingresa Cert." at 04,01
   DEFINE PAD listados      OF pant_01 PROMPT "\<Listados" AT 04,17
*   DEFINE PAD consultas     OF pant_01 PROMPT "\<Consultas" AT 04,28
*   define pad backups       of pant_01 prompt "Copias \<Seguridad" at 04,40
   do pie
   USE
   SET DATE FRENCH
   @02,70 SAY DATE()

   ON SELECTION PAD actualiza OF pant_01 ACTIVATE POPUP actual 
   DEFINE POPUP actual      FROM 6,01 TITLE "Igreso Certificados"
   DEFINE BAR  1 OF actual   PROMPT "\<Clasifica Certificados"
   DEFINE BAR  2 OF actual   PROMPT '\<Graba Certificados'
*   define bar  3 of actual   PROMPT '\<Departamentos'
*   define bar  4 of actual   prompt "\<Sanciones"        
*   define bar  5 of actual   prompt "\<Cursos post-grado"        
*   define bar  6 of actual   prompt "\<Representantes T‚cnicos"        
*   define bar  7 of actual   prompt "\<Titulos"        
*   define bar  8 of actual   prompt "\<Entidades Educativas"    
*   define bar  9 of actual   prompt "\<Incumbencias"        
*   define bar 10 of actual   prompt '\<N£meros de Documentos'
*   define bar 11 of actual   prompt "\<Matr¡culas Empresas"
   ON SELECTION POPUP actual  do spta with popup(), bar()

*   ON SELECTION PAD consultas OF pant_01 ACTIVATE POPUP consul 
*   DEFINE POPUP consul      FROM 6,28 TITLE "Consultas"
*   DEFINE BAR 1 OF consul   PROMPT "\<Profesionales/Matriculas"
*   DEFINE BAR 2 OF consul   PROMPT '\<Localidad, Dptos'
*   define bar 3 of consul   prompt "\<Sanciones"        
*   define bar 4 of consul   prompt "\<Cursos post-grado"        
*   define bar 5 of consul   prompt "\<Representantes T‚cnicos"        
*   define bar 6 of consul   prompt "\<Titulos"        
*   define bar 7 of consul   prompt "\<Entidades Educativas"    
*   define bar 8 of consul   prompt "\<Incumbencias"
*   define bar 9 of consul   prompt "\<Matr¡culas Empresas"        
*   ON SELECTION POPUP consul  do spac with popup(), bar()

     
   ON SELECTION PAD listados  OF pant_01 ACTIVATE POPUP lista
   DEFINE POPUP lista       FROM 6,17 TITLE "Listados"
   DEFINE BAR 1 OF lista    PROMPT "\<Certificados "
*   define bar 2 of lista    prompt "\<Sanciones"        
*   define bar 3 of lista    prompt "\<Titulos"
*   define bar 4 of lista    prompt "\<Curso"
*   define bar 5 of lista    prompt "\<Empresas"
*   define bar 6 of lista    prompt "\<Departamentos"
*   define bar 7 of lista    prompt "\<Localidades"
   ON SELECTION POPUP lista   do sptl with popup(), bar()
*   on selection pad backups OF pant_01 do noimp
   ACTIVATE MENU pant_01
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

